import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items, isCartOpen, setIsCartOpen,
    removeFromCart, updateQuantity, clearCart,
    appliedCoupon, applyCoupon, removeCoupon,
    totalCount, subtotal, discountAmount, totalPrice,
    checkout, isCheckingOut
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsCartOpen(false);
      setIsClosing(false);
    }, 260);
  };

  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      (window as any).__lenis?.stop();
    } else {
      document.body.style.overflow = '';
      (window as any).__lenis?.start();
    }
    return () => {
      document.body.style.overflow = '';
      (window as any).__lenis?.start();
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim() || isApplyingCoupon) return;
    setIsApplyingCoupon(true);
    setCouponMsg(null);
    try {
      const res = await applyCoupon(couponInput.trim());
      setCouponMsg({ text: res.message, ok: res.success });
      if (res.success) {
        setCouponInput('');
      }
    } catch (err) {
      setCouponMsg({ text: 'Error validating coupon. Please try again.', ok: false });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 z-50 overflow-hidden">

      <div onClick={handleClose} className={`absolute inset-0 bg-black/75 backdrop-blur-md ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`} />

      <div className="fixed inset-y-0 right-0 flex pl-10 max-w-full">
        <div data-lenis-prevent className={`w-screen max-w-md bg-[#0d0d12] border-l border-white/10 shadow-2xl flex flex-col text-zinc-100 ${isClosing ? 'animate-slideRight' : 'animate-slideLeft'}`}>

          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/40 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-white" />
              <h2 className="font-display font-bold text-lg text-white">Your Basket</h2>
              {totalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white/10 rounded-full text-zinc-300">
                  {totalCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {items.length > 0 && (
                <button onClick={clearCart} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  Clear all
                </button>
              )}
              <button onClick={handleClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="py-24 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="font-display font-semibold text-white mb-1">Your basket is empty</h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6">Add scripts to start your order.</p>
                <button onClick={handleClose} className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all">
                  Explore Scripts
                </button>
              </div>
            ) : items.map((item, idx) => (
              <div key={`${item.package.id}-${idx}`} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/10 flex gap-3.5 items-center hover:border-white/20 transition-all">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-white/10">
                  <img src={item.package.image} alt={item.package.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-white truncate">{item.package.name}</p>
                  <p className="text-xs font-mono font-bold text-zinc-200 mt-0.5">€{item.selectedPrice.toFixed(2)}</p>
                  <div className="flex items-center mt-2 border border-white/10 rounded-lg bg-zinc-950 w-fit">
                    <button onClick={() => updateQuantity(item.package.id, -1)} className="p-1 text-zinc-400 hover:text-white transition-colors px-2">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-white">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.package.id, 1)} className="p-1 text-zinc-400 hover:text-white transition-colors px-2">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.package.id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-zinc-950/60 backdrop-blur-md space-y-4 shrink-0">

              {appliedCoupon ? (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span className="text-emerald-300 font-mono font-bold">−{appliedCoupon.discountPercentage}%</span>
                  </div>
                  <button onClick={removeCoupon} className="text-zinc-400 hover:text-white underline text-[11px] transition-colors">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. new15)"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value); setCouponMsg(null); }}
                      disabled={isApplyingCoupon}
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 font-mono disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-semibold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5 min-w-[65px]"
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                  {couponMsg && (
                    <p className={`text-[11px] font-medium animate-fadeIn ${couponMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                      {couponMsg.text}
                    </p>
                  )}
                </form>
              )}

              <div className="space-y-1.5 text-xs text-zinc-400 border-t border-white/5 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-zinc-200">€{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && appliedCoupon.discountPercentage > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                    <span className="font-mono">−€{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-sm pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="font-mono text-emerald-400">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={checkout}
                disabled={isCheckingOut}
                className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-glow-white disabled:opacity-60"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
                <ShieldCheck className="w-3 h-3" />
                <span>Secure checkout powered by Tebex • CFX Keymaster delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
