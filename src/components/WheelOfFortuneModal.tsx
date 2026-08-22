import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Gift,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Clock,
  Check,
  Copy,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Crown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { TEBEX_CONFIG } from '../config/tebex';
import { WheelPrize, SpinReward } from '../types/wheel';

const PRIZES: WheelPrize[] = [
  { id: 'none', label: 'No Luck', shortLabel: 'No Luck', discount: 0, color: '#18181b', textColor: '#a1a1aa', probability: 25 },
  { id: 'disc5', label: '5% Discount', shortLabel: '5% OFF', discount: 5, color: '#065f46', textColor: '#a7f3d0', probability: 20 },
  { id: 'disc10', label: '10% Discount', shortLabel: '10% OFF', discount: 10, color: '#0369a1', textColor: '#bae6fd', probability: 15 },
  { id: 'disc15', label: '15% Discount', shortLabel: '15% OFF', discount: 15, color: '#6d28d9', textColor: '#ddd6fe', probability: 15 },
  { id: 'disc30', label: '30% Discount', shortLabel: '30% OFF', discount: 30, color: '#be185d', textColor: '#fbcfe8', probability: 15 },
  { id: 'disc50', label: '50% Discount', shortLabel: '50% OFF', discount: 50, color: '#d97706', textColor: '#fef3c7', probability: 9 },
  { id: 'disc100', label: '100% FREE Script', shortLabel: '100% FREE', discount: 100, color: '#e11d48', textColor: '#ffffff', probability: 1, isJackpot: true }
];

interface WheelOfFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WheelOfFortuneModal: React.FC<WheelOfFortuneModalProps> = ({ isOpen, onClose }) => {
  const { user, isLoggedIn, loginWithDiscord, syncUserData } = useAuth();
  const { applyCoupon, setIsCartOpen } = useCart();

