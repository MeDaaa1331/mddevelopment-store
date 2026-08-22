import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ExternalLink, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { TEBEX_CONFIG } from '../config/tebex';

export const DiscordWelcomeToast: React.FC = () => {
  const { user, justLoggedIn, dismissJustLoggedIn } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (justLoggedIn && user) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.15, x: 0.85 },
          colors: ['#5865F2', '#34D399', '#FBBF24', '#ffffff']
        });
      } catch {}

      const timer = setTimeout(() => {
        handleDismiss();
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [justLoggedIn, user]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      dismissJustLoggedIn();
      setIsClosing(false);
    }, 240);
  };

  if (!justLoggedIn || !user) return null;

  return (
    <div className={`fixed top-20 right-6 z-50 max-w-md w-[calc(100vw-3rem)] ${isClosing ? 'animate-slideUp' : 'animate-slideDown'}`}>
      <div className="relative p-5 rounded-3xl bg-[#0c0c14]/95 border border-[#5865F2]/50 shadow-[0_16px_50px_-10px_rgba(88,101,242,0.4)] backdrop-blur-2xl overflow-hidden group transition-all duration-300 hover:border-[#5865F2]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={handleDismiss}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95"
          aria-label="Dismiss welcome notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-12 h-12 rounded-2xl border-2 border-[#5865F2]/60 object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0c14] shadow-sm animate-pulse" />
          </div>

          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-display font-extrabold text-sm text-white tracking-tight">
                Welcome, {user.global_name || user.username}! 🎉
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Join our official Discord community to receive instant script update alerts, customer support & exclusive member discounts.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors px-2 py-1"
          >
            Dismiss
          </button>

          <a
            href={TEBEX_CONFIG.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDismiss}
            className="relative overflow-hidden px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all duration-200 shadow-glow-sm flex items-center gap-1.5 active:scale-95 hover:scale-105 hover:shadow-[0_0_25px_rgba(88,101,242,0.8)]"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 pointer-events-none" />
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>Join Discord Server</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#5865F2]/20 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#5865F2] to-emerald-400 w-full animate-[shrinkBar_12s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
};
