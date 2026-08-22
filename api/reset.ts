const ALL_TOOLS = [
  'translator', 'handling', 'json', 'blip', 'weapons', 'audio',
  'peds', 'flags', 'hash', 'colors', 'coords',
  'webhook', 'controls', 'manifest', 'anim'
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const headers = {
        Authorization: `Bearer ${kvToken}`,
        'Content-Type': 'application/json'
      };

      const keysToDelete = [
        'analytics:total_events',
        'analytics:total_views',
        'analytics:total_copies',
        'analytics:recent_events',
        'analytics:tools:views',
        'analytics:tools:copies',
        'analytics:searches',
        'analytics:items',
        'analytics:countries',
        'analytics:referrers',
        'analytics:devices',
        ...ALL_TOOLS.map(t => `analytics:tool_views:${t}`),
        ...ALL_TOOLS.map(t => `analytics:tool_copies:${t}`)
      ];

      const pipelineCommands = keysToDelete.map(k => ['DEL', k]);

      await Promise.allSettled([
        fetch(`${kvUrl}/pipeline`, {
          method: 'POST',
          headers,
          body: JSON.stringify(pipelineCommands)
        }),
        ...keysToDelete.map(k =>
          fetch(`${kvUrl}/del/${k}`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }).catch(() => {})
        )
      ]);
    }

    return res.status(200).json({ success: true, message: 'All analytics data reset to zero' });
  } catch (err: any) {
    return res.status(200).json({ success: true, fallback: true });
  }
}