  const [inGuild, setInGuild] = useState<boolean>(true);
  const [canSpin, setCanSpin] = useState<boolean>(false);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [wonReward, setWonReward] = useState<SpinReward | null>(null);
  const [isNoLuck, setIsNoLuck] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const checkStatus = async () => {
    if (!user) {
      setCanSpin(false);
      return;
    }

    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/wheel/status?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setInGuild(data.inGuild);
        setCanSpin(data.canSpin);
        setRemainingMs(data.remainingMs || 0);
      }
    } catch (err) {
      setCanSpin(true);
      setInGuild(true);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (remainingMs <= 0) return;
    const interval = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          clearInterval(interval);
          setCanSpin(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingMs]);

  const handleSpin = async () => {
    if (!user || isSpinning || !canSpin) return;

    setIsSpinning(true);
    setWonReward(null);
    setIsNoLuck(false);

    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          global_name: user.global_name,
          avatarUrl: user.avatarUrl
        })
      });

      const data = await res.json();

      if (!data.success) {
        if (data.inGuild === false) {
          setInGuild(false);
        }
        if (data.cooldown) {
          setCanSpin(false);
          setRemainingMs(data.remainingMs || 86400000);
        }
        setIsSpinning(false);
        return;
      }

      const segmentAngle = 360 / PRIZES.length;
      const prizeIndex = data.prizeIndex ?? 0;
      const prizeCenterAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2);
      const targetRotation = (360 * 6) + (360 - prizeCenterAngle);

      setRotation(targetRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setCanSpin(false);
        setRemainingMs(86400000);

        if (data.discountPercentage > 0 && data.reward) {
          setWonReward(data.reward);
          try {
            confetti({
              particleCount: data.prize?.isJackpot ? 120 : 60,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#5865F2', '#34D399', '#FBBF24', '#F43F5E', '#ffffff']
            });
          } catch {}

          if (user) {
            syncUserData({
              lastSpin: Date.now(),
              rewards: [data.reward, ...(user.rewards || [])]
            });
          }
        } else {
          setIsNoLuck(true);
          if (user) {
            syncUserData({ lastSpin: Date.now() });
          }
        }
      }, 5200);

    } catch (err) {
      setIsSpinning(false);
    }
  };

  const handleApplyCoupon = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
    onClose();
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const formatCountdown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn selection:bg-white selection:text-black">
      <div
        className="w-full max-w-xl rounded-3xl bg-[#0c0c14] border border-white/15 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-5 sm:p-6 bg-gradient-to-br from-amber-500/20 via-[#5865F2]/15 to-transparent border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black shadow-glow-sm">
              <Gift className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-xl text-white tracking-tight">Daily Wheel of Fortune</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-mono font-bold text-amber-300">
                  24H Free Spin
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Spin daily to win exclusive Tebex store discounts up to 100% OFF</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-zinc-400 hover:text-white transition-all"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute -top-3 z-30 flex flex-col items-center">
              <div className="w-6 h-7 bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.8)] [clip-path:polygon(50%_100%,0_0,100%_0)]" />
            </div>

            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2.5 bg-zinc-900 border-4 border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.25)]">
              <div
                className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 5s cubic-bezier(0.12, 0.8, 0.2, 1)' : 'none'
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {PRIZES.map((prize, idx) => {
                    const count = PRIZES.length;
                    const angle = 360 / count;
                    const startAngle = (idx * angle) * (Math.PI / 180);
                    const endAngle = ((idx + 1) * angle) * (Math.PI / 180);
                    const x1 = 50 + 50 * Math.cos(startAngle);
                    const y1 = 50 + 50 * Math.sin(startAngle);
                    const x2 = 50 + 50 * Math.cos(endAngle);
                    const y2 = 50 + 50 * Math.sin(endAngle);
                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                    const textAngle = (idx * angle) + (angle / 2);
                    const textRad = textAngle * (Math.PI / 180);
                    const textX = 50 + 32 * Math.cos(textRad);
                    const textY = 50 + 32 * Math.sin(textRad);

                    return (
                      <g key={prize.id}>
                        <path d={pathData} fill={prize.color} stroke="#0c0c14" strokeWidth="1" />
                        <text
                          x={textX}
                          y={textY}
                          fill={prize.textColor}
                          fontSize={prize.isJackpot ? '4.8' : '5.2'}
                          fontWeight="900"
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                        >
                          {prize.shortLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-zinc-950 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl z-20">
                <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>
          </div>

          {wonReward && (
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-zinc-950 border border-emerald-500/50 text-center space-y-3 animate-scaleUp shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
                <Crown className="w-3.5 h-3.5" />
                <span>You Won {wonReward.label}! 🎉</span>
              </div>
              <div className="flex items-center justify-center gap-2 font-mono text-lg font-black text-white bg-black/50 p-2.5 rounded-xl border border-white/10">
                <span>{wonReward.code}</span>
                <button
                  onClick={() => handleCopy(wonReward.code)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
                  data-tooltip="Copy coupon code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">Valid for 24 hours on all FiveM scripts in store.</p>
              <button
                onClick={() => handleApplyCoupon(wonReward.code)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-glow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Apply to Cart & Go to Store</span>
              </button>
            </div>
          )}

          {isNoLuck && (
            <div className="w-full p-4 rounded-2xl bg-zinc-900/80 border border-white/10 text-center space-y-1.5 animate-fadeIn">
              <span className="text-sm font-bold text-zinc-200 block">Better Luck Next Time! 🍀</span>
              <p className="text-xs text-zinc-400">No discount won today. Your next free spin will be available in 24 hours!</p>
            </div>
          )}

          <div className="w-full space-y-3">
            {!isLoggedIn ? (
              <button
                onClick={loginWithDiscord}
                className="w-full py-3.5 rounded-2xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-sm transition-all shadow-glow-sm flex items-center justify-center gap-2 active:scale-95 hover:scale-[1.02]"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Sign In with Discord to Spin</span>
              </button>
            ) : !inGuild ? (
              <div className="p-4 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/30 space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#8ea1ff]">
                  <MessageSquare className="w-4 h-4" />
                  <span>Join MD Development Discord to Unlock Spin</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
                  Only members of our official Discord community can spin the daily wheel for free store coupons.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={TEBEX_CONFIG.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Join Discord Server</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={checkStatus}
                    disabled={isCheckingStatus}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-1.5"
                    data-tooltip="Recheck Discord Membership"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                    <span>Check</span>
                  </button>
                </div>
              </div>
            ) : remainingMs > 0 && !isSpinning ? (
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">Next Free Spin In:</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{formatCountdown(remainingMs)}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 uppercase px-2.5 py-1 rounded-lg bg-zinc-950 border border-white/5 font-bold">
                  Once / 24H
                </span>
              </div>
            ) : (
              <button
                onClick={handleSpin}
                disabled={isSpinning || !canSpin}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm tracking-wide transition-all shadow-[0_0_25px_rgba(251,191,36,0.6)] active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>{isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL NOW'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
