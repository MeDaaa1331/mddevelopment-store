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
  activeInteractions: number;
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

const LOCAL_STORAGE_KEY = 'md_dev_analytics_events_v2';

export const TOOL_NAMES: Record<string, string> = {
  translator: 'Locales Translator',
  json: 'JSON Formatter',
  blip: 'Blip & Radar Designer',
  weapons: 'Weapons & Ammo',
  audio: 'Audio & Sound FX',
  peds: 'Ped & Prop Spawner',
  flags: 'Flags Generator',
  hash: 'Hash Converter',
  colors: 'Color & HEX',
  coords: 'Coords & Target',
  webhook: 'Discord Webhooks',
  controls: 'GTA Controls',
  manifest: 'fxmanifest.lua',
  anim: 'Anim Explorer'
};

export const normalizeToolId = (id: string): string => {
  const map: Record<string, string> = {
    flags_generator: 'flags',
    blip_designer: 'blip',
    weapons_configurator: 'weapons',
    ped_spawner: 'peds',
    audio_explorer: 'audio',
    json_formatter: 'json',
    hash_converter: 'hash',
    color_picker: 'colors',
    locales_translator: 'translator'
  };
  return map[id] || id;
};

export const trackEvent = async (
  rawToolId: string,
  action: DevToolEvent['action'],
  label?: string,
  meta?: Record<string, any>
) => {
  try {
    const toolId = normalizeToolId(rawToolId);
    const event: DevToolEvent = {
      id: 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      toolId,
      toolName: TOOL_NAMES[toolId] || toolId,
      action,
      label,
      meta,
      country: Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Europe') ? 'CZ' : 'Global',
      device: typeof window !== 'undefined' && window.innerWidth > 1024 ? 'Desktop' : 'Mobile',
      referrer: typeof document !== 'undefined' && document.referrer ? (new URL(document.referrer).hostname || 'Direct') : 'Direct'
    };

    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      const events: DevToolEvent[] = existingStr ? JSON.parse(existingStr) : [];
      events.unshift(event);
      if (events.length > 500) events.pop();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events));
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {});
  } catch (err) {}
};

