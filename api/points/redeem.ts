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

  const DISCOUNT_COSTS: Record<number, number> = {
    10: 100,
    20: 250,
    30: 350,
    50: 500
  };

  try {
    const { userId, discountPercentage } = req.body || {};
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
