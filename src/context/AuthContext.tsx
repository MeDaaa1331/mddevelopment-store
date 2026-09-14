import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DiscordUser, UserHistoryItem, PointsHistoryItem, RedeemedCoupon } from '../types/auth';

const USER_STORAGE_KEY = 'md_discord_user_v1';
const FAV_STORAGE_KEY = 'md_devtools_favorite_tools';
const CART_STORAGE_KEY = 'md_cart_items_v2';

export interface PointAwardNotification {
  id: string;
  points: number;
  label: string;
}

export interface PointsStatus {
  points: number;
  totalPointsEarned: number;
  inGuild: boolean;
  extraSpins?: number;
  claimedActivities: Record<string, boolean>;
  claimedFreeScripts: (string | number)[];
  cooldowns: {
    devToolsRemainingMs: number;
    wheelSpinRemainingMs: number;
    canUseDevToolsForPoints: boolean;
    canSpinWheel: boolean;
  };
  redeemedCoupons: RedeemedCoupon[];
  pointsHistory: PointsHistoryItem[];
}

interface AuthContextType {
  user: DiscordUser | null;
  isLoggedIn: boolean;
  pointsStatus: PointsStatus | null;
  pointToast: PointAwardNotification | null;
  showPointToast: (points: number, label: string) => void;
  dismissPointToast: () => void;
  refreshPoints: () => Promise<void>;
  claimPointActivity: (
    activity: 'devtools_use' | 'download_free_script' | 'discord_guild' | string,
    payload?: { toolId?: string; scriptId?: string | number; scriptName?: string }
  ) => Promise<{ success: boolean; message?: string; pointsAwarded?: number; cooldown?: boolean; alreadyClaimed?: boolean; inGuild?: boolean }>;
  redeemCoupon: (discountPercentage: number) => Promise<{ success: boolean; coupon?: RedeemedCoupon; error?: string }>;
  buyExtraWheelSpin: () => Promise<{ success: boolean; message?: string; error?: string }>;
  loginWithDiscord: () => void;
  logout: () => void;
  syncUserData: (updates: Partial<DiscordUser>) => Promise<void>;
  recordHistory: (item: Omit<UserHistoryItem, 'id' | 'timestamp'>) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  justLoggedIn: boolean;
  dismissJustLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DiscordUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [pointsStatus, setPointsStatus] = useState<PointsStatus | null>(null);
  const [pointToast, setPointToast] = useState<PointAwardNotification | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const showPointToast = useCallback((points: number, label: string) => {
    const id = 'pt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setPointToast({ id, points, label });
    setTimeout(() => {
      setPointToast(curr => (curr?.id === id ? null : curr));
    }, 5000);
  }, []);

  const dismissPointToast = useCallback(() => {
    setPointToast(null);
  }, []);

  // Helper to merge two points history lists by ID (descending timestamp)
  const mergePointsHistory = (listA: PointsHistoryItem[] = [], listB: PointsHistoryItem[] = []): PointsHistoryItem[] => {
    const map = new Map<string, PointsHistoryItem>();
    for (const item of listA) {
      if (item && item.id) map.set(item.id, item);
    }
    for (const item of listB) {
      if (item && item.id) map.set(item.id, item);
    }
    return Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  };

  // Helper to generate default history entries if user has empty history
  const generateDefaultHistory = (u: DiscordUser): PointsHistoryItem[] => {
    const items: PointsHistoryItem[] = [];
    const now = Date.now();

    if (u.claimedActivities?.discord_login !== false) {
      items.push({
        id: 'pt-' + (u.firstJoined || now).toString(36) + '-login',
        activity: 'discord_login',
        label: 'Welcome Discord Login Bonus',
        points: 100,
        timestamp: u.firstJoined || (now - 3600000)
      });
    }

    if (u.claimedActivities?.discord_guild) {
      items.push({
        id: 'pt-' + (u.firstJoined || now).toString(36) + '-guild',
        activity: 'discord_guild',
        label: 'Joined MD Development Discord Server',
        points: 50,
        timestamp: u.firstJoined ? (u.firstJoined + 1000) : now
      });
    }

    if (u.lastSpin) {
      items.push({
        id: 'pt-' + u.lastSpin.toString(36) + '-spin',
        activity: 'wheel_spin',
        label: 'Daily Wheel of Fortune Spin',
        points: 20,
        timestamp: u.lastSpin
      });
    }

    if (u.lastDevToolsUse) {
      items.push({
        id: 'pt-' + u.lastDevToolsUse.toString(36) + '-dev',
        activity: 'devtools_use',
        label: 'DevTools Usage',
        points: 20,
        timestamp: u.lastDevToolsUse
      });
    }

    return items;
  };

