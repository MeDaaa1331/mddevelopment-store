import React, { memo } from 'react';
import { ShoppingCart, Eye, Check, Code2, Sparkles, Flame, Gift, Download } from 'lucide-react';
import { TebexPackage } from '../types';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

interface ScriptCardProps {
  pkg: TebexPackage;
}

export const ScriptCard: React.FC<ScriptCardProps> = memo(({ pkg }) => {
  const { addToCart } = useCart();
  const { setSelectedPackage } = useStore();
  const isFree = pkg.price === 0 || pkg.category_type === 'free' || pkg.is_free;

  const handleCardClick = () => {
    setSelectedPackage(pkg);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFree) {
      setSelectedPackage(pkg);
    } else {
      addToCart(pkg);
    }
  };

  const cleanDescription = pkg.description
    ? pkg.description.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim()
    : 'High performance FiveM resource designed for modern servers.';

  return (
    <div
      onClick={handleCardClick}
      className="group relative cursor-pointer flex flex-col rounded-3xl bg-[#0b0b10]/90 border border-white/10 hover:border-white/30 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-950">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 [image-rendering:-webkit-optimize-contrast] contrast-[1.02] transform-gpu backface-hidden"
          loading="lazy"
          decoding="auto"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b10] via-transparent to-black/30 pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isFree ? (
              <span className="px-2.5 py-1 text-[10px] font-mono font-black bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1">
                <Gift className="w-3 h-3 text-emerald-400" />
                FREE SCRIPT
              </span>
            ) : pkg.discount && pkg.discount > 0 ? (
              <span className="px-2.5 py-1 text-[10px] font-mono font-black bg-red-600 text-white rounded-lg shadow-[0_0_18px_rgba(220,38,38,0.6)] flex items-center gap-1 animate-pulse-subtle border border-red-400/30">
                <Flame className="w-3.5 h-3.5 fill-white text-white" />
                −{pkg.discount}% SALE
              </span>
            ) : null}
            {pkg.is_open_source && !isFree && (
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-950/90 text-white border border-white/20 rounded-lg backdrop-blur-md flex items-center gap-1 shadow-md">
                <Code2 className="w-3 h-3 text-emerald-400" />
                OPEN SOURCE
              </span>
            )}
            {pkg.is_bestseller && !pkg.discount && !isFree && (
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-zinc-900/90 text-zinc-200 border border-white/15 rounded-lg backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                POPULAR
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-widest truncate">
              {pkg.category_name || (isFree ? 'Free Resource' : (pkg.is_open_source ? 'Open Source' : 'Paid Resources'))}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold text-zinc-300"
                data-tooltip="ESX Legacy Compatible"
                data-tooltip-pos="top"
              >
                <img src="/frameworks/esx.png" alt="ESX" className="w-3.5 h-3.5 rounded-[3px] object-cover" />
                <span>ESX</span>
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[10px] font-mono font-bold text-zinc-300"
                data-tooltip="QBCore Compatible"
                data-tooltip-pos="top"
              >
                <img src="/frameworks/qbcore.png" alt="QBCore" className="w-3.5 h-3.5 rounded-[3px] object-cover" />
                <span>QB-CORE</span>
              </span>
            </div>
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
              {isFree ? 'Discord Verified' : 'CFX Keymaster'}
            </span>
            <div className="flex items-baseline gap-2">
              {isFree ? (
                <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400">
                  FREE
                </span>
              ) : (
                <>
                  <span className="font-mono text-xl sm:text-2xl font-extrabold text-white">
                    €{pkg.price.toFixed(2)}
                  </span>
                  {pkg.original_price && (
                    <span className="font-mono text-xs sm:text-sm text-red-500 font-bold line-through decoration-red-500/80 decoration-2">
                      €{pkg.original_price.toFixed(2)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCardClick}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
              data-tooltip="Preview Details"
              data-tooltip-pos="left"
              aria-label="Preview script details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleActionClick}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all duration-200 active:scale-95 hover:scale-[1.02] cursor-pointer ${
                isFree
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-white text-black hover:bg-zinc-100 shadow-glow-sm'
              }`}
              aria-label={isFree ? 'Get free script' : 'Buy script'}
            >
              {isFree ? (
                <>
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Get Free</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-black" />
                  <span>Buy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
