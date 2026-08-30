const ALL_TOOLS = [
  'translator', 'handling', 'json', 'blip', 'weapons', 'audio',
  'peds', 'flags', 'hash', 'colors', 'coords',
  'webhook', 'controls', 'manifest', 'anim'
];

const TOOL_NAMES: Record<string, string> = {
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
  anim: 'Anim Explorer'
};

const COUNTRY_NAMES: Record<string, string> = {
  CZ: 'Czech Republic',
  SK: 'Slovakia',
  DE: 'Germany',
  US: 'United States',
  FR: 'France',
  PL: 'Poland',
  GB: 'United Kingdom',
  AT: 'Austria',
  NL: 'Netherlands',
  GLOBAL: 'Global / Other'
};

function safeParseJson(raw: any) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      try {
        return JSON.parse(decodeURIComponent(raw));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function parseHashResult(raw: any): Record<string, number> {
  const result: Record<string, number> = {};
  if (!raw) return result;
  if (Array.isArray(raw)) {
    for (let i = 0; i < raw.length; i += 2) {
      try {
        const key = decodeURIComponent(raw[i]);
        const val = parseInt(raw[i + 1] || '0', 10);
        if (key && !isNaN(val)) result[key] = val;
      } catch {}
    }
  } else if (typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      try {
        const key = decodeURIComponent(k);
        const val = parseInt(String(v) || '0', 10);
        if (key && !isNaN(val)) result[key] = val;
      } catch {}
    }
  }
  return result;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(200).json({ status: 'offline_fallback', announcement: null });
  }

  const headers = { Authorization: `Bearer ${kvToken}` };

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const action = body.action || req.query?.action;

      if (action === 'save_announcement') {
        const announcementData = body.announcement || null;
        if (!announcementData) {
          return res.status(400).json({ error: 'Missing announcement payload' });
        }
        await fetch(`${kvUrl}/set/site:announcement`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(announcementData)
        });
        return res.status(200).json({ success: true, announcement: announcementData });
      }

      if (action === 'delete_announcement') {
        await fetch(`${kvUrl}/del/site:announcement`, { headers });
        return res.status(200).json({ success: true, announcement: null });
      }

      return res.status(400).json({ error: 'Unknown action' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  const queryType = req.query?.type || req.query?.action;
  if (queryType === 'announcement') {
    try {
      const annRes = await fetch(`${kvUrl}/get/site:announcement`, { headers }).then(r => r.json()).catch(() => ({ result: null }));
      const announcement = safeParseJson(annRes?.result);
      return res.status(200).json({ announcement });
    } catch (err) {
      return res.status(200).json({ announcement: null });
    }
  }

  try {
    const viewKeyFetches = ALL_TOOLS.map(t =>
      fetch(`${kvUrl}/get/analytics:tool_views:${t}`, { headers }).then(r => r.json()).catch(() => ({ result: 0 }))
    );
    const copyKeyFetches = ALL_TOOLS.map(t =>
      fetch(`${kvUrl}/get/analytics:tool_copies:${t}`, { headers }).then(r => r.json()).catch(() => ({ result: 0 }))
    );

    const [
      totalEventsRes,
      totalViewsRes,
      totalCopiesRes,
      toolsViewsHashRes,
      toolsCopiesHashRes,
      searchesRes,
      itemsRes,
      countriesRes,
      referrersRes,
      devicesRes,
      recentEventsRes,
      discordIndexRes,
      totalFreeDownloadsRes,
      freeDownloadsHashRes,
      recentDownloadsRes,
      announcementRes,
      ...indivResults
    ] = await Promise.all([
      fetch(`${kvUrl}/get/analytics:total_events`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:total_views`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:total_copies`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/hgetall/analytics:tools:views`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/hgetall/analytics:tools:copies`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/hgetall/analytics:searches`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/hgetall/analytics:items`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/hgetall/analytics:countries`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/hgetall/analytics:referrers`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/hgetall/analytics:devices`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/lrange/analytics:recent_events/0/99`, { headers }).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(`${kvUrl}/smembers/users:discord:index`, { headers }).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(`${kvUrl}/get/analytics:total_free_downloads`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/hgetall/analytics:free_downloads`, { headers }).then(r => r.json()).catch(() => ({ result: {} })),
      fetch(`${kvUrl}/lrange/analytics:recent_downloads/0/49`, { headers }).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(`${kvUrl}/get/site:announcement`, { headers }).then(r => r.json()).catch(() => ({ result: null })),
      ...viewKeyFetches,
      ...copyKeyFetches
    ]);

    const numTools = ALL_TOOLS.length;
    const viewResults = indivResults.slice(0, numTools);
    const copyResults = indivResults.slice(numTools);

    const rawViewsHash = parseHashResult(toolsViewsHashRes?.result);
    const rawCopiesHash = parseHashResult(toolsCopiesHashRes?.result);
    const rawSearchesHash = parseHashResult(searchesRes?.result);
    const rawItemsHash = parseHashResult(itemsRes?.result);
    const rawCountriesHash = parseHashResult(countriesRes?.result);
    const rawReferrersHash = parseHashResult(referrersRes?.result);
    const rawDevicesHash = parseHashResult(devicesRes?.result);
    const rawFreeDownloadsHash = parseHashResult(freeDownloadsHashRes?.result);

    const discordUserIds: string[] = Array.isArray(discordIndexRes?.result) ? discordIndexRes.result : [];
    let discordUsers: any[] = [];
    if (discordUserIds.length > 0) {
      try {
        const userFetches = discordUserIds.slice(0, 100).map(id =>
          fetch(`${kvUrl}/get/users:discord:${id}`, { headers }).then(r => r.json()).catch(() => ({ result: null }))
        );
        const userResults = await Promise.all(userFetches);
        discordUsers = userResults
          .map(r => safeParseJson(r?.result))
          .filter(Boolean)
          .sort((a, b) => (b.lastLogin || b.lastSpin || 0) - (a.lastLogin || a.lastSpin || 0));
      } catch {}
    }

    const toolStats: Record<string, { views: number; copies: number; name: string }> = {};
    let totalViews = parseInt(totalViewsRes?.result || '0', 10);
    let totalCopies = parseInt(totalCopiesRes?.result || '0', 10);
    let totalEvents = parseInt(totalEventsRes?.result || '0', 10);

    ALL_TOOLS.forEach((toolId, i) => {
      const vIndiv = parseInt(viewResults[i]?.result || '0', 10);
      const cIndiv = parseInt(copyResults[i]?.result || '0', 10);
      const vHash = rawViewsHash[toolId] || 0;
      const cHash = rawCopiesHash[toolId] || 0;

      const views = Math.max(vIndiv, vHash);
      const copies = Math.max(cIndiv, cHash);

      toolStats[toolId] = {
        name: TOOL_NAMES[toolId] || toolId,
        views,
        copies
      };
    });

    const sumViews = Object.values(toolStats).reduce((acc, curr) => acc + curr.views, 0);
    const sumCopies = Object.values(toolStats).reduce((acc, curr) => acc + curr.copies, 0);
    totalViews = Math.max(totalViews, sumViews);
    totalCopies = Math.max(totalCopies, sumCopies);
    totalEvents = Math.max(totalEvents, totalViews + totalCopies);

    const toolRankings = Object.entries(toolStats)
      .map(([toolId, stats]) => ({
        toolId,
        toolName: stats.name,
        views: stats.views,
        copies: stats.copies,
        total: stats.views + stats.copies
      }))
      .sort((a, b) => b.copies !== a.copies ? b.copies - a.copies : b.views - a.views);

    const topSearches = Object.entries(rawSearchesHash)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    const topItems = Object.entries(rawItemsHash)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    const totalCountryHits = Math.max(1, Object.values(rawCountriesHash).reduce((a, b) => a + b, 0));
    const topCountries = Object.entries(rawCountriesHash)
      .map(([code, count]) => ({
        code: code.toUpperCase(),
        name: COUNTRY_NAMES[code.toUpperCase()] || code.toUpperCase(),
        count,
        percentage: Math.round((count / totalCountryHits) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const totalRefCount = Math.max(1, Object.values(rawReferrersHash).reduce((a, b) => a + b, 0));
    const topReferrers = Object.entries(rawReferrersHash)
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / totalRefCount) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    const desktopCount = rawDevicesHash['Desktop'] || rawDevicesHash['desktop'] || 0;
    const mobileCount = rawDevicesHash['Mobile'] || rawDevicesHash['mobile'] || 0;
    const totalDeviceCount = Math.max(1, desktopCount + mobileCount);

    const recentEvents = (recentEventsRes?.result || []).map((entry: any) => safeParseJson(entry)).filter(Boolean);

    const totalFreeDownloads = parseInt(totalFreeDownloadsRes?.result || '0', 10) || Object.values(rawFreeDownloadsHash).reduce((a, b) => a + b, 0);
    const packageDownloads = Object.entries(rawFreeDownloadsHash)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalFreeDownloads > 0 ? Math.round((count / totalFreeDownloads) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
    const recentDownloads = (recentDownloadsRes?.result || []).map((entry: any) => safeParseJson(entry)).filter(Boolean);

    const announcement = safeParseJson(announcementRes?.result);

    return res.status(200).json({
      totalEvents,
      totalViews,
      totalCopies,
      activeInteractions: totalEvents,
      toolRankings,
      toolStats,
      topSearches,
      topItems,
      topCountries,
      topReferrers,
      deviceBreakdown: {
        desktop: Math.round((desktopCount / totalDeviceCount) * 100) || 100,
        mobile: Math.round((mobileCount / totalDeviceCount) * 100) || 0,
        tablet: 0
      },
      recentEvents: recentEvents || [],
      discordUsers: discordUsers || [],
      totalDiscordUsers: discordUsers.length || 0,
      freeDownloads: {
        totalDownloads: totalFreeDownloads,
        packageDownloads,
        recentDownloads
      },
      announcement
    });

  } catch (err: any) {
    return res.status(200).json({ status: 'offline_fallback', announcement: null });
  }
}
