export default async function handler(req: any, res: any) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(302, '/?discord_auth=error&reason=' + encodeURIComponent(error || 'no_code'));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/discord/callback`;

  if (!clientId || !clientSecret) {
    return res.redirect(302, '/?discord_auth=error&reason=missing_server_credentials');
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code.toString(),
        redirect_uri: redirectUri
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.redirect(302, '/?discord_auth=error&reason=' + encodeURIComponent('token_exchange_failed'));
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      return res.redirect(302, '/?discord_auth=error&reason=user_fetch_failed');
    }

    const discordUser = await userRes.json();

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${(BigInt(discordUser.id || '0') >> 22n) % 6n}.png`;

    const country = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'CZ').toString().toUpperCase();

    const now = Date.now();
    let finalUser: any = {
      id: discordUser.id,
      username: discordUser.username,
      global_name: discordUser.global_name || discordUser.username,
      avatar: discordUser.avatar,
      avatarUrl,
      email: discordUser.email || '',
      country,
      firstJoined: now,
      lastActive: now,
      cart: [],
      favorites: [],
      downloadsCount: 0,
      history: []
    };

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const headers = { Authorization: `Bearer ${kvToken}` };

      try {
        const existingRes = await fetch(`${kvUrl}/get/users:discord:${discordUser.id}`, { headers });
        const existingData = await existingRes.json();
        if (existingData?.result) {
          try {
            const parsed = JSON.parse(decodeURIComponent(existingData.result));
            finalUser = {
              ...parsed,
              username: discordUser.username,
              global_name: discordUser.global_name || discordUser.username,
              avatar: discordUser.avatar,
              avatarUrl,
              email: discordUser.email || parsed.email,
              country: country || parsed.country,
              lastActive: now
            };
          } catch {}
        }
      } catch {}

      await Promise.allSettled([
        fetch(`${kvUrl}/set/users:discord:${discordUser.id}/${encodeURIComponent(JSON.stringify(finalUser))}`, { headers }),
        fetch(`${kvUrl}/sadd/users:discord:index/${discordUser.id}`, { headers }),
        fetch(`${kvUrl}/incr/analytics:discord:total_logins`, { headers }),
        fetch(`${kvUrl}/lpush/analytics:recent_events/${encodeURIComponent(JSON.stringify({
          id: 'ev-login-' + now.toString(36),
          timestamp: now,
          toolId: 'auth',
          toolName: 'Discord Auth',
          action: 'view',
          label: `Discord Login: @${discordUser.username}`,
          country,
          device: /mobile/i.test(req.headers['user-agent'] || '') ? 'Mobile' : 'Desktop'
        }))}`, { headers }),
        fetch(`${kvUrl}/ltrim/analytics:recent_events/0/99`, { headers })
      ]);
    }

    const payload = encodeURIComponent(JSON.stringify(finalUser));
    return res.redirect(302, `/?discord_auth=success&user=${payload}`);
  } catch (err: any) {
    return res.redirect(302, '/?discord_auth=error&reason=' + encodeURIComponent(err.message || 'unknown'));
  }
}
