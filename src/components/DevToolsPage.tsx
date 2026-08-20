import React, { useState } from 'react';
import { ArrowLeft, Languages, Palette, Terminal, Sparkles, Home, ChevronRight, Wrench } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LocalesTranslator } from './DevTools/LocalesTranslator';
import { ColorGenerator } from './DevTools/ColorGenerator';
import { Footer } from './Footer';

export const DevToolsPage: React.FC = () => {
  const { navigate } = useStore();
  const [activeTab, setActiveTab] = useState<'translator' | 'colors'>('translator');

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      <div className="relative z-10 pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <button
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-white font-semibold">DEV Tools</span>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-fit px-4 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Scripts Store</span>
          </button>
        </div>

        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#111118]/90 to-[#0b0b10]/95 border border-white/15 overflow-hidden shadow-2xl mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/15 text-xs font-mono text-zinc-300 mb-4 shadow-sm">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white font-bold">FiveM Developer Hub</span>
              <span className="w-1 h-1 rounded-full bg-zinc-500" />
              <span className="text-zinc-400">Free Utilities</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              DEVELOPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">TOOLS</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
              Free productivity tools created by MD Development. Translate script locales with preserved variables, or generate color codes and preview them in real-time.
            </p>
          </div>
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
      </div>

      <Footer />
    </div>
  );
};
