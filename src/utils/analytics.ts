export interface DevToolEvent {
  id: string;
  timestamp: number;
  toolId: string;
  toolName: string;
  action: 'view' | 'copy_lua' | 'copy_ox' | 'copy_xml' | 'copy_json' | 'copy_hash' | 'copy_hex' | 'copy_csharp' | 'search' | 'format' | 'download';
  label?: string;
  meta?: Record<string, any>;
  country?: string;
  device?: string;
  referrer?: string;
}

export interface ToolRankItem {
  toolId: string;
  toolName: string;
  views: number;
  copies: number;
  copyRate: number;
}

export interface FreeDownloadItem {
  name: string;
  count: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalViews: number;
  totalCopies: number;
  activeInteractions: number;
  toolRankings: ToolRankItem[];
  topSearches: { query: string; count: number }[];
  topItems: { name: string; type: string; count: number }[];
  topCountries: { code: string; name: string; count: number; percentage: number }[];
  topReferrers: { source: string; count: number; percentage: number }[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  recentEvents: DevToolEvent[];
  discordUsers?: any[];
  totalDiscordUsers?: number;
  freeDownloads?: {
    totalDownloads: number;
    packageDownloads: FreeDownloadItem[];
    recentDownloads: any[];
  };
}

const LOCAL_EVENTS_KEY = 'md_dev_analytics_events_v3';
const LOCAL_COUNTS_KEY = 'md_dev_analytics_counts_v3';

export const TOOL_NAMES: Record<string, string> = {
  translator: 'Locales Translator',
  handling: 'Vehicle Handling Editor',
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
  anim: 'Anim Explorer',
  free_download: 'Free Scripts Download'
};

export const normalizeToolId = (id: string): string => {
  const map: Record<string, string> = {
    flags_generator: 'flags',
    handling_editor: 'handling',
    blip_designer: 'blip',
    weapons_configurator: 'weapons',
    ped_spawner: 'peds',
    audio_explorer: 'audio',
    json_formatter: 'json',
    hash_converter: 'hash',
    color_picker: 'colors',
    locales_translator: 'translator',
    free_script: 'free_download'
  };
  return map[id] || id;
};

interface LocalCounts {
  totalEvents: number;
  totalViews: number;
  totalCopies: number;
  totalFreeDownloads: number;
  toolStats: Record<string, { views: number; copies: number }>;
  freeDownloads: Record<string, number>;
  searches: Record<string, number>;
  items: Record<string, { name: string; type: string; count: number }>;
  countries: Record<string, number>;
  referrers: Record<string, number>;
  devices: { desktop: number; mobile: number };
}

function getLocalCounts(): LocalCounts {
  if (typeof window === 'undefined') {
    return {
      totalEvents: 0,
      totalViews: 0,
      totalCopies: 0,
      totalFreeDownloads: 0,
      toolStats: {},
      freeDownloads: {},
      searches: {},
      items: {},
      countries: {},
      referrers: {},
      devices: { desktop: 0, mobile: 0 }
    };
  }

  try {
    const raw = localStorage.getItem(LOCAL_COUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const initialToolStats: Record<string, { views: number; copies: number }> = {};
  Object.keys(TOOL_NAMES).forEach(t => {
    initialToolStats[t] = { views: 0, copies: 0 };
  });

  return {
    totalEvents: 0,
    totalViews: 0,
    totalCopies: 0,
    totalFreeDownloads: 0,
    toolStats: initialToolStats,
    freeDownloads: {},
    searches: {},
    items: {},
    countries: {},
    referrers: {},
    devices: { desktop: 0, mobile: 0 }
  };
}

function saveLocalCounts(counts: LocalCounts) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(counts));
  } catch {}
}

export const viewedSessionTools = new Set<string>();

