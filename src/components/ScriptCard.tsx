import React from 'react';
import { ShoppingCart, Eye, Check, Code2, Sparkles, Flame, Play } from 'lucide-react';
import { TebexPackage } from '../types';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { extractYouTubeId } from '../utils/youtube';

interface ScriptCardProps {
  pkg: TebexPackage;
}

export const ScriptCard: React.FC<ScriptCardProps> = ({ pkg }) => {
  const { addToCart } = useCart();
  const { setSelectedPackage } = useStore();
  const youtubeId = pkg.youtube_id || extractYouTubeId(pkg.description);

  const handleCardClick = () => {
    setSelectedPackage(pkg);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(pkg);
  };

  const cleanDescription = pkg.description
    ? pkg.description.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    : 'High performance FiveM resource designed for modern servers.';

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col rounded-3xl bg-[#0b0b10]/90 border border-white/10 hover:border-white/30 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >

      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10] via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">

          <div className="flex items-center gap-1.5 flex-wrap pointer-events-none">
            {pkg.discount && pkg.discount > 0 ? (
              <span className="px-2.5 py-1 text-[10px] font-mono font-black bg-red-600 text-white rounded-lg shadow-[0_0_18px_rgba(220,38,38,0.6)] flex items-center gap-1 animate-pulse-subtle border border-red-400/30">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                −{pkg.discount}% SALE
              </span>
            ) : null}
            {pkg.is_open_source && (
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-950/90 text-white border border-white/20 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-md">
                <Code2 className="w-3 h-3 text-emerald-400" />
                OPEN SOURCE
              </span>
            )}
            {pkg.is_bestseller && !pkg.discount && (
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-900/90 text-zinc-200 border border-white/15 rounded-lg backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                POPULAR
              </span>
            )}
          </div>

          {youtubeId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPackage(pkg);
              }}
              className="px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-950/90 hover:bg-red-600 text-zinc-200 hover:text-white border border-white/20 hover:border-red-500/50 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-lg transition-all active:scale-95 group/video"
              title="Watch Video Preview"
            >
              <Play className="w-3 h-3 fill-red-500 text-red-500 group-hover/video:fill-white group-hover/video:text-white transition-colors" />
              <span>Preview</span>
            </button>
          )}
        </div>

        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-black/85 text-zinc-200 rounded-md border border-white/15 backdrop-blur-md">
            ESX
          </span>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase bg-black/85 text-zinc-200 rounded-md border border-white/15 backdrop-blur-md">
            QB-CORE
          </span>
        </div>

      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">

        <div>

          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
              {pkg.category_name || (pkg.is_open_source ? 'Open Source' : 'Paid Resources')}
            </span>
          </div>

          <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-zinc-100 transition-colors line-clamp-1 tracking-tight">
            {pkg.name}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed font-normal">
            {cleanDescription}
          </p>

          {pkg.features && pkg.features.length > 0 && (
            <ul className="mt-3.5 space-y-1.5 border-t border-white/10 pt-3.5">
              {pkg.features.slice(0, 2).map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                  <div className="w-4 h-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                  </div>
                  <span className="truncate">{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between mt-auto">

          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">
              CFX Keymaster
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl sm:text-2xl font-extrabold text-white">
                €{pkg.price.toFixed(2)}
              </span>
              {pkg.original_price && (
                <span className="font-mono text-xs sm:text-sm text-red-500 font-bold line-through decoration-red-500/80 decoration-2">
                  €{pkg.original_price.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCardClick}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-95"
              title="Preview Details"
              aria-label="Preview script details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleAddToCart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-100 font-extrabold text-xs transition-all duration-200 shadow-glow-sm active:scale-95 hover:scale-[1.02]"
              aria-label="Buy script"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-black" />
              <span>Buy</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
