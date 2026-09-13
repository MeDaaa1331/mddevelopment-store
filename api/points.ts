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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-BC-Sig, X-Signature');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const body = parseBody(req);
    const queryAction = req.query?.action || url.searchParams.get('action') || body.action;
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const pathAction = (lastPart && lastPart !== 'points' && lastPart !== 'api' && lastPart !== '[action]') ? lastPart : '';
    const action = (queryAction || pathAction || '').toString().toLowerCase();

    if (action === 'status') {
      return await handleStatus(req, res, url, body);
    } else if (action === 'activity') {
      return await handleActivity(req, res, body);
    } else if (action === 'redeem') {
      return await handleRedeem(req, res, body);
    } else if (action === 'admin_adjust') {
      return await handleAdminAdjust(req, res, body);
    } else if (action === 'buy_wheel_spin') {
      return await handleBuyWheelSpin(req, res, body);
    } else if (action === 'register_basket') {
      return await handleRegisterBasket(req, res, body);
    } else if (action === 'claim_purchase') {
      return await handleClaimPurchase(req, res, url, body);
    } else if (action === 'tebex_webhook' || action === 'webhook') {
      return await handleTebexWebhook(req, res, body);
    }

    return res.status(404).json({ error: `Unknown points action: ${action || 'none'}` });
  } catch (err: any) {
    console.error('[Points Handler Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
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

    let lastSpinTime = 0;
    let lastDevTime = 0;

    if (kvUrl && kvToken) {
      try {
        const [userRes, lastSpinRes, devtoolsDailyRes, extraSpinsRes] = await Promise.all([
          fetch(`${kvUrl}/get/users:discord:${userId}`, { headers }),
          fetch(`${kvUrl}/get/users:discord:${userId}:last_spin`, { headers }),
          fetch(`${kvUrl}/get/points:daily:${userId}:devtools_use`, { headers }),
          fetch(`${kvUrl}/get/users:discord:${userId}:extra_spins`, { headers })
        ]);

        const userData = await userRes.json().catch(() => null);
        const lastSpinData = await lastSpinRes.json().catch(() => null);
        const devtoolsDailyData = await devtoolsDailyRes.json().catch(() => null);
        const extraSpinsData = await extraSpinsRes.json().catch(() => null);

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

        let extraSpins = Number(user.extraSpins || 0);
        if (extraSpinsData?.result) {
          const directExtra = parseInt(String(extraSpinsData.result), 10) || 0;
          if (directExtra > extraSpins) extraSpins = directExtra;
        }
        user.extraSpins = extraSpins;

        lastSpinTime = user.lastSpin || 0;
        if (lastSpinData?.result) {
          const directSpin = parseInt(String(lastSpinData.result), 10) || 0;
          if (directSpin > lastSpinTime) lastSpinTime = directSpin;
        }

        // If extra spins are available, cooldown is completely bypassed
        if (extraSpins > 0) {
          lastSpinTime = 0;
        }

        lastDevTime = user.lastDevToolsUse || 0;
        if (devtoolsDailyData?.result) {
          const directDev = parseInt(String(devtoolsDailyData.result), 10) || 0;
          if (directDev > lastDevTime) lastDevTime = directDev;
        }
      } catch {}
    } else {
      const extraSpins = Number(user.extraSpins || 0);
      lastSpinTime = extraSpins > 0 ? 0 : (user.lastSpin || 0);
      lastDevTime = user.lastDevToolsUse || 0;
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;
    // Default inGuild to true for Discord-authenticated users (matches wheel.ts),
    // or if already marked/claimed in user profile
    let inGuild = Boolean(user.claimedActivities?.discord_guild || (user.inGuild ?? true));

    if (guildId && botToken) {
      try {
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.toString().trim()}`, {
          headers: { Authorization: `Bot ${botToken.trim()}` }
        });
        if (guildRes.status === 404) {
          if (!user.claimedActivities?.discord_guild) {
            inGuild = false;
          }
        } else {
          inGuild = true;
        }
      } catch {
        inGuild = true;
      }
    }

    const now = Date.now();
    let userModified = false;

    if (!user.claimedActivities) user.claimedActivities = {};
    if (!user.pointsHistory) user.pointsHistory = [];

    // Safety auto-award: First Discord Login (+100 points) if missing
    if (!user.claimedActivities.discord_login) {
      user.claimedActivities.discord_login = true;
      user.points = (user.points || 0) + 100;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 100;
      user.pointsHistory.unshift({
        id: 'pt-' + now.toString(36) + '-login',
        activity: 'discord_login',
        label: 'Welcome Discord Login Bonus',
        points: 100,
        timestamp: user.firstJoined || now
      });
      userModified = true;
    }

    // Auto-award: Join Discord Server (+50 points) if in guild and not claimed yet
    if (inGuild && !user.claimedActivities.discord_guild) {
      user.claimedActivities.discord_guild = true;
      user.points = (user.points || 0) + 50;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 50;
      user.pointsHistory.unshift({
        id: 'pt-' + (now + 1).toString(36) + '-guild',
        activity: 'discord_guild',
        label: 'Joined MD Development Discord Server',
        points: 50,
        timestamp: now
      });
      userModified = true;
    }

    // Safety Self-heal: If pointsHistory is empty, reconstruct records based on claimed activities
    if (user.pointsHistory.length === 0) {
      if (user.claimedActivities.discord_login) {
        user.pointsHistory.push({
          id: 'pt-' + now.toString(36) + '-login',
          activity: 'discord_login',
          label: 'Welcome Discord Login Bonus',
          points: 100,
          timestamp: user.firstJoined || now
        });
      }
      if (user.claimedActivities.discord_guild || inGuild) {
        user.pointsHistory.push({
          id: 'pt-' + (now + 1).toString(36) + '-guild',
          activity: 'discord_guild',
          label: 'Joined MD Development Discord Server',
          points: 50,
          timestamp: now
        });
      }
      userModified = true;
    }

    if (userModified && kvUrl && kvToken) {
      const pipeline = [
        ['SET', `users:discord:${userId}`, JSON.stringify(user)]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    // Calculate DevTools cooldown
    const cooldown24h = 86400000;
    const elapsedDev = lastDevTime > 0 ? (now - lastDevTime) : cooldown24h + 1;
    const devToolsRemainingMs = (lastDevTime > 0 && elapsedDev < cooldown24h) ? Math.max(0, cooldown24h - elapsedDev) : 0;
    const canClaimDevTools = devToolsRemainingMs === 0;

    // Calculate Wheel spin cooldown
    const elapsedSpin = lastSpinTime > 0 ? (now - lastSpinTime) : cooldown24h + 1;
    const wheelSpinRemainingMs = (lastSpinTime > 0 && elapsedSpin < cooldown24h) ? Math.max(0, cooldown24h - elapsedSpin) : 0;
    const canSpinWheel = wheelSpinRemainingMs === 0;

    const isMember = inGuild || Boolean(user.claimedActivities?.discord_guild);

    return res.status(200).json({
      success: true,
      points: user.points || 0,
      totalPointsEarned: user.totalPointsEarned || 0,
      extraSpins: user.extraSpins || 0,
      claimedActivities: user.claimedActivities || {},
      claimedFreeScripts: user.claimedFreeScripts || [],
      cooldowns: {
        devToolsRemainingMs,
        wheelSpinRemainingMs,
        canUseDevToolsForPoints: canClaimDevTools,
        canSpinWheel: canSpinWheel
      },
      devTools: {
        canClaim: canClaimDevTools,
        remainingMs: devToolsRemainingMs,
        lastUsed: lastDevTime
      },
      wheel: {
        canSpin: canSpinWheel,
        remainingMs: wheelSpinRemainingMs,
        lastSpin: lastSpinTime
      },
      history: user.pointsHistory || [],
      pointsHistory: user.pointsHistory || [],
      redeemedCoupons: user.redeemedCoupons || [],
      inGuild: isMember
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

    // --- ACTIVITY 3: JOIN DISCORD SERVER (+50 Points, 1x) ---
    if (activity === 'discord_guild') {
      if (user.claimedActivities?.discord_guild) {
        return res.status(200).json({
          success: true,
          alreadyClaimed: true,
          inGuild: true,
          message: 'Discord membership points have already been claimed.'
        });
      }

      user.claimedActivities.discord_guild = true;
      user.points = (user.points || 0) + 50;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + 50;
      user.pointsHistory.unshift({
        id: 'pt-' + now.toString(36) + '-guild',
        activity: 'discord_guild',
        label: 'Joined MD Development Discord Server',
        points: 50,
        timestamp: now
      });

      if (kvUrl && kvToken) {
        const pipeline = [
          ['SET', `users:discord:${userId}`, JSON.stringify(user)],
          ['SET', `points:onetime:${userId}:discord_guild`, 'true']
        ];
        await fetch(`${kvUrl}/pipeline`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(pipeline)
        }).catch(() => {});
      }

      return res.status(200).json({
        success: true,
        pointsAwarded: 50,
        newBalance: user.points,
        inGuild: true,
        message: 'Successfully claimed +50 MD Points for joining MD Development Discord!'
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

async function handleAdminAdjust(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, amount, reason } = body || {};
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const delta = parseInt(String(amount), 10);
    if (isNaN(delta) || delta === 0) {
      return res.status(400).json({ error: 'Invalid points amount. Must be a non-zero number.' });
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
      lastSpin: 0,
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

    const prevPoints = user.points || 0;
    const newPoints = Math.max(0, prevPoints + delta);
    user.points = newPoints;
    if (delta > 0) {
      user.totalPointsEarned = (user.totalPointsEarned || 0) + delta;
    }

    const now = Date.now();
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.unshift({
      id: 'pt-admin-' + now.toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      activity: 'admin_adjust',
      label: reason?.trim() || (delta > 0 ? `Admin added +${delta} MD Points` : `Admin removed ${Math.abs(delta)} MD Points`),
      points: delta,
      timestamp: now
    });

    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `users:discord:${userId}`, JSON.stringify(user)]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      userId,
      previousPoints: prevPoints,
      newPoints: user.points,
      totalPointsEarned: user.totalPointsEarned,
      delta,
      message: delta > 0
        ? `Successfully added +${delta} points to user.`
        : `Successfully removed ${Math.abs(delta)} points from user.`,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleBuyWheelSpin(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = body?.userId || body?.id;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const headers: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    let user: any = { id: userId, points: 0, pointsHistory: [] };

    if (kvUrl && kvToken) {
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
    }

    const clientPoints = Number(body?.currentPoints || 0);
    if ((user.points || 0) < 300 && clientPoints >= 300) {
      user.points = clientPoints;
    }

    if ((user.points || 0) < 300) {
      return res.status(400).json({
        success: false,
        error: `Not enough MD Points. You have ${user.points || 0} pts, 300 pts required.`
      });
    }

    const now = Date.now();
    user.points = Math.max(0, (user.points || 0) - 300);
    user.lastSpin = 0;
    user.extraSpins = (user.extraSpins || 0) + 1;
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.unshift({
      id: 'pt-' + now.toString(36) + '-wheel-extra',
      activity: 'wheel_extra_spin',
      label: 'Extra Wheel Spin (300 MD Points)',
      points: -300,
      timestamp: now
    });

    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `users:discord:${userId}`, JSON.stringify(user)],
        ['SET', `users:discord:${userId}:last_spin`, '0'],
        ['SET', `users:discord:${userId}:extra_spins`, String(user.extraSpins)],
        ['DEL', `users:discord:${userId}:last_spin`]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      newPoints: user.points,
      extraSpins: user.extraSpins,
      remainingMs: 0,
      canSpin: true,
      message: 'Wheel cooldown successfully skipped for 300 MD Points! You can spin now.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleRegisterBasket(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const basketId = body.basketId || body.basket_ident || body.ident;
    const userId = body.userId;
    const username = body.username || 'Discord User';
    const expectedPoints = Number(body.expectedPoints || 0);
    const packages = body.packages || body.packageNames || '';

    if (!basketId || !userId) {
      return res.status(400).json({ error: 'Missing basketId or userId' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `baskets:${basketId}:user`, JSON.stringify({ userId, username, expectedPoints, packages, timestamp: Date.now() }), 'EX', '172800']
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, registered: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleClaimPurchase(req: any, res: any, url: URL, body: any) {
  try {
    const basketId = (req.query?.basketId || url.searchParams.get('basketId') || body?.basketId || '').toString().trim();
    let userId = (req.query?.userId || url.searchParams.get('userId') || body?.userId || '').toString().trim();
    let clientExpectedPoints = Number(req.query?.expectedPoints || url.searchParams.get('expectedPoints') || body?.expectedPoints || 0);
    let clientPackageNames = (req.query?.packages || url.searchParams.get('packages') || body?.packages || body?.packageNames || '').toString().trim();

    if (!basketId) {
      return res.status(400).json({ success: false, error: 'Missing basketId' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const headers: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    // 1. Idempotency check: Has this basket already been credited?
    if (kvUrl && kvToken) {
      const claimedRes = await fetch(`${kvUrl}/get/baskets:claimed:${basketId}`, { headers }).catch(() => null);
      const claimedData = await claimedRes?.json().catch(() => null);
      if (claimedData?.result) {
        let pts = 0;
        try {
          const parsed = typeof claimedData.result === 'string' ? JSON.parse(claimedData.result) : claimedData.result;
          pts = Number(parsed.points || 0);
        } catch {}
        return res.status(200).json({
          success: true,
          alreadyClaimed: true,
          pointsAwarded: pts,
          message: 'Points for this purchase have already been credited.'
        });
      }

      // Check if Tebex webhook already processed this basket
      const webhookRes = await fetch(`${kvUrl}/get/payments:processed:${basketId}`, { headers }).catch(() => null);
      const webhookData = await webhookRes?.json().catch(() => null);
      if (webhookData?.result) {
        let pts = 0;
        try {
          const parsed = typeof webhookData.result === 'string' ? JSON.parse(webhookData.result) : webhookData.result;
          pts = Number(parsed.points || 0);
        } catch {}
        // Mark as claimed to prevent future checks
        await fetch(`${kvUrl}/set/baskets:claimed:${basketId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ userId, points: pts, timestamp: Date.now() })
        }).catch(() => {});
        return res.status(200).json({
          success: true,
          alreadyClaimed: true,
          pointsAwarded: pts,
          message: 'Payment verified and points already credited via Tebex webhook.'
        });
      }

      // Lookup basket user association if missing
      const bRes = await fetch(`${kvUrl}/get/baskets:${basketId}:user`, { headers }).catch(() => null);
      const bData = await bRes?.json().catch(() => null);
      if (bData?.result) {
        try {
          const parsed = typeof bData.result === 'string' ? JSON.parse(bData.result) : bData.result;
          if (!userId && parsed.userId) userId = parsed.userId;
          if (!clientExpectedPoints && parsed.expectedPoints) clientExpectedPoints = Number(parsed.expectedPoints);
          if (!clientPackageNames && parsed.packages) clientPackageNames = parsed.packages;
        } catch {}
      }
    }

    // 2. Fetch basket from Tebex Headless API to verify actual payment status
    const tebexToken = process.env.VITE_TEBEX_PUBLIC_TOKEN || process.env.TEBEX_PUBLIC_TOKEN || 'yry4-4f39d4771913f90be71cc7be4f234a2cfbd8036e';
    let basket: any = null;
    try {
      const basketRes = await fetch(`https://headless.tebex.io/api/accounts/${tebexToken}/baskets/${basketId}`, {
        headers: { Accept: 'application/json' }
      });
      if (basketRes.ok) {
        const basketJson = await basketRes.json();
        basket = basketJson.data || basketJson;
      }
    } catch (e) {
      console.warn('[handleClaimPurchase] Tebex API fetch error:', e);
    }

    if (!basket) {
      return res.status(404).json({
        success: false,
        error: 'Basket not found on Tebex or invalid basket ID.'
      });
    }

    // STRICT CHECK: The basket MUST be completed/paid!
    const isComplete = Boolean(
      basket.complete === true ||
      basket.is_complete === true ||
      basket.status === 'complete' ||
      basket.status === 'paid'
    );

    if (!isComplete) {
      return res.status(400).json({
        success: false,
        paid: false,
        error: 'Order has not been completed or paid. No points awarded for unpaid checkouts.'
      });
    }

    // 3. Basket is officially completed and paid: extract total and packages
    const rawPrice = parseFloat(basket.total_price ?? basket.base_price ?? 0);
    let amount = isNaN(rawPrice) ? 0 : rawPrice;

    const pkgs = basket.packages || basket.lines || [];
    if (amount <= 0 && Array.isArray(pkgs)) {
      const fallbackSum = pkgs.reduce((acc: number, p: any) => acc + (parseFloat(p.price || p.base_price || 0) || 0), 0);
      if (fallbackSum > 0) amount = fallbackSum;
    }

    let packageNames = clientPackageNames;
    if (Array.isArray(pkgs) && pkgs.length > 0) {
      packageNames = pkgs.map((p: any) => p.name || p.package?.name).filter(Boolean).join(', ');
    }
    if (!packageNames) {
      packageNames = 'FiveM Resource Script';
    }

    const pointsToAward = Math.max(0, Math.round(amount * 15));
    if (pointsToAward <= 0) {
      return res.status(200).json({
        success: true,
        pointsAwarded: 0,
        message: 'Order completed with 0.00 EUR total. 0 points awarded.'
      });
    }

    const targetUserId = userId;
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot credit points: Discord user ID not found for this completed basket.'
      });
    }

    // 4. Update user points in Redis
    let user: any = { id: targetUserId, points: 0, totalPointsEarned: 0, pointsHistory: [] };
    if (kvUrl && kvToken) {
      const userRes = await fetch(`${kvUrl}/get/users:discord:${targetUserId}`, { headers }).catch(() => null);
      const userData = await userRes?.json().catch(() => null);
      if (userData?.result) {
        try {
          user = typeof userData.result === 'string' ? JSON.parse(userData.result) : userData.result;
        } catch {}
      }
    }

    const now = Date.now();
    user.points = (user.points || 0) + pointsToAward;
    user.totalPointsEarned = (user.totalPointsEarned || 0) + pointsToAward;
    if (!user.pointsHistory) user.pointsHistory = [];

    user.pointsHistory.unshift({
      id: `pt-pay-${basketId}-${now.toString(36)}`,
      activity: 'script_purchase',
      label: `Script Purchase: ${packageNames} (+${pointsToAward} MD Points)`,
      points: pointsToAward,
      amountEur: amount > 0 ? amount : undefined,
      basketId,
      timestamp: now
    });

    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `users:discord:${targetUserId}`, JSON.stringify(user)],
        ['SET', `baskets:claimed:${basketId}`, JSON.stringify({ userId: targetUserId, points: pointsToAward, timestamp: now })],
        ['SET', `payments:processed:${basketId}`, JSON.stringify({ basketId, userId: targetUserId, points: pointsToAward, amount, timestamp: now })]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      pointsAwarded: pointsToAward,
      packageNames,
      newPoints: user.points,
      message: `Successfully credited ${pointsToAward} MD Points for your purchase!`
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleTebexWebhook(req: any, res: any, body: any) {
  try {
    const typeStr = (body.type || body.event || '').toString().toLowerCase();
    if (typeStr.includes('validation') || (body.id && (!body.subject || Object.keys(body.subject).length === 0))) {
      return res.status(200).json({ id: body.id || 'validation' });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const kvHeaders: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    const subject = body.subject || body;
    const txnId = (subject.transaction_id || subject.id || body.transaction_id || body.id)?.toString();
    if (!txnId) {
      return res.status(400).json({ error: 'Missing transaction ID' });
    }

    if (kvUrl && kvToken) {
      const checkRes = await fetch(`${kvUrl}/get/payments:processed:${txnId}`, { headers: kvHeaders }).catch(() => null);
      const checkData = await checkRes?.json().catch(() => null);
      if (checkData?.result) {
        return res.status(200).json({ success: true, message: 'Already processed', txnId });
      }
    }

    const rawAmount = parseFloat(subject.price?.amount ?? subject.amount ?? body.price?.amount ?? body.amount ?? 0);
    let amount = isNaN(rawAmount) ? 0 : rawAmount;
    if (amount <= 0) {
      const products = subject.products || subject.packages || body.products || body.packages || [];
      if (Array.isArray(products) && products.length > 0) {
        const fallbackSum = products.reduce((acc: number, p: any) => acc + (parseFloat(p.price || p.base_price || 0) || 0), 0);
        if (fallbackSum > 0) amount = fallbackSum;
      }
    }
    const pointsToAward = Math.max(0, Math.round(amount * 15));

    const basketIdent = (
      subject.basket?.ident ||
      subject.basket_ident ||
      body.basket?.ident ||
      body.basket_ident ||
      subject.custom?.basketId ||
      body.custom?.basketId
    )?.toString();

    let targetUserId = subject.custom?.userId || body.custom?.userId || null;
    if (!targetUserId && subject.custom?.user_id) targetUserId = subject.custom.user_id;

    // If userId missing, lookup via registered basket
    if (!targetUserId && basketIdent && kvUrl && kvToken) {
      const basketRes = await fetch(`${kvUrl}/get/baskets:${basketIdent}:user`, { headers: kvHeaders }).catch(() => null);
      const basketData = await basketRes?.json().catch(() => null);
      if (basketData?.result) {
        try {
          const parsed = typeof basketData.result === 'string' ? JSON.parse(basketData.result) : basketData.result;
          if (parsed?.userId) targetUserId = parsed.userId.toString();
        } catch {}
      }
    }

    if (targetUserId && kvUrl && kvToken) {
      let user: any = { id: targetUserId, points: 0, totalPointsEarned: 0, pointsHistory: [] };
      const userRes = await fetch(`${kvUrl}/get/users:discord:${targetUserId}`, { headers: kvHeaders }).catch(() => null);
      const userData = await userRes?.json().catch(() => null);
      if (userData?.result) {
        try {
          user = typeof userData.result === 'string' ? JSON.parse(userData.result) : userData.result;
        } catch {}
      }

      const products = subject.products || subject.packages || body.products || body.packages || [];
      const packageNames = Array.isArray(products)
        ? products.map((p: any) => p.name || p.title || 'Script').filter(Boolean).join(', ')
        : 'FiveM Script';

      const now = Date.now();
      user.points = (user.points || 0) + pointsToAward;
      user.totalPointsEarned = (user.totalPointsEarned || 0) + pointsToAward;
      if (!user.pointsHistory) user.pointsHistory = [];
      user.pointsHistory.unshift({
        id: `pt-pay-${txnId}-${now.toString(36)}`,
        activity: 'script_purchase',
        label: `Script Purchase: ${packageNames} (+${pointsToAward} MD Points)`,
        points: pointsToAward,
        amountEur: amount > 0 ? amount : undefined,
        txnId,
        timestamp: now
      });

      const pipeline: any[] = [
        ['SET', `users:discord:${targetUserId}`, JSON.stringify(user)],
        ['SET', `payments:processed:${txnId}`, JSON.stringify({ txnId, userId: targetUserId, points: pointsToAward, amount, timestamp: now })]
      ];
      if (basketIdent) {
        pipeline.push(['SET', `payments:processed:${basketIdent}`, JSON.stringify({ txnId, userId: targetUserId, points: pointsToAward, amount, timestamp: now })]);
        pipeline.push(['SET', `baskets:claimed:${basketIdent}`, JSON.stringify({ userId: targetUserId, points: pointsToAward, timestamp: now })]);
      }
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...kvHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, txnId, pointsAwarded: pointsToAward });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}

