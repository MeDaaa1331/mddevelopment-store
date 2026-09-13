function safeRedirect(res: any, url: string, statusCode = 302) {
  try {
    if (typeof res.redirect === 'function') {
      return res.redirect(statusCode, url);
    }
  } catch {}
  try {
    res.writeHead(statusCode, { Location: url });
    return res.end();
  } catch {}
  return res
    .status(statusCode)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${encodeURI(url)}"></head><body><script>window.location.href=${JSON.stringify(url)};</script><p>Redirecting to <a href="${encodeURI(url)}">${encodeURI(url)}</a>...</p></body></html>`);
}

export default async function handler(req: any, res: any) {
  try {
    const query = req.query || {};
    const { code, error } = query;

    if (error || !code) {
      return safeRedirect(res, '/?discord_auth=error&reason=' + encodeURIComponent(String(error || 'no_code')));
    }

    const clientId = process.env.DISCORD_CLIENT_ID?.trim();
    const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
    const proto = (req.headers?.['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
    const host = (req.headers?.host || 'md-development.cz').toString().trim();
    const redirectUri = process.env.DISCORD_REDIRECT_URI?.trim() || `${proto}://${host}/api/auth/discord/callback`;

    if (!clientId || !clientSecret) {
      return safeRedirect(res, '/?discord_auth=error&reason=missing_server_credentials');
    }

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
      return safeRedirect(res, '/?discord_auth=error&reason=token_exchange_failed');
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!userRes.ok) {
      return safeRedirect(res, '/?discord_auth=error&reason=user_fetch_failed');
    }

    const discordUser = await userRes.json();

    let defaultAvatarIndex = 0;
    try {
      defaultAvatarIndex = Number((BigInt(discordUser.id || '0') >> BigInt(22)) % BigInt(6));
    } catch {
      defaultAvatarIndex = 0;
    }

    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=128`
      : `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;

    const country = (req.headers?.['x-vercel-ip-country'] || req.headers?.['cf-ipcountry'] || 'CZ').toString().toUpperCase();

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
      history: [],
      claimedActivities: {},
      pointsHistory: []
    };

    const kvUrl = (process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)?.trim();
    const kvToken = (process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)?.trim();

    if (kvUrl && kvToken) {
      const headers = { Authorization: `Bearer ${kvToken}` };

      try {
        const existingRes = await fetch(`${kvUrl}/get/users:discord:${discordUser.id}`, { headers });
        const existingData = await existingRes.json();
        if (existingData?.result) {
          try {
            let parsed: any = null;
            if (typeof existingData.result === 'object') {
              parsed = existingData.result;
            } else if (typeof existingData.result === 'string') {
              try {
                parsed = JSON.parse(existingData.result);
              } catch {
                try {
                  parsed = JSON.parse(decodeURIComponent(existingData.result));
                } catch {}
              }
            }
            if (parsed && typeof parsed === 'object') {
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
            }
          } catch {}
        }
      } catch {}

      if (!finalUser.claimedActivities) {
        finalUser.claimedActivities = {};
      }
      if (!finalUser.pointsHistory) {
        finalUser.pointsHistory = [];
      }

      // MD Points: First Login Reward (+100 Points, strictly once per Discord ID)
      if (!finalUser.claimedActivities.discord_login) {
        finalUser.claimedActivities.discord_login = true;
        finalUser.points = (finalUser.points || 0) + 100;
        finalUser.totalPointsEarned = (finalUser.totalPointsEarned || 0) + 100;
        finalUser.pointsHistory.unshift({
          id: 'pt-' + now.toString(36) + '-login',
          activity: 'discord_login',
          label: 'Welcome Discord Login Bonus',
          points: 100,
          timestamp: now
        });
      }

      // Check Discord Guild membership
      const guildId = process.env.DISCORD_GUILD_ID?.trim();
      const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
      let inGuild = Boolean(finalUser.claimedActivities?.discord_guild || (finalUser.inGuild ?? true));

      if (guildId && botToken) {
        try {
          const gRes = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordUser.id}`, {
            headers: { Authorization: `Bot ${botToken}` }
          });
          if (gRes.status === 404) {
            if (!finalUser.claimedActivities?.discord_guild) {
              inGuild = false;
            }
          } else if (gRes.ok) {
            inGuild = true;
          }
        } catch {
          inGuild = true;
        }
      }

      finalUser.inGuild = inGuild;

      // Auto-award discord_guild if inGuild and not yet claimed
      if (inGuild && !finalUser.claimedActivities.discord_guild) {
        finalUser.claimedActivities.discord_guild = true;
        finalUser.points = (finalUser.points || 0) + 50;
        finalUser.totalPointsEarned = (finalUser.totalPointsEarned || 0) + 50;
        finalUser.pointsHistory.unshift({
          id: 'pt-' + (now + 1).toString(36) + '-guild',
          activity: 'discord_guild',
          label: 'Joined MD Development Discord Server',
          points: 50,
          timestamp: now
        });
      }

      // Self-heal: If pointsHistory is empty, reconstruct from claimed activities
      if (finalUser.pointsHistory.length === 0) {
        if (finalUser.claimedActivities.discord_login) {
          finalUser.pointsHistory.push({
            id: 'pt-' + now.toString(36) + '-login',
            activity: 'discord_login',
            label: 'Welcome Discord Login Bonus',
            points: 100,
            timestamp: finalUser.firstJoined || now
          });
        }
        if (finalUser.claimedActivities.discord_guild || inGuild) {
          finalUser.pointsHistory.push({
            id: 'pt-' + (now + 1).toString(36) + '-guild',
            activity: 'discord_guild',
            label: 'Joined MD Development Discord Server',
            points: 50,
            timestamp: now
          });
        }
      }

      const pipelineCommands: any[] = [
        ['SET', `users:discord:${discordUser.id}`, JSON.stringify(finalUser)],
        ['SET', `points:onetime:${discordUser.id}:discord_login`, 'true'],
        ...(finalUser.claimedActivities.discord_guild ? [['SET', `points:onetime:${discordUser.id}:discord_guild`, 'true']] : []),
        ['SADD', 'users:discord:index', discordUser.id],
        ['INCR', 'analytics:discord:total_logins'],
        ['LPUSH', 'analytics:recent_events', JSON.stringify({
          id: 'ev-login-' + now.toString(36),
          timestamp: now,
          toolId: 'auth',
          toolName: 'Discord Auth',
          action: 'view',
          label: `Discord Login: @${discordUser.username}`,
          country,
          device: /mobile/i.test(req.headers?.['user-agent'] || '') ? 'Mobile' : 'Desktop'
        })],
        ['LTRIM', 'analytics:recent_events', '0', '99']
      ];

      try {
        await fetch(`${kvUrl}/pipeline`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(pipelineCommands)
        });
      } catch {}
    }

    // Prepare lean payload for URL redirect so Location header never exceeds HTTP header size limits (8KB)
    const sessionUser = {
      ...finalUser,
      history: (finalUser.history || []).slice(0, 10),
      pointsHistory: (finalUser.pointsHistory || []).slice(0, 10),
      cart: (finalUser.cart || []).slice(0, 20),
      favorites: (finalUser.favorites || []).slice(0, 50)
    };

    const payload = encodeURIComponent(JSON.stringify(sessionUser));
    return safeRedirect(res, `/?discord_auth=success&user=${payload}`, 302);
  } catch (err: any) {
    const errorMsg = err?.message || 'unknown_error';
    return safeRedirect(res, '/?discord_auth=error&reason=' + encodeURIComponent(String(errorMsg)));
  }
}