export const buildAnalyticsSummary = (allEvents: DevToolEvent[], serverTotalEvents = 0, serverTotalCopies = 0): AnalyticsSummary => {
  const sortedEvents = [...allEvents].sort((a, b) => b.timestamp - a.timestamp);

  const totalEvents = Math.max(allEvents.length, serverTotalEvents);
  
  let totalViews = 0;
  let totalCopies = 0;

  const toolStatsMap: Record<string, { views: number; copies: number }> = {};
  Object.keys(TOOL_NAMES).forEach(id => {
    toolStatsMap[id] = { views: 0, copies: 0 };
  });

  const searchCounts: Record<string, number> = {};
  const itemCounts: Record<string, { name: string; type: string; count: number }> = {};
  const countryCounts: Record<string, number> = {};
  const referrerCounts: Record<string, number> = {};
  let desktopCount = 0;
  let mobileCount = 0;

  sortedEvents.forEach(e => {
    const isCopy = e.action.startsWith('copy_') || e.action === 'format';
    const isView = e.action === 'view';

    if (isView) totalViews++;
    if (isCopy) totalCopies++;

    const tid = normalizeToolId(e.toolId);
    if (!toolStatsMap[tid]) {
      toolStatsMap[tid] = { views: 0, copies: 0 };
    }
    if (isView) toolStatsMap[tid].views++;
    if (isCopy) toolStatsMap[tid].copies++;

    if (e.label) {
      const cleanLabel = e.label.trim();
      let type = 'Item';
      if (tid === 'weapons') type = 'Weapon';
      else if (tid === 'peds') type = 'Ped / Prop';
      else if (tid === 'blip') type = 'Blip';
      else if (tid === 'flags') type = 'Flag';
      else if (tid === 'audio') type = 'Sound';
      else if (tid === 'json') type = 'JSON';
      else if (tid === 'hash') type = 'Hash';
      else if (tid === 'translator') type = 'Locale';
      else if (tid === 'colors') type = 'Color';
      else if (tid === 'coords') type = 'Coord / Zone';
      else if (tid === 'webhook') type = 'Webhook';
      else if (tid === 'controls') type = 'Control';
      else if (tid === 'manifest') type = 'Manifest';
      else if (tid === 'anim') type = 'Animation';

      if (e.action === 'search') {
        searchCounts[cleanLabel] = (searchCounts[cleanLabel] || 0) + 1;
      } else if (cleanLabel) {
        if (!itemCounts[cleanLabel]) {
          itemCounts[cleanLabel] = { name: cleanLabel, type, count: 0 };
        }
        itemCounts[cleanLabel].count++;
      }
    }

    const c = e.country || 'CZ';
    countryCounts[c] = (countryCounts[c] || 0) + 1;

    const r = e.referrer || 'Direct';
    referrerCounts[r] = (referrerCounts[r] || 0) + 1;

    if (e.device === 'Mobile') mobileCount++;
    else desktopCount++;
  });

  if (serverTotalCopies > totalCopies) {
    totalCopies = serverTotalCopies;
  }

  const toolRankings = Object.entries(toolStatsMap)
    .map(([toolId, stats]) => ({
      toolId,
      toolName: TOOL_NAMES[toolId] || toolId,
      views: stats.views,
      copies: stats.copies,
      copyRate: stats.views > 0 ? Math.min(100, Math.round((stats.copies / stats.views) * 100)) : 0
    }))
    .sort((a, b) => b.copies - a.copies || b.views - a.views);

  const topSearches = Object.entries(searchCounts)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const countryNames: Record<string, string> = {
    CZ: 'Czech Republic',
    SK: 'Slovakia',
    DE: 'Germany',
    US: 'United States',
    FR: 'France',
    PL: 'Poland',
    GB: 'United Kingdom',
    Global: 'Global / Other'
  };

  const totalGeoEvents = Math.max(1, Object.values(countryCounts).reduce((a, b) => a + b, 0));
  const topCountries = Object.entries(countryCounts)
    .map(([code, count]) => ({
      code,
      name: countryNames[code] || code,
      count,
      percentage: Math.round((count / totalGeoEvents) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const totalRefEvents = Math.max(1, Object.values(referrerCounts).reduce((a, b) => a + b, 0));
  const topReferrers = Object.entries(referrerCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / totalRefEvents) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const totalDev = Math.max(1, desktopCount + mobileCount);

  return {
    totalEvents,
    totalViews,
    totalCopies,
    activeInteractions: totalEvents,
    toolRankings,
    topSearches,
    topItems,
    topCountries,
    topReferrers,
    deviceBreakdown: {
      desktop: Math.round((desktopCount / totalDev) * 100),
      mobile: Math.round((mobileCount / totalDev) * 100),
      tablet: 0
    },
    recentEvents: sortedEvents.slice(0, 50)
  };
};

export const getStoredAnalytics = async (): Promise<AnalyticsSummary> => {
  let serverEvents: DevToolEvent[] = [];
  let serverTotalEvents = 0;
  let serverTotalCopies = 0;

  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.recentEvents)) {
        serverEvents = data.recentEvents;
      }
      if (data && typeof data.totalEvents === 'number') {
        serverTotalEvents = data.totalEvents;
      }
      if (data && typeof data.totalCopies === 'number') {
        serverTotalCopies = data.totalCopies;
      }
    }
  } catch (err) {}

  let localEvents: DevToolEvent[] = [];
  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    localEvents = existingStr ? JSON.parse(existingStr) : [];
  }

  const mergedEventsMap = new Map<string, DevToolEvent>();
  [...serverEvents, ...localEvents].forEach(ev => {
    if (ev && ev.id) mergedEventsMap.set(ev.id, ev);
  });

  const allMergedEvents = Array.from(mergedEventsMap.values());

  return buildAnalyticsSummary(allMergedEvents, serverTotalEvents, serverTotalCopies);
};

export const resetAllAnalytics = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem('md_dev_analytics_events_v1');
  }

  try {
    await fetch('/api/reset', { method: 'POST' });
  } catch (err) {}
};
