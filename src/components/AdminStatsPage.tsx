import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Copy,
  Eye,
  Globe,
  Compass,
  Smartphone,
  Monitor,
  Search,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Flame,
  Shield,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Database,
  Trash2,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { getStoredAnalytics, resetAllAnalytics, AnalyticsSummary, DevToolEvent } from '../utils/analytics';
import { useStore } from '../context/StoreContext';

const ADMIN_PIN = '8616';

export const AdminStatsPage: React.FC = () => {
  const { navigate } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'items' | 'live' | 'geo' | 'discord'>('overview');
  const [discordSearch, setDiscordSearch] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState<any | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('md_admin_auth');
    }
  }, []);

  const loadStats = async () => {
    setIsRefreshing(true);
    try {
      const stats = await getStoredAnalytics();
      setData(stats);
    } catch (e) {
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
  };

  const handleResetData = async () => {
    await resetAllAnalytics();
    setShowResetConfirm(false);
    await loadStats();
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `md-devtools-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center mb-5 text-emerald-400 shadow-glow-sm">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="font-display font-extrabold text-2xl text-white mb-2">
            MD Admin Analytics
          </h2>
          <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed">
            Enter the admin PIN to access live DevTools usage statistics, popular tools, and GTA V community queries.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <input
                type="password"
                maxLength={10}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  if (pinError) setPinError(false);
                }}
                placeholder=""
                autoFocus
                className={`w-full px-4 py-3 rounded-xl bg-zinc-900 border text-center font-mono text-lg font-bold tracking-widest text-white placeholder-zinc-600 focus:outline-none transition-colors ${
                  pinError ? 'border-red-500/60 bg-red-950/20 text-red-300' : 'border-white/10 focus:border-white/30'
                }`}
              />
              {pinError && (
                <p className="text-red-400 text-xs font-mono mt-1.5 font-semibold">
                  Incorrect PIN. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all shadow-glow-white flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4 text-black" />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 w-full flex items-center justify-between text-[11px] text-zinc-500">
            <span>MD Development © 2026</span>
            <button
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortedRecentEvents = (data?.recentEvents || []).slice().sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-zinc-950 border border-red-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Reset All Analytics?</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                This action will permanently wipe all analytics counters from the database and local cache. Metrics will restart from zero.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-glow-sm"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-sm">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black text-lg text-white">MD Analytics & Stats</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400">DevTools usage metrics, popularity rankings & GTA V query trends</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono font-bold text-zinc-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All-Time Stats</span>
            </div>

            <button
              onClick={loadStats}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all"
              data-tooltip="Refresh live stats"
              data-tooltip-pos="bottom"
              aria-label="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
              data-tooltip="Export stats to JSON"
              data-tooltip-pos="bottom"
              aria-label="Export JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-xs font-semibold text-red-300 transition-all flex items-center gap-1.5"
              data-tooltip="Reset all analytics"
              data-tooltip-pos="bottom"
              aria-label="Reset stats"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Total Tool Actions</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="font-display font-black text-3xl text-white">
                {(data?.totalEvents || 0).toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Recorded events</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Code Copies & Exports</span>
              <Copy className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <span className="font-display font-black text-3xl text-white">
                {(data?.totalCopies || 0).toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium mt-1">
                <span>Lua, ox_lib, XML & JSON</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Copy Conversion Rate</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-3">
              <span className="font-display font-black text-3xl text-white">
                {data?.totalViews && data.totalViews > 0 ? Math.round((data.totalCopies / data.totalViews) * 100) : 0}%
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-1">
                <span>Copy to view ratio</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Total Activity</span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div className="mt-3">
              <span className="font-display font-black text-3xl text-white">
                {(data?.activeInteractions || 0).toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium mt-1">
                <span>Total interactions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Top Charts', icon: BarChart3 },
            { id: 'tools', label: 'Tool Leaderboard', icon: Flame },
            { id: 'items', label: 'Top GTA V Items & Queries', icon: Search },
            { id: 'live', label: 'Live Activity Stream', icon: Activity },
            { id: 'geo', label: 'Geography & Traffic', icon: Globe },
            { id: 'discord', label: `Discord Members (${data?.totalDiscordUsers || (data?.discordUsers?.length || 0)})`, icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                  active
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-base text-white">Most Popular Dev Tools</h3>
                  <p className="text-xs text-zinc-400">Ranked by code copies and daily usage</p>
                </div>
                <button
                  onClick={() => setActiveTab('tools')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <span>View All 14 Tools</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {(data?.toolRankings || []).slice(0, 6).map((tool, idx) => {
                  const maxCopies = Math.max(1, data?.toolRankings[0]?.copies || 1);
                  const pct = tool.copies > 0 ? Math.round((tool.copies / maxCopies) * 100) : 0;
                  return (
                    <div key={tool.toolId} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-mono text-[11px] font-black shrink-0 ${
                            idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white truncate">{tool.toolName}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                          <span className="text-zinc-400"><strong className="text-white">{tool.views}</strong> views</span>
                          <span className="text-emerald-400 font-bold"><strong className="text-white">{tool.copies}</strong> copies ({tool.copyRate}%)</span>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Stream</span>
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                {sortedRecentEvents.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                    <p className="text-xs text-zinc-400 font-mono">Zatím žádné zaznamenané akce.</p>
                    <p className="text-[11px] text-zinc-500 mt-1">Otevři jakoukoliv toolku a zkopíruj kód pro otestování.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {sortedRecentEvents.slice(0, 6).map(ev => (
                      <div key={ev.id} className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/40">
                            {ev.toolName}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {Math.max(0, Math.floor((Date.now() - ev.timestamp) / 1000))}s ago
                          </span>
                        </div>
                        <span className="text-white font-medium text-[11px] truncate">
                          {ev.label || ev.action}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setActiveTab('live')}
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all text-center"
                >
                  Open Full Activity Stream
                </button>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-display font-extrabold text-sm text-white">Upstash Redis Status</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Analytics engine running live in production mode connected to Upstash Cloud Redis.
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-zinc-300 flex items-center justify-between">
                  <span>Target:</span>
                  <span className="text-emerald-400 font-bold">/api/track & /api/stats</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">Complete Tool Usage Leaderboard</h3>
              <p className="text-xs text-zinc-400">All 14 developer utilities sorted by active engagement and code generation</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="pb-3">Rank & Tool Name</th>
                    <th className="pb-3">Total Views</th>
                    <th className="pb-3">Code Copies</th>
                    <th className="pb-3">Copy Rate</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(data?.toolRankings || []).map((tool, idx) => (
                    <tr key={tool.toolId} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 pr-4 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-black shrink-0 ${
                          idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-zinc-300 text-black' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-white block">{tool.toolName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{tool.toolId}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-mono font-bold text-white">
                        {tool.views.toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-4 font-mono font-bold text-emerald-400">
                        {tool.copies.toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{tool.copyRate}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-emerald-400 rounded-full"
                              style={{ width: `${tool.copyRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => navigate('/devtools')}
                          className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors"
                        >
                          Launch Tool
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Top Copied GTA V Items</h3>
                <p className="text-xs text-zinc-400">Most configured weapons, peds, blips and flag codes</p>
              </div>

              {(data?.topItems || []).length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-mono">Zatím žádné vybrané položky.</p>
                  <p className="text-[11px] text-zinc-500 mt-1">Zkopíruj kód v některé toolce a položka se zde okamžitě objeví.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(data?.topItems || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-zinc-300">
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-white truncate">{item.name}</span>
                      </div>

                      <span className="font-mono font-bold text-xs text-emerald-400 shrink-0">
                        {item.count}× configured
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Top Search Queries</h3>
                <p className="text-xs text-zinc-400">What developers are actively searching for inside your DevTools</p>
              </div>

              {(data?.topSearches || []).length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-mono">Zatím žádná vyhledávání.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(data?.topSearches || []).map((searchItem, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="text-xs font-mono font-semibold text-white truncate">"{searchItem.query}"</span>
                      </div>

                      <span className="font-mono font-bold text-xs text-zinc-400 shrink-0">
                        {searchItem.count} searches
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'live' && (
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Real-time Live Activity Stream</span>
                </h3>
                <p className="text-xs text-zinc-400">Live stream of developer interactions, code generation & exports (nejnovější nahoře)</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Listening
              </span>
            </div>

            {sortedRecentEvents.length === 0 ? (
              <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                <p className="text-sm font-bold text-white mb-1">Žádné zaznamenané akce</p>
                <p className="text-xs text-zinc-400">Jakmile někdo otevře toolku nebo zkopíruje kód, akce se okamžitě zobrazí zde.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedRecentEvents.map(ev => (
                  <div key={ev.id} className="p-4 rounded-2xl bg-zinc-900/70 border border-white/5 flex items-center justify-between gap-4 flex-wrap hover:border-white/15 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white shrink-0">
                        {ev.action.startsWith('copy') ? <Copy className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-white">{ev.toolName}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-white/10 text-zinc-300">
                            {ev.action}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono mt-0.5">{ev.label || 'Tool interaction'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{ev.country || 'CZ'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>{ev.device || 'Desktop'}</span>
                      </span>
                      <span className="text-zinc-400">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'geo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Geographic Distribution</h3>
                <p className="text-xs text-zinc-400">Where developers are accessing your tools from</p>
              </div>

              {(data?.topCountries || []).length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-mono">Zatím žádná geolokační data.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(data?.topCountries || []).map(country => (
                    <div key={country.code} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-white">
                          <span className="font-mono text-zinc-400">[{country.code}]</span>
                          <span>{country.name}</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{country.count} ({country.percentage}%)</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${country.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Traffic Sources (Referrers)</h3>
                <p className="text-xs text-zinc-400">How developers found your DevTools suite</p>
              </div>

              {(data?.topReferrers || []).length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                  <p className="text-xs text-zinc-400 font-mono">No referrer traffic recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(data?.topReferrers || []).map((ref, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{ref.source}</span>
                        <span className="font-mono text-cyan-400 font-bold">{ref.count} ({ref.percentage}%)</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-400"
                          style={{ width: `${ref.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'discord' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase font-bold">Registered Members</span>
                  <span className="font-display font-black text-2xl text-white block mt-1">
                    {data?.totalDiscordUsers || (data?.discordUsers?.length || 0)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-[#8ea1ff]">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase font-bold">Cloud Synced Carts</span>
                  <span className="font-display font-black text-2xl text-white block mt-1">
                    {(data?.discordUsers || []).filter(u => u.cart && u.cart.length > 0).length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-zinc-400 uppercase font-bold">Tool Downloads / Copies</span>
                  <span className="font-display font-black text-2xl text-white block mt-1">
                    {(data?.discordUsers || []).reduce((acc, u) => acc + (u.downloadsCount || u.history?.length || 0), 0)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Download className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-extrabold text-base text-white">Discord Member Accounts</h3>
                  <p className="text-xs text-zinc-400">Users who authenticated via Discord OAuth2</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search by name, ID or country..."
                    value={discordSearch}
                    onChange={e => setDiscordSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              {(() => {
                const allUsers = data?.discordUsers || [];
                const filtered = allUsers.filter(u => {
                  if (!discordSearch) return true;
                  const q = discordSearch.toLowerCase();
                  return (
                    (u.username && u.username.toLowerCase().includes(q)) ||
                    (u.global_name && u.global_name.toLowerCase().includes(q)) ||
                    (u.id && u.id.toLowerCase().includes(q)) ||
                    (u.country && u.country.toLowerCase().includes(q))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 rounded-2xl bg-zinc-900/40 border border-white/5 text-center">
                      <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-xs text-zinc-400 font-mono">
                        {allUsers.length === 0 ? 'No Discord users have logged in yet.' : 'No users match your search query.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-400 font-mono">
                          <th className="pb-3 pl-2">User</th>
                          <th className="pb-3">Discord ID</th>
                          <th className="pb-3">Country</th>
                          <th className="pb-3">Joined</th>
                          <th className="pb-3">Last Active</th>
                          <th className="pb-3">Cart / Favs</th>
                          <th className="pb-3">Activity</th>
                          <th className="pb-3 text-right pr-2">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-sans">
                        {filtered.map(user => {
                          const joinedStr = user.firstJoined
                            ? new Date(user.firstJoined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A';
                          const activeStr = user.lastActive
                            ? new Date(user.lastActive).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'N/A';

                          return (
                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 pl-2">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    className="w-8 h-8 rounded-xl object-cover border border-white/10 shrink-0"
                                  />
                                  <div>
                                    <span className="font-bold text-white block">
                                      {user.global_name || user.username}
                                    </span>
                                    <span className="font-mono text-[11px] text-zinc-400 block">
                                      @{user.username}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 font-mono text-zinc-400">
                                <span className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[11px]">
                                  {user.id}
                                </span>
                              </td>
                              <td className="py-3.5 font-mono text-zinc-300">
                                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[10px] font-bold">
                                  {user.country || 'GLOBAL'}
                                </span>
                              </td>
                              <td className="py-3.5 text-zinc-400 font-mono text-[11px]">{joinedStr}</td>
                              <td className="py-3.5 text-emerald-400 font-mono text-[11px]">{activeStr}</td>
                              <td className="py-3.5">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/5 text-[11px] font-mono text-zinc-300">
                                    🛒 {user.cart?.length || 0}
                                  </span>
                                  <span className="px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 text-[11px] font-mono text-amber-300">
                                    ★ {user.favorites?.length || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 font-mono text-zinc-300">
                                <span className="font-bold">{user.downloadsCount || user.history?.length || 0}</span> events
                              </td>
                              <td className="py-3.5 text-right pr-2">
                                <button
                                  onClick={() => setSelectedUserModal(user)}
                                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {selectedUserModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-lg p-6 rounded-3xl bg-zinc-950 border border-white/15 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedUserModal.avatarUrl}
                    alt={selectedUserModal.username}
                    className="w-12 h-12 rounded-2xl border border-white/20 object-cover"
                  />
                  <div>
                    <h4 className="font-display font-bold text-base text-white">
                      {selectedUserModal.global_name || selectedUserModal.username}
                    </h4>
                    <p className="text-xs font-mono text-zinc-400">@{selectedUserModal.username} • ID: {selectedUserModal.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUserModal(null)}
                  className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <AlertTriangle className="w-4 h-4 hidden" />
                  <Trash2 className="w-4 h-4 hidden" />
                  <span className="text-sm font-bold">✕</span>
                </button>
              </div>

              <div>
                <h5 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Activity History ({selectedUserModal.history?.length || 0})
                </h5>
                {(!selectedUserModal.history || selectedUserModal.history.length === 0) ? (
                  <p className="text-xs text-zinc-500 font-mono py-4 text-center">No recorded activity yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedUserModal.history.map((h: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between text-xs">
                        <span className="font-semibold text-white truncate max-w-xs">{h.title}</span>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">{h.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedUserModal(null)}
                  className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
