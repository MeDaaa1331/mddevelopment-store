export default async function handler(req: any, res: any) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/discord/callback`;

  if (!clientId) {
    return res.status(200).json({
      error: 'DISCORD_CLIENT_ID is not configured in Vercel environment variables yet.'
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify email guilds.join',
    prompt: 'consent'
  });

  return res.redirect(302, `https://discord.com/oauth2/authorize?${params.toString()}`);
}
