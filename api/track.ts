export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    if (!event || !event.toolId) {
      return res.status(400).json({ error: 'Invalid event data' });
    }

    const country = req.headers['x-vercel-ip-country'] || 'CZ';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] ? new URL(req.headers['referer']).hostname : 'Direct';

    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      country,
      device: /mobile|android|iphone/i.test(userAgent) ? 'Mobile' : 'Desktop',
      referrer
    };

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      await Promise.allSettled([
        fetch(`${kvUrl}/incr/analytics:total_events`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/incr/analytics:tool_views:${event.toolId}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/lpush/analytics:recent_events/${encodeURIComponent(JSON.stringify(enrichedEvent))}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/ltrim/analytics:recent_events/0/99`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        })
      ]);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(200).json({ success: true, fallback: true });
  }
}
