import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, MessageSquare, Menu, X, Flame, Code2, Crown, Wrench, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { TEBEX_CONFIG } from '../config/tebex';
import { useDiscordStats } from '../hooks/useDiscordStats';
import { smoothScrollTo } from '../hooks/useSmoothScroll';

export const Navbar: React.FC = () => {
  const { totalCount, setIsCartOpen } = useCart();
  const { setCategory, setSearch, filters, currentRoute, navigate, setIsWheelOpen } = useStore();
  const { user, isLoggedIn, loginWithDiscord, setIsProfileModalOpen } = useAuth();
  const discordStats = useDiscordStats();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  const [activeNav, setActiveNav] = useState<string>(() => (currentRoute === '/devtools' ? 'devtools' : filters.category || 'paid'));
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

  const navRef = useRef<HTMLElement>(null);
  const DISCORD = TEBEX_CONFIG.discordUrl;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (currentRoute === '/devtools') {
      setActiveNav('devtools');
    } else {
      setActiveNav(filters.category || 'paid');
    }
  }, [currentRoute, filters.category]);

  const updateIndicator = () => {
    if (!navRef.current) return;
    const targetSlug = activeNav || 'paid';
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
    const raf = requestAnimationFrame(updateIndicator);
    const t1 = setTimeout(updateIndicator, 50);
    const t2 = setTimeout(updateIndicator, 150);
    const t3 = setTimeout(updateIndicator, 350);

    if (document.fonts?.ready) {
      document.fonts.ready.then(updateIndicator);
    }

    let observer: ResizeObserver | null = null;
    if (navRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateIndicator());
      observer.observe(navRef.current);
    }

    window.addEventListener('resize', updateIndicator);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeNav, filters.category, currentRoute]);

  const handleCategory = (slug: string) => {
    setActiveNav(slug);
    setMobileOpen(false);
    if (slug === 'devtools') {
      navigate('/devtools');
    } else {
      if (currentRoute === '/devtools') {
        navigate('/');
        setCategory(slug);
        setTimeout(() => smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 }), 100);
      } else {
        setCategory(slug);
        smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 });
      }
    }
  };

  const handleFAQClick = () => {
    setActiveNav('faq');
    setMobileOpen(false);
    if (currentRoute === '/devtools') {
      navigate('/');
      setTimeout(() => smoothScrollTo('#faq-section', { offset: -40, duration: 1.4 }), 100);
    } else {
      smoothScrollTo('#faq-section', { offset: -40, duration: 1.4 });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearch(localSearch.trim());
      setSearchOpen(false);
      if (currentRoute === '/devtools') {
        navigate('/');
        setTimeout(() => smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 }), 100);
      } else {
        smoothScrollTo('#scripts-store', { offset: -30, duration: 1.4 });
      }
    }
  };

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (currentRoute === '/devtools') {
      navigate('/');
      setTimeout(() => smoothScrollTo(`#${id}`, { offset: -30, duration: 1.4 }), 100);
    } else {
      smoothScrollTo(`#${id}`, { offset: -30, duration: 1.4 });
    }
  };

  const navCategories = [
    { slug: 'all', label: 'All Scripts' },
    { slug: 'paid', label: 'Paid', icon: <Crown className="w-3.5 h-3.5" /> },
    { slug: 'deals', label: 'Deals', icon: <Flame className="w-3.5 h-3.5" /> },
    { slug: 'opensource', label: 'Open Source', icon: <Code2 className="w-3.5 h-3.5" /> },
    { slug: 'free', label: 'Free', icon: <Gift className="w-3.5 h-3.5" /> },
    { slug: 'devtools', label: 'DEV Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050507]/90 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between gap-3 lg:gap-6">

          <a href="/" onClick={e => { e.preventDefault(); navigate('/'); smoothScrollTo(0, { duration: 1.4 }); }} className="flex items-center gap-3.5 group cursor-pointer select-none shrink-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-black border border-white/15 p-1 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-white/40 shadow-glow-sm">
              <img src="/logo.png" alt="MD Development" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <div className="flex items-center gap-1.5">
                <span className="font-display text-xl font-extrabold tracking-tight text-white">MD<span className="text-zinc-400">.</span></span>
                <span className="text-xs font-mono font-medium tracking-widest text-zinc-400 uppercase">Development</span>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">Best Quality FiveM Scripts</span>
            </div>
          </a>

          <nav ref={navRef} className="relative hidden lg:flex items-center gap-1 bg-zinc-900/70 p-1.5 rounded-full border border-white/10 backdrop-blur-md shrink-0">

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
                className={`relative z-10 px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 flex items-center gap-1.5 select-none whitespace-nowrap ${
                  activeNav === cat.slug ? 'text-black font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {cat.icon && <span className={activeNav === cat.slug ? 'text-black' : ''}>{cat.icon}</span>}
                <span>{cat.label}</span>
                {cat.slug === 'devtools' && (
                  <span className={`px-1.5 py-0.2 text-[8px] font-mono font-black rounded-md tracking-wider transition-colors ${
                    activeNav === 'devtools'
                      ? 'bg-black text-white'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow-sm'
                  }`}>
                    NEW
                  </span>
                )}
              </button>
            ))}
            <button
              data-nav="faq"
              onClick={handleFAQClick}
              className={`relative z-10 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors duration-200 select-none whitespace-nowrap ${
                activeNav === 'faq' ? 'text-black font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              FAQ
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/10 transition-all shrink-0"
              data-tooltip="Search scripts"
              data-tooltip-pos="bottom"
              aria-label="Search scripts"
            >
              <Search className="w-4 h-4" />
            </button>

            <a
              href={DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 hover:border-white/25 transition-all group shrink-0 whitespace-nowrap"
              data-tooltip={`${discordStats.totalMembers} Members • ${discordStats.onlineMembers} Online`}
              data-tooltip-pos="bottom"
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
              onClick={() => setIsWheelOpen(true)}
              aria-label="Daily Wheel of Fortune"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500/15 to-amber-600/10 hover:from-amber-500/25 hover:to-amber-600/20 text-amber-300 border border-amber-500/40 hover:border-amber-400/80 transition-all shrink-0 whitespace-nowrap hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)] group"
              data-tooltip="Daily Wheel of Fortune (Win up to 100% OFF)"
              data-tooltip-pos="bottom"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>Daily Spin</span>
            </button>

            {isLoggedIn && user ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                aria-label="View Discord Profile"
                className="hidden md:flex items-center gap-2.5 p-1 pl-2 pr-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/12 hover:border-[#5865F2]/60 hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-all duration-200 text-xs font-bold text-white shadow-sm group shrink-0 whitespace-nowrap hover:scale-105 active:scale-95"
                data-tooltip="View Discord Profile & History"
                data-tooltip-pos="bottom"
              >
                <div className="relative">
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-6 h-6 rounded-lg object-cover border border-white/10 group-hover:border-[#5865F2] transition-colors"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black" />
                </div>
                <span className="max-w-[120px] truncate group-hover:text-[#8ea1ff] transition-colors">
                  {user.global_name || user.username}
                </span>
              </button>
            ) : (
              <button
                onClick={loginWithDiscord}
                aria-label="Sign in with Discord"
                className="relative overflow-hidden hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#5865F2] hover:bg-[#4752C4] text-white border border-[#5865F2]/60 hover:border-[#5865F2] transition-all duration-200 shadow-glow-sm active:scale-95 hover:scale-105 hover:shadow-[0_0_20px_rgba(88,101,242,0.7)] shrink-0 whitespace-nowrap group"
                data-tooltip="Sign in with Discord"
                data-tooltip-pos="bottom"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 pointer-events-none" />
                <MessageSquare className="w-3.5 h-3.5 fill-white transition-transform duration-200 group-hover:rotate-6" />
                <span>Sign In with Discord</span>
              </button>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping Cart${totalCount > 0 ? `, ${totalCount} items` : ''}`}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all shadow-glow-sm active:scale-95 hover:scale-105 shrink-0 whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold bg-black text-white rounded-full min-w-[18px]">
                  {totalCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              className="md:hidden p-2.5 rounded-xl text-zinc-300 hover:text-white bg-zinc-900 border border-white/10 transition-colors"
            >
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
          <div className="md:hidden mt-4 p-4 rounded-2xl bg-zinc-950/95 border border-white/15 backdrop-blur-2xl flex flex-col gap-2.5 shadow-2xl animate-fadeIn">
            <button
              onClick={() => {
                setMobileOpen(false);
                setIsWheelOpen(true);
              }}
              className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-zinc-900/40 border border-amber-500/40 hover:border-amber-400 text-amber-300 flex items-center justify-between transition-all group shadow-[0_0_20px_rgba(245,158,11,0.15)] active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-amber-200 uppercase tracking-wide">Daily Wheel of Fortune</span>
                  <span className="text-[10px] text-amber-400/80 font-medium">Win up to 100% OFF coupons</span>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-mono font-black bg-amber-500/30 text-amber-200 rounded-md border border-amber-500/40">
                SPIN →
              </span>
            </button>

            <div className="flex flex-col gap-1 py-1">
              {navCategories.map(cat => (
                <button key={cat.slug} onClick={() => handleCategory(cat.slug)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between transition-colors ${filters.category === cat.slug ? 'bg-white text-black' : 'text-zinc-300 hover:text-white hover:bg-white/5'}`}>
                  <div className="flex items-center gap-2">
                    {cat.icon && <span>{cat.icon}</span>}
                    <span>{cat.label}</span>
                  </div>
                  {cat.slug === 'deals' && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-black rounded-full">SALE</span>}
                  {cat.slug === 'devtools' && <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">NEW</span>}
                </button>
              ))}
              <button onClick={() => scrollTo('faq-section')} className="w-full text-left px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-white/5">FAQ</button>
            </div>

            <div className="pt-2.5 border-t border-white/10 flex flex-col gap-2">
              {isLoggedIn && user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-zinc-900 border border-white/10 text-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={user.avatarUrl} alt={user.username} className="w-7 h-7 rounded-lg object-cover border border-white/10" />
                    <div className="flex flex-col text-left">
                      <span className="text-white font-bold text-xs">{user.global_name || user.username}</span>
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Connected
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 px-2 py-1 rounded-md bg-white/5 border border-white/10">Profile →</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    loginWithDiscord();
                  }}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-[#5865F2] text-white flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>Sign In with Discord</span>
                </button>
              )}

              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="w-full py-2 text-xs font-semibold rounded-lg bg-zinc-900/80 text-white flex items-center justify-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discord Community</span>
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
