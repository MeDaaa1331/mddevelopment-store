import React from 'react';
import { ScriptCard } from './ScriptCard';
import { useStore } from '../context/StoreContext';
import { SearchX } from 'lucide-react';

export const ScriptGrid: React.FC = () => {
  const { filteredPackages, isLoading, resetFilters } = useStore();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="rounded-3xl bg-zinc-900/40 border border-white/5 p-5 flex flex-col gap-4 animate-pulse min-h-[460px]"
          >
            <div className="aspect-[16/10] w-full rounded-2xl bg-zinc-800/50"></div>
            <div className="h-4 w-1/4 bg-zinc-800/50 rounded"></div>
            <div className="h-6 w-3/4 bg-zinc-800/50 rounded"></div>
            <div className="h-12 w-full bg-zinc-800/30 rounded"></div>
            <div className="h-10 w-full bg-zinc-800/50 rounded mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredPackages.length === 0) {
    return (
      <div className="py-20 px-4 text-center rounded-3xl bg-zinc-900/30 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center max-w-lg mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4 text-zinc-400">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="font-display text-lg font-bold text-white mb-1">
          No scripts match your criteria
        </h3>
        <p className="text-sm text-zinc-400 max-w-xs mb-6">
          Try searching for a different keyword or removing category and framework filters.
        </p>
        <button
          onClick={resetFilters}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-glow-sm"
        >
          Reset all filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
      {filteredPackages.map((pkg) => (
        <ScriptCard key={pkg.id} pkg={pkg} />
      ))}
    </div>
  );
};
