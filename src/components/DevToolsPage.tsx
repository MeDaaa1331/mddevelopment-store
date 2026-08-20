import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Languages,
  Palette,
  Terminal,
  Home,
  ChevronRight,
  MapPin,
  MessageSquare,
  Gamepad2,
  FileCode,
  Film,
  Flag,
  Hash,
  FileJson,
  Navigation,
  Volume2,
  Crosshair,
  User
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LocalesTranslator } from './DevTools/LocalesTranslator';
import { ColorGenerator } from './DevTools/ColorGenerator';
import { CoordsGenerator } from './DevTools/CoordsGenerator';
import { DiscordWebhookBuilder } from './DevTools/DiscordWebhookBuilder';
import { ControlsLookup } from './DevTools/ControlsLookup';
import { ManifestGenerator } from './DevTools/ManifestGenerator';
import { AnimExplorer } from './DevTools/AnimExplorer';
import { FlagsGenerator } from './DevTools/FlagsGenerator';
import { HashConverter } from './DevTools/HashConverter';
import { JsonFormatter } from './DevTools/JsonFormatter';
import { BlipDesigner } from './DevTools/BlipDesigner';
import { AudioExplorer } from './DevTools/AudioExplorer';
import { WeaponsConfigurator } from './DevTools/WeaponsConfigurator';
import { PedPropExplorer } from './DevTools/PedPropExplorer';
import { trackEvent } from '../utils/analytics';
import { Footer } from './Footer';

type ToolTab =
  | 'translator'
  | 'json'
  | 'blip'
  | 'weapons'
  | 'audio'
  | 'peds'
  | 'flags'
  | 'hash'
  | 'colors'
  | 'coords'
  | 'webhook'
  | 'controls'
  | 'manifest'
  | 'anim';

interface TabItem {
  id: ToolTab;
  label: string;
  icon: React.ReactNode;
}

const DEV_TOOLS_TABS: TabItem[] = [
  { id: 'translator', label: 'Locales Translator', icon: <Languages className="w-3.5 h-3.5" /> },
  { id: 'json', label: 'JSON Formatter', icon: <FileJson className="w-3.5 h-3.5" /> },
  { id: 'blip', label: 'Blip & Radar Designer', icon: <Navigation className="w-3.5 h-3.5" /> },
  { id: 'weapons', label: 'Weapons & Ammo', icon: <Crosshair className="w-3.5 h-3.5" /> },
  { id: 'audio', label: 'Audio & Sound FX', icon: <Volume2 className="w-3.5 h-3.5" /> },
  { id: 'peds', label: 'Ped & Prop Spawner', icon: <User className="w-3.5 h-3.5" /> },
  { id: 'flags', label: 'Flags Generator', icon: <Flag className="w-3.5 h-3.5" /> },
  { id: 'hash', label: 'Hash Converter', icon: <Hash className="w-3.5 h-3.5" /> },
  { id: 'colors', label: 'Color & HEX', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'coords', label: 'Coords & Target', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'webhook', label: 'Discord Webhooks', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { id: 'controls', label: 'GTA Controls', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
  { id: 'manifest', label: 'fxmanifest.lua', icon: <FileCode className="w-3.5 h-3.5" /> },
  { id: 'anim', label: 'Anim Explorer', icon: <Film className="w-3.5 h-3.5" /> },
];

export const DevToolsPage: React.FC = () => {
  const { navigate } = useStore();
  const [activeTab, setActiveTab] = useState<ToolTab>('translator');
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0
  });

  const tabContainerRef = useRef<HTMLDivElement>(null);

  const updateIndicator = () => {
    if (!tabContainerRef.current) return;
    const activeBtn = tabContainerRef.current.querySelector(`[data-tool="${activeTab}"]`) as HTMLElement | null;
    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        top: activeBtn.offsetTop,
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
        opacity: 1
      });
    }
  };

  useEffect(() => {
    updateIndicator();
    trackEvent(activeTab, 'view');
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

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
              <span className="text-zinc-400">14 Free Utilities</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
              DEVELOPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">TOOLS</span>
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl">
              Professional productivity tools built by MD Development for FiveM developers and server owners. Translate locales, design blips, format JSON, inspect weapons, play audio cues, spawn peds, calculate flags, convert hashes, lookup keybinds, and configure manifests in seconds.
            </p>
          </div>
        </div>

        <div
          ref={tabContainerRef}
          className="relative flex flex-wrap items-center gap-1.5 p-2 bg-zinc-950/80 rounded-2xl border border-white/10 w-full backdrop-blur-md mb-6"
        >
          <div
            className="absolute rounded-xl bg-white transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-glow-sm pointer-events-none"
            style={{
              left: `${indicatorStyle.left}px`,
              top: `${indicatorStyle.top}px`,
              width: `${indicatorStyle.width}px`,
              height: `${indicatorStyle.height}px`,
              opacity: indicatorStyle.opacity,
            }}
          />

          {DEV_TOOLS_TABS.map(tab => (
            <button
              key={tab.id}
              data-tool={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors duration-200 flex items-center gap-2 select-none whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-black font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-black' : ''}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div
          data-lenis-prevent
          className="p-6 sm:p-8 rounded-3xl bg-[#0b0b10]/90 border border-white/10 backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-fadeIn"
        >
          {activeTab === 'translator' && <LocalesTranslator />}
          {activeTab === 'json' && <JsonFormatter />}
          {activeTab === 'blip' && <BlipDesigner />}
          {activeTab === 'weapons' && <WeaponsConfigurator />}
          {activeTab === 'audio' && <AudioExplorer />}
          {activeTab === 'peds' && <PedPropExplorer />}
          {activeTab === 'flags' && <FlagsGenerator />}
          {activeTab === 'hash' && <HashConverter />}
          {activeTab === 'colors' && <ColorGenerator />}
          {activeTab === 'coords' && <CoordsGenerator />}
          {activeTab === 'webhook' && <DiscordWebhookBuilder />}
          {activeTab === 'controls' && <ControlsLookup />}
          {activeTab === 'manifest' && <ManifestGenerator />}
          {activeTab === 'anim' && <AnimExplorer />}
        </div>
      </div>

      <Footer />
    </div>
  );
};
