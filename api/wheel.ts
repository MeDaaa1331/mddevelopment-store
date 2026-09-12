const WHEEL_PRIZES = [
  { id: 'none', label: 'No Luck', shortLabel: 'NO LUCK', discount: 0, weight: 25, color: '#18181b' },
  { id: 'disc5', label: '5% Discount', shortLabel: '5% OFF', discount: 5, weight: 20, color: '#0f172a' },
  { id: 'disc10', label: '10% Discount', shortLabel: '10% OFF', discount: 10, weight: 15, color: '#131b2e' },
  { id: 'disc15', label: '15% Discount', shortLabel: '15% OFF', discount: 15, weight: 15, color: '#16221c' },
  { id: 'disc30', label: '30% Discount', shortLabel: '30% OFF', discount: 30, weight: 15, color: '#22182b' },
  { id: 'disc50', label: '50% Discount', shortLabel: '50% OFF', discount: 50, weight: 9, color: '#281d0d' },
  { id: 'disc100', label: '100% FREE Standalone Script', shortLabel: '100% FREE', discount: 100, weight: 1, color: '#311019', isJackpot: true }
];

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

function safeParseJson(raw: any) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      try {
        return JSON.parse(decodeURIComponent(raw));
      } catch {
        return null;
      }
    }
  }
  return null;
}

