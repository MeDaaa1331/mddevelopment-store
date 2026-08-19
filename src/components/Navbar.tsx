import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, MessageSquare, Menu, X, Flame, Code2, Crown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { TEBEX_CONFIG } from '../config/tebex';
import { useDiscordStats } from '../hooks/useDiscordStats';
import { smoothScrollTo } from '../hooks/useSmoothScroll';

export const Navbar: React.FC = () => {
  const { totalCount, setIsCartOpen } = useCart();
  const { setCategory, setSearch, filters } = useStore();
  const discordStats = useDiscordStats();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [activeNav, setActiveNav] = useState<string>(filters.category || 'all');
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

  const navRef = useRef<HTMLElement>(null);
  const DISCORD = TEBEX_CONFIG.discordUrl;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (filters.category) {
      setActiveNav(filters.category);
    }
  }, [filters.category]);

  const updateIndicator = () => {
    if (!navRef.current) return;
    const targetSlug = activeNav || 'all';
    const activeBtn = navRef.current.querySelector(`[data-nav="${targetSlug}"]`) as HTMLElement | null;
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeNav, filters.category]);

  const handleCategory = (slug: string) => {
    setActiveNav(slug);
    setCategory(slug);
    setMobileOpen(false);
    smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 });
  };

  const handleFAQClick = () => {
    setActiveNav('faq');
    setMobileOpen(false);
    smoothScrollTo('#faq-section', { offset: -40, duration: 1.4 });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearch(localSearch.trim());
      setSearchOpen(false);
      smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 });
    }
  };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    smoothScrollTo(`#${id}`, { offset: -30, duration: 1.4 });
  };

  const navCategories = [
    { slug: 'all', label: 'All Scripts' },
    { slug: 'paid', label: 'Paid', icon: <Crown className="w-3.5 h-3.5" /> },
    { slug: 'deals', label: 'Deals', icon: <Flame className="w-3.5 h-3.5" /> },
    { slug: 'opensource', label: 'Open Source', icon: <Code2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050507]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">

          <a href="#" onClick={e => { e.preventDefault(); smoothScrollTo(0, { duration: 1.4 }); }} className="flex items-center gap-3.5 group cursor-pointer select-none">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/15 p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-white/40 shadow-glow-sm">
              <img src="/logo.png" alt="MD Development" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-extrabold tracking-tight text-white">MD<span className="text-zinc-400">.</span></span>
                <span className="text-xs font-mono font-medium tracking-widest text-zinc-400 uppercase">Development</span>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">Best Quality FiveM Scripts</span>
            </div>
          </a>

          <nav ref={navRef} className="relative hidden md:flex items-center gap-1 bg-zinc-900/70 p-1.5 rounded-full border border-white/10 backdrop-blur-md">

            <div
              className="absolute top-1.5 bottom-1.5 rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-md pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
            />

            {navCategories.map(cat => (
              <button
                key={cat.slug}
                data-nav={cat.slug}
                onClick={() => handleCategory(cat.slug)}
                className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 flex items-center gap-1.5 select-none ${
                  activeNav === cat.slug ? 'text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat.icon && <span className={activeNav === cat.slug ? 'text-black' : ''}>{cat.icon}</span>}
                <span>{cat.label}</span>
              </button>
            ))}
            <button
              data-nav="faq"
              onClick={handleFAQClick}
              className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 select-none ${
                activeNav === 'faq' ? 'text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-2.5">

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/10 transition-all"
              title="Search scripts"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            <a
              href={DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 hover:border-white/25 transition-all group"
              title={`${discordStats.totalMembers} Total Members • ${discordStats.onlineMembers} Online`}
            >
              <div className="relative flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span>Discord</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                {discordStats.onlineMembers}
              </span>
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all shadow-glow-sm active:scale-95 hover:scale-105"
            >
              <ShoppingCart className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-black text-white rounded-full min-w-[18px]">
                  {totalCount}
                </span>
              )}
            </button>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2.5 rounded-xl text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 transition-colors">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="mt-3 pt-3 border-t border-white/10 animate-fadeIn">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search scripts..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 bg-zinc-900/90 border border-white/20 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white backdrop-blur-xl"
                autoFocus
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-black font-semibold text-xs rounded-lg hover:bg-zinc-200 transition-colors">
                Search
              </button>
            </form>
          </div>
        )}

        {mobileOpen && (
          <div className="md:hidden mt-4 p-4 rounded-2xl bg-zinc-950/95 border border-white/15 backdrop-blur-2xl flex flex-col gap-2 shadow-2xl animate-fadeIn">
            {navCategories.map(cat => (
              <button key={cat.slug} onClick={() => handleCategory(cat.slug)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${filters.category === cat.slug ? 'bg-white text-black' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}>
                <span>{cat.label}</span>
                {cat.slug === 'deals' && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-black rounded-full">SALE</span>}
              </button>
            ))}
            <button onClick={() => scrollTo('faq-section')} className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-white/5">FAQ</button>

            <div className="pt-2 border-t border-white/10 flex gap-2">
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="w-full py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-white flex items-center justify-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discord Support</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 rounded-full">
                  ● {discordStats.onlineMembers} Online
                </span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
