import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DiscordUser, UserHistoryItem, PointsHistoryItem, RedeemedCoupon } from '../types/auth';

const USER_STORAGE_KEY = 'md_discord_user_v1';
const FAV_STORAGE_KEY = 'md_devtools_favorite_tools';
const CART_STORAGE_KEY = 'md_cart_items_v2';

export interface PointsStatus {
  points: number;
  totalPointsEarned: number;
  inGuild: boolean;
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
  refreshPoints: () => Promise<void>;
  claimPointActivity: (
    activity: 'devtools_use' | 'download_free_script',
    payload?: { toolId?: string; scriptId?: string | number; scriptName?: string }
  ) => Promise<{ success: boolean; message?: string; pointsAwarded?: number; cooldown?: boolean; alreadyClaimed?: boolean }>;
  redeemCoupon: (discountPercentage: number) => Promise<{ success: boolean; coupon?: RedeemedCoupon; error?: string }>;
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Sync / Refresh Points from server
  const refreshPoints = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/points?action=status&userId=${user.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success || data.points !== undefined) {
        setPointsStatus({
          points: data.points || 0,
          totalPointsEarned: data.totalPointsEarned || 0,
          inGuild: Boolean(data.inGuild),
          claimedActivities: data.claimedActivities || {},
          claimedFreeScripts: data.claimedFreeScripts || [],
          cooldowns: data.cooldowns || {
            devToolsRemainingMs: 0,
            wheelSpinRemainingMs: 0,
            canUseDevToolsForPoints: true,
            canSpinWheel: false
          },
          redeemedCoupons: data.redeemedCoupons || [],
          pointsHistory: data.pointsHistory || []
        });

        // Keep local user in sync
        setUser(prev => {
          if (!prev) return null;
          const updated = {
            ...prev,
            points: data.points,
            totalPointsEarned: data.totalPointsEarned,
            claimedActivities: data.claimedActivities,
            claimedFreeScripts: data.claimedFreeScripts,
            redeemedCoupons: data.redeemedCoupons,
            pointsHistory: data.pointsHistory
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
          }
          return updated;
        });
      }
    } catch {}
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshPoints();
    }
  }, [user?.id, refreshPoints]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('discord_auth');
    const userPayload = params.get('user');

    if (authStatus === 'success' && userPayload) {
      try {
        const parsedUser: DiscordUser = JSON.parse(decodeURIComponent(userPayload));
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
      } catch (err) {}
    }
  }, []);

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
    activity: 'devtools_use' | 'download_free_script',
    payload?: { toolId?: string; scriptId?: string | number; scriptName?: string }
  ) => {
    if (!user?.id) {
      return { success: false, message: 'Please sign in with Discord to earn MD Points.' };
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

      const data = await res.json();
      if (data.success) {
        await refreshPoints();
        return {
          success: true,
          message: data.message,
          pointsAwarded: data.pointsAwarded
        };
      } else {
        return {
          success: false,
          cooldown: Boolean(data.cooldown),
          alreadyClaimed: Boolean(data.alreadyClaimed),
          message: data.message || 'Points could not be awarded.'
        };
      }
    } catch {
      return { success: false, message: 'Network error claiming points.' };
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
        await refreshPoints();
        return { success: true, coupon: data.coupon };
      } else {
        return { success: false, error: data.error || 'Failed to redeem coupon.' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error while redeeming coupon.' };
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
    const newItem: UserHistoryItem = {
      ...item,
      id: 'hist-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now()
    };

    if (!user) return;

    const newHistory = [newItem, ...(user.history || [])].slice(0, 50);
    const newDownloadsCount = item.type === 'download' || item.type === 'export'
      ? (user.downloadsCount || 0) + 1
      : (user.downloadsCount || 0);

    const updated = {
      ...user,
      downloadsCount: newDownloadsCount,
      history: newHistory,
      lastActive: Date.now()
    };

    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    }

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
        refreshPoints,
        claimPointActivity,
        redeemCoupon,
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

