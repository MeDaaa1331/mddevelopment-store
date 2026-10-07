/**
 * Serverless Dynamic Embed / OpenGraph Generator for MD Development Scripts
 * 
 * Intercepts link sharing crawlers (Discordbot, Twitterbot, Facebook, Telegram, WhatsApp, Slack, etc.)
 * and serves dynamically generated HTML containing full Open Graph & Twitter Card tags
 * with the script's exact banner image, name, description, and pricing.
 * 
 * Works 100% automatically for ALL existing and newly added Tebex scripts via live Headless API.
 */

const TEBEX_PUBLIC_TOKEN = process.env.VITE_TEBEX_PUBLIC_TOKEN || 'yry4-4f39d4771913f90be71cc7be4f234a2cfbd8036e';
const TEBEX_HEADLESS_BASE = 'https://headless.tebex.io/api';
const BASE_URL = 'https://www.mddevelopment.store';
const DEFAULT_LOGO = 'https://www.mddevelopment.store/logo.png';
const THEME_COLOR = '#f59e0b';

// In-memory cache for live Tebex packages (5-minute TTL)
let cachedPackages: any[] = [];
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanDescription(rawDesc: string): string {
  if (!rawDesc) {
    return 'High-performance FiveM script for ESX & QBCore with 0.00ms resmon, modern glassmorphic NUI interface, and instant CFX Keymaster delivery.';
  }
  let text = rawDesc
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length > 280) {
    text = text.slice(0, 277).trim() + '...';
  }
  return text || 'High-performance FiveM script for ESX & QBCore with 0.00ms resmon, modern glassmorphic NUI interface, and instant CFX Keymaster delivery.';
}

