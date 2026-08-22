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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(200).json({ status: 'offline_fallback' });
    }

    const headers = { Authorization: `Bearer ${kvToken}` };

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
      ...viewKeyFetches,
      ...copyKeyFetches
    ]);

    const discordUserIds: string[] = recentEventsRes ? (await fetch(`${kvUrl}/smembers/users:discord:index`, { headers }).then(r => r.json()).catch(() => ({ result: [] })))?.result || [] : [];
    const discordUserFetches = discordUserIds.map(id =>
      fetch(`${kvUrl}/get/users:discord:${id}`, { headers })
        .then(r => r.json())
        .then(d => {
          if (d?.result) {
            try { return JSON.parse(decodeURIComponent(d.result)); } catch {}
          }
          return null;
        })
        .catch(() => null)
    );
    const discordUsers = (await Promise.all(discordUserFetches)).filter(Boolean);

    const rawViewsHash = parseHashResult(toolsViewsHashRes?.result);
    const rawCopiesHash = parseHashResult(toolsCopiesHashRes?.result);
    const rawSearchesHash = parseHashResult(searchesRes?.result);
    const rawItemsHash = parseHashResult(itemsRes?.result);
    const rawCountriesHash = parseHashResult(countriesRes?.result);
    const rawReferrersHash = parseHashResult(referrersRes?.result);
    const rawDevicesHash = parseHashResult(devicesRes?.result);

    const indivViews = indivResults.slice(0, ALL_TOOLS.length);
    const indivCopies = indivResults.slice(ALL_TOOLS.length);

    let sumCopies = 0;
    let sumViews = 0;

    const toolStats: Record<string, { views: number; copies: number; copyRate: number }> = {};
    const toolRankings = ALL_TOOLS.map((t, idx) => {
      const vIndiv = parseInt(indivViews[idx]?.result || '0', 10) || 0;
      const cIndiv = parseInt(indivCopies[idx]?.result || '0', 10) || 0;
      const vHash = rawViewsHash[t] || 0;
      const cHash = rawCopiesHash[t] || 0;

      const views = Math.max(vIndiv, vHash);
      const copies = Math.max(cIndiv, cHash);

      sumViews += views;
      sumCopies += copies;

      const copyRate = views > 0 ? Math.min(100, Math.round((copies / views) * 100)) : 0;
      toolStats[t] = { views, copies, copyRate };

      return {
        toolId: t,
        toolName: TOOL_NAMES[t] || t,
        views,
        copies,
        copyRate
      };
    }).sort((a, b) => b.copies - a.copies || b.views - a.views);

    const totalCopies = Math.max(parseInt(totalCopiesRes?.result || '0', 10) || 0, sumCopies);
    const totalViews = Math.max(parseInt(totalViewsRes?.result || '0', 10) || 0, sumViews);
    const totalEvents = Math.max(parseInt(totalEventsRes?.result || '0', 10) || 0, totalViews + totalCopies);

    const topSearches = Object.entries(rawSearchesHash)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const topItems = Object.entries(rawItemsHash)
      .map(([fullKey, count]) => {
        const parts = fullKey.split('::');
        const toolId = parts[0] || 'tool';
        const name = parts[1] || fullKey;
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

        return { name, type, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const totalCountryCount = Math.max(1, Object.values(rawCountriesHash).reduce((a, b) => a + b, 0));
    const topCountries = Object.entries(rawCountriesHash)
      .map(([code, count]) => ({
        code,
        name: COUNTRY_NAMES[code] || code,
        count,
        percentage: Math.round((count / totalCountryCount) * 100)
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

    const recentEvents = (recentEventsRes?.result || []).map((str: string) => {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch {
        return null;
      }
    }).filter(Boolean);

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
      totalDiscordUsers: discordUsers.length || 0
    });

  } catch (err: any) {
    return res.status(200).json({ status: 'offline_fallback' });
  }
}
