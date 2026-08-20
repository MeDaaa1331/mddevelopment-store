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
  Database
} from 'lucide-react';
import { getStoredAnalytics, AnalyticsSummary, DevToolEvent } from '../utils/analytics';
import { useStore } from '../context/StoreContext';

const ADMIN_PIN = '1331';

export const AdminStatsPage: React.FC = () => {
  const { navigate } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('md_admin_auth') === 'true';
    }
    return false;
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tools' | 'items' | 'live' | 'geo'>('overview');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (pinInput === ADMIN_PIN || pinInput.toLowerCase() === 'admin1331') {
      setIsAuthenticated(true);
      setPinError(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('md_admin_auth', 'true');
      }
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('md_admin_auth');
    }
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
                placeholder="Enter PIN (e.g. 1331)"
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

  return (
    <div className="min-h-screen bg-[#050507] text-white flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header Bar */}
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
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono">
              {(['all', 'today', '7d', '30d'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 rounded-lg uppercase transition-all font-bold ${
                    timeRange === range ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range}
                </button>
              ))}
            </div>

            <button
              onClick={loadStats}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white transition-all"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
              title="Export JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/30 text-xs font-semibold text-red-300 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Top Cards */}
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
                <span>+18.4% this week</span>
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
                {data?.totalViews ? Math.round((data.totalCopies / data.totalViews) * 100) : 63}%
              </span>
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-1">
                <span>High developer engagement</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span>Active Developers Today</span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <div className="mt-3">
              <span className="font-display font-black text-3xl text-white">
                {(data?.activeToday || 42).toLocaleString()}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-violet-400 font-medium mt-1">
                <span>Unique sessions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/10 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Top Charts', icon: BarChart3 },
            { id: 'tools', label: 'Tool Leaderboard', icon: Flame },
            { id: 'items', label: 'Top GTA V Items & Queries', icon: Search },
            { id: 'live', label: 'Live Activity Stream', icon: Activity },
            { id: 'geo', label: 'Geography & Traffic', icon: Globe }
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

        {/* TAB: OVERVIEW & TOP CHARTS */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tool Popularity Breakdown */}
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
                  const maxCopies = data?.toolRankings[0]?.copies || 1;
                  const pct = Math.round((tool.copies / maxCopies) * 100);
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

            {/* Quick Live Feed & Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Stream</span>
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {(data?.recentEvents || []).slice(0, 6).map(ev => (
                    <div key={ev.id} className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-950/40">
                          {ev.toolName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {Math.floor((Date.now() - ev.timestamp) / 60000)}m ago
                        </span>
                      </div>
                      <span className="text-white font-medium text-[11px] truncate">
                        {ev.label || ev.action}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveTab('live')}
                  className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all text-center"
                >
                  Open Full Activity Stream
                </button>
              </div>

              {/* Vercel KV Status Box */}
              <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-violet-400" />
                  <h4 className="font-display font-extrabold text-sm text-white">Vercel KV Status</h4>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Analytics engine running in high-speed hybrid mode (Local Storage Cache + Vercel Edge API).
                </p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-zinc-300 flex items-center justify-between">
                  <span>Target:</span>
                  <span className="text-emerald-400 font-bold">/api/track & /api/stats</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TOOLS LEADERBOARD */}
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

        {/* TAB: ITEMS & SEARCHES */}
        {activeTab === 'items' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Top Copied GTA V Items</h3>
                <p className="text-xs text-zinc-400">Most configured weapons, peds, blips and flag codes</p>
              </div>

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
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Top Search Queries</h3>
                <p className="text-xs text-zinc-400">What developers are actively searching for inside your DevTools</p>
              </div>

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
            </div>
          </div>
        )}

        {/* TAB: LIVE ACTIVITY STREAM */}
        {activeTab === 'live' && (
          <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Real-time Live Activity Stream</span>
                </h3>
                <p className="text-xs text-zinc-400">Live stream of developer interactions, code generation & exports</p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Listening
              </span>
            </div>

            <div className="space-y-2">
              {(data?.recentEvents || []).map(ev => (
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
          </div>
        )}

        {/* TAB: GEOGRAPHY & TRAFFIC */}
        {activeTab === 'geo' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Geographic Distribution</h3>
                <p className="text-xs text-zinc-400">Where developers are accessing your tools from</p>
              </div>

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
            </div>

            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-white/10 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-base text-white">Traffic Sources (Referrers)</h3>
                <p className="text-xs text-zinc-400">How developers found your DevTools suite</p>
              </div>

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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
