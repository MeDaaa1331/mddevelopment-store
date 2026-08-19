import React, { useEffect, useState } from 'react';
import { X, Check, ShoppingCart, ShieldCheck, Download, Play, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { extractYouTubeId } from '../utils/youtube';

export const ScriptModal: React.FC = () => {
  const { selectedPackage, setSelectedPackage } = useStore();
  const { addToCart } = useCart();
  const [isClosing, setIsClosing] = useState(false);
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const youtubeId = selectedPackage ? (selectedPackage.youtube_id || extractYouTubeId(selectedPackage.description)) : null;
  const screenshots = selectedPackage?.screenshots && selectedPackage.screenshots.length > 0
    ? selectedPackage.screenshots
    : (selectedPackage?.image ? [selectedPackage.image] : []);

  useEffect(() => {
    setMediaTab('image');
    setActiveImageIndex(0);
  }, [selectedPackage?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPackage || mediaTab !== 'image' || screenshots.length <= 1) return;
      if (e.key === 'ArrowLeft') {
        setActiveImageIndex(prev => (prev === 0 ? screenshots.length - 1 : prev - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex(prev => (prev === screenshots.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPackage, mediaTab, screenshots.length]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPackage(null);
      setIsClosing(false);
    }, 240);
  };

  useEffect(() => {
    if (selectedPackage) {
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
  }, [selectedPackage]);

  if (!selectedPackage) return null;

  const handleAddToCart = () => {
    addToCart(selectedPackage);
    handleClose();
  };

  return (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div 
        onClick={handleClose}
        className={`fixed inset-0 bg-black/85 backdrop-blur-xl transition-opacity ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
      />

      <div
        data-lenis-prevent
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#0d0d12] border border-white/15 shadow-2xl z-10 flex flex-col my-auto text-zinc-100 ${isClosing ? 'animate-scaleDown' : 'animate-scaleUp'}`}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0d0d12]/95 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-white/10 text-zinc-200 rounded-md border border-white/10">
              {selectedPackage.category_name || (selectedPackage.is_open_source ? 'Open Source' : 'Paid')}
            </span>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 transition-colors duration-200 hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-7 flex flex-col gap-3">
              {youtubeId && (
                <div className="flex items-center gap-1.5 p-1 bg-zinc-950/90 border border-white/10 rounded-xl w-fit">
                  <button
                    onClick={() => setMediaTab('image')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      mediaTab === 'image'
                        ? 'bg-white text-black font-bold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Screenshots ({screenshots.length})</span>
                  </button>
                  <button
                    onClick={() => setMediaTab('video')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                      mediaTab === 'video'
                        ? 'bg-red-600 text-white font-bold shadow-[0_0_15px_rgba(220,38,38,0.6)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Video Showcase</span>
                  </button>
                </div>
              )}

              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-white/10 shadow-lg group/media">
                {youtubeId && mediaTab === 'video' ? (
                  <iframe
                    className="w-full h-full border-0"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title={`${selectedPackage.name} Video Preview`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      key={activeImageIndex}
                      src={screenshots[activeImageIndex] || selectedPackage.image}
                      alt={`${selectedPackage.name} - ${activeImageIndex + 1}`}
                      className="w-full h-full object-cover animate-fadeIn"
                    />

                    {screenshots.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(prev => (prev === 0 ? screenshots.length - 1 : prev - 1));
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/75 hover:bg-black text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl"
                          aria-label="Previous screenshot"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(prev => (prev === screenshots.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-black/75 hover:bg-black text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-105 active:scale-95 shadow-xl"
                          aria-label="Next screenshot"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 border border-white/15 text-[10px] font-mono font-bold text-white backdrop-blur-md shadow-md flex items-center gap-1">
                          <span>{activeImageIndex + 1}</span>
                          <span className="text-zinc-500">/</span>
                          <span>{screenshots.length}</span>
                        </div>
                      </>
                    )}

                    {selectedPackage.discount && selectedPackage.discount > 0 && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 text-xs font-black bg-red-600 text-white rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.7)] flex items-center gap-1.5 border border-red-400/30">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        −{selectedPackage.discount}% SPECIAL DEAL
                      </span>
                    )}
                  </>
                )}
              </div>

              {screenshots.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                  {screenshots.map((imgUrl, idx) => {
                    const isActive = activeImageIndex === idx && mediaTab === 'image';
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setMediaTab('image');
                          setActiveImageIndex(idx);
                        }}
                        className={`relative aspect-video w-16 sm:w-20 rounded-xl overflow-hidden shrink-0 border transition-all duration-200 ${
                          isActive
                            ? 'border-white ring-2 ring-white/50 scale-[1.03] shadow-md'
                            : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                        }`}
                        title={`View screenshot ${idx + 1}`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-5 flex flex-col justify-between gap-5">
              <div>

                <h2 className="font-display text-2xl font-bold text-white leading-tight">
                  {selectedPackage.name}
                </h2>

                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  <span className="text-xs text-zinc-500 font-mono">Frameworks:</span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-zinc-900 text-white rounded-md border border-white/15">
                    ESX
                  </span>
                  <span className="px-2.5 py-0.5 text-xs font-bold bg-zinc-900 text-white rounded-md border border-white/15">
                    QB
                  </span>
                </div>

                {selectedPackage.features && selectedPackage.features.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                      Feature Highlights:
                    </span>
                    <ul className="space-y-1.5">
                      {selectedPackage.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-zinc-400">Price:</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-white">
                      €{selectedPackage.price.toFixed(2)}
                    </span>
                    {selectedPackage.original_price && (
                      <span className="font-mono text-base font-bold text-red-500 line-through decoration-red-500/80 decoration-2">
                        €{selectedPackage.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-extrabold text-sm hover:bg-zinc-200 transition-all duration-200 flex items-center justify-center gap-2 shadow-glow-white active:scale-98 hover:scale-[1.01]"
                >
                  <ShoppingCart className="w-4 h-4 text-black" />
                  <span>Add to Tebex Basket</span>
                </button>

                <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> CFX Keymaster Instant
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Official Tebex Store
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-3">
              Package Description
            </h4>

            <div 
              className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed space-y-3 bg-zinc-950/40 p-5 rounded-2xl border border-white/5"
              dangerouslySetInnerHTML={{ __html: selectedPackage.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
