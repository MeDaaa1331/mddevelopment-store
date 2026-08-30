export async function runCouponsCleanup(): Promise<{
  success: boolean;
  checkedCount: number;
  deletedCount: number;
  deletedCodes: string[];
}> {
  const secret = process.env.TEBEX_SECRET_KEY || process.env.VITE_TEBEX_SECRET_KEY;
  if (!secret) {
    return { success: false, checkedCount: 0, deletedCount: 0, deletedCodes: [] };
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const headers = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

  try {
    const tebexRes = await fetch('https://plugin.tebex.io/coupons', {
      headers: {
        'X-Tebex-Secret': secret.trim(),
        'Accept': 'application/json'
      }
    });

    if (!tebexRes.ok) {
      return { success: false, checkedCount: 0, deletedCount: 0, deletedCodes: [] };
    }

    const data = await tebexRes.json();
    const list = Array.isArray(data) ? data : (data?.data || []);

    const wheelCoupons = list.filter((c: any) => {
      const code = (c.code || '').toUpperCase();
      const note = (c.note || '').toLowerCase();
      return code.startsWith('SPIN') || note.includes('wheel reward') || note.includes('100% free escrow');
    });

    const now = Date.now();
    const deletedCodes: string[] = [];

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
              'X-Tebex-Secret': secret.trim(),
              'Accept': 'application/json'
            }
          });

          if (delRes.ok || delRes.status === 204 || delRes.status === 404) {
            deletedCodes.push(code);

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

    if (kvUrl && kvToken) {
      await fetch(`${kvUrl}/set/analytics:last_coupon_cleanup/${now}`, { headers }).catch(() => {});
    }

    return {
      success: true,
      checkedCount: wheelCoupons.length,
      deletedCount: deletedCodes.length,
      deletedCodes
    };
  } catch (err) {
    return { success: false, checkedCount: 0, deletedCount: 0, deletedCodes: [] };
  }
}
