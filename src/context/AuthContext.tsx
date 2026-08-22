import React, { createContext, useContext, useState, useEffect } from 'react';
import { DiscordUser, UserHistoryItem } from '../types/auth';

const USER_STORAGE_KEY = 'md_discord_user_v1';
const FAV_STORAGE_KEY = 'md_devtools_favorite_tools';
const CART_STORAGE_KEY = 'md_cart_items_v2';

interface AuthContextType {
  user: DiscordUser | null;
  isLoggedIn: boolean;
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

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_STORAGE_KEY);
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
