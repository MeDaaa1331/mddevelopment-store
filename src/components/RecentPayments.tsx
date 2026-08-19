import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, CheckCircle2, ShieldCheck, Sparkles, Clock } from 'lucide-react';

export interface RecentPayment {
  id: number;
  username: string;
  packageName: string;
  amount: string;
  priceFormatted: string;
  currency: string;
  date: string;
}

export const RecentPayments: React.FC = () => {
  const [payments, setPayments] = useState<RecentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/recent-payments');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.payments)) {
          setPayments(data.payments);
        }
      }
    } catch (err) {
      console.warn('[RecentPayments] Error loading recent payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 60000); 
    return () => clearInterval(interval);
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recently';
    }
  };

  if (!isLoading && payments.length === 0) {
    return null;
  }

  return (
    <section className="py-14 border-t border-white/10 relative overflow-hidden bg-[#07070b]">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold uppercase tracking-wider">Recent Activity</span>
              <span className="text-emerald-500/50">•</span>
              <span className="text-zinc-300">Live Tebex Transactions</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              RECENT COMMUNITY PURCHASES
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Verified orders and script deliveries across ESX & QBCore server communities.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Instant CFX Keymaster Delivery</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-2xl bg-zinc-900/40 border border-white/10 animate-pulse h-32 flex flex-col justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-zinc-800"></div>
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3 bg-zinc-800 rounded w-3/4"></div>
                    <div className="h-2 bg-zinc-800 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-4 bg-zinc-800 rounded w-1/3 mt-3"></div>
              </div>
            ))
          ) : (
            payments.map((p, idx) => (
              <div
                key={`${p.id}-${idx}`}
                className="group relative p-4 rounded-2xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-white/10 hover:border-white/25 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-sm hover:shadow-glass"
              >

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-black border border-white/15 flex items-center justify-center shrink-0 group-hover:border-white/40 transition-colors">
                        <User className="w-3.5 h-3.5 text-zinc-300" />
                      </div>
                      <span className="font-mono font-bold text-xs text-white truncate group-hover:text-zinc-200">
                        {p.username}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatRelativeTime(p.date)}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 mt-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-zinc-300 font-medium line-clamp-2 leading-snug">
                      {p.packageName}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
                    p.priceFormatted === 'FREE' 
                      ? 'bg-zinc-800 text-zinc-300 border border-white/10' 
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {p.priceFormatted}
                  </span>

                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};
