export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const userId = req.query.userId || req.body?.userId;

    if (!userId) {
      return res.status(200).json({
        isLoggedIn: false,
        inGuild: false,
        canSpin: false,
        remainingMs: 0,
        rewards: []
      });
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    let inGuild = true;
    if (guildId && botToken) {
      try {
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
          headers: { Authorization: `Bot ${botToken}` }
        });
        if (guildRes.status === 404) {
          inGuild = false;
        } else if (guildRes.ok) {
          inGuild = true;
        }
      } catch (err) {
        inGuild = true;
      }
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    let lastSpin = 0;
    let rewards: any[] = [];

    if (kvUrl && kvToken) {
      const headers = { Authorization: `Bearer ${kvToken}` };
      const userRes = await fetch(`${kvUrl}/get/users:discord:${userId}`, { headers });
      const userData = await userRes.json();

      if (userData?.result) {
        try {
          const parsed = JSON.parse(decodeURIComponent(userData.result));
          lastSpin = parsed.lastSpin || 0;
          rewards = parsed.rewards || [];
        } catch {}
      }
    }

    const now = Date.now();
    const cooldownMs = 86400000;
    const elapsed = now - lastSpin;
    const remainingMs = Math.max(0, cooldownMs - elapsed);
    const canSpin = inGuild && remainingMs === 0;

    return res.status(200).json({
      isLoggedIn: true,
      inGuild,
      canSpin,
      remainingMs,
      nextSpinTime: lastSpin + cooldownMs,
      rewards
    });
  } catch (err: any) {
    return res.status(200).json({
      isLoggedIn: false,
      inGuild: true,
      canSpin: true,
      remainingMs: 0,
      rewards: []
    });
  }
}
