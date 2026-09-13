import crypto from 'crypto';

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

function safeParseJson(str: any): any {
  if (!str) return null;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(str));
    } catch {
      return null;
    }
  }
}

export async function processTebexPayment(payload: any, headers?: Record<string, string>): Promise<{
  success: boolean;
  message: string;
  pointsAwarded?: number;
  userId?: string;
  txnId?: string;
}> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const kvHeaders: Record<string, string> = kvToken ? { Authorization: `Bearer ${kvToken}` } : {};

  // Extract payment details supporting both new Webhook API (with subject) and legacy webhook formats
  const subject = payload.subject || payload;
  const type = (payload.type || payload.event || '').toString().toLowerCase();

  // Tebex dashboard webhook validation check
  if (type === 'validation') {
    return { success: true, message: 'Validation accepted' };
  }

  const txnId = (
    subject.transaction_id ||
    subject.id ||
    payload.transaction_id ||
    payload.id ||
    payload.payment_id
  )?.toString();

  if (!txnId) {
    return { success: false, message: 'Missing transaction ID in webhook payload' };
  }

  // Idempotency check: Ensure this transaction has not already been credited
  if (kvUrl && kvToken) {
    const checkRes = await fetch(`${kvUrl}/get/payments:processed:${txnId}`, { headers: kvHeaders }).catch(() => null);
    const checkData = await checkRes?.json().catch(() => null);
    if (checkData?.result) {
      return { success: true, message: 'Payment already processed and points credited', txnId };
    }
  }

  // Extract amount and calculate points (1 € = 15 MD Points)
  const rawAmount = parseFloat(
    subject.price?.amount ??
    subject.amount ??
    payload.price?.amount ??
    payload.amount ??
    0
  );

  let amount = isNaN(rawAmount) ? 0 : rawAmount;

  // Fallback for 100% discount test orders or coupons: use product base price so testing costs 0 €
  if (amount <= 0) {
    const products = subject.products || subject.packages || payload.products || payload.packages || [];
    if (Array.isArray(products) && products.length > 0) {
      const fallbackSum = products.reduce((acc: number, p: any) => acc + (parseFloat(p.price || p.base_price || 0) || 0), 0);
      if (fallbackSum > 0) {
        amount = fallbackSum;
      }
    }
  }

  const pointsToAward = Math.max(0, Math.round(amount * 15));

  // Identify the Discord user ID:
  // 1. Direct custom property
  let userId: string | null = (
    subject.custom?.userId ||
    subject.custom?.discord_id ||
    payload.custom?.userId ||
    payload.custom?.discord_id ||
    null
  )?.toString() || null;

  // 2. Lookup via basket ident in Redis (registered when user clicked Checkout in cart)
  const basketIdent = (
    subject.basket?.ident ||
    subject.basket_ident ||
    payload.basket?.ident ||
    payload.basket_ident ||
    subject.custom?.basketId ||
    payload.custom?.basketId
  )?.toString();

  if (!userId && basketIdent && kvUrl && kvToken) {
    const basketRes = await fetch(`${kvUrl}/get/baskets:${basketIdent}:user`, { headers: kvHeaders }).catch(() => null);
    const basketData = await basketRes?.json().catch(() => null);
    if (basketData?.result) {
      const parsedBasket = safeParseJson(basketData.result);
      if (parsedBasket?.userId) {
        userId = parsedBasket.userId.toString();
      }
    }
  }

  // 3. Fallback: check player ID if it looks like a Discord snowflake (17-20 digits)
  if (!userId) {
    const playerId = (subject.player?.id || payload.player?.id)?.toString();
    if (playerId && /^\d{17,20}$/.test(playerId)) {
      userId = playerId;
    }
  }

  if (!userId) {
    // Save unassigned payment in Redis so it can be manually claimed or associated later
    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `payments:unassigned:${txnId}`, JSON.stringify({ txnId, amount, basketIdent, payload, timestamp: Date.now() })]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...kvHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }
    return { success: false, message: `No Discord user found for transaction ${txnId}`, txnId };
  }

  // If points are 0 (e.g. 0.00 EUR order), we still mark it processed without error
  if (pointsToAward <= 0) {
    if (kvUrl && kvToken) {
      const pipeline = [
        ['SET', `payments:processed:${txnId}`, JSON.stringify({ txnId, userId, points: 0, timestamp: Date.now() })]
      ];
      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: { ...kvHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(pipeline)
      }).catch(() => {});
    }
    return { success: true, message: 'Zero amount transaction processed', userId, txnId, pointsAwarded: 0 };
  }

  // Fetch and update Discord user points in Redis
  let user: any = { id: userId, points: 0, totalPointsEarned: 0, pointsHistory: [] };

  if (kvUrl && kvToken) {
    const userRes = await fetch(`${kvUrl}/get/users:discord:${userId}`, { headers: kvHeaders }).catch(() => null);
    const userData = await userRes?.json().catch(() => null);
    if (userData?.result) {
      user = safeParseJson(userData.result) || user;
    }
  }

  const products = subject.products || subject.packages || payload.products || payload.packages || [];
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
    amountEur: amount,
    txnId,
    timestamp: now
  });

  if (kvUrl && kvToken) {
    const pipeline = [
      ['SET', `users:discord:${userId}`, JSON.stringify(user)],
      ['SET', `payments:processed:${txnId}`, JSON.stringify({ txnId, userId, points: pointsToAward, amount, timestamp: now })]
    ];
    if (basketIdent) {
      pipeline.push(['SET', `payments:processed:${basketIdent}`, JSON.stringify({ txnId, userId, points: pointsToAward, amount, timestamp: now })]);
      pipeline.push(['SET', `baskets:claimed:${basketIdent}`, JSON.stringify({ userId, points: pointsToAward, timestamp: now })]);
    }
    await fetch(`${kvUrl}/pipeline`, {
      method: 'POST',
      headers: { ...kvHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(pipeline)
    }).catch(() => {});
  }

  return {
    success: true,
    message: `Awarded ${pointsToAward} MD Points for transaction ${txnId}`,
    userId,
    txnId,
    pointsAwarded: pointsToAward
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-BC-Sig');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'MD Development Tebex Webhook' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const body = parseBody(req);

    // If Tebex dashboard validation ping (Tebex sends type "validation.webhook" with subject: {}):
    const typeStr = (body.type || body.event || '').toString().toLowerCase();
    if (typeStr.includes('validation') || (body.id && (!body.subject || Object.keys(body.subject).length === 0))) {
      return res.status(200).json({ id: body.id || 'validation' });
    }

    // Optional HMAC signature check if secret is defined in environment
    const webhookSecret = process.env.TEBEX_WEBHOOK_SECRET;
    const signature = req.headers['x-bc-sig'] || req.headers['x-signature'];

    if (webhookSecret && signature) {
      const calculatedHash = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      if (calculatedHash !== signature) {
        console.warn('[Tebex Webhook] Invalid signature mismatch');
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const result = await processTebexPayment(body, req.headers);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(200).json({ status: 'ignored_or_unassigned', detail: result.message });
    }
  } catch (err: any) {
    console.error('[Tebex Webhook Error]:', err);
    return res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
