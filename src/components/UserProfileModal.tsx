import React, { useState, useEffect } from 'react';
import {
  X,
  LogOut,
  MessageSquare,
  Cloud,
  CheckCircle2,
  Download,
  Copy,
  ShoppingCart,
  Calendar,
  ExternalLink,
  Star,
  Activity,
  Sparkles,
  Check,
  Gift,
  Tag,
  Coins,
  ArrowRight,
  Flame,
  Clock,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { TEBEX_CONFIG } from '../config/tebex';

const DISCOUNT_TIERS = [
  { discount: 10, cost: 100, label: '10% OFF Storewide', badge: 'STARTER' },
  { discount: 20, cost: 250, label: '20% OFF Storewide', badge: 'POPULAR' },
  { discount: 30, cost: 350, label: '30% OFF Storewide', badge: 'ADVANCED' },
  { discount: 50, cost: 500, label: '50% OFF Storewide', badge: 'BEST VALUE', isJackpot: true },
];

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, setIsProfileModalOpen, logout, pointsStatus, refreshPoints, redeemCoupon, buyExtraWheelSpin } = useAuth();
  const { applyCoupon, setIsCartOpen } = useCart();
  const { setIsWheelOpen, navigate } = useStore();

  const [activeTab, setActiveTab] = useState<'points' | 'overview' | 'rewards' | 'history'>('points');
  const [isClosing, setIsClosing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState<number | null>(null);
  const [isBuyingExtraSpin, setIsBuyingExtraSpin] = useState<boolean>(false);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);
  const [redeemErrorMsg, setRedeemErrorMsg] = useState<string | null>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsProfileModalOpen(false);
      setIsClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (isProfileModalOpen && user?.id) {
      refreshPoints();
    }
  }, [isProfileModalOpen, user?.id, refreshPoints]);

  useEffect(() => {
    if (!isProfileModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

  const currentPoints = pointsStatus?.points ?? user.points ?? 0;
  const totalEarned = pointsStatus?.totalPointsEarned ?? user.totalPointsEarned ?? currentPoints;
  const inGuild = pointsStatus?.inGuild ?? false;
  const redeemedCoupons = pointsStatus?.redeemedCoupons ?? user.redeemedCoupons ?? [];
  const pointsHistory = pointsStatus?.pointsHistory ?? user.pointsHistory ?? [];
  const cooldowns = pointsStatus?.cooldowns;

  const wheelRemainingMs = cooldowns?.wheelSpinRemainingMs ?? 0;
  const devToolsRemainingMs = cooldowns?.devToolsRemainingMs ?? 0;
  const canSpinWheel = cooldowns ? (cooldowns.canSpinWheel !== false && wheelRemainingMs === 0) : true;
  const canUseDevTools = cooldowns ? (cooldowns.canUseDevToolsForPoints !== false && devToolsRemainingMs === 0) : true;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyCoupon = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleApplyCoupon = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
    handleClose();
  };

  const handleRedeem = async (tier: typeof DISCOUNT_TIERS[0]) => {
    if (currentPoints < tier.cost) return;
    setIsRedeeming(tier.discount);
    setRedeemSuccessMsg(null);
    setRedeemErrorMsg(null);

    const result = await redeemCoupon(tier.discount);
    setIsRedeeming(null);

    if (result.success && result.coupon) {
      setRedeemSuccessMsg(`Successfully redeemed code ${result.coupon.code} for ${tier.discount}% OFF!`);
      setTimeout(() => setRedeemSuccessMsg(null), 6000);
    } else {
      setRedeemErrorMsg(result.error || 'Failed to redeem discount coupon.');
      setTimeout(() => setRedeemErrorMsg(null), 6000);
    }
  };

  const handleBuyExtraSpinFromProfile = async () => {
    if (canSpinWheel) {
      handleClose();
      setIsWheelOpen(true);
      return;
    }

    if (currentPoints < 300) {
      setRedeemErrorMsg(`Nemáš dostatek MD Pointů. Máš ${currentPoints} pts, k odemknutí zatočení je potřeba 300 pts.`);
      setTimeout(() => setRedeemErrorMsg(null), 5000);
      return;
    }

    setIsBuyingExtraSpin(true);
    setRedeemErrorMsg(null);
    setRedeemSuccessMsg(null);

    const res = await buyExtraWheelSpin();
    setIsBuyingExtraSpin(false);

    if (res.success) {
      setRedeemSuccessMsg('Zatočení navíc zakoupeno za 300 MD Pointů! Otevírám kolo štěstí...');
      setTimeout(() => {
        handleClose();
        setIsWheelOpen(true);
      }, 700);
    } else {
      setRedeemErrorMsg(res.error || 'Nepodařilo se zakoupit zatočení.');
      setTimeout(() => setRedeemErrorMsg(null), 5000);
    }
  };

  const joinDate = user.firstJoined
    ? new Date(user.firstJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent Member';

  const lastActiveDate = user.lastActive
    ? new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  const wheelRewards = user.rewards || [];

  // Calculate next reward goal
  const nextTier = DISCOUNT_TIERS.find(t => currentPoints < t.cost);
  const progressPercent = nextTier
    ? Math.min(100, Math.round((currentPoints / nextTier.cost) * 100))
    : 100;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-2xl h-[620px] max-h-[92vh] rounded-3xl bg-[#0b0b10] border border-white/12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col ${
          isClosing ? 'animate-scaleDown' : 'animate-scaleUp'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#5865F2]/25 via-[#5865F2]/10 to-transparent border-b border-white/10 overflow-hidden shrink-0">
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 z-30 flex items-center justify-center cursor-pointer shadow-md"
            aria-label="Close profile modal"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 pr-8">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 group">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-xl object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b0b10] shadow-sm animate-pulse" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-display font-black text-xl text-white truncate">
                    {user.global_name || user.username}
                  </h2>
                  {inGuild ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[10px] font-mono font-bold text-[#8ea1ff] flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      Discord Member
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/90 border border-white/15 text-[10px] font-mono font-bold text-zinc-300 flex items-center gap-1 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Logged In
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-zinc-400 mt-0.5 truncate">@{user.username}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    <span>Joined {joinDate}</span>
                  </span>
                  <span>•</span>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    data-tooltip="Copy Discord ID"
                    data-tooltip-pos="top"
                  >
                    <span>ID: {user.id.slice(0, 8)}...</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-500" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Points Badge in Header */}
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-600/15 border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] self-start sm:self-center">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-sm">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-300/80 uppercase block">MD Points</span>
                <span className="font-mono text-lg font-black text-amber-300 leading-none">
                  {currentPoints.toLocaleString()} <span className="text-xs font-semibold text-amber-400/70">pts</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-zinc-950/60 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('points')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'points'
                ? 'border-amber-400 text-amber-300 shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>MD Points & Rewards</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-[10px] font-mono font-bold text-amber-300">
              {currentPoints}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-white text-white shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Overview & Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'rewards'
                ? 'border-white text-white shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-purple-400" />
            <span>Wheel Rewards ({wheelRewards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'border-white text-white shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Activity History</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 font-sans text-sm selection:bg-white selection:text-black">
          {/* TAB 1: MD POINTS */}
          {activeTab === 'points' && (
            <div className="space-y-6 animate-fadeIn transition-opacity duration-300">
              {/* Feedback Toasts */}
              {redeemSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-slideDown">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{redeemSuccessMsg}</span>
                </div>
              )}
              {redeemErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2 animate-slideDown">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{redeemErrorMsg}</span>
                </div>
              )}

              {/* Points Hero Card */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-black border border-amber-400/25 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                        Current Points Balance
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
                        {currentPoints.toLocaleString()}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">MD Points</span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-500 mt-1 block">
                      Lifetime points earned: <strong className="text-zinc-300">{totalEarned.toLocaleString()} pts</strong>
                    </span>
                  </div>

                  <div className="w-full sm:w-72 md:w-80 p-3.5 rounded-xl bg-black/50 border border-white/10 text-xs shrink-0">
                    <div className="flex items-center justify-between gap-2.5 mb-1.5 text-[11px] font-mono">
                      <span className="text-zinc-400 whitespace-nowrap">Next Discount Goal</span>
                      <span className="text-amber-300 font-bold whitespace-nowrap">
                        {nextTier ? `${nextTier.discount}% OFF (${nextTier.cost} pts)` : 'MAX TIER!'}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 mt-1 block text-right">
                      {nextTier
                        ? `${Math.max(0, nextTier.cost - currentPoints)} points needed`
                        : 'All reward tiers available to claim!'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Redeem Tiers Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h3 className="font-display font-bold text-sm text-white">Redeem Discount Coupons</h3>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">1 single-use Tebex coupon per claim</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DISCOUNT_TIERS.map(tier => {
                    const canAfford = currentPoints >= tier.cost;
                    const isProcessing = isRedeeming === tier.discount;

                    return (
                      <div
                        key={tier.discount}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                          canAfford
                            ? 'bg-zinc-900/80 border-amber-400/30 hover:border-amber-400/60 shadow-[0_4px_20px_-8px_rgba(245,158,11,0.2)]'
                            : 'bg-zinc-950/60 border-white/10 opacity-75'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-display font-black text-2xl text-white tracking-tight">
                                {tier.discount}% OFF
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  tier.isJackpot
                                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse'
                                    : 'bg-white/5 text-zinc-400 border border-white/10'
                                }`}
                              >
                                {tier.badge}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 block">{tier.label}</span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono text-sm font-black text-amber-300 block">
                              {tier.cost} <span className="text-[10px] font-normal text-amber-400/80">pts</span>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRedeem(tier)}
                          disabled={!canAfford || isProcessing}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-glow-sm hover:scale-[1.02] active:scale-[0.98]'
                              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Generating Coupon...</span>
                            </>
                          ) : canAfford ? (
                            <>
                              <Gift className="w-3.5 h-3.5" />
                              <span>Redeem for {tier.cost} Points</span>
                            </>
                          ) : (
                            <span>Need {tier.cost - currentPoints} more pts</span>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Reward: Extra Wheel Spin (Skip Cooldown) */}
              <div className="p-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-white">Extra Wheel of Fortune Spin</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        SKIP COOLDOWN
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Přeskoč 24hodinový cooldown a získej okamžité zatočení kolem štěstí navíc.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                  <div className="text-right">
                    <span className="font-mono text-sm font-black text-amber-300 block">
                      300 <span className="text-[10px] font-normal text-amber-400/80">pts</span>
                    </span>
                  </div>
                  <button
                    onClick={handleBuyExtraSpinFromProfile}
                    disabled={isBuyingExtraSpin || (!canSpinWheel && currentPoints < 300)}
                    className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      canSpinWheel
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-glow-sm hover:scale-[1.02] active:scale-[0.98]'
                        : currentPoints >= 300
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-glow-sm hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    {isBuyingExtraSpin ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Aktivuji...</span>
                      </>
                    ) : canSpinWheel ? (
                      <>
                        <Gift className="w-3.5 h-3.5" />
                        <span>Roztočit zdarma</span>
                      </>
                    ) : currentPoints >= 300 ? (
                      <>
                        <Coins className="w-3.5 h-3.5" />
                        <span>Koupit za 300 pts</span>
                      </>
                    ) : (
                      <span>Chybí {300 - currentPoints} pts</span>
                    )}
                  </button>
                </div>
              </div>

              {/* My Claimed Discount Codes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-display font-bold text-sm text-white">
                      My Redeemed Discount Codes ({redeemedCoupons.length})
                    </h3>
                  </div>
                </div>

                {redeemedCoupons.length === 0 ? (
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
                    <p className="text-xs text-zinc-500">
                      You have not redeemed any discount codes yet. Earn points by using DevTools, spinning the wheel, or downloading free scripts!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {redeemedCoupons.map(coupon => (
                      <div
                        key={coupon.id}
                        className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                            {coupon.discount}%
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-white tracking-wider">
                                {coupon.code}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                                {coupon.discount}% OFF
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-500 block mt-0.5">
                              Claimed on {new Date(coupon.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyCoupon(coupon.id, coupon.code)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            {copiedCodeId === coupon.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedCodeId === coupon.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button
                            onClick={() => handleApplyCoupon(coupon.code)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Apply to Cart</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Earn More Points Checklist */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="font-display font-bold text-sm text-white">How to Earn MD Points</h3>
                </div>

                <div className="space-y-2">
                  {/* 1. Discord Login */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">First Discord Sign-in</span>
                        <span className="text-[11px] text-zinc-400 block">Sign in with your Discord account (one-time)</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shrink-0">
                      ✓ Claimed (+100 pts)
                    </span>
                  </div>

                  {/* 2. Join Discord */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#5865F2]/15 text-[#8ea1ff] flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Join MD Development Discord</span>
                        <span className="text-[11px] text-zinc-400 block">Be an active member of our official community (one-time)</span>
                      </div>
                    </div>
                    {inGuild ? (
                      <span className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shrink-0">
                        ✓ Claimed (+50 pts)
                      </span>
                    ) : (
                      <a
                        href={TEBEX_CONFIG.discordUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center gap-1 shrink-0"
                      >
                        <span>Join (+50 pts)</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* 3. Daily Wheel Spin */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Daily Wheel of Fortune</span>
                        <span className="text-[11px] text-zinc-400 block">Spin the wheel once every 24 hours</span>
                      </div>
                    </div>
                    {canSpinWheel ? (
                      <button
                        onClick={() => {
                          handleClose();
                          setIsWheelOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>Spin (+20 pts)</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-400 font-mono text-xs font-bold hidden sm:flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Cooldown</span>
                        </span>
                        <button
                          onClick={handleBuyExtraSpinFromProfile}
                          disabled={isBuyingExtraSpin || currentPoints < 300}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                            currentPoints >= 300
                              ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                              : 'bg-zinc-800 text-zinc-400 border border-white/5 cursor-not-allowed opacity-80'
                          }`}
                          title="Přeskočit 24h cooldown za 300 MD Pointů"
                        >
                          {isBuyingExtraSpin ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Coins className="w-3 h-3 text-amber-900" />
                          )}
                          <span>Přeskočit cooldown (300 pts)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4. DevTools Usage */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Use FiveM DevTools</span>
                        <span className="text-[11px] text-zinc-400 block">Perform an action in any DevTool (once per 24 hours)</span>
                      </div>
                    </div>
                    {canUseDevTools ? (
                      <button
                        onClick={() => {
                          handleClose();
                          navigate('/devtools');
                        }}
                        className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <span>Use Tool (+20 pts)</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 font-mono text-xs font-bold flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>Completed Today</span>
                      </span>
                    )}
                  </div>

                  {/* 5. Free Scripts Download */}
                  <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Download Free FiveM Scripts</span>
                        <span className="text-[11px] text-zinc-400 block">Earn +20 points for each unique free script downloaded</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold shrink-0">
                      +20 pts / script
                    </span>
                  </div>
                </div>
              </div>

              {/* Points History Log */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-zinc-400" />
                  <h3 className="font-display font-bold text-sm text-white">Points Activity Log</h3>
                </div>

                {pointsHistory.length === 0 ? (
                  <p className="text-xs text-zinc-500">No point transactions yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {pointsHistory.map(item => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-zinc-200 block">{item.label}</span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            item.points > 0
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {item.points > 0 ? `+${item.points}` : item.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn transition-opacity duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-start gap-3 hover:border-white/20 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Cart Cloud Sync</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5 leading-relaxed">
                      Your shopping cart items are saved to your account and synced across all your devices.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-start gap-3 hover:border-white/20 transition-all group">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5 fill-amber-400" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Favorite DevTools</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5 leading-relaxed">
                      Pinned developer tools are securely bound to your Discord profile.
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#5865F2]/20 to-purple-600/10 border border-[#5865F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#5865F2]/60">
                <div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#8ea1ff]" />
                    <span className="font-bold text-sm text-white">Join Official Discord (+50 MD Points)</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 max-w-sm leading-relaxed">
                    Get access to customer support, real-time script updates, free release notifications & customer role.
                  </p>
                </div>
                <a
                  href={TEBEX_CONFIG.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all shadow-glow-sm flex items-center justify-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Connect to Discord</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: WHEEL REWARDS */}
          {activeTab === 'rewards' && (
            <div className="space-y-3 animate-fadeIn transition-opacity duration-300">
              {wheelRewards.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
                  <Gift className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-zinc-300 block">No Wheel Rewards Yet</span>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                    Spin the Daily Wheel of Fortune to win discounts up to 100% OFF for the Tebex store.
                  </p>
                </div>
              ) : (
                wheelRewards.map(rew => {
                  const isExpired = Date.now() > rew.expiresAt;
                  const hoursLeft = Math.max(0, Math.round((rew.expiresAt - Date.now()) / (1000 * 60 * 60)));

                  return (
                    <div
                      key={rew.id}
                      className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/25 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white block">{rew.label}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isExpired ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {isExpired ? 'Expired' : `${hoursLeft}h left`}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-amber-300 font-bold block mt-0.5">{rew.code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCoupon(rew.id, rew.code)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedCodeId === rew.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCodeId === rew.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        {!isExpired && (
                          <button
                            onClick={() => handleApplyCoupon(rew.code)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Apply</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: GENERAL HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2.5 animate-fadeIn transition-opacity duration-300">
              {(!user.history || user.history.length === 0) ? (
                <div className="p-8 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
                  <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-zinc-300 block">No activity recorded yet</span>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                    Exported handling files, translated script locales, and copied code snippets will appear here.
                  </p>
                </div>
              ) : (
                user.history.map(item => {
                  const dateStr = new Date(item.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/20 hover:bg-zinc-900/90 transition-all hover:translate-x-1"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                          {item.type === 'download' && <Download className="w-4 h-4 text-emerald-400" />}
                          {item.type === 'export' && <Download className="w-4 h-4 text-cyan-400" />}
                          {item.type === 'copy' && <Copy className="w-4 h-4 text-amber-400" />}
                          {item.type === 'purchase' && <ShoppingCart className="w-4 h-4 text-purple-400" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                          <span className="text-[10px] font-mono text-zinc-400 block">{dateStr}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono text-zinc-400 uppercase font-bold shrink-0">
                        {item.type}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-mono text-zinc-500">
            Last synced: {lastActiveDate}
          </span>
          <button
            onClick={() => {
              logout();
              handleClose();
            }}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 hover:scale-105 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
