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
      return res.status(200).json({ users: [], totalCount: 0 });
    }

    const headers = { Authorization: `Bearer ${kvToken}` };
    const indexRes = await fetch(`${kvUrl}/smembers/users:discord:index`, { headers });
    const indexData = await indexRes.json();
    const userIds: string[] = indexData?.result || [];

    if (userIds.length === 0) {
      return res.status(200).json({ users: [], totalCount: 0 });
    }

    const userPromises = userIds.map(id =>
      fetch(`${kvUrl}/get/users:discord:${id}`, { headers })
        .then(r => r.json())
        .then(data => {
          if (data?.result) {
            try {
              return JSON.parse(decodeURIComponent(data.result));
            } catch {
              return null;
            }
          }
          return null;
        })
        .catch(() => null)
    );

    const users = (await Promise.all(userPromises))
      .filter(Boolean)
      .sort((a: any, b: any) => (b.lastActive || 0) - (a.lastActive || 0));

    return res.status(200).json({
      users,
      totalCount: users.length
    });
  } catch (err: any) {
    return res.status(200).json({ users: [], totalCount: 0 });
  }
}
