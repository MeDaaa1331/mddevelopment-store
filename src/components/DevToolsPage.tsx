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
  User,
  Car
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { LocalesTranslator } from './DevTools/LocalesTranslator';
import { HandlingEditor } from './DevTools/HandlingEditor';
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
  | 'handling'
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
  { id: 'handling', label: 'Vehicle Handling', icon: <Car className="w-3.5 h-3.5" /> },
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

const TOOL_SEO_METADATA: Record<ToolTab, { title: string; description: string }> = {
  handling: {
    title: 'FiveM Vehicle Handling Editor & Calculator (handling.meta) | FiveM Dev Tools',
    description: 'Visual FiveM handling.meta editor and calculator. Tune engine power, transmission gears, traction curve, suspension, and damage multipliers with live speed calculations.'
  },
  flags: {
    title: 'FiveM Flags Generator & Bitwise Calculator (YTYP, Handling, AI Styles) | FiveM Dev Tools',
    description: 'Accurate bitwise flag calculator for FiveM & GTA V. Calculate YTYP archetypes, vehicle model flags, handling flags, damage flags, and AI driving styles.'
  },
  translator: {
    title: 'FiveM Locales & Script Translator (Auto Lua / JSON) | FiveM Dev Tools',
    description: 'Auto-translate FiveM script locales to 12+ languages (Czech, Slovak, German, French, Spanish, etc.) and export directly to Lua tables or JSON.'
  },
  json: {
    title: 'FiveM JSON Formatter, Auto-Repair & Lua Converter | FiveM Dev Tools',
    description: 'Format, validate, and auto-repair broken FiveM JSON configs with trailing commas and unquoted keys. Convert JSON into optimized FiveM Lua tables.'
  },
  blip: {
    title: 'FiveM Blip & Radar Designer (Lua & ox_lib Generator) | FiveM Dev Tools',
    description: 'Visual FiveM map blip configurator. Search all 800+ GTA V blip sprite IDs, colors, displays, and generate native or ox_lib blip codes.'
  },
  weapons: {
    title: 'FiveM Weapons & Ammo Configurator (ox_inventory & QB) | FiveM Dev Tools',
    description: 'Interactive GTA V weapon explorer. Generate ammo configurations, recoil multipliers, weapon component attachments, and ox_inventory items.'
  },
  audio: {
    title: 'FiveM Audio & Sound FX Explorer (PlaySoundFrontend) | FiveM Dev Tools',
    description: 'Interactive GTA V audio bank explorer. Search soundsets, frontend audio cues, and copy PlaySoundFrontend & PlaySoundFromEntity native codes.'
  },
  peds: {
    title: 'FiveM Ped & Prop Spawner (ox_target & Native Code) | FiveM Dev Tools',
    description: 'Complete GTA V ped model and prop hash directory. Generate spawning codes, scenario loops, and ox_target / qb-target interactions.'
  },
  hash: {
    title: 'FiveM Hash Converter (JOAAT, Hex, Signed Int32) | FiveM Dev Tools',
    description: 'Convert strings, vehicle spawn names, and weapon names into GTA V Jenkins One-At-A-Time (JOAAT) hashes, signed/unsigned int32, and hex format.'
  },
  colors: {
    title: 'FiveM Color & HEX / RGBA / Vector4 Generator | FiveM Dev Tools',
    description: 'Convert and generate FiveM colors in Hex, RGB, RGBA, Vector4, and Lua table formats. Includes GTA V HUD & Radar color palettes.'
  },
  coords: {
    title: 'FiveM Coords & PolyZone Generator (ox_target & Markers) | FiveM Dev Tools',
    description: 'Convert in-game vectors into ox_target box zones, sphere zones, DrawMarker loops, and ped spawn coordinate snippets.'
  },
  webhook: {
    title: 'FiveM Discord Webhook Builder (Lua Embed Logger) | FiveM Dev Tools',
    description: 'Design professional Discord embed loggers for FiveM server scripts. Export ready-to-use PerformHttpRequest Lua logging functions.'
  },
  controls: {
    title: 'FiveM GTA Controls & Keybinds Lookup (IsControlJustPressed) | FiveM Dev Tools',
    description: 'Complete FiveM control codes reference. Search all GTA V pad control IDs, input tags (~INPUT_CONTEXT~), and copy IsControlJustPressed snippets.'
  },
  manifest: {
    title: 'FiveM fxmanifest.lua Generator & Validator | FiveM Dev Tools',
    description: 'Quickly create valid fxmanifest.lua files for FiveM resources. Configure client_scripts, server_scripts, UI files, dependencies, and ox_lib.'
  },
  anim: {
    title: 'FiveM Animation & Scenario Explorer (ox_lib & Natives) | FiveM Dev Tools',
    description: 'Search thousands of GTA V animation dicts, animation names, and world scenarios. Generate TaskPlayAnim and ox_lib anim configurations.'
  }
};

