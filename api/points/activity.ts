export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, activity, toolId, scriptId, scriptName } = req.body || {};
    if (!userId || !activity) {
      return res.status(400).json({ error: 'Missing userId or activity' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const headers: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    let user: any = {
      id: userId,
      points: 0,
      totalPointsEarned: 0,
      claimedActivities: {},
      claimedFreeScripts: [],
      lastDevToolsUse: 0,
      redeemedCoupons: [],
      pointsHistory: []
    };

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

    if (!user.claimedActivities) user.claimedActivities = {};
    if (!user.claimedFreeScripts) user.claimedFreeScripts = [];
    if (!user.pointsHistory) user.pointsHistory = [];

    const now = Date.now();
    const cooldown24h = 86400000;

    // --- ACTIVITY 1: DEVTOOLS USAGE (+20 Points, 1x per 24 hours) ---
    if (activity === 'devtools_use') {
      const lastDevTools = user.lastDevToolsUse || 0;
      const elapsed = now - lastDevTools;

      if (lastDevTools > 0 && elapsed < cooldown24h) {
        return res.status(200).json({
          success: false,
          cooldown: true,
          remainingMs: cooldown24h - elapsed,
          message: 'DevTools daily points cooldown active. You can earn points once every 24 hours.'
        });
      }

      // Check redis onetime key as secondary anti-abuse
      if (kvUrl && kvToken) {
        try {
          const directCheck = await fetch(`${kvUrl}/get/points:daily:${userId}:devtools_use`, { headers });
          const directData = await directCheck.json().catch(() => null);
          if (directData?.result) {
            const lastTime = parseInt(String(directData.result), 10) || 0;
            if (lastTime > 0 && now - lastTime < cooldown24h) {
              return res.status(200).json({
                success: false,
                cooldown: true,
                remainingMs: cooldown24h - (now - lastTime),
                message: 'DevTools daily points cooldown active.'
              });
            }
          }
        } catch {}
      }

      const toolLabel = toolId
        ? toolId.charAt(0).toUpperCase() + toolId.slice(1)
        : 'Utility';

      user.points = (user.points || 0) + 20;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 20;
      user.lastDevToolsUse = now;
      user.pointsHistory.unshift({
        id: 'pt-' + now.toString(36) + '-dev',
        activity: 'devtools_use',
        label: `DevTools Usage (${toolLabel})`,
        points: 20,
        timestamp: now
      });

      if (kvUrl && kvToken) {
        const pipeline = [
          ['SET', `users:discord:${userId}`, JSON.stringify(user)],
          ['SET', `points:daily:${userId}:devtools_use`, String(now)],
          ['EXPIRE', `points:daily:${userId}:devtools_use`, '86400']
        ];
        await fetch(`${kvUrl}/pipeline`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(pipeline)
        }).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        pointsAwarded: 20,
        newBalance: user.points,
        remainingMs: cooldown24h,
        message: 'Successfully earned +20 MD Points for using FiveM DevTools!'
      });
    }

    // --- ACTIVITY 2: DOWNLOAD FREE SCRIPT (+20 Points, 1x per script) ---
    if (activity === 'download_free_script') {
      const cleanScriptId = String(scriptId || '').trim();
      if (!cleanScriptId) {
        return res.status(400).json({ error: 'Missing scriptId' });
      }

      if (user.claimedFreeScripts.includes(cleanScriptId)) {
        return res.status(200).json({
          success: false,
          alreadyClaimed: true,
          message: 'Points have already been claimed for this script.'
        });
      }

      if (kvUrl && kvToken) {
        try {
          const directCheck = await fetch(`${kvUrl}/get/points:script:${userId}:${cleanScriptId}`, { headers });
          const directData = await directCheck.json().catch(() => null);
          if (directData?.result) {
            user.claimedFreeScripts.push(cleanScriptId);
            return res.status(200).json({
              success: false,
              alreadyClaimed: true,
              message: 'Points have already been claimed for this script.'
            });
          }
        } catch {}
      }

      const scriptTitle = scriptName || `Script #${cleanScriptId}`;
      user.points = (user.points || 0) + 20;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 20;
      user.claimedFreeScripts.push(cleanScriptId);
      user.pointsHistory.unshift({
        id: 'pt-' + now.toString(36) + '-dl',
        activity: 'download_free_script',
        label: `Downloaded Free Script (${scriptTitle})`,
        points: 20,
        timestamp: now
      });

      if (kvUrl && kvToken) {
        const pipeline = [
          ['SET', `users:discord:${userId}`, JSON.stringify(user)],
          ['SET', `points:script:${userId}:${cleanScriptId}`, 'true']
        ];
        await fetch(`${kvUrl}/pipeline`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(pipeline)
        }).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        pointsAwarded: 20,
        newBalance: user.points,
        message: `Successfully earned +20 MD Points for downloading ${scriptTitle}!`
      });
    }

    return res.status(400).json({ error: `Unknown activity type: ${activity}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
