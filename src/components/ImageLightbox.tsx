import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Maximize2, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  title,
  onClose,
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isClosing, setIsClosing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsClosing(false);
    }
  }, [isOpen, initialIndex]);

  const resetTransform = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    resetTransform();
    setCurrentIndex((prev) => {
      const next = prev === images.length - 1 ? 0 : prev + 1;
      onIndexChange?.(next);
      return next;
    });
  }, [images.length, onIndexChange, resetTransform]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    resetTransform();
    setCurrentIndex((prev) => {
      const next = prev === 0 ? images.length - 1 : prev - 1;
      onIndexChange?.(next);
      return next;
    });
  }, [images.length, onIndexChange, resetTransform]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetTransform();
    } else {
      setScale(2);
    }
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetTransform();
        } else {
          handleClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        resetTransform();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale, handleNext, handlePrev, handleClose, resetTransform]);

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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.2, 3.5));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.2, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-[100] flex flex-col justify-between select-none ${
        isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
      }`}
    >
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-2xl transition-opacity"
        onClick={handleClose}
      />

      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/80 to-transparent border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display font-bold text-sm sm:text-base text-white truncate max-w-[200px] sm:max-w-md">
              {title || 'Script Screenshots'}
            </span>
          </div>
          {images.length > 1 && (
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 text-xs font-mono font-medium border border-white/10 shrink-0">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-white/10 rounded-xl p-1 backdrop-blur-md">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Zoom Out (-)"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetTransform}
              className="px-2 py-1 rounded-lg text-[11px] font-mono font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Reset Zoom (0)"
              aria-label="Reset zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 3.5}
              className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Zoom In (+)"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <a
            href={currentImage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 transition-all duration-200 cursor-pointer hidden sm:flex items-center justify-center"
            title="Open Full Image in New Tab"
            aria-label="Open image in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
            title="Close Lightbox (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative z-10 flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 sm:left-6 z-20 p-3 sm:p-3.5 rounded-2xl bg-black/70 hover:bg-zinc-900/90 text-white border border-white/15 backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
              title="Previous Photo (Left Arrow)"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 sm:right-6 z-20 p-3 sm:p-3.5 rounded-2xl bg-black/70 hover:bg-zinc-900/90 text-white border border-white/15 backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
              title="Next Photo (Right Arrow)"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onDoubleClick={handleDoubleClick}
        >
          <img
            ref={imageRef}
            src={currentImage}
            alt={`${title || 'Screenshot'} - ${currentIndex + 1}`}
            className="max-h-[75vh] sm:max-h-[80vh] max-w-[95vw] sm:max-w-[90vw] object-contain rounded-xl sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-white/10 pointer-events-auto"
            draggable={false}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent border-t border-white/10 backdrop-blur-md">
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 py-1 scrollbar-none">
            {images.map((imgUrl, idx) => {
              const isActive = currentIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    resetTransform();
                    setCurrentIndex(idx);
                    onIndexChange?.(idx);
                  }}
                  className={`relative aspect-video w-14 sm:w-20 rounded-xl overflow-hidden shrink-0 border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'border-white ring-2 ring-white/60 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/40'
                  }`}
                  aria-label={`Go to screenshot ${idx + 1}`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400">
          <span className="hidden sm:inline">Double click or Scroll to Zoom</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="hidden sm:inline">Drag to Pan</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span>Arrow keys to Navigate</span>
          <span className="text-zinc-600">•</span>
          <span>ESC to Close</span>
        </div>
      </div>
    </div>
  );
};
