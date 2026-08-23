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
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { TEBEX_CONFIG } from '../config/tebex';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, setIsProfileModalOpen, logout } = useAuth();
  const { applyCoupon, setIsCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history'>('overview');
  const [isClosing, setIsClosing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [inGuild, setInGuild] = useState<boolean | null>(null);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsProfileModalOpen(false);
      setIsClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (!isProfileModalOpen || !user?.id) return;
    let isMounted = true;
    fetch(`/api/wheel/status?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && typeof data?.inGuild === 'boolean') {
          setInGuild(data.inGuild);
        }
      })
      .catch(() => {
        if (isMounted) setInGuild(false);
      });
    return () => { isMounted = false; };
  }, [isProfileModalOpen, user?.id]);

  useEffect(() => {
    if (!isProfileModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isProfileModalOpen]);

  if (!isProfileModalOpen || !user) return null;

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

  const joinDate = user.firstJoined
    ? new Date(user.firstJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent Member';

  const lastActiveDate = user.lastActive
    ? new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  const rewards = user.rewards || [];

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
      onClick={handleClose}
    >
      <div
        className={`w-full max-w-xl h-[560px] max-h-[90vh] rounded-3xl bg-[#0b0b10] border border-white/12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col ${
          isClosing ? 'animate-scaleDown' : 'animate-scaleUp'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-6 sm:p-7 bg-gradient-to-br from-[#5865F2]/25 via-[#5865F2]/10 to-transparent border-b border-white/10 overflow-hidden shrink-0">
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-[#5865F2]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <button
            onClick={handleClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all hover:scale-110 active:scale-95 z-30 flex items-center justify-center cursor-pointer shadow-md"
            aria-label="Close profile modal"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>

          <div className="flex items-center gap-4 sm:gap-5 relative z-10">
            <div className="relative shrink-0 group">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-white/20 shadow-xl object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b0b10] shadow-sm animate-pulse" />
            </div>

            <div className="flex-1 min-w-0 pr-8">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-xl sm:text-2xl text-white truncate">
                  {user.global_name || user.username}
                </h2>
                {inGuild ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[10px] font-mono font-bold text-[#8ea1ff] flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    Discord Member
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/90 border border-white/15 text-[10px] font-mono font-bold text-zinc-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Logged In
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-0.5 truncate">@{user.username}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-2 flex-wrap">
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
        </div>

        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-zinc-950/60 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-white text-white shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'rewards'
                ? 'border-white text-white shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Wheel Rewards ({rewards.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-white text-white shadow-sm'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>History ({user.history?.length || 0})</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans text-sm selection:bg-white selection:text-black">
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
                    <span className="font-bold text-sm text-white">Join Official Discord</span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 max-w-sm leading-relaxed">
                    Get access to customer support, real-time script updates, free release notifications & customer role.
                  </p>
                </div>
                <a
                  href={TEBEX_CONFIG.discordUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all shadow-glow-sm flex items-center justify-center gap-1.5 shrink-0 hover:scale-105 active:scale-95"
                >
                  <span>Connect to Discord</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-3 animate-fadeIn transition-opacity duration-300">
              {rewards.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-950/60 border border-white/5 text-center">
                  <Gift className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <span className="text-xs font-bold text-zinc-300 block">No Wheel Rewards Yet</span>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-xs mx-auto">
                    Spin the Daily Wheel of Fortune to win discounts up to 100% OFF for the Tebex store.
                  </p>
                </div>
              ) : (
                rewards.map(rew => {
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
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isExpired ? 'bg-zinc-800 text-zinc-500' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
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
                          data-tooltip="Copy Coupon Code"
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
