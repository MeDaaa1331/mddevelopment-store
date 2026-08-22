import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DiscordLoginPrompt: React.FC = () => {
  const { isLoggedIn, loginWithDiscord } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      setIsVisible(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('md_discord_prompt_dismissed');
      if (dismissed) return;

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('md_discord_prompt_dismissed', 'true');
    }
  };

  if (!isVisible || isLoggedIn) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 max-w-sm w-[calc(100vw-3rem)] animate-slideUp">
      <div className="relative p-5 rounded-3xl bg-[#0c0c14]/95 border border-[#5865F2]/30 shadow-2xl backdrop-blur-2xl overflow-hidden group">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#5865F2]/20 rounded-full blur-2xl pointer-events-none" />
        
        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          aria-label="Dismiss login prompt"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-glow-sm">
            <MessageSquare className="w-5 h-5 fill-white" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-display font-extrabold text-sm text-white">Unlock Full Potential</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Sign in with Discord to sync your cart across devices, save favorite FiveM DevTools & unlock exclusive member perks.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={handleDismiss}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Maybe later
          </button>

          <button
            onClick={loginWithDiscord}
            className="px-3.5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all shadow-glow-sm flex items-center gap-1.5 active:scale-95"
          >
            <span>Sign in with Discord</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