export const DevToolsPage: React.FC = () => {
  const { navigate } = useStore();
  const [activeTab, setActiveTab] = useState<ToolTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const toolParam = params.get('tool') as ToolTab | null;
      if (toolParam && DEV_TOOLS_TABS.some(t => t.id === toolParam)) {
        return toolParam;
      }
    }
    return 'translator';
  });

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

    if (typeof window !== 'undefined') {
      const seo = TOOL_SEO_METADATA[activeTab];
      if (seo) {
        document.title = `${seo.title} - MD Development`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', seo.description);
        }
      }

      const currentUrl = new URL(window.location.href);
      if (activeTab === 'translator') {
        currentUrl.searchParams.delete('tool');
      } else {
        currentUrl.searchParams.set('tool', activeTab);
      }
      window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
    }

    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans selection:bg-white selection:text-black">
      <div className="relative z-10 pt-24 pb-14 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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
            className="w-fit px-3.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to Scripts Store</span>
          </button>
        </div>

        <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#111118]/90 via-[#0e0e14]/90 to-[#0b0b10]/95 border border-white/10 overflow-hidden shadow-xl mb-5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-emerald-500/[0.02] rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-white/10 text-[11px] font-mono text-zinc-300 mb-2 shadow-sm">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-bold">FiveM Developer Hub</span>
                <span className="w-1 h-1 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">14 Free Utilities</span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                DEVELOPER <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">TOOLS</span>
              </h1>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl md:text-right">
              Professional productivity tools engineered for FiveM developers. Translate locales, inspect weapons & peds, design blips, format JSON, generate flags & hashes in seconds.
            </p>
          </div>
        </div>

        <div
          ref={tabContainerRef}
          className="relative flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/10 w-full backdrop-blur-md mb-5"
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
              className={`relative z-10 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors duration-200 flex items-center gap-2 select-none whitespace-nowrap ${
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
          className="p-6 sm:p-9 rounded-3xl bg-[#0b0b10]/95 border border-white/12 backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-fadeIn min-h-[600px]"
        >
          {activeTab === 'handling' && <HandlingEditor />}
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

        <section aria-labelledby="devtools-overview-heading" className="mt-12 pt-10 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
              <div className="flex items-center gap-2.5 mb-2.5 text-white font-bold text-sm">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3>100% Free FiveM Utilities</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                All 15 developer utilities run instantly in your browser with zero latency. No downloads or signups required.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
              <div className="flex items-center gap-2.5 mb-2.5 text-white font-bold text-sm">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3>Ready-to-use Code Snippets</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate clean code for modern FiveM frameworks: ox_lib, ox_target, ox_inventory, ESX Legacy, and QBCore.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
              <div className="flex items-center gap-2.5 mb-2.5 text-white font-bold text-sm">
                <Flag className="w-4 h-4 text-emerald-400" />
                <h3>Authentic GTA V Game Data</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Calculates precise 32-bit flags for YTYP archetypes, vehicle models, handling, damage, animations, and controls.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-950/40 border border-white/10">
            <h2 id="devtools-overview-heading" className="font-display font-bold text-base text-white mb-3">
              FiveM Developer Tools & Reference Index
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Explore the complete suite of FiveM developer tools built by MD Development to accelerate script development, server customization, and resource optimization:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
              {DEV_TOOLS_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 hover:border-white/20 text-zinc-300 hover:text-white transition-all text-left flex items-center gap-2"
                >
                  <span className="text-emerald-400">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
};
