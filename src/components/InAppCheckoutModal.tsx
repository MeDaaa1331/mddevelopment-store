import React, { useEffect, useRef, useState } from 'react';
import { X, ShieldCheck, Lock, ExternalLink, Loader2, CheckCircle } from 'lucide-react';

interface InAppCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string | null;
}

export const InAppCheckoutModal: React.FC<InAppCheckoutModalProps> = ({ isOpen, onClose, checkoutUrl }) => {
  const popupRef = useRef<Window | null>(null);
  const [popupOpened, setPopupOpened] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen || !checkoutUrl) return;

    setPopupOpened(false);
    setPopupClosed(false);

    const w = 520;
    const h = 720;
    const left = Math.max(0, window.screenX + (window.outerWidth - w) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - h) / 2);

    const popup = window.open(
      checkoutUrl,
      'tebex_cfx_checkout',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes,toolbar=no,menubar=no,location=yes`
    );

    if (popup) {
      popupRef.current = popup;
      popup.focus();
      setPopupOpened(true);

      pollRef.current = setInterval(() => {
        if (popup.closed) {
          clearInterval(pollRef.current!);
          setPopupClosed(true);
        }
      }, 500);
    } else {

      window.location.href = checkoutUrl;
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, checkoutUrl]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const [isClosing, setIsClosing] = useState(false);

  const handleFocusPopup = () => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus();
    } else if (checkoutUrl) {
      window.open(checkoutUrl, 'tebex_cfx_checkout');
    }
  };

  const handleClose = () => {
    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 240);
  };

  if (!isOpen || !checkoutUrl) return null;

  return (
    <div data-lenis-prevent className="fixed inset-0 z-[60] flex items-center justify-center p-4">

      <div onClick={handleClose} className={`fixed inset-0 bg-black/85 backdrop-blur-2xl ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`} />

      <div data-lenis-prevent className={`relative z-10 w-full max-w-sm rounded-3xl bg-[#09090d] border border-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.95)] overflow-hidden ${isClosing ? 'animate-scaleDown' : 'animate-scaleUp'}`}>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0e0e14]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-white/15 flex items-center justify-center">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-display font-bold text-sm text-white">Tebex Secure Checkout</p>
              <p className="text-[11px] text-zinc-500 font-mono">CFX.re • Official Gateway</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center gap-5">
          {popupClosed ? (

            <>
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white text-base mb-1">Checkout window closed</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  If you completed your purchase, check your email and CFX Keymaster for delivery.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleFocusPopup}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Reopen Checkout
                </button>
                <button onClick={handleClose} className="w-full py-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white font-semibold text-sm border border-white/10 transition-all">
                  Close
                </button>
              </div>
            </>
          ) : popupOpened ? (

            <>
              <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse" />
                <Lock className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <h3 className="font-display font-bold text-white text-base mb-2">Checkout window opened</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                  A secure <span className="text-white font-semibold">CFX.re</span> checkout window has opened.
                  Log in with your FiveM account to complete your purchase.
                </p>
              </div>

              <div className="w-full p-3 rounded-xl bg-zinc-900/60 border border-white/10 flex items-start gap-2.5 text-left">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-zinc-400 leading-relaxed">
                  <span className="text-white font-semibold block mb-0.5">Secure CFX Login</span>
                  Powered by Tebex Limited. After logging in with FiveM, your scripts are delivered instantly via Keymaster.
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleFocusPopup}
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  Focus Checkout Window
                </button>
                <button onClick={handleClose} className="w-full py-2.5 rounded-xl bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-semibold text-xs border border-white/10 transition-all">
                  Cancel & close
                </button>
              </div>
            </>
          ) : (

            <>
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-zinc-300 animate-spin" />
              </div>
              <p className="text-sm text-zinc-300 font-semibold">Opening checkout...</p>
            </>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
          <ShieldCheck className="w-3 h-3" />
          <span>Processed by Tebex Limited • CFX Keymaster instant delivery</span>
        </div>
      </div>
    </div>
  );
};
