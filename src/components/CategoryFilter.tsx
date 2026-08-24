import React, { useState, useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Flame, Code2, Check, ChevronDown, Sparkles, Crown, Gift } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { FilterState } from '../types';

export const CategoryFilter: React.FC = () => {
  const { 
    categories, 
    filters, 
    setCategory, 
    setSearch, 
    setSortBy, 
    setOnlyDiscounted,
    resetFilters,
    filteredPackages,
    packages
  } = useStore();

  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: { label: string; value: FilterState['sortBy'] }[] = [
    { label: 'Featured First', value: 'featured' },
    { label: 'Newest Releases', value: 'newest' },
    { label: 'Price: Low → High', value: 'price-asc' },
    { label: 'Price: High → Low', value: 'price-desc' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === filters.sortBy)?.label || 'Featured First';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-5 mb-8">

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search MD Development scripts (e.g. Banking, Vehicleshop, Weed, Motel)..."
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/70 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all duration-200 backdrop-blur-md"
          />
          {filters.search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">

          <button
            onClick={() => setOnlyDiscounted(!filters.onlyDiscounted)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              filters.onlyDiscounted
                ? 'bg-white text-black border-white shadow-glow-sm scale-[1.02]'
                : 'bg-zinc-900/70 text-zinc-300 border-white/10 hover:border-white/30 hover:bg-zinc-800'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${filters.onlyDiscounted ? 'text-red-600 fill-current' : 'text-orange-400'}`} />
            <span>On Sale</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-2 pl-3.5 pr-3 py-2.5 bg-zinc-900/70 hover:bg-zinc-800/80 border border-white/10 hover:border-white/30 rounded-xl text-xs font-semibold text-zinc-200 transition-all duration-200 backdrop-blur-md cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              <span>{currentSortLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0e0e14]/95 border border-white/15 shadow-2xl p-1.5 z-30 backdrop-blur-2xl animate-scaleUp">
                <div className="text-[10px] font-mono font-semibold px-2.5 py-1 text-zinc-500 uppercase tracking-wider">
                  Sort Order
                </div>
                {sortOptions.map((opt) => {
                  const isSelected = filters.sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 text-white font-semibold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar scrollbar-none">
          {categories.map((cat) => {
            const isActive = filters.category === cat.slug;

            let count = 0;
            if (cat.slug === 'all') count = packages.length;
            else if (cat.slug === 'paid') count = packages.filter(p => !p.is_open_source && p.category_type !== 'opensource' && p.category_type !== 'free' && p.price > 0).length;
            else if (cat.slug === 'deals') {
              count = packages.filter(p => 
                (p.category_type === 'deals' || 
                (p.discount && p.discount > 0) || 
                Boolean(p.original_price && p.original_price > p.price) ||
                /deal|sale|bundle|discount/i.test(p.category_name || '') ||
                /deal|bundle|all[\s-_]?in[\s-_]?one/i.test(p.name)) &&
                p.category_type !== 'free'
              ).length;
            }
            else if (cat.slug === 'opensource') {
              count = packages.filter(p => (p.is_open_source || p.category_type === 'opensource') && p.category_type !== 'free').length;
            }
            else if (cat.slug === 'free') {
              count = packages.filter(p => p.price === 0 || p.category_type === 'free' || p.is_free || /free/i.test(p.category_name || '') || /free/i.test(p.name)).length;
            }
            else if (cat.packages) {
              count = cat.packages.length;
            }

            return (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? 'bg-white text-black border-white shadow-glow-sm scale-[1.02]'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white border-white/10 hover:border-white/25 hover:bg-zinc-800/60'
                }`}
              >
                {cat.slug === 'paid' && (
                  <Crown className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                )}
                {cat.slug === 'deals' && (
                  <Flame className={`w-3.5 h-3.5 ${isActive ? 'text-red-600' : 'text-orange-400'}`} />
                )}
                {cat.slug === 'opensource' && (
                  <Code2 className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                )}
                {cat.slug === 'free' && (
                  <Gift className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-950 font-bold' : 'text-emerald-400'}`} />
                )}
                <span>{cat.name}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                  isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 whitespace-nowrap pl-2">
          <span>
            <strong className="text-white font-mono">{filteredPackages.length}</strong> scripts
          </span>
          {(filters.search || filters.category !== 'all' || filters.onlyDiscounted) && (
            <button
              onClick={resetFilters}
              className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 ml-1 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
