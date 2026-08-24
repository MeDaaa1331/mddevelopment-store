import React from 'react';
import { MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useDiscordStats } from '../hooks/useDiscordStats';
import { smoothScrollTo } from '../hooks/useSmoothScroll';

export const Footer: React.FC = () => {
  const { setCategory, currentRoute, navigate } = useStore();
  const discordStats = useDiscordStats();
  const DISCORD_LINK = 'https://discord.gg/Ze4m2Uyxjw';

  const scrollTo = (id: string, catSlug?: string) => {
    if (id === 'devtools-section') {
      navigate('/devtools');
      return;
    }
    if (currentRoute === '/devtools') {
      navigate('/');
      if (catSlug) setCategory(catSlug);
      setTimeout(() => smoothScrollTo(`#${id}`, { offset: -30, duration: 1.4 }), 100);
    } else {
      if (catSlug) setCategory(catSlug);
      smoothScrollTo(`#${id}`, { offset: -30, duration: 1.4 });
    }
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#050507] pt-16 pb-12 overflow-hidden text-zinc-400 text-xs">

      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/20 p-1 flex items-center justify-center shadow-glow-sm">
                <img 
                  src="/logo.png" 
                  alt="MD Development Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-display font-black text-lg text-white tracking-tight">
                  MD DEVELOPMENT
                </span>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  Best Quality FiveM Scripts
                </p>
              </div>
            </div>

            <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
              Ultra-optimized FiveM scripts for ESX & QBCore with 0.00ms resmon, modern monochrome glassmorphism UIs, and automatic CFX Keymaster instant delivery.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-all duration-200 flex items-center gap-2 hover:border-white/30 group"
              >
                <div className="relative flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <span className="font-semibold text-xs">Discord Server</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-full">
                  {discordStats.onlineMembers} Online
                </span>
              </a>

              <a
                href="https://tebex.io"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-all duration-200 flex items-center gap-1.5 hover:border-white/30"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">Tebex Verified</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-mono font-bold text-xs uppercase text-white tracking-wider mb-4">
              Categories
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => scrollTo('scripts-store', 'all')} className="hover:text-white transition-colors duration-200">
                  All Scripts
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('scripts-store', 'paid')} className="hover:text-white transition-colors duration-200">
                  Paid Scripts
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('scripts-store', 'deals')} className="hover:text-white transition-colors duration-200 text-white font-semibold flex items-center gap-1">
                  <span>Special Deals</span>
                  <span className="px-1 py-0.2 text-[9px] bg-orange-500 text-black font-bold rounded">DEAL</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('scripts-store', 'opensource')} className="hover:text-white transition-colors duration-200 cursor-pointer">
                  Open Source Code
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('scripts-store', 'free')} className="hover:text-white transition-colors duration-200 text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer">
                  <span>Free Scripts</span>
                  <span className="px-1 py-0.2 text-[9px] bg-emerald-500/20 text-emerald-300 font-bold rounded border border-emerald-500/30">FREE</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('devtools-section')} className="hover:text-white transition-colors duration-200 text-cyan-400 font-semibold flex items-center gap-1 cursor-pointer">
                  <span>DEV Tools Hub</span>
                  <span className="px-1 py-0.2 text-[9px] bg-cyan-500/20 text-cyan-300 font-bold rounded border border-cyan-500/30">HOT</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold text-xs uppercase text-white tracking-wider mb-4">
              Store & Support
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => scrollTo('features-section')} className="hover:text-white transition-colors duration-200">
                  Performance & Resmon
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq-section')} className="hover:text-white transition-colors duration-200">
                  FAQ & Installation
                </button>
              </li>
              <li>
                <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center gap-1">
                  <span>Join Discord</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://keymaster.fivem.net" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center gap-1">
                  <span>Cfx.re Keymaster</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-bold text-xs uppercase text-white tracking-wider mb-4">
              Supported Frameworks
            </h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[11px] text-white font-bold font-mono">
                ESX Legacy
              </span>
              <span className="px-2.5 py-1 bg-zinc-900 border border-white/10 rounded-lg text-[11px] text-white font-bold font-mono">
                QBCore (QB)
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 leading-relaxed">
              Native multi-framework auto-detection engineered for every script.
            </p>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} MD Development. All rights reserved.</span>
            <span>·</span>
            <button
              onClick={() => navigate('/admin')}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              Admin Panel
            </button>
          </div>

          <div className="text-center sm:text-right text-zinc-500">
            Payments processed securely by <a href="https://www.tebex.io" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Tebex Limited</a> · Not affiliated with Cfx.re or Rockstar Games.
          </div>
        </div>

      </div>
    </footer>
  );
};
