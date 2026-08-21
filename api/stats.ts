export default async function handler(req: any, res: any) {
  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(200).json({ status: 'offline_fallback' });
    }

    const [totalEventsRes, totalCopiesRes, recentEventsRes] = await Promise.all([
      fetch(`${kvUrl}/get/analytics:total_events`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      }),
      fetch(`${kvUrl}/get/analytics:total_copies`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      }),
      fetch(`${kvUrl}/lrange/analytics:recent_events/0/49`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      })
    ]);

    const totalEventsData = await totalEventsRes.json();
    const totalCopiesData = await totalCopiesRes.json();
    const recentEventsData = await recentEventsRes.json();

    const recentEvents = (recentEventsData.result || []).map((str: string) => {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch {
        return null;
      }
    }).filter(Boolean);

    const totalEvents = parseInt(totalEventsData.result || '0', 10);
    const totalCopies = parseInt(totalCopiesData.result || '0', 10);

    return res.status(200).json({
      totalEvents,
      totalCopies,
      recentEvents: recentEvents || []
    });
  } catch (err: any) {
    return res.status(200).json({ status: 'offline_fallback' });
  }
}
