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
            if (parsed) {
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

      // MD Points: First Login Reward (+100 Points, strictly once per Discord ID)
      if (!finalUser.claimedActivities) {
        finalUser.claimedActivities = {};
      }
      if (!finalUser.pointsHistory) {
        finalUser.pointsHistory = [];
      }

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
      const guildId = process.env.DISCORD_GUILD_ID;
      const botToken = process.env.DISCORD_BOT_TOKEN;
      let inGuild = Boolean(finalUser.claimedActivities?.discord_guild || finalUser.inGuild ?? true);

      if (guildId && botToken) {
        try {
          const gRes = await fetch(`https://discord.com/api/guilds/${guildId.trim()}/members/${discordUser.id}`, {
            headers: { Authorization: `Bot ${botToken.trim()}` }
          });
          if (gRes.status === 404) {
            if (!finalUser.claimedActivities?.discord_guild) {
              inGuild = false;
            }
          } else {
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

      const pipelineCommands = [
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
          device: /mobile/i.test(req.headers['user-agent'] || '') ? 'Mobile' : 'Desktop'
        })],
        ['LTRIM', 'analytics:recent_events', '0', '99']
      ];

      await fetch(`${kvUrl}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pipelineCommands)
      }).catch(() => {});
    }

    const payload = encodeURIComponent(JSON.stringify(finalUser));
    return res.redirect(302, `/?discord_auth=success&user=${payload}`);
  } catch (err: any) {
    return res.redirect(302, '/?discord_auth=error&reason=' + encodeURIComponent(err.message || 'unknown'));
  }
}
