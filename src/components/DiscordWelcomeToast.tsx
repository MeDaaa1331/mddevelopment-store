import React, { useEffect } from 'react';
import { MessageSquare, X, ExternalLink, Gift, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TEBEX_CONFIG } from '../config/tebex';

export const DiscordWelcomeToast: React.FC = () => {
  const { user, justLoggedIn, dismissJustLoggedIn } = useAuth();

  useEffect(() => {
    if (justLoggedIn) {
      const timer = setTimeout(() => {
        dismissJustLoggedIn();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [justLoggedIn, dismissJustLoggedIn]);

  if (!justLoggedIn || !user) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-slideDown">
      <div className="relative p-5 rounded-3xl bg-[#0c0c14]/95 border border-[#5865F2]/40 shadow-2xl backdrop-blur-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#5865F2]/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={dismissJustLoggedIn}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          aria-label="Dismiss welcome notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-11 h-11 rounded-2xl border border-white/20 object-cover shadow-md"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0c0c14]" />
          </div>

          <div className="flex-1 pr-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-display font-extrabold text-sm text-white">
                Welcome, {user.global_name || user.username}! 🎉
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Join our official Discord community to receive instant script update alerts, customer support & exclusive member discounts.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={dismissJustLoggedIn}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Dismiss
          </button>

          <a
            href={TEBEX_CONFIG.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={dismissJustLoggedIn}
            className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all shadow-glow-sm flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>Join Discord Server</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
