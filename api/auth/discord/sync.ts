export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, cart, favorites, historyItem, downloadsCountDelta } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const headers = { Authorization: `Bearer ${kvToken}` };
      const userRes = await fetch(`${kvUrl}/get/users:discord:${userId}`, { headers });
      const userData = await userRes.json();

      let user: any = {
        id: userId,
        lastActive: Date.now(),
        cart: [],
        favorites: [],
        downloadsCount: 0,
        history: []
      };

      if (userData?.result) {
        try {
          user = JSON.parse(decodeURIComponent(userData.result));
        } catch {}
      }

      if (cart !== undefined) user.cart = cart;
      if (favorites !== undefined) user.favorites = favorites;
      if (downloadsCountDelta) user.downloadsCount = (user.downloadsCount || 0) + downloadsCountDelta;
      if (historyItem) {
        user.history = [historyItem, ...(user.history || [])].slice(0, 50);
      }
      user.lastActive = Date.now();

      await fetch(`${kvUrl}/set/users:discord:${userId}/${encodeURIComponent(JSON.stringify(user))}`, { headers });

      return res.status(200).json({ success: true, user });
    }

    return res.status(200).json({ success: true, offline: true });
  } catch (err: any) {
    return res.status(200).json({ success: true, fallback: true });
  }
}
