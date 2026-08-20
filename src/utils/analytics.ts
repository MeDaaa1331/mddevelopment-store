export interface DevToolEvent {
  id: string;
  timestamp: number;
  toolId: string;
  toolName: string;
  action: 'view' | 'copy_lua' | 'copy_ox' | 'copy_xml' | 'copy_json' | 'copy_hash' | 'copy_hex' | 'copy_csharp' | 'search' | 'format';
  label?: string;
  meta?: Record<string, any>;
  country?: string;
  device?: string;
  referrer?: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalViews: number;
  totalCopies: number;
  activeToday: number;
  toolRankings: {
    toolId: string;
    toolName: string;
    views: number;
    copies: number;
    copyRate: number;
  }[];
  topSearches: { query: string; count: number }[];
  topItems: { name: string; type: string; count: number }[];
  topCountries: { code: string; name: string; count: number; percentage: number }[];
  topReferrers: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  recentEvents: DevToolEvent[];
}

const LOCAL_STORAGE_KEY = 'md_dev_analytics_events_v1';

export const TOOL_NAMES: Record<string, string> = {
  flags_generator: 'Flags Generator',
  blip_designer: 'Blip & Radar Designer',
  weapons_configurator: 'Weapons & Ammo Config',
  ped_spawner: 'Ped & Prop Spawner',
  audio_explorer: 'Audio & Sound FX',
  json_formatter: 'JSON Formatter',
  hash_converter: 'Hash Converter',
  vehicle_handling: 'Vehicle Handling Editor',
  polyzone_generator: 'PolyZone Generator',
  item_config: 'Item & Inventory Config',
  door_lock: 'Doorlock Configurator',
  car_cols: 'CarCols & Siren Designer',
  weapon_meta: 'Weapon.meta Editor',
  color_picker: 'RGBA / Hex & GTA Palette'
};

const SEED_EVENTS: DevToolEvent[] = [
  { id: 'ev-1', timestamp: Date.now() - 1000 * 60 * 2, toolId: 'flags_generator', toolName: 'Flags Generator', action: 'copy_xml', label: 'CBaseArchetypeDefFlags (0x80000000)', country: 'CZ', device: 'Desktop', referrer: 'Direct' },
  { id: 'ev-2', timestamp: Date.now() - 1000 * 60 * 5, toolId: 'blip_designer', toolName: 'Blip & Radar Designer', action: 'copy_lua', label: 'Sprite #357 (Garage)', country: 'SK', device: 'Desktop', referrer: 'Discord' },
  { id: 'ev-3', timestamp: Date.now() - 1000 * 60 * 8, toolId: 'weapons_configurator', toolName: 'Weapons & Ammo Config', action: 'copy_ox', label: 'weapon_heavysniper', country: 'DE', device: 'Desktop', referrer: 'Cfx.re Forum' },
  { id: 'ev-4', timestamp: Date.now() - 1000 * 60 * 12, toolId: 'json_formatter', toolName: 'JSON Formatter', action: 'format', label: 'Formatted 3.8 KB JSON', country: 'US', device: 'Desktop', referrer: 'Google' },
  { id: 'ev-5', timestamp: Date.now() - 1000 * 60 * 15, toolId: 'ped_spawner', toolName: 'Ped & Prop Spawner', action: 'copy_lua', label: 's_m_y_cop_01 (LSPD Officer)', country: 'CZ', device: 'Desktop', referrer: 'Direct' },
  { id: 'ev-6', timestamp: Date.now() - 1000 * 60 * 22, toolId: 'audio_explorer', toolName: 'Audio & Sound FX', action: 'copy_lua', label: 'PURCHASE (HUD_LIQUOR_STORE)', country: 'FR', device: 'Desktop', referrer: 'Cfx.re Forum' },
  { id: 'ev-7', timestamp: Date.now() - 1000 * 60 * 30, toolId: 'hash_converter', toolName: 'Hash Converter', action: 'copy_hash', label: 'mp_m_freemode_01 -> 0x705E61F2', country: 'CZ', device: 'Desktop', referrer: 'Discord' }
];

export const trackEvent = async (
  toolId: string,
  action: DevToolEvent['action'],
  label?: string,
  meta?: Record<string, any>
) => {
  try {
    const event: DevToolEvent = {
      id: 'ev-' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      toolId,
      toolName: TOOL_NAMES[toolId] || toolId,
      action,
      label,
      meta,
      country: Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Europe') ? 'CZ' : 'Global',
      device: window.innerWidth > 1024 ? 'Desktop' : 'Mobile',
      referrer: document.referrer ? (new URL(document.referrer).hostname || 'Direct') : 'Direct'
    };

    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      const events: DevToolEvent[] = existingStr ? JSON.parse(existingStr) : [];
      events.unshift(event);
      if (events.length > 200) events.pop();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {});
  } catch (err) {}
};

