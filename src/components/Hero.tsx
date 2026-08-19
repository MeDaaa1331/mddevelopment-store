import React from 'react';
import { ArrowRight, Sparkles, Flame, Zap, ShieldCheck, DownloadCloud, Headphones } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useDiscordStats } from '../hooks/useDiscordStats';
import { smoothScrollTo } from '../hooks/useSmoothScroll';

export const Hero: React.FC = () => {
  const { packages, setSelectedPackage, setCategory } = useStore();
  const { addToCart } = useCart();
  const discordStats = useDiscordStats();

  const featuredList = packages.filter(p => p.is_featured || p.is_bestseller).slice(0, 4);

  const scrollToStore = (cat?: string) => {
    if (cat) setCategory(cat);
    smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">

      <div className="ambient-glow top-[-100px] left-1/2 -translate-x-1/2 bg-white/10 opacity-70"></div>
      <div className="ambient-glow top-[200px] right-[-150px] bg-zinc-400/5 opacity-50"></div>
      <div className="ambient-glow top-[300px] left-[-150px] bg-zinc-500/5 opacity-40"></div>

      <div className="absolute inset-0 ambient-grid opacity-30 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-white/15 text-xs text-zinc-300 backdrop-blur-xl mb-6 shadow-glow-sm animate-pulse-subtle">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping"></span>
            <span className="font-semibold text-white">MD Development</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-300">Official Tebex Store</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            ENGINEERED FOR <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent drop-shadow-sm">
              PERFORMANCE & IMMERSION
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl font-normal leading-relaxed">
            Ultra-optimized FiveM scripts for <span className="text-white font-semibold">ESX & QBCore</span> with <span className="text-white font-semibold">0.00ms resmon</span>, modern monochrome glassmorphism UIs, and automatic <span className="text-white font-semibold">CFX Keymaster</span> instant delivery.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={() => scrollToStore('all')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all duration-200 shadow-glow-white hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore All Scripts</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollToStore('deals')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-zinc-900/90 text-white font-semibold text-sm border border-white/15 hover:border-white/40 hover:bg-zinc-800 transition-all duration-200 backdrop-blur-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Special Deals & Packs</span>
            </button>
          </div>

          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full max-w-3xl">
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/10 backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 hover:border-white/20">
              <span className="font-display text-2xl font-extrabold text-white">0.00ms</span>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Benchmark Resmon</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/10 backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 hover:border-white/20">
              <span className="font-display text-2xl font-extrabold text-white">ESX & QB</span>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Multi-Framework</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/10 backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 hover:border-white/20">
              <span className="font-display text-2xl font-extrabold text-white">Instant</span>
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mt-0.5">Keymaster Delivery</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/10 backdrop-blur-md flex flex-col items-center text-center transition-all duration-300 hover:border-white/20 group">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-display text-2xl font-extrabold text-white font-mono">{discordStats.totalMembers}+</span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                {discordStats.onlineMembers} Online Discord
              </span>
            </div>
          </div>

        </div>

        {featuredList.length > 0 && (
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                  Featured Bestsellers
                </h2>
              </div>
              <button
                onClick={() => scrollToStore('all')}
                className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1 transition-colors duration-200"
              >
                <span>View catalog</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredList.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className="group relative cursor-pointer rounded-2xl p-3 bg-zinc-900/40 border border-white/10 hover:border-white/35 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-glass flex flex-col"
                >
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 mb-3 border border-white/5">
                    <img 
                      src={pkg.image} 
                      alt={pkg.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    {pkg.discount && pkg.discount > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-white text-black rounded-md">
                        -{pkg.discount}%
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-white group-hover:text-zinc-200 line-clamp-1 transition-colors">
                    {pkg.name}
                  </h3>

                  <div 
                    className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed flex-1 font-normal"
                    dangerouslySetInnerHTML={{ __html: pkg.description.replace(/<[^>]*>?/gm, ' ') }}
                  />

                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-white font-mono">
                        €{pkg.price.toFixed(2)}
                      </span>
                      {pkg.original_price && (
                        <span className="text-xs text-zinc-500 line-through font-mono">
                          €{pkg.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(pkg);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white text-white hover:text-black border border-white/15 transition-all duration-200 active:scale-95"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
