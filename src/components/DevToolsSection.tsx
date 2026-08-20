import React, { useState } from 'react';
import { Wrench, Languages, Palette, Sparkles, Terminal } from 'lucide-react';
import { LocalesTranslator } from './DevTools/LocalesTranslator';
import { ColorGenerator } from './DevTools/ColorGenerator';

export const DevToolsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'translator' | 'colors'>('translator');

  return (
    <section id="devtools-section" className="relative py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-400 mb-3 uppercase tracking-wider">
            <Terminal className="w-3.5 h-3.5 text-white" />
            <span>Developer Utilities</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
            FIVEM DEV TOOLS
          </h2>
        </div>
        <p className="text-xs text-zinc-400 max-w-md">
          Free productivity tools for FiveM developers and server owners. Speed up your script configuration and localization.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-6 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/10 w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab('translator')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'translator'
              ? 'bg-white text-black shadow-glow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Languages className="w-4 h-4" />
          <span>Locales Translator</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'colors'
              ? 'bg-white text-black shadow-glow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Color & HEX Generator</span>
        </button>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0b10]/90 border border-white/10 backdrop-blur-2xl shadow-2xl">
        {activeTab === 'translator' ? <LocalesTranslator /> : <ColorGenerator />}
      </div>
    </section>
  );
};
