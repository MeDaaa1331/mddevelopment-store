import React, { Suspense, lazy } from 'react';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { ScriptGrid } from './components/ScriptGrid';
import { FeaturesSection } from './components/FeaturesSection';
import { RecentPayments } from './components/RecentPayments';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { DiscordLoginPrompt } from './components/DiscordLoginPrompt';
import { DiscordWelcomeToast } from './components/DiscordWelcomeToast';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';

const DevToolsPage = lazy(() => import('./components/DevToolsPage').then(m => ({ default: m.DevToolsPage })));
const AdminStatsPage = lazy(() => import('./components/AdminStatsPage').then(m => ({ default: m.AdminStatsPage })));
const ScriptModal = lazy(() => import('./components/ScriptModal').then(m => ({ default: m.ScriptModal })));
const CartDrawer = lazy(() => import('./components/CartDrawer').then(m => ({ default: m.CartDrawer })));
const PromoPopup = lazy(() => import('./components/PromoPopup').then(m => ({ default: m.PromoPopup })));
const InAppCheckoutModal = lazy(() => import('./components/InAppCheckoutModal').then(m => ({ default: m.InAppCheckoutModal })));
const UserProfileModal = lazy(() => import('./components/UserProfileModal').then(m => ({ default: m.UserProfileModal })));
const WheelOfFortuneModal = lazy(() => import('./components/WheelOfFortuneModal').then(m => ({ default: m.WheelOfFortuneModal })));

const AppModals: React.FC = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, checkoutUrl } = useCart();
  const { isWheelOpen, setIsWheelOpen } = useStore();

  return (
    <Suspense fallback={null}>
      <ScriptModal />
      <CartDrawer />
      <PromoPopup />
      <UserProfileModal />
      <DiscordLoginPrompt />
      <DiscordWelcomeToast />
      <WheelOfFortuneModal
        isOpen={isWheelOpen}
        onClose={() => setIsWheelOpen(false)}
      />
      <InAppCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        checkoutUrl={checkoutUrl}
      />
    </Suspense>
  );
};

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
    <span className="text-xs font-mono text-zinc-400">Loading module...</span>
  </div>
);

const AppContent: React.FC = () => {
  useSmoothScroll();
  const { isCallbackProcessing, callbackError } = useCart();
  const { currentRoute } = useStore();

  if (isCallbackProcessing) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/15 flex items-center justify-center mb-5 shadow-glow-sm">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
        <h2 className="font-display font-bold text-xl text-white mb-2">Connecting to Secure Payment...</h2>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          Your CFX.re account is linked. Preparing your basket for direct Tebex payment gateway...
        </p>
      </div>
    );
  }

  if (callbackError) {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-red-950/40 border border-red-500/30 flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-white mb-2">Checkout Error</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6">{callbackError}</p>
        <button
          onClick={() => { window.location.href = window.location.origin; }}
          className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('payment-complete') === '1') {
    return (
      <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 rounded-3xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center mb-5 shadow-glow-sm">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-white mb-2">Payment Successful!</h2>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          Thank you for your order! Your FiveM resources are being delivered to your <strong className="text-white">CFX Keymaster</strong> granted assets now.
        </p>
        <button
          onClick={() => { window.location.href = window.location.origin; }}
          className="px-6 py-3 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-glow-white"
        >
          Continue Browsing MD Development
        </button>
      </div>
    );
  }

  if (currentRoute === '/admin') {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminStatsPage />
        </Suspense>
      </div>
    );
  }

  if (currentRoute === '/devtools') {
    return (
      <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
        <Navbar />
        <Suspense fallback={<PageLoadingFallback />}>
          <DevToolsPage />
        </Suspense>
        <AppModals />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      <Navbar />
      <Hero />
      <main id="scripts-store" className="relative z-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">Catalog & Marketplace</span>
            <h2 className="font-display text-3xl font-extrabold text-white tracking-tight mt-1">OFFICIAL FIVEM RESOURCES</h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm">Instant delivery via CFX Keymaster upon Tebex checkout completion.</p>
        </div>
        <CategoryFilter />
        <ScriptGrid />
      </main>
      <RecentPayments />
      <FeaturesSection />
      <FAQSection />
      <Footer />
      <AppModals />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <StoreProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </StoreProvider>
  );
};

export default App;
