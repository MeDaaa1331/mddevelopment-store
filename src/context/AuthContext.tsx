import React, { createContext, useContext, useState, useEffect } from 'react';
import { CfxAuthService, CfxForumUser } from '../services/cfxAuth';

interface AuthContextType {
  user: CfxForumUser | null;
  loginWithCfxForum: () => Promise<void>;
  loginWithUsername: (username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authPendingAction: (() => void) | null;
  setAuthPendingAction: (action: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CfxForumUser | null>(() => CfxAuthService.getSavedUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authPendingAction, setAuthPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const payloadParam = urlParams.get('payload');
      const cfxUsername = urlParams.get('username') || urlParams.get('cfx_username') || urlParams.get('user');

      if (cfxUsername) {
        setIsLoading(true);
        try {
          const profile = await CfxAuthService.fetchForumProfile(cfxUsername);
          setUser(profile);
          CfxAuthService.saveUser(profile);
          window.history.replaceState({}, document.title, window.location.pathname);
        } finally {
          setIsLoading(false);
        }
      } else if (payloadParam) {
        setIsLoading(true);
        try {
          console.log('[CfxAuth] Processing encrypted return payload from forum.cfx.re...');
          const decrypted = await CfxAuthService.decryptAuthPayload(payloadParam);
          if (decrypted) {
            console.log('[CfxAuth] Decrypted auth response successfully:', decrypted);
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {
          console.warn('[CfxAuth] Error handling payload:', e);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuthRedirect();
  }, []);

  const loginWithCfxForum = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = await CfxAuthService.getCfxForumLoginUrl();
      console.log('[CfxAuth] Redirecting to official Cfx.re Forum Authorization:', redirectUrl);
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('[CfxAuth] Failed to generate RSA auth URL:', err);
      setIsLoading(false);
    }
  };

  const loginWithUsername = async (rawUsername: string) => {
    const clean = rawUsername.trim().replace(/^@/, '');
    if (!clean) return;

    setIsLoading(true);
    try {
      const profile = await CfxAuthService.fetchForumProfile(clean);
      setUser(profile);
      CfxAuthService.saveUser(profile);
      setIsAuthModalOpen(false);

      if (authPendingAction) {
        authPendingAction();
        setAuthPendingAction(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    CfxAuthService.clearUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithCfxForum,
        loginWithUsername,
        logout,
        isLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authPendingAction,
        setAuthPendingAction
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
