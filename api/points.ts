function parseBody(req: any): any {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const body = parseBody(req);
  const queryAction = req.query?.action || url.searchParams.get('action') || body.action;
  const pathParts = url.pathname.split('/').filter(Boolean);
  const lastPart = pathParts[pathParts.length - 1];
  const pathAction = (lastPart && lastPart !== 'points' && lastPart !== 'api' && lastPart !== '[action]') ? lastPart : '';
  const action = (queryAction || pathAction || '').toString().toLowerCase();

  if (action === 'status') {
    return handleStatus(req, res, url, body);
  } else if (action === 'activity') {
    return handleActivity(req, res, body);
  } else if (action === 'redeem') {
    return handleRedeem(req, res, body);
  }

  return res.status(404).json({ error: `Unknown points action: ${action || 'none'}` });
}

async function handleStatus(req: any, res: any, url: URL, body: any) {
  try {
    const userId = req.query?.userId || url.searchParams.get('userId') || body?.userId;
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
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.toString().trim()}`, {
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

    // Auto-award: Join Discord Server (+50 points) if in guild and not claimed yet
    if (inGuild && !user.claimedActivities.discord_guild) {
      user.claimedActivities.discord_guild = true;
      user.points = (user.points || 0) + 50;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 50;
      if (!user.pointsHistory) user.pointsHistory = [];
      user.pointsHistory.unshift({
        id: 'pt-' + now.toString(36) + '-guild',
        activity: 'discord_guild',
        label: 'Joined MD Development Discord Server',
        points: 50,
        timestamp: now
      });
      userModified = true;
    }

    if (userModified && kvUrl && kvToken) {
      await fetch(`${kvUrl}/set/users:discord:${userId}`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => {});
    }

    // Calculate DevTools cooldown
    const cooldown24h = 86400000;
    const lastDev = user.lastDevToolsUse || 0;
    const elapsedDev = now - lastDev;
    const devToolsRemainingMs = lastDev > 0 ? Math.max(0, cooldown24h - elapsedDev) : 0;
    const canClaimDevTools = devToolsRemainingMs === 0;

    return res.status(200).json({
      success: true,
      points: user.points || 0,
      totalPointsEarned: user.totalPointsEarned || 0,
      claimedActivities: user.claimedActivities || {},
      claimedFreeScripts: user.claimedFreeScripts || [],
      cooldowns: {
        devToolsRemainingMs,
        wheelRemainingMs: 0
      },
      devTools: {
        canClaim: canClaimDevTools,
        remainingMs: devToolsRemainingMs,
        lastUsed: user.lastDevToolsUse || 0
      },
      history: user.pointsHistory || [],
      redeemedCoupons: user.redeemedCoupons || [],
      inGuild
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleActivity(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, activity, toolId, scriptId, scriptName } = body || {};
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

async function handleRedeem(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const DISCOUNT_COSTS: Record<number, number> = {
    10: 100,
    20: 250,
    30: 350,
    50: 500
  };

  try {
    const { userId, discountPercentage } = body || {};
    const discount = Number(discountPercentage);

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    if (!DISCOUNT_COSTS[discount]) {
      return res.status(400).json({ error: 'Invalid discount tier. Allowed: 10, 20, 30, 50' });
    }

    const cost = DISCOUNT_COSTS[discount];
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    const headers: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    let user: any = {
      id: userId,
      points: 0,
      totalPointsEarned: 0,
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

    const currentPoints = user.points || 0;
    if (currentPoints < cost) {
      return res.status(400).json({
        error: `Insufficient MD Points. Required: ${cost}, Current: ${currentPoints}`,
        required: cost,
        current: currentPoints
      });
    }

    const now = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const couponCode = `MDP${discount}-${randomSuffix}`;
    const tebexSecret = process.env.TEBEX_SECRET_KEY || process.env.VITE_TEBEX_SECRET_KEY;

    // Create coupon on Tebex Plugin API
    if (tebexSecret) {
      const startDate = new Date(now).toISOString().split('T')[0];
      try {
        const tebexRes = await fetch('https://plugin.tebex.io/coupons', {
          method: 'POST',
          headers: {
            'X-Tebex-Secret': tebexSecret.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            code: couponCode,
            effective_on: 'cart',
            packages: [],
            categories: [],
            discount_type: 'percentage',
            discount_percentage: discount,
            discount_amount: 0,
            redeem_unlimited: false,
            expire_never: true,
            expire_limit: 1,
            start_date: startDate,
            basket_type: 'single',
            minimum: 0,
            username: '',
            note: `MD Points Reward (${discount}% OFF, Cost: ${cost} pts) for ${user.username || 'User'}`
          })
        });

        if (!tebexRes.ok) {
          const errText = await tebexRes.text();
          return res.status(500).json({
            error: 'Failed to create coupon on Tebex API',
            details: errText
          });
        }
      } catch (err: any) {
        return res.status(500).json({
          error: 'Tebex coupon service unavailable',
          details: err.message
        });
      }
    }

    // Deduct points
    user.points = currentPoints - cost;
    if (!user.redeemedCoupons) user.redeemedCoupons = [];
    if (!user.pointsHistory) user.pointsHistory = [];

    const newCoupon = {
      id: 'coupon-' + now.toString(36) + '-' + randomSuffix,
      code: couponCode,
      discount,
      cost,
      createdAt: now,
      expiresAt: null
    };

    user.redeemedCoupons.unshift(newCoupon);
    user.pointsHistory.unshift({
      id: 'pt-' + now.toString(36) + '-redeem',
      activity: 'redeem_coupon',
      label: `Redeemed ${discount}% OFF Discount Coupon (${couponCode})`,
      points: -cost,
      timestamp: now,
      meta: couponCode
    });

    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `users:discord:${userId}`, JSON.stringify(user)],
        ['SET', `coupons:spin:${couponCode}`, JSON.stringify({
          code: couponCode,
          discount,
          userId,
          username: user.username,
          createdAt: now,
          effectiveType: 'cart'
        })],
        ['SADD', 'coupons:spin:index', couponCode]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      coupon: newCoupon,
      newBalance: user.points,
      message: `Discount code ${couponCode} (${discount}% OFF) successfully claimed!`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
