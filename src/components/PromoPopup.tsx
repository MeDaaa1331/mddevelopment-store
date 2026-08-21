import React, { useState, useEffect } from 'react';
import { Sparkles, Copy, CheckCheck, X, Tag, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const PromoPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { applyCoupon, setIsCartOpen } = useCart();

  useEffect(() => {

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const promoCode = 'new15';

  const handleMinimize = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMinimized(true);
      setIsClosing(false);
    }, 240);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleApplyAndOpenCart = () => {
    applyCoupon(promoCode);
    setIsCartOpen(true);
    handleMinimize();
  };

  if (!isVisible) return null;

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-fadeIn">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-zinc-950/90 border border-white/20 text-xs font-bold text-white shadow-2xl hover:border-white/50 transition-all backdrop-blur-xl group hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <Tag className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" />
          <span>15% OFF (code: {promoCode})</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-5 right-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] sm:w-80 ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}>
      <div className="relative rounded-2xl bg-[#0e0e13]/95 border border-white/20 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl text-zinc-100 overflow-hidden">

        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

        <button
          onClick={handleMinimize}
          className="absolute top-3 right-3 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
          aria-label="Minimize discount banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center shrink-0 mt-0.5 shadow-glow-sm">
            <Gift className="w-4 h-4 text-black" />
          </div>

          <div className="flex-1 pr-4">
            <div className="flex items-center gap-1.5">
              <h4 className="font-display font-bold text-xs text-white">
                New Customer Discount
              </h4>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded">
                -15%
              </span>
            </div>

            <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
              First time at MD Development? Use coupon code <strong className="text-white font-mono font-bold">{promoCode}</strong> to get 15% OFF your order!
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">

          <button 
            onClick={handleCopy}
            type="button"
            aria-label={`Copy discount code ${promoCode}`}
            className="flex-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-white/15 flex items-center justify-between cursor-pointer hover:border-white/40 transition-colors group"
            data-tooltip="Click to copy code"
          >
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              {promoCode}
            </span>
            <span className="text-zinc-400 group-hover:text-white transition-colors">
              {copied ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </span>
          </button>

          <button
            onClick={handleCopy}
            type="button"
            aria-label="Copy discount promo code"
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all border ${
              copied
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-white text-black hover:bg-zinc-200 border-white shadow-glow-sm'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleApplyAndOpenCart}
            type="button"
            aria-label="Apply discount directly to basket"
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors"
            data-tooltip="Apply discount to cart"
            data-tooltip-pos="left"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
