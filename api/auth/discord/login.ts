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
    const clientId = process.env.DISCORD_CLIENT_ID?.trim();
    const proto = (req.headers?.['x-forwarded-proto'] || 'https').toString().split(',')[0].trim();
    const host = (req.headers?.host || 'mddevelopment.store').toString().trim();
    const redirectUri = (process.env.DISCORD_REDIRECT_URI?.trim()) || `${proto}://${host}/api/auth/discord/callback`;

    if (!clientId) {
      return safeRedirect(res, '/?discord_auth=error&reason=missing_client_id');
    }

    // Embed exact redirectUri in OAuth2 state so callback.ts always matches it
    const stateData = {
      redirectUri,
      t: Date.now()
    };
    const state = Buffer.from(JSON.stringify(stateData), 'utf-8').toString('base64url');

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'identify email guilds.join',
      prompt: 'consent',
      state
    });

    const targetUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
    return safeRedirect(res, targetUrl, 302);
  } catch (err: any) {
    const errMsg = encodeURIComponent(err?.message || 'login_handler_failed');
    return safeRedirect(res, `/?discord_auth=error&reason=${errMsg}`);
  }
}
