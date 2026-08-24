export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    if (!event || !event.toolId) {
      return res.status(400).json({ error: 'Invalid event data' });
    }

    const country = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || event.country || 'CZ').toString().toUpperCase();
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] ? (new URL(req.headers['referer']).hostname || 'Direct') : (event.referrer || 'Direct');
    const device = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : (event.device || 'Desktop');

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      country,
      device,
      referrer
    };

    const kvUrl = process.env.KV_REST_API_URL || process.env.REDIS_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      const isCopy = event.action && (event.action.startsWith('copy_') || event.action === 'format');
      const isView = event.action === 'view';
      const isSearch = event.action === 'search';
      const isDownload = event.action === 'download' || event.toolId === 'free_download';
      const toolId = event.toolId;

      const promises: Promise<any>[] = [
        fetch(`${kvUrl}/incr/analytics:total_events`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/lpush/analytics:recent_events/${encodeURIComponent(JSON.stringify(enrichedEvent))}`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/ltrim/analytics:recent_events/0/99`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/hincrby/analytics:countries/${encodeURIComponent(country)}/1`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/hincrby/analytics:referrers/${encodeURIComponent(referrer)}/1`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        }),
        fetch(`${kvUrl}/hincrby/analytics:devices/${encodeURIComponent(device)}/1`, {
          headers: { Authorization: `Bearer ${kvToken}` }
        })
      ];

      if (isDownload) {
        promises.push(
          fetch(`${kvUrl}/incr/analytics:total_free_downloads`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }),
          fetch(`${kvUrl}/lpush/analytics:recent_downloads/${encodeURIComponent(JSON.stringify(enrichedEvent))}`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }),
          fetch(`${kvUrl}/ltrim/analytics:recent_downloads/0/99`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          })
        );
        if (event.label) {
          const cleanName = event.label.trim().slice(0, 80);
          promises.push(
            fetch(`${kvUrl}/hincrby/analytics:free_downloads/${encodeURIComponent(cleanName)}/1`, {
              headers: { Authorization: `Bearer ${kvToken}` }
            })
          );
        }
      }

      if (isView) {
        promises.push(
          fetch(`${kvUrl}/incr/analytics:total_views`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }),
          fetch(`${kvUrl}/incr/analytics:tool_views:${toolId}`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }),
          fetch(`${kvUrl}/hincrby/analytics:tools:views/${encodeURIComponent(toolId)}/1`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          })
        );
      }

      if (isCopy) {
        promises.push(
          fetch(`${kvUrl}/incr/analytics:total_copies`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }),
          fetch(`${kvUrl}/incr/analytics:tool_copies:${toolId}`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          }),
          fetch(`${kvUrl}/hincrby/analytics:tools:copies/${encodeURIComponent(toolId)}/1`, {
            headers: { Authorization: `Bearer ${kvToken}` }
          })
        );
      }

      if (isSearch && event.label) {
        const cleanQuery = event.label.trim().toLowerCase().slice(0, 50);
        if (cleanQuery) {
          promises.push(
            fetch(`${kvUrl}/hincrby/analytics:searches/${encodeURIComponent(cleanQuery)}/1`, {
              headers: { Authorization: `Bearer ${kvToken}` }
            })
          );
        }
      }

      if (event.label && !isSearch && !isDownload) {
        const cleanItem = event.label.trim().slice(0, 60);
        if (cleanItem) {
          promises.push(
            fetch(`${kvUrl}/hincrby/analytics:items/${encodeURIComponent(toolId + '::' + cleanItem)}/1`, {
              headers: { Authorization: `Bearer ${kvToken}` }
            })
          );
        }
      }

      await Promise.allSettled(promises);
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(200).json({ success: true, fallback: true });
  }
}