function getScriptSlug(nameOrPkg: any): string {
  const raw = typeof nameOrPkg === 'string' ? nameOrPkg : (nameOrPkg?.name || nameOrPkg?.slug || '');
  if (!raw) return '';
  const cleanTitle = raw.split('|')[0].trim();
  const withoutMd = cleanTitle.replace(/^\s*md[\s_.:-]*\s*/i, '').replace(/\bmd\b/gi, '');
  return withoutMd.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchLivePackages(): Promise<any[]> {
  const now = Date.now();
  if (cachedPackages.length > 0 && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedPackages;
  }

  try {
    const url = `${TEBEX_HEADLESS_BASE}/accounts/${TEBEX_PUBLIC_TOKEN}/categories?includePackages=1`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      const categories = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      const pkgs: any[] = [];
      const seen = new Set<number>();

      const processCat = (cat: any) => {
        if (!cat) return;
        if (Array.isArray(cat.packages)) {
          for (const p of cat.packages) {
            if (p && p.id && !seen.has(p.id)) {
              seen.add(p.id);
              pkgs.push(p);
            }
          }
        }
        if (Array.isArray(cat.subcategories)) {
          for (const sub of cat.subcategories) {
            processCat(sub);
          }
        }
      };

      for (const c of categories) {
        processCat(c);
      }

      if (pkgs.length > 0) {
        cachedPackages = pkgs;
        lastCacheTime = now;
        return pkgs;
      }
    }
  } catch (err) {
    console.warn('[Embed] Failed to fetch categories from Tebex API:', err);
  }

  // Fallback: direct packages endpoint
  try {
    const pkgRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${TEBEX_PUBLIC_TOKEN}/packages`, {
      headers: { Accept: 'application/json' }
    });
    if (pkgRes.ok) {
      const pkgJson = await pkgRes.json();
      const pkgs = Array.isArray(pkgJson.data) ? pkgJson.data : (Array.isArray(pkgJson) ? pkgJson : []);
      if (pkgs.length > 0) {
        cachedPackages = pkgs;
        lastCacheTime = now;
        return pkgs;
      }
    }
  } catch (err) {
    console.warn('[Embed] Failed to fetch packages from Tebex API:', err);
  }

  return cachedPackages;
}

export default async function handler(req: any, res: any) {
  // Extract slug from query (?slug=heisttablet) or from requested URL path
  const rawParam = req.query?.slug || '';
  let requestedSlug = (Array.isArray(rawParam) ? rawParam[0] : rawParam) || '';

  if (!requestedSlug && req.url) {
    const pathname = req.url.split('?')[0];
    const match = pathname.match(/\/(?:store|scripts)\/([^/?#]+)/i);
    if (match) {
      requestedSlug = match[1];
    }
  }

  const cleanSlug = requestedSlug
    .split('/')[0]
    .replace(/^\/?(store|scripts)\//i, '')
    .replace(/^\s*md[\s_.:-]*\s*/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  let pkg: any = null;

  if (cleanSlug) {
    const livePkgs = await fetchLivePackages();
    // 1. Exact slug match
    pkg = livePkgs.find(p => getScriptSlug(p.name) === cleanSlug);

    // 2. Package predefined slug match
    if (!pkg) {
      pkg = livePkgs.find(p => {
        if (!p.slug) return false;
        const s = p.slug.replace(/^\s*md[\s_.:-]*\s*/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return s === cleanSlug;
      });
    }

    // 3. ID match
    if (!pkg) {
      pkg = livePkgs.find(p => p.id && p.id.toString() === cleanSlug);
    }

    // 4. Prefix/substring fuzzy match for plural/singular variants
    if (!pkg && cleanSlug.length >= 5) {
      pkg = livePkgs.find(p => {
        const s = getScriptSlug(p.name);
        return s.startsWith(cleanSlug) || cleanSlug.startsWith(s);
      });
    }
  }

  // Response Metadata Preparation
  let title = 'MD Development | FiveM Scripts & Free FiveM Developer Tools Hub';
  let cleanDesc = 'Official MD Development Tebex & DEV Tools. Ultra optimized FiveM Scripts and 15 Free FiveM DEV Tools, including Locales Translator, Handling Editor, Flags Calculator and more!';
  let imageUrl = DEFAULT_LOGO;
  let canonicalUrl = `${BASE_URL}/`;
  let priceBadge = 'FiveM Script';
  let scriptDisplayName = 'MD Development Store';

  if (pkg) {
    const rawTitle = pkg.name || 'FiveM Script';
    const mainTitle = rawTitle.split('|')[0].trim();
    scriptDisplayName = mainTitle;
    title = `${mainTitle} | FiveM Script | MD Development`;
    cleanDesc = cleanDescription(pkg.description);
    imageUrl = pkg.image || (Array.isArray(pkg.media) && pkg.media[0]?.url) || DEFAULT_LOGO;
    canonicalUrl = `${BASE_URL}/store/${getScriptSlug(pkg.name)}`;

    const price = Number(pkg.total_price ?? pkg.price ?? 0);
    priceBadge = price === 0 ? 'FREE DOWNLOAD • FiveM Script' : `€${price.toFixed(2)} • ESX & QBCore`;
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(cleanDesc)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OpenGraph / Facebook / Discord -->
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="MD Development | FiveM Scripts">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(cleanDesc)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:alt" content="${escapeHtml(scriptDisplayName)}">

  <!-- Twitter Card (summary_large_image for full-width banner preview in Discord & Twitter) -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@mddevelopment">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(cleanDesc)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <meta name="twitter:image:alt" content="${escapeHtml(scriptDisplayName)}">

  <!-- Discord Embed Accent Color -->
  <meta name="theme-color" content="${THEME_COLOR}">

  <!-- Smooth redirect for interactive browsers opening the embed URL -->
  <script>
    if (typeof window !== 'undefined') {
      window.location.replace('${canonicalUrl}');
    }
  </script>
</head>
<body style="background:#050507;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:24px;display:flex;align-items:center;justify-content:center;min-height:100vh;box-sizing:border-box;">
  <div style="max-width:540px;width:100%;background:#0d0d12;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(scriptDisplayName)}" style="width:100%;height:auto;border-radius:12px;margin-bottom:16px;object-fit:cover;aspect-ratio:16/9;box-shadow:0 4px 20px rgba(0,0,0,0.4);" />
    <div style="display:inline-block;padding:4px 12px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);border-radius:999px;color:#fbbf24;font-size:12px;font-weight:700;margin-bottom:12px;">${escapeHtml(priceBadge)}</div>
    <h1 style="font-size:22px;margin:0 0 10px 0;font-weight:800;letter-spacing:-0.02em;">${escapeHtml(scriptDisplayName)}</h1>
    <p style="font-size:14px;color:#a1a1aa;margin:0 0 24px 0;line-height:1.6;">${escapeHtml(cleanDesc)}</p>
    <a href="${canonicalUrl}" style="display:inline-block;padding:12px 28px;background:#f59e0b;color:#000;font-weight:800;text-decoration:none;border-radius:12px;font-size:14px;transition:opacity 0.2s;">Open in MD Store &rarr;</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  
  if (typeof res.send === 'function') {
    return res.status(200).send(html);
  }
  res.statusCode = 200;
  return res.end(html);
}
