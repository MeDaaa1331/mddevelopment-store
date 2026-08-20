export default async function handler(req: any, res: any) {
  try {
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(200).json({ status: 'offline_fallback' });
    }

    const [totalEventsRes, recentEventsRes] = await Promise.all([
      fetch(`${kvUrl}/get/analytics:total_events`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      }),
      fetch(`${kvUrl}/lrange/analytics:recent_events/0/49`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      })
    ]);

    const totalEventsData = await totalEventsRes.json();
    const recentEventsData = await recentEventsRes.json();

    const recentEvents = (recentEventsData.result || []).map((str: string) => {
      try {
        return JSON.parse(decodeURIComponent(str));
      } catch {
        return null;
      }
    }).filter(Boolean);

    return res.status(200).json({
      totalEvents: parseInt(totalEventsData.result || '0', 10),
      recentEvents
    });
  } catch (err: any) {
    return res.status(200).json({ status: 'offline_fallback' });
  }
}
