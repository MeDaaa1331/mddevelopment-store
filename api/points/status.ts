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
      return res.status(400).json({ error: 'Missing userId' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    let user: any = {
      id: userId,
      points: 0,
      totalPointsEarned: 0,
      claimedActivities: {},
      claimedFreeScripts: [],
      lastDevToolsUse: 0,
      lastSpin: 0,
      redeemedCoupons: [],
      pointsHistory: []
    };

    const headers: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    if (kvUrl && kvToken) {
      try {
        const userRes = await fetch(`${kvUrl}/get/users:discord:${userId}`, { headers });
        const userData = await userRes.json().catch(() => null);
        if (userData?.result) {
          try {
            const parsed = typeof userData.result === 'string' ? JSON.parse(userData.result) : userData.result;
            user = { ...user, ...parsed };
          } catch {
            try {
              const parsed = JSON.parse(decodeURIComponent(userData.result));
              user = { ...user, ...parsed };
            } catch {}
          }
        }
      } catch {}
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    let inGuild = false;

    if (guildId && botToken) {
      try {
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.trim()}`, {
          headers: { Authorization: `Bot ${botToken.trim()}` }
        });
        if (guildRes.ok) {
          inGuild = true;
        }
      } catch {
        inGuild = false;
      }
    }

    const now = Date.now();
    let userModified = false;

    // Safety auto-award: First Discord Login (+100 points) if missing
    if (!user.claimedActivities) user.claimedActivities = {};
    if (!user.claimedActivities.discord_login) {
      user.claimedActivities.discord_login = true;
      user.points = (user.points || 0) + 100;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 100;
      if (!user.pointsHistory) user.pointsHistory = [];
      user.pointsHistory.unshift({
        id: 'pt-' + now.toString(36) + '-login',
        activity: 'discord_login',
        label: 'Welcome Discord Login Bonus',
        points: 100,
        timestamp: now
      });
      userModified = true;
    }

    // Auto-check & award: Join Official Discord (+50 points, strictly once)
    if (inGuild && !user.claimedActivities.discord_guild) {
      let alreadyClaimedOnetime = false;
      if (kvUrl && kvToken) {
        try {
          const oRes = await fetch(`${kvUrl}/get/points:onetime:${userId}:discord_guild`, { headers });
          const oData = await oRes.json().catch(() => null);
          if (oData?.result) alreadyClaimedOnetime = true;
        } catch {}
      }

      if (!alreadyClaimedOnetime) {
        user.claimedActivities.discord_guild = true;
        user.points = (user.points || 0) + 50;
        user.totalPointsEarned = (user.totalPointsEarned || 0) + 50;
        if (!user.pointsHistory) user.pointsHistory = [];
        user.pointsHistory.unshift({
          id: 'pt-' + now.toString(36) + '-guild',
          activity: 'discord_guild',
          label: 'Joined Official Discord Server',
          points: 50,
          timestamp: now
        });
        userModified = true;

        if (kvUrl && kvToken) {
          fetch(`${kvUrl}/set/points:onetime:${userId}:discord_guild/true`, { headers }).catch(() => {});
        }
      } else {
        user.claimedActivities.discord_guild = true;
        userModified = true;
      }
    }

    if (userModified && kvUrl && kvToken) {
      try {
        await fetch(`${kvUrl}/set/users:discord:${userId}`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
      } catch {}
    }

    const cooldown24h = 86400000;
    const lastDevTools = user.lastDevToolsUse || 0;
    const devToolsRemainingMs = lastDevTools > 0 ? Math.max(0, cooldown24h - (now - lastDevTools)) : 0;

    const lastSpin = user.lastSpin || 0;
    const wheelSpinRemainingMs = lastSpin > 0 ? Math.max(0, cooldown24h - (now - lastSpin)) : 0;

    return res.status(200).json({
      success: true,
      points: user.points || 0,
      totalPointsEarned: user.totalPointsEarned || 0,
      inGuild,
      claimedActivities: user.claimedActivities || {},
      claimedFreeScripts: user.claimedFreeScripts || [],
      cooldowns: {
        devToolsRemainingMs,
        wheelSpinRemainingMs,
        canUseDevToolsForPoints: devToolsRemainingMs === 0,
        canSpinWheel: inGuild && wheelSpinRemainingMs === 0
      },
      redeemedCoupons: user.redeemedCoupons || [],
      pointsHistory: (user.pointsHistory || []).slice(0, 50)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
