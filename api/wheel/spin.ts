const WHEEL_PRIZES = [
  { id: 'none', label: 'No Luck', shortLabel: 'NO LUCK', discount: 0, weight: 25, color: '#18181b' },
  { id: 'disc5', label: '5% Discount', shortLabel: '5% OFF', discount: 5, weight: 20, color: '#0f172a' },
  { id: 'disc10', label: '10% Discount', shortLabel: '10% OFF', discount: 10, weight: 15, color: '#131b2e' },
  { id: 'disc15', label: '15% Discount', shortLabel: '15% OFF', discount: 15, weight: 15, color: '#16221c' },
  { id: 'disc30', label: '30% Discount', shortLabel: '30% OFF', discount: 30, weight: 15, color: '#22182b' },
  { id: 'disc50', label: '50% Discount', shortLabel: '50% OFF', discount: 50, weight: 9, color: '#281d0d' },
  { id: 'disc100', label: '100% FREE Standalone Script', shortLabel: '100% FREE', discount: 100, weight: 1, color: '#311019', isJackpot: true }
];

async function getEscrowPackageIds(tebexSecret: string): Promise<number[]> {
  try {
    const res = await fetch('https://plugin.tebex.io/packages', {
      headers: {
        'X-Tebex-Secret': tebexSecret.trim(),
        'Accept': 'application/json'
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data.packages || data.data || []);

    return list
      .filter((pkg: any) => {
        const name = (pkg.name || '').toLowerCase();
        const isExcluded = /all[\s-_]?in[\s-_]?one|subscription|open[\s-_]?source/i.test(name);
        return !isExcluded;
      })
      .map((pkg: any) => Number(pkg.id))
      .filter((id: number) => !isNaN(id) && id > 0);
  } catch (err) {
    return [];
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

      if (!expiresAt && (coupon.created_at || coupon.start_date)) {
        const parsedStart = new Date(coupon.created_at || coupon.start_date).getTime();
        if (!isNaN(parsedStart)) {
          expiresAt = parsedStart + 86400000;
        }
      }

      if (expiresAt && now > expiresAt) {
        try {
          const delRes = await fetch(`https://plugin.tebex.io/coupons/${coupon.id}`, {
            method: 'DELETE',
            headers: {
              'X-Tebex-Secret': tebexSecret.trim(),
              'Accept': 'application/json'
            }
          });

          if (delRes.ok || delRes.status === 204 || delRes.status === 404) {
            if (kvUrl && kvToken) {
              await fetch(`${kvUrl}/pipeline`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify([
                  ['DEL', `coupons:spin:${code}`],
                  ['SREM', 'coupons:spin:index', code]
                ])
              }).catch(() => {});
            }
          }
        } catch {}
      }
    }
  } catch {}
}

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
    const { userId, username, global_name, avatarUrl } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId. Please sign in with Discord.' });
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (guildId && botToken) {
      try {
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${userId.trim()}`, {
          headers: { Authorization: `Bot ${botToken.trim()}` }
        });
        if (guildRes.status === 404) {
          return res.status(200).json({
            success: false,
            inGuild: false,
            error: 'You must join MD Development Discord server to spin.'
          });
        }
      } catch (err) {}
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    const headers = kvToken ? { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' } : {};

    let user: any = {
      id: userId,
      username: username || 'User',
      global_name: global_name || username || 'User',
      avatarUrl: avatarUrl || '',
      lastSpin: 0,
      rewards: [],
      history: []
    };

    let lastSpinTime = 0;

    if (kvUrl && kvToken) {
      try {
        const [userRes, lastSpinRes] = await Promise.all([
          fetch(`${kvUrl}/get/users:discord:${userId}`, { headers: { Authorization: `Bearer ${kvToken}` } }),
          fetch(`${kvUrl}/get/users:discord:${userId}:last_spin`, { headers: { Authorization: `Bearer ${kvToken}` } })
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

    if (lastSpinTime > 0 && elapsed < cooldownMs) {
      return res.status(200).json({
        success: false,
        cooldown: true,
        remainingMs: cooldownMs - elapsed,
        nextSpinTime: lastSpinTime + cooldownMs,
        error: 'Cooldown active. You can spin once every 24 hours.'
      });
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
    const tebexSecret = process.env.TEBEX_SECRET_KEY;

    if (isWin && tebexSecret) {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      couponCode = `SPIN${prize.discount}-${randomSuffix}`;

      try {
        const startDate = new Date(now).toISOString().split('T')[0];

        let effectiveOn = 'cart';
        let packagesPayload: number[] = [];

        if (prize.discount === 100) {
          const escrowPackageIds = await getEscrowPackageIds(tebexSecret);
          if (escrowPackageIds.length > 0) {
            effectiveOn = 'package';
            packagesPayload = escrowPackageIds;
          }
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
            categories: [],
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
              ? `100% Free Escrow Script for ${user.username || 'User'} (Valid until: ${new Date(expiresAt).toISOString()})`
              : `Daily Wheel Reward for ${user.username || 'User'} (Valid until: ${new Date(expiresAt).toISOString()})`
          })
        });
      } catch (err) {}
    }

    const rewardEntry = isWin ? {
      id: 'rew-' + now.toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      prizeId: prize.id,
      label: prize.label,
      discount: prize.discount,
      code: couponCode,
      createdAt: now,
      expiresAt,
      isUsed: false
    } : null;

    user.lastSpin = now;
    if (rewardEntry) {
      user.rewards = [rewardEntry, ...(user.rewards || [])].slice(0, 30);
    }

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
            expiresAt
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
      nextSpinTime: now + cooldownMs
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: 'Server error processing wheel spin.',
      details: err.message
    });
  }
}
