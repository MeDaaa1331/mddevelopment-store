import React, { useState } from 'react';
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
  Shield,
  Star,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TEBEX_CONFIG } from '../config/tebex';

export const UserProfileModal: React.FC = () => {
  const { user, isProfileModalOpen, setIsProfileModalOpen, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  if (!isProfileModalOpen || !user) return null;

  const joinDate = user.firstJoined
    ? new Date(user.firstJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recent Member';

  const lastActiveDate = user.lastActive
    ? new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="w-full max-w-xl rounded-3xl bg-[#0b0b10] border border-white/12 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#5865F2]/25 via-[#5865F2]/10 to-transparent border-b border-white/10">
          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 text-zinc-400 hover:text-white transition-all"
            aria-label="Close profile modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white/20 shadow-xl object-cover"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0b0b10] shadow-sm" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-xl sm:text-2xl text-white truncate">
                  {user.global_name || user.username}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[10px] font-mono font-bold text-[#8ea1ff]">
                  Discord Member
                </span>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-0.5 truncate">@{user.username}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  <span>Joined {joinDate}</span>
                </span>
                <span>•</span>
                <span>ID: {user.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-zinc-950/60">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud Sync & Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-white text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity History ({user.history?.length || 0})</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 font-sans text-sm selection:bg-white selection:text-black">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block">Cart Cloud Sync</span>
                    <span className="text-[11px] text-zinc-400 block mt-0.5 leading-relaxed">
                      Your shopping cart items are saved to your account and synced across all your devices.
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/10 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
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

              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#5865F2]/20 to-purple-600/10 border border-[#5865F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-extrabold text-xs transition-all shadow-glow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Connect to Discord</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2.5">
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
                      className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
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

        <div className="p-4 sm:p-5 border-t border-white/10 bg-zinc-950/80 flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-zinc-500">
            Last synced: {lastActiveDate}
          </span>
          <button
            onClick={() => {
              logout();
              setIsProfileModalOpen(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