export const trackEvent = async (
  rawToolId: string,
  action: DevToolEvent['action'],
  label?: string,
  meta?: Record<string, any>
) => {
  try {
    const toolId = normalizeToolId(rawToolId);

    if (action === 'view') {
      const sessionKey = `md_view_${toolId}`;
      if (typeof window !== 'undefined') {
        const lastViewTime = sessionStorage.getItem(sessionKey);
        if (lastViewTime && Date.now() - Number(lastViewTime) < 60000) {
          return;
        }
        sessionStorage.setItem(sessionKey, Date.now().toString());
      } else if (viewedSessionTools.has(toolId)) {
        return;
      }
      viewedSessionTools.add(toolId);
    }

    const country = Intl.DateTimeFormat().resolvedOptions().timeZone.includes('Europe') ? 'CZ' : 'Global';
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 1024;
    const device = isMobile ? 'Mobile' : 'Desktop';
    const referrer = typeof document !== 'undefined' && document.referrer ? (new URL(document.referrer).hostname || 'Direct') : 'Direct';

    const event: DevToolEvent = {
      id: 'ev-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      toolId,
      toolName: TOOL_NAMES[toolId] || toolId,
      action,
      label,
      meta,
      country,
      device,
      referrer
    };

    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem(LOCAL_EVENTS_KEY);
      const events: DevToolEvent[] = existingStr ? JSON.parse(existingStr) : [];
      events.unshift(event);
      if (events.length > 100) events.pop();
      localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));

      const counts = getLocalCounts();
      counts.totalEvents = (counts.totalEvents || 0) + 1;

      const isCopy = action.startsWith('copy_') || action === 'format';
      const isView = action === 'view';
      const isSearch = action === 'search';
      const isDownload = action === 'download' || toolId === 'free_download';

      if (isDownload) {
        counts.totalFreeDownloads = (counts.totalFreeDownloads || 0) + 1;
        if (label) {
          counts.freeDownloads = counts.freeDownloads || {};
          counts.freeDownloads[label] = (counts.freeDownloads[label] || 0) + 1;
        }
      }

      if (isView) counts.totalViews = (counts.totalViews || 0) + 1;
      if (isCopy) counts.totalCopies = (counts.totalCopies || 0) + 1;

      if (!counts.toolStats[toolId]) {
        counts.toolStats[toolId] = { views: 0, copies: 0 };
      }
      if (isView) counts.toolStats[toolId].views = (counts.toolStats[toolId].views || 0) + 1;
      if (isCopy) counts.toolStats[toolId].copies = (counts.toolStats[toolId].copies || 0) + 1;

      if (isSearch && label) {
        const q = label.trim().toLowerCase();
        counts.searches[q] = (counts.searches[q] || 0) + 1;
      }

      if (label && !isSearch && !isDownload) {
        const itemKey = `${toolId}::${label.trim()}`;
        let type = 'Item';
        if (toolId === 'weapons') type = 'Weapon';
        else if (toolId === 'peds') type = 'Ped / Prop';
        else if (toolId === 'blip') type = 'Blip';
        else if (toolId === 'flags') type = 'Flag';
        else if (toolId === 'audio') type = 'Sound';
        else if (toolId === 'json') type = 'JSON';
        else if (toolId === 'hash') type = 'Hash';
        else if (toolId === 'translator') type = 'Locale';
        else if (toolId === 'colors') type = 'Color';
        else if (toolId === 'coords') type = 'Coord / Zone';
        else if (toolId === 'webhook') type = 'Webhook';
        else if (toolId === 'controls') type = 'Control';
        else if (toolId === 'manifest') type = 'Manifest';
        else if (toolId === 'anim') type = 'Animation';

        if (!counts.items[itemKey]) {
          counts.items[itemKey] = { name: label.trim(), type, count: 0 };
        }
        counts.items[itemKey].count += 1;
      }

      counts.countries[country] = (counts.countries[country] || 0) + 1;
      counts.referrers[referrer] = (counts.referrers[referrer] || 0) + 1;
      if (isMobile) counts.devices.mobile = (counts.devices.mobile || 0) + 1;
      else counts.devices.desktop = (counts.devices.desktop || 0) + 1;

      saveLocalCounts(counts);
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {});
  } catch (err) {}
};

