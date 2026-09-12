import React, { useState, useEffect } from 'react';
import { Coins, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PointAwardToast: React.FC = () => {
  const { pointToast, dismissPointToast } = useAuth();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsClosing(false);
  }, [pointToast?.id]);

  if (!pointToast) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      dismissPointToast();
      setIsClosing(false);
    }, 200);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100vw-3rem)] pointer-events-auto transition-all duration-300 ${
        isClosing ? 'animate-fadeOut translate-y-3 opacity-0' : 'animate-slideUp'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="relative p-4 rounded-2xl bg-[#09090d]/95 border border-amber-500/40 shadow-[0_16px_50px_-10px_rgba(245,158,11,0.35)] backdrop-blur-2xl overflow-hidden group">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* Animated Coin Icon */}
          <div className="relative shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/25 to-yellow-500/10 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Coins className="w-5 h-5 animate-bounce" />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-black tracking-wide">
                +{pointToast.points} MD Points
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400/70 font-mono">
                Reward
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-100 leading-snug line-clamp-2">
              {pointToast.label}
            </p>
          </div>
        </div>

        {/* 5-second animated progress timer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800/80 overflow-hidden">
          <div
            key={pointToast.id}
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 w-full animate-progress5s"
            style={{
              animation: 'progress5s 5s linear forwards'
            }}
          />
        </div>
      </div>
    </div>
  );
};
