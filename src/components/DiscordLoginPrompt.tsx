import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DiscordLoginPrompt: React.FC = () => {
  const { isLoggedIn, loginWithDiscord } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
      }, 2600);

      return () => clearTimeout(timer);
    }
  }, [isLoggedIn]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('md_discord_prompt_dismissed', 'true');
      }
    }, 220);
  };

  if (!isVisible || isLoggedIn) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-40 max-w-sm w-[calc(100vw-3rem)] ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}>
      <div className="relative p-5 rounded-3xl bg-[#0c0c14]/95 border border-[#5865F2]/40 shadow-[0_12px_40px_-10px_rgba(88,101,242,0.3)] backdrop-blur-2xl overflow-hidden group transition-all duration-300 hover:border-[#5865F2]/70 hover:shadow-[0_16px_50px_-8px_rgba(88,101,242,0.45)]">
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#5865F2]/25 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95"
          aria-label="Dismiss login prompt"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="relative w-11 h-11 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-[0_0_20px_rgba(88,101,242,0.6)] group-hover:scale-105 transition-transform duration-300">
            <MessageSquare className="w-5 h-5 fill-white transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-[#0c0c14] animate-ping" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-display font-extrabold text-sm text-white tracking-tight">
                Unlock Full Potential
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Sign in with Discord to sync your cart across devices, save favorite FiveM DevTools & unlock exclusive member perks.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={handleDismiss}
            className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors px-2 py-1"
          >
            Maybe later
          </button>

          <button
            onClick={loginWithDiscord}
            className="relative overflow-hidden px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all duration-200 shadow-glow-sm flex items-center gap-1.5 active:scale-95 hover:scale-105 hover:shadow-[0_0_20px_rgba(88,101,242,0.8)]"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 pointer-events-none" />
            <span>Sign in with Discord</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