export const getStoredAnalytics = async (): Promise<AnalyticsSummary> => {
  let serverData: any = null;
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      serverData = await res.json();
    }
  } catch (err) {}

  const localCounts = getLocalCounts();

  let localEvents: DevToolEvent[] = [];
  if (typeof window !== 'undefined') {
    const existingStr = localStorage.getItem(LOCAL_EVENTS_KEY);
    localEvents = existingStr ? JSON.parse(existingStr) : [];
  }

  const serverEvents: DevToolEvent[] = (serverData && Array.isArray(serverData.recentEvents)) ? serverData.recentEvents : [];
  const mergedEventsMap = new Map<string, DevToolEvent>();
  [...serverEvents, ...localEvents].forEach(ev => {
    if (ev && ev.id) mergedEventsMap.set(ev.id, ev);
  });
  const recentEvents = Array.from(mergedEventsMap.values()).sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

  const localFreeDownloadsList: FreeDownloadItem[] = Object.entries(localCounts.freeDownloads || {})
    .map(([name, count]) => ({
      name,
      count,
      percentage: (localCounts.totalFreeDownloads || 1) > 0 ? Math.round((count / Math.max(1, localCounts.totalFreeDownloads)) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  if (serverData && Array.isArray(serverData.toolRankings) && serverData.toolRankings.length > 0) {
    const serverToolStats = serverData.toolStats || {};

    const toolRankings = Object.keys(TOOL_NAMES).filter(k => k !== 'free_download').map(toolId => {
      const serverStats = serverToolStats[toolId] || { views: 0, copies: 0 };
      const views = serverStats.views || 0;
      const copies = serverStats.copies || 0;
      const copyRate = views > 0 ? Math.min(100, Math.round((copies / views) * 100)) : 0;

      return {
        toolId,
        toolName: TOOL_NAMES[toolId] || toolId,
        views,
        copies,
        copyRate
      };
    }).sort((a, b) => b.copies - a.copies || b.views - a.views);

    const sumToolCopies = toolRankings.reduce((acc, t) => acc + t.copies, 0);
    const sumToolViews = toolRankings.reduce((acc, t) => acc + t.views, 0);

    const totalCopies = Math.max(serverData.totalCopies || 0, sumToolCopies);
    const totalViews = Math.max(serverData.totalViews || 0, sumToolViews);
    const totalEvents = Math.max(serverData.totalEvents || 0, totalViews + totalCopies);

    return {
      totalEvents,
      totalViews,
      totalCopies,
      activeInteractions: totalEvents,
      toolRankings,
      topSearches: serverData.topSearches || [],
      topItems: serverData.topItems || [],
      topCountries: serverData.topCountries || [],
      topReferrers: serverData.topReferrers || [],
      deviceBreakdown: serverData.deviceBreakdown || { desktop: 100, mobile: 0, tablet: 0 },
      recentEvents,
      discordUsers: serverData.discordUsers || [],
      totalDiscordUsers: serverData.totalDiscordUsers || (serverData.discordUsers?.length || 0),
      freeDownloads: serverData.freeDownloads || {
        totalDownloads: localCounts.totalFreeDownloads || 0,
        packageDownloads: localFreeDownloadsList,
        recentDownloads: recentEvents.filter(ev => ev.action === 'download')
      }
    };
  }

  const toolRankings = Object.keys(TOOL_NAMES).filter(k => k !== 'free_download').map(toolId => {
    const stats = localCounts.toolStats[toolId] || { views: 0, copies: 0 };
    const copyRate = stats.views > 0 ? Math.min(100, Math.round((stats.copies / stats.views) * 100)) : 0;
    return {
      toolId,
      toolName: TOOL_NAMES[toolId] || toolId,
      views: stats.views,
      copies: stats.copies,
      copyRate
    };
  }).sort((a, b) => b.copies - a.copies || b.views - a.views);

  const sumToolCopies = toolRankings.reduce((acc, t) => acc + t.copies, 0);
  const sumToolViews = toolRankings.reduce((acc, t) => acc + t.views, 0);

  const totalCopies = Math.max(localCounts.totalCopies, sumToolCopies);
  const totalViews = Math.max(localCounts.totalViews, sumToolViews);
  const totalEvents = Math.max(localCounts.totalEvents, totalViews + totalCopies);

  const topSearches = Object.entries(localCounts.searches)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const topItems = Object.values(localCounts.items)
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const totalGeo = Math.max(1, Object.values(localCounts.countries).reduce((a, b) => a + b, 0));
  const topCountries = Object.entries(localCounts.countries)
    .map(([code, count]) => ({
      code,
      name: code === 'CZ' ? 'Czech Republic' : (code === 'SK' ? 'Slovakia' : code),
      count,
      percentage: Math.round((count / totalGeo) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const totalRef = Math.max(1, Object.values(localCounts.referrers).reduce((a, b) => a + b, 0));
  const topReferrers = Object.entries(localCounts.referrers)
    .map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / totalRef) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const totalDevices = Math.max(1, localCounts.devices.desktop + localCounts.devices.mobile);

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
      desktop: Math.round((localCounts.devices.desktop / totalDevices) * 100) || 100,
      mobile: Math.round((localCounts.devices.mobile / totalDevices) * 100) || 0,
      tablet: 0
    },
    recentEvents,
    freeDownloads: {
      totalDownloads: localCounts.totalFreeDownloads || 0,
      packageDownloads: localFreeDownloadsList,
      recentDownloads: recentEvents.filter(ev => ev.action === 'download')
    }
  };
};

export const resetAllAnalytics = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_EVENTS_KEY);
    localStorage.removeItem(LOCAL_COUNTS_KEY);
    localStorage.removeItem('md_dev_analytics_events_v2');
    localStorage.removeItem('md_dev_analytics_events_v1');
  }

  try {
    await fetch('/api/reset', { method: 'POST' });
  } catch (err) {}
};