async function getPaidCategoryAndPackages(tebexSecret: string): Promise<{ categoryId: number; packageIds: number[] }> {
  try {
    const res = await fetch('https://plugin.tebex.io/packages', {
      headers: {
        'X-Tebex-Secret': tebexSecret.trim(),
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return { categoryId: 3002267, packageIds: [] };
    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : (data.packages || data.data || []);

    let paidCategoryId = 3002267;
    const paidPackages: number[] = [];

    for (const pkg of list) {
      const catName = (pkg.category?.name || '').trim().toLowerCase();
      const catId = Number(pkg.category?.id);
      const pkgName = (pkg.name || '').toLowerCase();

      const isPaidCategory = catName === 'paid' || catName === 'paid resources' || catName.startsWith('paid') || catId === 3002267;
      if (isPaidCategory && catId) {
        paidCategoryId = catId;
      }

      const isPackOrDeal = /pack|bundle|all[\s-_]?in[\s-_]?one|subscription|deal/i.test(pkgName);
      const isOpenSource = /open[\s-_]?source/i.test(pkgName) || /open[\s-_]?source/i.test(catName);

      if (isPaidCategory && !isPackOrDeal && !isOpenSource) {
        const id = Number(pkg.id);
        if (!isNaN(id) && id > 0) {
          paidPackages.push(id);
        }
      }
    }

    return { categoryId: paidCategoryId, packageIds: paidPackages };
  } catch (err) {
    return { categoryId: 3002267, packageIds: [] };
  }
}

async function cleanupExpiredCoupons(tebexSecret: string, kvUrl?: string, kvToken?: string) {
  try {
    const tebexRes = await fetch('https://plugin.tebex.io/coupons', {
      headers: {
        'X-Tebex-Secret': tebexSecret.trim(),
        'Accept': 'application/json'
      }
    });

    if (!tebexRes.ok) return;
    const data = await tebexRes.json();
    const list = Array.isArray(data) ? data : (data?.data || []);

    const wheelCoupons = list.filter((c: any) => {
      const code = (c.code || '').toUpperCase();
      const note = (c.note || '').toLowerCase();
      return code.startsWith('SPIN') || note.includes('wheel reward') || note.includes('100% free escrow');
    });

    const now = Date.now();
    const headers: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    for (const coupon of wheelCoupons) {
      const code = (coupon.code || '').toUpperCase();
      let expiresAt: number | null = null;

      if (kvUrl && kvToken) {
        try {
          const rRes = await fetch(`${kvUrl}/get/coupons:spin:${encodeURIComponent(code)}`, { headers });
          const rData = await rRes.json().catch(() => null);
          if (rData?.result) {
            const parsed = typeof rData.result === 'string' ? JSON.parse(rData.result) : rData.result;
            if (parsed?.expiresAt) {
              expiresAt = Number(parsed.expiresAt);
            }
          }
        } catch {}
      }

      if (!expiresAt && coupon.note) {
        const match = coupon.note.match(/Valid (?:until|24h):\s*([^\)]+)/i);
        if (match && match[1]) {
          const parsedDate = new Date(match[1].trim()).getTime();
          if (!isNaN(parsedDate)) {
            expiresAt = parsedDate;
          }
        }
      }

      if (expiresAt && now > expiresAt) {
        const couponId = coupon.id;
        if (couponId) {
          await fetch(`https://plugin.tebex.io/coupons/${couponId}`, {
            method: 'DELETE',
            headers: { 'X-Tebex-Secret': tebexSecret.trim() }
          }).catch(() => {});
        }

        if (kvUrl && kvToken) {
          fetch(`${kvUrl}/del/coupons:spin:${encodeURIComponent(code)}`, { headers }).catch(() => {});
          fetch(`${kvUrl}/srem/coupons:spin:index/${encodeURIComponent(code)}`, { headers }).catch(() => {});
        }
      }
    }
  } catch (err) {}
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
  const pathAction = (lastPart && lastPart !== 'wheel' && lastPart !== 'api' && lastPart !== '[action]') ? lastPart : '';
  const action = (queryAction || pathAction || '').toString().toLowerCase();

  if (action === 'status') {
    return handleStatus(req, res, url, body);
  } else if (action === 'spin') {
    return handleSpin(req, res, body);
  } else if (action === 'buy_spin') {
    return handleBuySpin(req, res, body);
  } else if (action === 'history') {
    return handleHistory(req, res);
  }

  return res.status(404).json({ error: `Unknown wheel action: ${action || 'none'}` });
}

async function handleStatus(req: any, res: any, url: URL, body: any) {
  try {
    const userId = req.query?.userId || url.searchParams.get('userId') || body?.userId;

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
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.toString().trim()}`, {
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

async function handleSpin(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = body.userId || body.id;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (guildId && botToken) {
      try {
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.toString().trim()}`, {
          headers: { Authorization: `Bot ${botToken.trim()}` }
        });
        if (guildRes.status === 404) {
          return res.status(200).json({
            success: false,
            inGuild: false,
            error: 'You must be a member of the official MD Development Discord server to spin the Wheel of Fortune.'
          });
        }
      } catch (err) {}
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    let lastSpinTime = 0;
    let user: any = {
      id: userId,
      username: body.username || '',
      global_name: body.global_name || '',
      avatarUrl: body.avatarUrl || ''
    };

    if (kvUrl && kvToken) {
      const headers = { Authorization: `Bearer ${kvToken}` };
      try {
        const [userRes, lastSpinRes] = await Promise.all([
          fetch(`${kvUrl}/get/users:discord:${userId}`, { headers }),
          fetch(`${kvUrl}/get/users:discord:${userId}:last_spin`, { headers })
        ]);

        const userData = await userRes.json().catch(() => null);
        const lastSpinData = await lastSpinRes.json().catch(() => null);

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

        if (lastSpinData?.result) {
          lastSpinTime = parseInt(String(lastSpinData.result), 10) || 0;
        } else if (user.lastSpin) {
          lastSpinTime = user.lastSpin;
        }
      } catch {}
    }

    const now = Date.now();
    const cooldownMs = 86400000;
    const elapsed = now - lastSpinTime;
    const usePoints = Boolean(body.usePoints);

    if (lastSpinTime > 0 && elapsed < cooldownMs) {
      if (usePoints) {
        if ((user.points || 0) < 300) {
          return res.status(400).json({
            success: false,
            error: 'Not enough MD Points. 300 points required for an extra spin.'
          });
        }
        // Deduct 300 points for extra spin
        user.points = Math.max(0, (user.points || 0) - 300);
        if (!user.pointsHistory) user.pointsHistory = [];
        user.pointsHistory.unshift({
          id: 'pt-wheel-buy-' + now.toString(36),
          activity: 'wheel_extra_spin',
          label: 'Extra Wheel Spin (300 MD Points)',
          points: -300,
          timestamp: now
        });
      } else {
        return res.status(200).json({
          success: false,
          cooldown: true,
          remainingMs: cooldownMs - elapsed,
          nextSpinTime: lastSpinTime + cooldownMs,
          error: 'Cooldown active. You can spin once every 24 hours.'
        });
      }
    }

    const totalWeight = WHEEL_PRIZES.reduce((acc, p) => acc + p.weight, 0);
    const rand = Math.random() * totalWeight;
    let accumulated = 0;
    let selectedIndex = 0;

    for (let i = 0; i < WHEEL_PRIZES.length; i++) {
      accumulated += WHEEL_PRIZES[i].weight;
      if (rand <= accumulated) {
        selectedIndex = i;
        break;
      }
    }

    const prize = WHEEL_PRIZES[selectedIndex];
    const isWin = prize.discount > 0;
    let couponCode = '';
    const expiresAt = now + 86400000;
    const tebexSecret = process.env.TEBEX_SECRET_KEY || process.env.VITE_TEBEX_SECRET_KEY;

    if (isWin && tebexSecret) {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      couponCode = `SPIN${prize.discount}-${randomSuffix}`;

      try {
        const startDate = new Date(now).toISOString().split('T')[0];
        let effectiveOn = 'cart';
        let packagesPayload: number[] = [];
        let categoriesPayload: number[] = [];

        if (prize.discount === 100) {
          const { categoryId } = await getPaidCategoryAndPackages(tebexSecret);
          effectiveOn = 'category';
          categoriesPayload = [categoryId || 3002267];
          packagesPayload = [];
        }

        await fetch('https://plugin.tebex.io/coupons', {
          method: 'POST',
          headers: {
            'X-Tebex-Secret': tebexSecret.trim(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            code: couponCode,
            effective_on: effectiveOn,
            packages: packagesPayload,
            categories: categoriesPayload,
            discount_type: 'percentage',
            discount_percentage: prize.discount,
            discount_amount: 0,
            redeem_unlimited: false,
            expire_never: true,
            expire_limit: 1,
            start_date: startDate,
            basket_type: 'single',
            minimum: 0,
            username: '',
            note: prize.discount === 100
              ? `100% Free Standalone Script (PAID Category only) for ${user.username || 'User'} (Valid until: ${new Date(expiresAt).toISOString()})`
              : `Daily Wheel Reward for ${user.username || 'User'} (Valid until: ${new Date(expiresAt).toISOString()})`
          })
        });
      } catch (err) {
        couponCode = '';
      }
    }

    const rewardEntry = isWin && couponCode ? {
      id: 'rew-' + now.toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      prizeId: prize.id,
      label: prize.label,
      discount: prize.discount,
      code: couponCode,
      createdAt: now,
      expiresAt,
      isJackpot: prize.isJackpot || false,
      effectiveType: prize.discount === 100 ? 'category' : 'cart',
      effectiveCategory: prize.discount === 100 ? 'paid' : undefined,
      effectiveCategories: prize.discount === 100 ? [3002267] : []
    } : null;

    user.lastSpin = now;
    if (rewardEntry) {
      user.rewards = [rewardEntry, ...(user.rewards || [])].slice(0, 30);
    }

    // Award +20 MD Points for daily wheel spin
    user.points = (user.points || 0) + 20;
    user.totalPointsEarned = (user.totalPointsEarned || 0) + 20;
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.unshift({
      id: 'pt-' + now.toString(36) + '-spin',
      activity: 'wheel_spin',
      label: 'Daily Wheel of Fortune Spin',
      points: 20,
      timestamp: now
    });

    user.history = [{
      id: 'hist-spin-' + now.toString(36),
      type: isWin ? 'purchase' : 'download',
      title: isWin ? `Wheel of Fortune: Won ${prize.label} (${couponCode})` : 'Wheel of Fortune: No Luck',
      timestamp: now
    }, ...(user.history || [])].slice(0, 50);

    const country = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || user.country || 'CZ').toString().toUpperCase();

    const historyEntry = {
      id: 'spin-' + now.toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      username: user.global_name || user.username,
      avatarUrl: user.avatarUrl,
      prizeLabel: prize.label,
      discount: prize.discount,
      code: couponCode || undefined,
      timestamp: now,
      country
    };

    if (kvUrl && kvToken) {
      const pipelineCommands: any[] = [
        ['SET', `users:discord:${userId}`, JSON.stringify(user)],
        ['SET', `users:discord:${userId}:last_spin`, String(now)],
        ['LPUSH', 'analytics:spin_history', JSON.stringify(historyEntry)],
        ['LTRIM', 'analytics:spin_history', '0', '199'],
        ['INCR', 'analytics:spins:total'],
        ['INCR', `analytics:spins:prize_${prize.discount}`],
        ['INCR', 'analytics:total_events'],
        ['LPUSH', 'analytics:recent_events', JSON.stringify({
          id: 'ev-spin-' + now.toString(36),
          timestamp: now,
          toolId: 'wheel',
          toolName: 'Wheel of Fortune',
          action: isWin ? 'copy_lua' : 'view',
          label: isWin ? `@${user.username} won ${prize.label} (${couponCode})` : `@${user.username} spun: No Luck`,
          country,
          device: /mobile/i.test(req.headers['user-agent'] || '') ? 'Mobile' : 'Desktop'
        })],
        ['LTRIM', 'analytics:recent_events', '0', '99']
      ];

      if (isWin && couponCode) {
        pipelineCommands.push(
          ['SET', `coupons:spin:${couponCode}`, JSON.stringify({
            code: couponCode,
            discount: prize.discount,
            userId,
            username: user.username,
            createdAt: now,
            expiresAt,
            effectiveType: prize.discount === 100 ? 'category' : 'cart',
            effectiveCategory: prize.discount === 100 ? 'paid' : undefined,
            effectiveCategories: prize.discount === 100 ? [3002267] : []
          })],
          ['SADD', 'coupons:spin:index', couponCode],
          ['EXPIRE', `coupons:spin:${couponCode}`, '172800']
        );
      }

      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pipelineCommands)
      }).catch(() => {});
    }

    if (tebexSecret) {
      cleanupExpiredCoupons(tebexSecret, kvUrl, kvToken).catch(() => {});
    }

    return res.status(200).json({
      success: true,
      prizeIndex: selectedIndex,
      prize: {
        id: prize.id,
        label: prize.label,
        shortLabel: prize.shortLabel,
        discount: prize.discount,
        color: prize.color,
        isJackpot: prize.isJackpot || false
      },
      couponCode: couponCode || null,
      discountPercentage: prize.discount,
      expiresAt: isWin ? expiresAt : null,
      reward: rewardEntry,
      pointsAwarded: 20,
      newPointsBalance: user.points,
      nextSpinTime: now + cooldownMs
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleBuySpin(req: any, res: any, body: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = body.userId || body.id;
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
        user = safeParseJson(userData.result) || user;
      }
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
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.unshift({
      id: 'pt-wheel-buy-' + now.toString(36),
      activity: 'wheel_extra_spin',
      label: 'Extra Wheel of Fortune Spin (Cooldown Skip for 300 MD Points)',
      points: -300,
      timestamp: now
    });

    if (kvUrl && kvToken) {
      await Promise.allSettled([
        fetch(`${kvUrl}/set/users:discord:${userId}`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        }),
        fetch(`${kvUrl}/del/users:discord:${userId}:last_spin`, { headers })
      ]);
    }

    return res.status(200).json({
      success: true,
      newPoints: user.points,
      remainingMs: 0,
      canSpin: true,
      message: 'Wheel cooldown successfully skipped for 300 MD Points! You can spin now.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

async function handleHistory(req: any, res: any) {
  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!kvUrl || !kvToken) {
      return res.status(200).json({ history: [], totalSpins: 0, prizeCounts: {} });
    }

    const headers = { Authorization: `Bearer ${kvToken}` };

    const [historyRes, totalSpinsRes, ...prizeCountRes] = await Promise.all([
      fetch(`${kvUrl}/lrange/analytics:spin_history/0/199`, { headers }).then(r => r.json()).catch(() => ({ result: [] })),
      fetch(`${kvUrl}/get/analytics:spins:total`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_0`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_5`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_10`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_15`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_30`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_50`, { headers }).then(r => r.json()).catch(() => ({ result: 0 })),
      fetch(`${kvUrl}/get/analytics:spins:prize_100`, { headers }).then(r => r.json()).catch(() => ({ result: 0 }))
    ]);

    const history = (historyRes?.result || []).map((entry: any) => safeParseJson(entry)).filter(Boolean);

    const prizeCounts: Record<string, number> = {
      '0': parseInt(prizeCountRes[0]?.result || '0', 10) || 0,
      '5': parseInt(prizeCountRes[1]?.result || '0', 10) || 0,
      '10': parseInt(prizeCountRes[2]?.result || '0', 10) || 0,
      '15': parseInt(prizeCountRes[3]?.result || '0', 10) || 0,
      '30': parseInt(prizeCountRes[4]?.result || '0', 10) || 0,
      '50': parseInt(prizeCountRes[5]?.result || '0', 10) || 0,
      '100': parseInt(prizeCountRes[6]?.result || '0', 10) || 0
    };

    return res.status(200).json({
      history,
      totalSpins: parseInt(totalSpinsRes?.result || '0', 10) || 0,
      prizeCounts
    });
  } catch (err: any) {
    return res.status(200).json({ history: [], totalSpins: 0, prizeCounts: {} });
  }
}