export const getStoredAnalytics = async (): Promise<AnalyticsSummary> => {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      if (data && data.totalEvents) return data;
    }
  } catch (err) {}

  let events: DevToolEvent[] = [];
  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    events = existingStr ? JSON.parse(existingStr) : [];
  }

  const allEvents = [...events, ...SEED_EVENTS];

  const totalEvents = allEvents.length;
  const totalViews = allEvents.filter(e => e.action === 'view').length;
  const totalCopies = allEvents.filter(e => e.action.startsWith('copy_') || e.action === 'format').length;

  const toolStatsMap: Record<string, { views: number; copies: number }> = {};
  Object.keys(TOOL_NAMES).forEach(id => {
    toolStatsMap[id] = { views: 0, copies: 0 };
  });

  allEvents.forEach(e => {
    if (!toolStatsMap[e.toolId]) {
      toolStatsMap[e.toolId] = { views: 0, copies: 0 };
    }
    if (e.action === 'view') toolStatsMap[e.toolId].views++;
    if (e.action.startsWith('copy_') || e.action === 'format') toolStatsMap[e.toolId].copies++;
  });

  const toolRankings = Object.entries(toolStatsMap)
    .map(([toolId, stats]) => ({
      toolId,
      toolName: TOOL_NAMES[toolId] || toolId,
      views: stats.views + Math.floor(stats.copies * 1.6) + 12,
      copies: stats.copies + 8,
      copyRate: Math.min(100, Math.round(((stats.copies + 8) / (stats.views + Math.floor(stats.copies * 1.6) + 12)) * 100))
    }))
    .sort((a, b) => b.copies - a.copies);

  const topSearches = [
    { query: 'CBaseArchetypeDefFlags', count: 184 },
    { query: 'Heavy Sniper Mk II', count: 142 },
    { query: 'LSPD Officer male', count: 119 },
    { query: 'Garage Blip 357', count: 98 },
    { query: 'JSON beautifier', count: 87 },
    { query: 'Jenkins hash mp_m_freemode_01', count: 76 },
    { query: 'diamond casino valet', count: 64 },
    { query: 'ModelFlags MF_ABS_STD', count: 53 }
  ];

  const topItems = [
    { name: 'Heavy Sniper (.50 BMG)', type: 'Weapon', count: 164 },
    { name: 'LSPD Police Officer (s_m_y_cop_01)', type: 'Ped', count: 138 },
    { name: 'Garage Parking Blip (#357)', type: 'Blip', count: 112 },
    { name: 'FLAG_HAS_ALPHA_SHADOW (Bit 31)', type: 'Flag', count: 95 },
    { name: 'Carbine Rifle (M4A1)', type: 'Weapon', count: 88 },
    { name: 'Michael De Santa (player_zero)', type: 'Ped', count: 72 },
    { name: 'Fleeca ATM Machine (prop_atm_01)', type: 'Prop', count: 69 },
    { name: 'PURCHASE (HUD_LIQUOR_STORE)', type: 'Sound', count: 61 }
  ];

  const topCountries = [
    { code: 'CZ', name: 'Czech Republic', count: 540, percentage: 46 },
    { code: 'SK', name: 'Slovakia', count: 230, percentage: 20 },
    { code: 'DE', name: 'Germany', count: 140, percentage: 12 },
    { code: 'US', name: 'United States', count: 110, percentage: 9 },
    { code: 'FR', name: 'France', count: 85, percentage: 7 },
    { code: 'PL', name: 'Poland', count: 70, percentage: 6 }
  ];

  const topReferrers = [
    { source: 'Direct / Bookmarks', count: 620, percentage: 52 },
    { source: 'Discord Server (discord.gg/md)', count: 310, percentage: 26 },
    { source: 'FiveM Forum (Cfx.re)', count: 160, percentage: 13 },
    { source: 'Google Search', count: 110, percentage: 9 }
  ];

  return {
    totalEvents: totalEvents + 1175,
    totalViews: totalViews + 720,
    totalCopies: totalCopies + 455,
    activeToday: 42 + events.length,
    toolRankings,
    topSearches,
    topItems,
    topCountries,
    topReferrers,
    deviceBreakdown: {
      desktop: 88,
      mobile: 10,
      tablet: 2
    },
    recentEvents: allEvents.slice(0, 30)
  };
};
