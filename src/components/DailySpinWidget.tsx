import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DailySpinWidgetProps {
  onOpen: () => void;
}

export const DailySpinWidget: React.FC<DailySpinWidgetProps> = ({ onOpen }) => {
  const { user, isLoggedIn } = useAuth();
  const [canSpin, setCanSpin] = useState<boolean>(true);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setCanSpin(true);
      setRemainingMs(0);
      return;
    }

    const now = Date.now();
    const lastSpin = user.lastSpin || 0;
    const cooldownMs = 86400000;
    const elapsed = now - lastSpin;

    if (lastSpin > 0 && elapsed < cooldownMs) {
      setCanSpin(false);
      setRemainingMs(cooldownMs - elapsed);
    } else {
      setCanSpin(true);
      setRemainingMs(0);
    }
  }, [user]);

  useEffect(() => {
    if (remainingMs <= 0) return;
    const timer = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          setCanSpin(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingMs]);

  const formatShort = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 animate-fadeIn">
      <button
        onClick={onOpen}
        className="relative group p-1 rounded-2xl bg-zinc-950/90 border border-amber-500/40 hover:border-amber-400 shadow-[0_10px_35px_-8px_rgba(245,158,11,0.35)] hover:shadow-[0_12px_45px_-5px_rgba(245,158,11,0.6)] backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2.5 pr-3.5 pl-2 py-2"
        data-tooltip="Daily Wheel of Fortune"
        data-tooltip-pos="top"
      >
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-md group-hover:rotate-12 transition-transform duration-300">
          <Gift className="w-5 h-5 stroke-[2.5]" />
          {canSpin && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black animate-ping" />
          )}
        </div>

        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-xs text-white tracking-tight">Daily Spin</span>
            {canSpin ? (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[9px] font-mono font-black animate-pulse">
                FREE
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-zinc-500" />
                <span>{formatShort(remainingMs)}</span>
              </span>
            )}
          </div>
          <span className="text-[10px] text-zinc-400 block font-medium">Win up to 100% OFF</span>
        </div>
      </button>
    </div>
  );
};
