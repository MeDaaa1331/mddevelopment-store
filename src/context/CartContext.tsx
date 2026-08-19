import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Coupon, TebexPackage } from '../types';
import confetti from 'canvas-confetti';
import { TEBEX_CONFIG } from '../config/tebex';

const TEBEX_HEADLESS_BASE = 'https://headless.tebex.io/api';
const CART_KEY = 'md_cart_items_v2';
const COUPON_KEY = 'md_applied_coupon_v2';

function getTebexToken(): string {
  return TEBEX_CONFIG.publicToken;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (pkg: TebexPackage) => void;
  removeFromCart: (pkgId: number) => void;
  updateQuantity: (pkgId: number, delta: number) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkout: () => Promise<void>;
  isCheckingOut: boolean;
  checkoutUrl: string | null;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isCallbackProcessing: boolean;
  callbackError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try { return JSON.parse(localStorage.getItem(COUPON_KEY) || 'null'); } catch { return null; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCallbackProcessing, setIsCallbackProcessing] = useState(false);
  const [callbackError, setCallbackError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(items)); }, [items]);
  useEffect(() => {
    if (appliedCoupon) localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
    else localStorage.removeItem(COUPON_KEY);
  }, [appliedCoupon]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY && e.newValue) {
        try { setItems(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isCallback = params.get('checkout-callback') === '1';
    const basketId = params.get('basketId');

    if (isCallback && basketId) {
      setIsCallbackProcessing(true);

      const processCallback = async () => {
        try {
          let cartItems: CartItem[] = [];
          try {
            cartItems = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
          } catch {}

          if (cartItems.length === 0) {

            window.location.href = `https://pay.tebex.io/${basketId}`;
            return;
          }

          let added = 0;
          for (const item of cartItems) {
            try {
              const res = await fetch(`${TEBEX_HEADLESS_BASE}/baskets/${basketId}/packages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({ package_id: Number(item.package.id), quantity: item.quantity })
              });
              if (res.ok) added++;
              else {
                const errData = await res.json().catch(() => null);
                console.warn(`[Checkout Callback] Failed to add package ${item.package.id}:`, errData);
              }
            } catch (e) {
              console.warn(`[Checkout Callback] Network error adding package ${item.package.id}:`, e);
            }
          }

          let couponData: Coupon | null = null;
          try {
            couponData = JSON.parse(localStorage.getItem(COUPON_KEY) || 'null');
          } catch {}

          if (couponData?.code) {
            const token = getTebexToken();
            await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}/baskets/${basketId}/coupons`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ coupon_code: couponData.code })
            }).catch(() => {});
          }

          localStorage.removeItem(CART_KEY);
          localStorage.removeItem(COUPON_KEY);

          window.location.href = `https://pay.tebex.io/${basketId}`;
        } catch (err: any) {
          console.error('[Checkout Callback] Error configuring basket:', err);

          window.location.href = `https://pay.tebex.io/${basketId}`;
        }
      };

      processCallback();
    }
  }, []);

  const addToCart = (pkg: TebexPackage) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.package.id === pkg.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { package: pkg, quantity: 1, selectedPrice: pkg.price }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (pkgId: number) => setItems(prev => prev.filter(i => i.package.id !== pkgId));

  const updateQuantity = (pkgId: number, delta: number) => {
    setItems(prev =>
      prev.map(i => i.package.id === pkgId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
          .filter(i => i.quantity > 0)
    );
  };

  const clearCart = () => { setItems([]); setAppliedCoupon(null); };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    try {
      const apiRes = await fetch(`/api/coupons?code=${encodeURIComponent(clean)}`);
      if (apiRes.ok) {
        const apiData = await apiRes.json();
        if (apiData.valid) {
          const pct = Number(apiData.discountPercentage) || 15;
          setAppliedCoupon({ code: clean, discountPercentage: pct, description: '' });
          try {
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#ffffff', '#34d399'] });
          } catch {}
          return { success: true, message: `Coupon ${clean} applied! ${pct}% discount.` };
        }
      } else if (apiRes.status === 404 || apiRes.status === 400) {
        const apiErr = await apiRes.json().catch(() => null);
        return { success: false, message: apiErr?.message || 'Invalid coupon code. Please check the code and try again.' };
      }
    } catch (backendErr) {
      console.warn('[Coupon] Backend check skipped, using Headless API validation:', backendErr);
    }

    let discountPct = 0;
    const knownMap = TEBEX_CONFIG.coupons || {};
    if (knownMap[clean]) {
      discountPct = Number(knownMap[clean]);
    } else {

      const match = clean.match(/\d+/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > 0 && num <= 90) {
          discountPct = num;
        }
      }
    }
    if (!discountPct || discountPct <= 0) {
      discountPct = TEBEX_CONFIG.defaultCouponDiscount || 15;
    }

    const token = getTebexToken();
    if (token) {
      try {
        const bRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}/baskets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            complete_url: window.location.origin,
            cancel_url: window.location.origin
          })
        });

        if (bRes.ok) {
          const bData = await bRes.json();
          const ident: string | undefined = bData.data?.ident || bData.ident;

          if (ident) {
            const cRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}/baskets/${ident}/coupons`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ coupon_code: clean })
            });

            const cData = await cRes.json().catch(() => null);

            if (cRes.status === 422 || cData?.title?.toLowerCase().includes('invalid coupon') || cData?.detail?.toLowerCase().includes('invalid')) {
              return { success: false, message: 'Invalid coupon code. Please enter a valid coupon.' };
            }
          }
        }
      } catch (err) {
        console.warn('[Coupon Validation] Error reaching Tebex API:', err);
      }
    }

    setAppliedCoupon({ code: clean, discountPercentage: discountPct, description: '' });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 }, colors: ['#10b981', '#ffffff', '#34d399'] });
    } catch {}

    const msg = `Coupon ${clean} applied! ${discountPct}% discount.`;
    return { success: true, message: msg };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const totalCount = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.selectedPrice * i.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercentage) / 100 : 0;
  const totalPrice = Math.max(0, subtotal - discountAmount);

  const checkout = async () => {
    if (items.length === 0) return;
    setIsCheckingOut(true);

    const token = getTebexToken();
    const firstPkg = items[0].package;
    const coupon = appliedCoupon?.code;

    const fallbackUrl = `https://medaaa.tebex.io/checkout/packages/add/${firstPkg.id}/single${coupon ? `?code=${encodeURIComponent(coupon)}` : ''}`;

    let targetUrl = fallbackUrl;

    if (token) {
      try {

        const bRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}/baskets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            complete_url: `${window.location.origin}/?payment-complete=1`,
            cancel_url: window.location.origin
          })
        });

        if (bRes.ok) {
          const bData = await bRes.json();
          const ident: string | undefined = bData.data?.ident || bData.ident;

          if (ident) {

            const callbackUrl = `${window.location.origin}/?checkout-callback=1&basketId=${ident}`;

            const authRes = await fetch(
              `${TEBEX_HEADLESS_BASE}/accounts/${token}/baskets/${ident}/auth?returnUrl=${encodeURIComponent(callbackUrl)}`,
              { headers: { Accept: 'application/json' } }
            );

            if (authRes.ok) {
              const authData = await authRes.json();

              const providers: Array<{ name: string; url: string }> = Array.isArray(authData)
                ? authData
                : Array.isArray(authData.data)
                  ? authData.data
                  : authData.data
                    ? [authData.data]
                    : [];

              const cfxProvider = providers.find(p =>
                p.name?.toLowerCase().includes('fivem') ||
                p.name?.toLowerCase().includes('cfx') ||
                p.url?.includes('cfx.re') ||
                p.url?.includes('ident.tebex.io')
              ) || providers[0];

              if (cfxProvider?.url) {
                targetUrl = cfxProvider.url;
              } else {

                targetUrl = `https://pay.tebex.io/${ident}`;
              }
            } else {
              targetUrl = `https://pay.tebex.io/${ident}`;
            }
          }
        }
      } catch (err) {
        console.warn('[Checkout] Headless API request error:', err);
      }
    }

    setCheckoutUrl(targetUrl);
    setIsCheckoutOpen(true);
    setIsCartOpen(false);
    setIsCheckingOut(false);
  };

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQuantity, clearCart,
      appliedCoupon, applyCoupon, removeCoupon,
      totalCount, subtotal, discountAmount, totalPrice,
      isCartOpen, setIsCartOpen,
      checkout, isCheckingOut,
      checkoutUrl, isCheckoutOpen, setIsCheckoutOpen,
      isCallbackProcessing, callbackError
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
