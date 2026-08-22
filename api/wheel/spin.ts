const WHEEL_PRIZES = [
  { id: 'none', label: 'No Luck', shortLabel: 'No Luck', discount: 0, weight: 25, color: '#27272a' },
  { id: 'disc5', label: '5% Discount', shortLabel: '5% OFF', discount: 5, weight: 20, color: '#065f46' },
  { id: 'disc10', label: '10% Discount', shortLabel: '10% OFF', discount: 10, weight: 15, color: '#0369a1' },
  { id: 'disc15', label: '15% Discount', shortLabel: '15% OFF', discount: 15, weight: 15, color: '#6d28d9' },
  { id: 'disc30', label: '30% Discount', shortLabel: '30% OFF', discount: 30, weight: 15, color: '#be185d' },
  { id: 'disc50', label: '50% Discount', shortLabel: '50% OFF', discount: 50, weight: 9, color: '#d97706' },
  { id: 'disc100', label: '100% FREE Script', shortLabel: '100% FREE', discount: 100, weight: 1, color: '#e11d48', isJackpot: true }
];

export default async function handler(req: any, res: any) {
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
        const guildRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}`, {
          headers: { Authorization: `Bot ${botToken}` }
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
    const headers = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

    let user: any = {
      id: userId,
      username: username || 'User',
      global_name: global_name || username || 'User',
      avatarUrl: avatarUrl || '',
      lastSpin: 0,
      rewards: [],
      history: []
    };

    if (kvUrl && kvToken) {
      try {
        const userRes = await fetch(`${kvUrl}/get/users:discord:${userId}`, { headers });
        const userData = await userRes.json();
        if (userData?.result) {
          const parsed = JSON.parse(decodeURIComponent(userData.result));
          user = { ...user, ...parsed };
        }
      } catch {}
    }

    const now = Date.now();
    const cooldownMs = 86400000;
    const lastSpin = user.lastSpin || 0;
    const elapsed = now - lastSpin;

    if (lastSpin > 0 && elapsed < cooldownMs) {
      return res.status(200).json({
        success: false,
        cooldown: true,
        remainingMs: cooldownMs - elapsed,
        nextSpinTime: lastSpin + cooldownMs,
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

    if (isWin) {
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      couponCode = `SPIN${prize.discount}-${randomSuffix}`;

      const tebexSecret = process.env.TEBEX_SECRET_KEY;
      if (tebexSecret) {
        try {
          const expireDate = new Date(expiresAt).toISOString().split('T')[0];
          await fetch('https://plugin.tebex.io/coupons', {
            method: 'POST',
            headers: {
              'X-Tebex-Secret': tebexSecret,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              code: couponCode,
              effective_on: 'cart',
              discount_type: 'percentage',
              discount_percentage: prize.discount,
              redeem_unlimited: 'false',
              expire_never: '0',
              expire_limit: 1,
              expire_date: expireDate,
              basket_type: 'both',
              minimum: 0
            })
          });
        } catch (err) {}
      }
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
      await Promise.allSettled([
        fetch(`${kvUrl}/set/users:discord:${userId}/${encodeURIComponent(JSON.stringify(user))}`, { headers }),
        fetch(`${kvUrl}/lpush/analytics:spin_history/${encodeURIComponent(JSON.stringify(historyEntry))}`, { headers }),
        fetch(`${kvUrl}/ltrim/analytics:spin_history/0/199`, { headers }),
        fetch(`${kvUrl}/incr/analytics:spins:total`, { headers }),
        fetch(`${kvUrl}/incr/analytics:spins:prize_${prize.discount}`, { headers })
      ]);
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
    return res.status(500).json({ error: err.message || 'Spin failed' });
  }
}