  // User and pointsStatus refs to keep refreshPoints stable and prevent dependency cycles
  const userRef = useRef<DiscordUser | null>(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const pointsStatusRef = useRef<PointsStatus | null>(pointsStatus);
  useEffect(() => {
    pointsStatusRef.current = pointsStatus;
  }, [pointsStatus]);

  const isRefreshingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  // Sync / Refresh Points from server
  const refreshPoints = useCallback(async () => {
    const currentUser = userRef.current;
    if (!currentUser?.id) return;

    // Prevent concurrent calls and excessive rapid polling (debounce 2s)
    const now = Date.now();
    if (isRefreshingRef.current) return;
    if (now - lastRefreshTimeRef.current < 2000) return;

    isRefreshingRef.current = true;
    lastRefreshTimeRef.current = now;

    try {
      const DAY_MS = 86400000;

      const res = await fetch(`/api/points?action=status&userId=${currentUser.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success || data.points !== undefined) {
        const extraSpins = Number(data.extraSpins !== undefined ? data.extraSpins : (currentUser.extraSpins || 0));

        // Calculate local cooldowns
        const localDevToolsRemaining = currentUser.lastDevToolsUse ? Math.max(0, DAY_MS - (now - currentUser.lastDevToolsUse)) : 0;
        const localWheelRemaining = extraSpins > 0 ? 0 : (currentUser.lastSpin ? Math.max(0, DAY_MS - (now - currentUser.lastSpin)) : 0);

        const serverDevToolsRemaining = data.cooldowns?.devToolsRemainingMs ?? data.devTools?.remainingMs ?? 0;
        const serverWheelRemaining = extraSpins > 0 ? 0 : (data.cooldowns?.wheelSpinRemainingMs ?? data.wheel?.remainingMs ?? 0);

        // Effective cooldowns MUST respect both server and local state
        const devToolsRemaining = Math.max(serverDevToolsRemaining, localDevToolsRemaining);
        const wheelRemaining = extraSpins > 0 ? 0 : Math.max(serverWheelRemaining, localWheelRemaining);

        const canUseDevTools = (data.cooldowns?.canUseDevToolsForPoints !== false) && devToolsRemaining === 0;
        const canSpin = extraSpins > 0 || ((data.cooldowns?.canSpinWheel !== false) && wheelRemaining === 0);

        // Merge points history safely
        const serverHistory: PointsHistoryItem[] = (Array.isArray(data.pointsHistory) && data.pointsHistory.length > 0)
          ? data.pointsHistory
          : (Array.isArray(data.history) && data.history.length > 0)
            ? data.history
            : [];

        const localHistory = currentUser.pointsHistory || pointsStatusRef.current?.pointsHistory || [];
        let historyList = mergePointsHistory(serverHistory, localHistory);

        if (historyList.length === 0) {
          historyList = generateDefaultHistory(currentUser);
        }

        const isMember = Boolean(
          data.inGuild ||
          data.claimedActivities?.discord_guild ||
          currentUser.claimedActivities?.discord_guild ||
          pointsStatusRef.current?.inGuild
        );

        // Authoritative server balance
        const effectivePoints = (data.points !== undefined && data.points !== null)
          ? Number(data.points)
          : (currentUser.points ?? 0);
        const effectiveTotalEarned = (data.totalPointsEarned !== undefined && data.totalPointsEarned !== null)
          ? Number(data.totalPointsEarned)
          : Math.max(currentUser.totalPointsEarned ?? 0, effectivePoints);

        const mergedClaimed = {
          ...(currentUser.claimedActivities || {}),
          ...(data.claimedActivities || {}),
          discord_login: true,
          discord_guild: isMember
        };

        setPointsStatus({
          points: effectivePoints,
          totalPointsEarned: effectiveTotalEarned,
          inGuild: isMember,
          extraSpins,
          claimedActivities: mergedClaimed,
          claimedFreeScripts: data.claimedFreeScripts || currentUser.claimedFreeScripts || [],
          cooldowns: {
            devToolsRemainingMs: devToolsRemaining,
            wheelSpinRemainingMs: wheelRemaining,
            canUseDevToolsForPoints: canUseDevTools,
            canSpinWheel: canSpin
          },
          redeemedCoupons: data.redeemedCoupons || currentUser.redeemedCoupons || [],
          pointsHistory: historyList
        });

        // Keep local user in sync
        setUser(prev => {
          if (!prev) return null;
          const updated: DiscordUser = {
            ...prev,
            points: effectivePoints,
            totalPointsEarned: effectiveTotalEarned,
            extraSpins,
            lastSpin: extraSpins > 0 ? 0 : prev.lastSpin,
            claimedActivities: mergedClaimed,
            claimedFreeScripts: data.claimedFreeScripts || prev.claimedFreeScripts,
            redeemedCoupons: data.redeemedCoupons || prev.redeemedCoupons,
            pointsHistory: historyList
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
          }
          return updated;
        });
      }
    } catch (err) {
      console.warn('[refreshPoints] error:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      refreshPoints();
    }
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('discord_auth');
    const userPayload = params.get('user');

    if (authStatus === 'success' && userPayload) {
      let parsedUser: DiscordUser | null = null;

      // Method 1: URL-safe Base64 decode (recommended, handles emojis & UTF-8)
      try {
        const base64 = userPayload.replace(/-/g, '+').replace(/_/g, '/');
        const binStr = atob(base64);
        const bytes = Uint8Array.from(binStr, c => c.charCodeAt(0));
        const decodedText = new TextDecoder().decode(bytes);
        parsedUser = JSON.parse(decodedText);
      } catch {}

      // Method 2: Direct JSON parse
      if (!parsedUser) {
        try {
          parsedUser = JSON.parse(userPayload);
        } catch {}
      }

      // Method 3: decodeURIComponent + JSON parse
      if (!parsedUser) {
        try {
          parsedUser = JSON.parse(decodeURIComponent(userPayload));
        } catch {}
      }

      if (parsedUser && parsedUser.id) {
        setUser(parsedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUser));
        setJustLoggedIn(true);

        if (Array.isArray(parsedUser.favorites) && parsedUser.favorites.length > 0) {
          localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(parsedUser.favorites));
        }
        if (Array.isArray(parsedUser.cart) && parsedUser.cart.length > 0) {
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(parsedUser.cart));
        }

        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('discord_auth');
        currentUrl.searchParams.delete('user');
        window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
      } else {
        console.error('[Discord Auth]: Failed to parse user payload:', userPayload);
        showPointToast(0, 'Failed to complete Discord login. Please try again.');
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('discord_auth');
        currentUrl.searchParams.delete('user');
        window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
      }
    } else if (authStatus === 'error') {
      const reason = params.get('reason') || 'unknown';
      console.error('[Discord Auth Error]:', reason);
      showPointToast(0, `Discord Login Error: ${reason.replace(/_/g, ' ')}`);
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('discord_auth');
      currentUrl.searchParams.delete('reason');
      window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
    }
  }, [showPointToast]);

  const loginWithDiscord = () => {
    window.location.href = '/api/auth/discord/login';
  };

  const logout = () => {
    setUser(null);
    setPointsStatus(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const claimPointActivity = async (
    activity: 'devtools_use' | 'download_free_script' | 'discord_guild' | string,
    payload?: { toolId?: string; scriptId?: string | number; scriptName?: string }
  ) => {
    if (!user?.id) {
      return { success: false, message: 'Please sign in with Discord to earn MD Points.' };
    }

    const now = Date.now();
    const DAY_MS = 86400000;

    // Local cooldown check for devtools_use
    if (activity === 'devtools_use') {
      if (user.lastDevToolsUse && (now - user.lastDevToolsUse < DAY_MS)) {
        return {
          success: false,
          cooldown: true,
          message: 'DevTools daily points cooldown active. You can earn points once every 24 hours.'
        };
      }
    }

    // Local check for discord_guild
    if (activity === 'discord_guild' && user.claimedActivities?.discord_guild) {
      return {
        success: false,
        alreadyClaimed: true,
        message: 'Discord membership points already claimed.'
      };
    }

    // Optimistic local update for instantaneous UI feedback
    if (activity === 'devtools_use') {
      const toolLabel = payload?.toolId
        ? payload.toolId.charAt(0).toUpperCase() + payload.toolId.slice(1)
        : 'Utility';

      const newHistoryItem: PointsHistoryItem = {
        id: 'pt-' + now.toString(36) + '-dev',
        activity: 'devtools_use',
        label: `DevTools Usage (${toolLabel})`,
        points: 20,
        timestamp: now
      };

      const newPoints = (user.points || 0) + 20;
      const newTotal = (user.totalPointsEarned || 0) + 20;
      const newHistory = [newHistoryItem, ...(user.pointsHistory || [])];

      setUser(prev => {
        if (!prev) return null;
        const updated: DiscordUser = {
          ...prev,
          lastDevToolsUse: now,
          points: newPoints,
          totalPointsEarned: newTotal,
          pointsHistory: newHistory
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });

      setPointsStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: newPoints,
          totalPointsEarned: newTotal,
          cooldowns: {
            ...prev.cooldowns,
            devToolsRemainingMs: DAY_MS,
            canUseDevToolsForPoints: false
          },
          pointsHistory: newHistory
        };
      });

      showPointToast(20, `DevTools daily reward (+20 MD Points)!`);
    } else if (activity === 'discord_guild') {
      const newHistoryItem: PointsHistoryItem = {
        id: 'pt-' + now.toString(36) + '-guild',
        activity: 'discord_guild',
        label: 'Joined MD Development Discord Server',
        points: 50,
        timestamp: now
      };

      const newPoints = (user.points || 0) + 50;
      const newTotal = (user.totalPointsEarned || 0) + 50;
      const newHistory = [newHistoryItem, ...(user.pointsHistory || [])];
      const nextClaimed = { ...(user.claimedActivities || {}), discord_guild: true };

      setUser(prev => {
        if (!prev) return null;
        const updated: DiscordUser = {
          ...prev,
          points: newPoints,
          totalPointsEarned: newTotal,
          claimedActivities: nextClaimed,
          pointsHistory: newHistory
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
        }
        return updated;
      });

      setPointsStatus(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: newPoints,
          totalPointsEarned: newTotal,
          inGuild: true,
          claimedActivities: nextClaimed,
          pointsHistory: newHistory
        };
      });

      showPointToast(50, `Discord Member bonus (+50 MD Points)!`);
    }

    try {
      const res = await fetch('/api/points?action=activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          activity,
          toolId: payload?.toolId,
          scriptId: payload?.scriptId,
          scriptName: payload?.scriptName
        })
      });

      const data = await res.json().catch(() => ({}));
      if (data.success) {
        await refreshPoints();
        return {
          success: true,
          message: data.message,
          pointsAwarded: Number(data.pointsAwarded) || 20,
          inGuild: data.inGuild
        };
      } else {
        return {
          success: activity === 'devtools_use' || activity === 'discord_guild' ? true : false,
          cooldown: Boolean(data.cooldown),
          alreadyClaimed: Boolean(data.alreadyClaimed),
          message: data.message || 'Points recorded.',
          inGuild: data.inGuild
        };
      }
    } catch {
      return { success: true, message: 'Points recorded locally.' };
    }
  };

  const redeemCoupon = async (discountPercentage: number) => {
    if (!user?.id) {
      return { success: false, error: 'Please sign in with Discord first.' };
    }

    try {
      const res = await fetch('/api/points?action=redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          discountPercentage
        })
      });

      const data = await res.json();
      if (data.success && data.coupon) {
        if (data.newBalance !== undefined) {
          setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, points: Number(data.newBalance) };
            if (typeof window !== 'undefined') {
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
            }
            return updated;
          });
          setPointsStatus(prev => {
            if (!prev) return null;
            return { ...prev, points: Number(data.newBalance) };
          });
        }
        await refreshPoints();
        return { success: true, coupon: data.coupon };
      } else {
        return { success: false, error: data.error || 'Failed to redeem coupon.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error while redeeming coupon.' };
    }
  };

  const buyExtraWheelSpin = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'Please sign in with Discord first.' };
    }

    const currentPoints = pointsStatus?.points ?? user.points ?? 0;
    if (currentPoints < 300) {
      return {
        success: false,
        error: `Not enough MD Points. You have ${currentPoints} pts, 300 pts required.`
      };
    }

    const now = Date.now();
    const newPoints = Math.max(0, currentPoints - 300);
    const extraHistItem: PointsHistoryItem = {
      id: 'pt-' + now.toString(36) + '-wheel-extra',
      activity: 'wheel_extra_spin',
      label: 'Extra Wheel Spin (Cooldown Skipped)',
      points: -300,
      timestamp: now
    };
    const newHistory = [extraHistItem, ...(user.pointsHistory || [])];

    // Optimistically update user & reset lastSpin to 0 so wheel can spin immediately
    setUser(prev => {
      if (!prev) return null;
      const updated: DiscordUser = {
        ...prev,
        points: newPoints,
        lastSpin: 0,
        extraSpins: (prev.extraSpins || 0) + 1,
        pointsHistory: newHistory
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    setPointsStatus(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: newPoints,
        extraSpins: (prev.extraSpins || 0) + 1,
        cooldowns: {
          ...prev.cooldowns,
          wheelSpinRemainingMs: 0,
          canSpinWheel: true
        },
        pointsHistory: newHistory
      };
    });

    showPointToast(-300, 'Extra Wheel Spin purchased (-300 MD Points)!');

    try {
      const res = await fetch('/api/points?action=buy_wheel_spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, currentPoints })
      });

      const data = await res.json().catch(() => ({}));
      if (data.success) {
        const serverPoints = data.newPoints !== undefined ? Number(data.newPoints) : newPoints;
        const serverSpins = data.extraSpins !== undefined ? Number(data.extraSpins) : ((user.extraSpins || 0) + 1);

        setUser(prev => {
          if (!prev) return null;
          const updated: DiscordUser = {
            ...prev,
            points: serverPoints,
            lastSpin: 0,
            extraSpins: serverSpins
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
          }
          return updated;
        });

        setPointsStatus(prev => {
          if (!prev) return null;
          return {
            ...prev,
            points: serverPoints,
            extraSpins: serverSpins,
            cooldowns: {
              ...prev.cooldowns,
              wheelSpinRemainingMs: 0,
              canSpinWheel: true
            }
          };
        });

        await refreshPoints();
        return { success: true, message: data.message };
      } else {
        await refreshPoints();
        return { success: false, error: data.error || 'Failed to purchase extra spin.' };
      }
    } catch (err: any) {
      await refreshPoints();
      return { success: false, error: err.message || 'Error purchasing extra spin.' };
    }
  };

  const syncUserData = async (updates: Partial<DiscordUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates, lastActive: Date.now() };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }

    try {
      await fetch('/api/auth/discord/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          cart: updates.cart,
          favorites: updates.favorites,
          downloadsCountDelta: updates.downloadsCount ? 1 : 0
        })
      });
    } catch {}
  };

  const recordHistory = (item: Omit<UserHistoryItem, 'id' | 'timestamp'>) => {
    if (!user) return;
    const newItem: UserHistoryItem = {
      ...item,
      id: 'hist-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };

    setUser(prev => {
      if (!prev) return null;
      const nextHistory = [newItem, ...(prev.history || [])].slice(0, 50);
      const updated = {
        ...prev,
        history: nextHistory,
        downloadsCount: item.type === 'download' || item.type === 'export' ? (prev.downloadsCount || 0) + 1 : prev.downloadsCount
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    fetch('/api/auth/discord/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        historyItem: newItem,
        downloadsCountDelta: item.type === 'download' || item.type === 'export' ? 1 : 0
      })
    }).catch(() => {});
  };

  const dismissJustLoggedIn = () => setJustLoggedIn(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user),
        pointsStatus,
        pointToast,
        showPointToast,
        dismissPointToast,
        refreshPoints,
        claimPointActivity,
        redeemCoupon,
        buyExtraWheelSpin,
        loginWithDiscord,
        logout,
        syncUserData,
        recordHistory,
        isProfileModalOpen,
        setIsProfileModalOpen,
        justLoggedIn,
        dismissJustLoggedIn
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

