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

export const trackEvent = async (
  toolId: string,
  action: DevToolEvent['action'],
  label?: string,
  meta?: Record<string, any>
) => {
  try {
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

    if (!toolStatsMap[e.toolId]) {
      toolStatsMap[e.toolId] = { views: 0, copies: 0 };
    }
    if (isView) toolStatsMap[e.toolId].views++;
    if (isCopy) toolStatsMap[e.toolId].copies++;

    if (e.label) {
      const cleanLabel = e.label.trim();
      let type = 'Item';
      if (e.toolId === 'weapons_configurator') type = 'Weapon';
      else if (e.toolId === 'ped_spawner') type = 'Ped / Prop';
      else if (e.toolId === 'blip_designer') type = 'Blip';
      else if (e.toolId === 'flags_generator') type = 'Flag';
      else if (e.toolId === 'audio_explorer') type = 'Sound';
      else if (e.toolId === 'json_formatter') type = 'JSON';
      else if (e.toolId === 'hash_converter') type = 'Hash';

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
