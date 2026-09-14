import React from 'react';

export const TopVSection: React.FC = () => {
  return (
    <section id="topv-widgets" className="py-12 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        <a
          href="https://topv.gg/creators/frajermeda"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
          title="Vote on TopV"
        >
          <img
            src="https://topv.gg/api/widget/frajermeda?color=violet"
            alt="Vote on TopV"
            className="w-full max-w-[400px] h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
            loading="lazy"
          />
        </a>

        <a
          href="https://topv.gg/creators/frajermeda"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-transform duration-200 hover:scale-105 active:scale-[0.98]"
          title="TopV"
        >
          <img
            src="https://topv.gg/api/badge/frajermeda?color=violet"
            alt="TopV"
            className="w-full max-w-[160px] h-auto drop-shadow-md"
            loading="lazy"
          />
        </a>
      </div>
    </section>
  );
};
