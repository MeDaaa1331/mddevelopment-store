export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const rawCode = (url.searchParams.get('code') || req.query?.code || '').toString().trim();
  const secret = process.env.TEBEX_SECRET_KEY || process.env.VITE_TEBEX_SECRET_KEY;

  if (!secret) {
    return res.status(503).json({
      error: 'TEBEX_SECRET_KEY is not configured on server.',
      configured: false
    });
  }

  if (!rawCode) {
    return res.status(400).json({ error: 'Query parameter "code" is required.' });
  }

  try {
    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    let redisCoupon: any = null;
    if (kvUrl && kvToken) {
      try {
        const rRes = await fetch(`${kvUrl}/get/coupons:spin:${encodeURIComponent(rawCode.toUpperCase())}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        });
        const rData = await rRes.json().catch(() => null);
        if (rData?.result) {
          try {
            redisCoupon = typeof rData.result === 'string' ? JSON.parse(rData.result) : rData.result;
          } catch {
            try {
              redisCoupon = JSON.parse(decodeURIComponent(rData.result));
            } catch {}
          }
        }
      } catch {}
    }

    if (redisCoupon && redisCoupon.expiresAt) {
      if (Date.now() > Number(redisCoupon.expiresAt)) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon has expired (coupons are valid for exactly 24 hours).'
        });
      }
    }

    const tebexRes = await fetch('https://plugin.tebex.io/coupons', {
      headers: {
        'X-Tebex-Secret': secret,
        'Accept': 'application/json'
      }
    });

    if (!tebexRes.ok) {
      const errText = await tebexRes.text();
      return res.status(tebexRes.status).json({
        error: 'Failed to fetch coupons from Tebex Plugin API',
        details: errText
      });
    }

    const data = await tebexRes.json();
    const list = Array.isArray(data) ? data : (data?.data || []);

    const found = list.find((c: any) => c.code === rawCode) || list.find((c: any) => c.code?.toLowerCase() === rawCode.toLowerCase());

    if (!found) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid coupon code. Please check the code and try again.'
      });
    }

    if (found.expire && found.expire.expire_never !== 'true' && found.expire.expire_never !== true && found.expire.date && !found.expire.date.startsWith('1970')) {
      const expDate = new Date(found.expire.date);
      if (expDate.getTime() < Date.now()) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon has expired.'
        });
      }
    } else if (found.expires_at) {
      const expDate = new Date(found.expires_at);
      if (expDate.getTime() < Date.now()) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon has expired.'
        });
      }
    }

    let discountPercentage = 0;
    if (typeof found.discount?.percentage === 'number' && found.discount.percentage > 0) {
      discountPercentage = Math.round(found.discount.percentage);
    } else if (typeof found.discount_percentage === 'number' && found.discount_percentage > 0) {
      discountPercentage = Math.round(found.discount_percentage);
    } else if (typeof found.discount?.value === 'number' && found.discount.value > 0) {
      discountPercentage = Math.round(found.discount.value);
    } else if (found.discount?.type === 'percentage' && found.discount.value) {
      discountPercentage = Math.round(Number(found.discount.value));
    } else if (found.discount_type === 'percentage' && found.discount_value) {
      discountPercentage = Math.round(Number(found.discount_value));
    } else if (redisCoupon?.discount) {
      discountPercentage = Math.round(Number(redisCoupon.discount));
    }

    const finalExpiresAt = redisCoupon?.expiresAt || found.expire?.date || found.expires_at || (Date.now() + 86400000);

    const isSpin100 = rawCode.toUpperCase().startsWith('SPIN100') ||
                      discountPercentage === 100 ||
                      (found.note && found.note.toLowerCase().includes('100% free')) ||
                      redisCoupon?.effectiveCategory === 'paid';

    const effectiveType: 'cart' | 'category' | 'package' = found.effective?.type || (isSpin100 ? 'category' : 'cart');
    const effectiveCategories: number[] = Array.isArray(found.effective?.categories) && found.effective.categories.length > 0
      ? found.effective.categories
      : (isSpin100 ? [3002267] : []);
    const effectivePackages: number[] = Array.isArray(found.effective?.packages) ? found.effective.packages : [];
    
    let effectiveCategorySlug: string | undefined = undefined;
    if (effectiveCategories.includes(3002267) || isSpin100) {
      effectiveCategorySlug = 'paid';
    } else if (redisCoupon?.effectiveCategory) {
      effectiveCategorySlug = redisCoupon.effectiveCategory;
    }

    const message = isSpin100
      ? `Coupon ${found.code} applied! 100% discount on standalone PAID scripts.`
      : `Coupon ${found.code} applied! ${discountPercentage}% discount.`;

    return res.status(200).json({
      valid: true,
      code: found.code,
      discountPercentage: discountPercentage > 0 ? discountPercentage : 15,
      discountType: found.discount?.type || found.discount_type || 'percentage',
      discountValue: Number(found.discount?.value ?? found.discount_value ?? 0),
      expiresAt: finalExpiresAt,
      effectiveType,
      effectiveCategories,
      effectivePackages,
      effectiveCategorySlug,
      message
    });

  } catch (err: any) {
    return res.status(500).json({
      error: 'Server error while checking coupon with Tebex API.',
      message: err.message
    });
  }
}
