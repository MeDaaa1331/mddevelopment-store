export default async function handler(req: any, res: any) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const code = (url.searchParams.get('code') || req.query?.code || '').toString().trim().toUpperCase();
  const secret = process.env.TEBEX_SECRET_KEY || process.env.VITE_TEBEX_SECRET_KEY;

  if (!secret) {
    return res.status(503).json({
      error: 'TEBEX_SECRET_KEY is not configured on server.',
      configured: false
    });
  }

  if (!code) {
    return res.status(400).json({ error: 'Query parameter "code" is required.' });
  }

  try {
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

    const found = list.find((c: any) => c.code?.toUpperCase() === code);

    if (!found) {
      return res.status(404).json({
        valid: false,
        message: 'Invalid coupon code. Please check the code and try again.'
      });
    }

    if (found.expire && found.expire.expire_never !== 'true' && found.expire.date && !found.expire.date.startsWith('1970')) {
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
    } else if (found.discount?.type === 'percentage' && found.discount.value) {
      discountPercentage = Math.round(Number(found.discount.value));
    } else if (found.discount_type === 'percentage' && found.discount_value) {
      discountPercentage = Math.round(Number(found.discount_value));
    } else if (found.discount?.value && Number(found.discount.value) > 0) {
      discountPercentage = Math.round(Number(found.discount.value));
    }

    return res.status(200).json({
      valid: true,
      code: found.code.toUpperCase(),
      discountPercentage: discountPercentage > 0 ? discountPercentage : 15,
      discountType: found.discount?.type || found.discount_type || 'percentage',
      discountValue: Number(found.discount?.value ?? found.discount_value ?? 0),
      expiresAt: found.expire?.date || found.expires_at || null,
      message: `Coupon ${found.code.toUpperCase()} applied! ${discountPercentage}% discount.`
    });

  } catch (err: any) {
    return res.status(500).json({
      error: 'Server error while checking coupon with Tebex API.',
      message: err.message
    });
  }
}
