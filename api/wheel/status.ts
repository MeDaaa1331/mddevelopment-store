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
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.trim()}`, {
          headers: { Authorization: `Bot ${botToken.trim()}` }
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
      const [userRes, lastSpinRes] = await Promise.all([
        fetch(`${kvUrl}/get/users:discord:${userId}`, { headers }),
        fetch(`${kvUrl}/get/users:discord:${userId}:last_spin`, { headers })
      ]);

      const userData = await userRes.json().catch(() => null);
      const lastSpinData = await lastSpinRes.json().catch(() => null);

      if (userData?.result) {
        try {
          const parsed = typeof userData.result === 'string' ? JSON.parse(userData.result) : userData.result;
          lastSpin = parsed.lastSpin || 0;
          rewards = parsed.rewards || [];
        } catch {
          try {
            const parsed = JSON.parse(decodeURIComponent(userData.result));
            lastSpin = parsed.lastSpin || 0;
            rewards = parsed.rewards || [];
          } catch {}
        }
      }

      if (lastSpinData?.result) {
        const directSpin = parseInt(String(lastSpinData.result), 10) || 0;
        if (directSpin > lastSpin) {
          lastSpin = directSpin;
        }
      }
    }

    const now = Date.now();
    const cooldownMs = 86400000;
    const elapsed = now - lastSpin;
    const remainingMs = lastSpin > 0 ? Math.max(0, cooldownMs - elapsed) : 0;
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
