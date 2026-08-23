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
  Car,
  Star
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { trackEvent } from '../utils/analytics';
import { Footer } from './Footer';

const LocalesTranslator = React.lazy(() => import('./DevTools/LocalesTranslator').then(m => ({ default: m.LocalesTranslator })));
const HandlingEditor = React.lazy(() => import('./DevTools/HandlingEditor').then(m => ({ default: m.HandlingEditor })));
const ColorGenerator = React.lazy(() => import('./DevTools/ColorGenerator').then(m => ({ default: m.ColorGenerator })));
const CoordsGenerator = React.lazy(() => import('./DevTools/CoordsGenerator').then(m => ({ default: m.CoordsGenerator })));
const DiscordWebhookBuilder = React.lazy(() => import('./DevTools/DiscordWebhookBuilder').then(m => ({ default: m.DiscordWebhookBuilder })));
const ControlsLookup = React.lazy(() => import('./DevTools/ControlsLookup').then(m => ({ default: m.ControlsLookup })));
const ManifestGenerator = React.lazy(() => import('./DevTools/ManifestGenerator').then(m => ({ default: m.ManifestGenerator })));
const AnimExplorer = React.lazy(() => import('./DevTools/AnimExplorer').then(m => ({ default: m.AnimExplorer })));
const FlagsGenerator = React.lazy(() => import('./DevTools/FlagsGenerator').then(m => ({ default: m.FlagsGenerator })));
const HashConverter = React.lazy(() => import('./DevTools/HashConverter').then(m => ({ default: m.HashConverter })));
const JsonFormatter = React.lazy(() => import('./DevTools/JsonFormatter').then(m => ({ default: m.JsonFormatter })));
const BlipDesigner = React.lazy(() => import('./DevTools/BlipDesigner').then(m => ({ default: m.BlipDesigner })));
const AudioExplorer = React.lazy(() => import('./DevTools/AudioExplorer').then(m => ({ default: m.AudioExplorer })));
const WeaponsConfigurator = React.lazy(() => import('./DevTools/WeaponsConfigurator').then(m => ({ default: m.WeaponsConfigurator })));
const PedPropExplorer = React.lazy(() => import('./DevTools/PedPropExplorer').then(m => ({ default: m.PedPropExplorer })));

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
    description: 'FiveM flags generator and bitwise calculator. Combine interior, exterior, vehicle handling, and ped task flags with zero math errors.'
  },
  translator: {
    title: 'FiveM Locales & Language Translator (Lua, JSON, ox_lib) | FiveM Dev Tools',
    description: 'Translate FiveM script locales between English, Czech, German, French, and Spanish instantly. Supports ESX, QBCore, and ox_lib dictionaries.'
  },
  json: {
    title: 'FiveM JSON Formatter, Minifier & Validator | FiveM Dev Tools',
    description: 'Clean, format, minify, and validate JSON data for FiveM config files, inventories, and database payloads.'
  },
  blip: {
    title: 'FiveM Blip & Map Radar Designer (Lua & OxLib) | FiveM Dev Tools',
    description: 'Interactive FiveM blip generator with visual GTA V sprite icons, colors, display settings, and live Lua / ox_lib code export.'
  },
  weapons: {
    title: 'FiveM Weapons, Ammo & Hash Database | FiveM Dev Tools',
    description: 'Complete FiveM weapon database with spawn names, JoAAT hashes, weapon groups, ammo types, and damage stats.'
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
  const { user, syncUserData } = useAuth();
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

  const [favorites, setFavorites] = useState<ToolTab[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('md_devtools_favorite_tools');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.filter(id => DEV_TOOLS_TABS.some(t => t.id === id));
          }
        }
      } catch {}
    }
    return [];
  });

  useEffect(() => {
    if (user?.favorites && Array.isArray(user.favorites) && user.favorites.length > 0) {
      setFavorites(user.favorites as ToolTab[]);
    }
  }, [user]);

  const toggleFavorite = (id: ToolTab, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('md_devtools_favorite_tools', JSON.stringify(next));
        } catch {}
      }
      if (user) {
        syncUserData({ favorites: next });
      }
      return next;
    });
  };

  const orderedTabs = React.useMemo(() => {
    const favTabs = DEV_TOOLS_TABS.filter(t => favorites.includes(t.id));
    const normalTabs = DEV_TOOLS_TABS.filter(t => !favorites.includes(t.id));
    return [...favTabs, ...normalTabs];
  }, [favorites]);

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
  const lastTrackedToolRef = useRef<string | null>(null);

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
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, favorites]);

  useEffect(() => {
    if (lastTrackedToolRef.current !== activeTab) {
      lastTrackedToolRef.current = activeTab;
      trackEvent(activeTab, 'view');
    }

    if (typeof window !== 'undefined') {
      const seo = TOOL_SEO_METADATA[activeTab];
      if (seo) {
        document.title = `${seo.title} - MD Development`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', seo.description);
        }
      }

      const toolUrl = `https://www.mddevelopment.store/devtools?tool=${activeTab}`;
      const canonicalEl = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (canonicalEl) {
        canonicalEl.setAttribute('href', toolUrl);
      }

      const ogUrl = document.querySelector<HTMLMetaElement>("meta[property='og:url']");
      if (ogUrl) {
        ogUrl.setAttribute('content', toolUrl);
      }

      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('tool', activeTab);
      window.history.replaceState(null, '', currentUrl.pathname + currentUrl.search);
    }
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
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-white/10 text-[11px] font-mono text-zinc-300 mb-2 shadow-sm flex-wrap">
                <Terminal className="w-3 h-3 text-emerald-400" />
                <span className="text-white font-bold">FiveM Developer Hub</span>
                <span className="w-1 h-1 rounded-full bg-zinc-500" />
                <span className="text-zinc-400">15 Free Utilities</span>
                {favorites.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      {favorites.length} {favorites.length === 1 ? 'Favorite Pinned' : 'Favorites Pinned'}
                    </span>
                  </>
                )}
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

          {orderedTabs.map(tab => {
            const isFav = favorites.includes(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-tool={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative z-10 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 select-none whitespace-nowrap ${
                  isActive
                    ? 'text-black font-extrabold shadow-sm'
                    : isFav
                    ? 'text-amber-200/90 hover:text-amber-100 bg-amber-400/[0.06] hover:bg-amber-400/[0.12] border border-amber-400/25 shadow-[0_0_8px_rgba(251,191,36,0.08)]'
                    : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-black' : isFav ? 'text-amber-400' : ''}>{tab.icon}</span>
                <span>{tab.label}</span>
                <button
                  type="button"
                  onClick={e => toggleFavorite(tab.id, e)}
                  data-tooltip={isFav ? 'Remove from favorites' : 'Pin to favorites'}
                  data-tooltip-pos="top"
                  className={`p-0.5 rounded transition-all ml-0.5 ${
                    isFav
                      ? 'text-amber-400 hover:scale-125'
                      : 'opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-amber-400 hover:scale-125'
                  }`}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3 h-3 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-zinc-400'}`} />
                </button>
              </button>
            );
          })}
        </div>

        <div
          data-lenis-prevent
          className="p-6 sm:p-9 rounded-3xl bg-[#0b0b10]/95 border border-white/12 backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-fadeIn min-h-[600px]"
        >
          <React.Suspense
            fallback={
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
                <Terminal className="w-8 h-8 text-emerald-400 animate-pulse mb-3" />
                <span className="text-xs font-mono text-zinc-400">Loading developer tool...</span>
              </div>
            }
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
          </React.Suspense>
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
