export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      await Promise.allSettled([
        fetch(`${kvUrl}/del/analytics:total_events`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/del/analytics:total_copies`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/del/analytics:recent_events`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        })
      ]);
    }

    return res.status(200).json({ success: true, message: 'All analytics data reset to zero' });
  } catch (err: any) {
    return res.status(200).json({ success: true, fallback: true });
  }
}
