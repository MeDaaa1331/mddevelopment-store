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
      return res.status(200).json({ history: [], totalSpins: 0, prizeCounts: {} });
    }

    const headers = { Authorization: `Bearer ${kvToken}` };

    const [historyRes, totalSpinsRes, ...prizeCountRes] = await Promise.all([
      fetch(`${kvUrl}/lrange/analytics:spin_history/0/199`, { headers }).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(`${kvUrl}/get/analytics:spins:total`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_0`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_5`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_10`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_15`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_30`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_50`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_100`, { headers }).then(r => r.json()).catch(() => ({ result: 0 }))
    ]);

    const history = (historyRes?.result || []).map((str: string) => {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch {
        return null;
      }
    }).filter(Boolean);

    const prizeCounts: Record<string, number> = {
      '0': parseInt(prizeCountRes[0]?.result || '0', 10) || 0,
      '5': parseInt(prizeCountRes[1]?.result || '0', 10) || 0,
      '10': parseInt(prizeCountRes[2]?.result || '0', 10) || 0,
      '15': parseInt(prizeCountRes[3]?.result || '0', 10) || 0,
      '30': parseInt(prizeCountRes[4]?.result || '0', 10) || 0,
      '50': parseInt(prizeCountRes[5]?.result || '0', 10) || 0,
      '100': parseInt(prizeCountRes[6]?.result || '0', 10) || 0
    };

    const totalSpins = parseInt(totalSpinsRes?.result || '0', 10) || history.length;

    return res.status(200).json({
      history,
      totalSpins,
      prizeCounts
    });
  } catch (err: any) {
    return res.status(200).json({ history: [], totalSpins: 0, prizeCounts: {} });
  }
}
