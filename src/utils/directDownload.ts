import { TebexPackage } from '../types';
import { TEBEX_CONFIG } from '../config/tebex';

export async function triggerDirectScriptDownload(pkg: TebexPackage): Promise<void> {
  const safeSlug = (pkg.slug || pkg.name || 'md_free_resource')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `${safeSlug}.zip`;

  const possibleLocalPaths = [
    pkg.download_url,
    `/downloads/${safeSlug}.zip`,
    `/downloads/${safeSlug.replace(/_/g, '-')}.zip`,
    `/downloads/md-hunting.zip`,
    `/downloads/md_hunting.zip`
  ].filter(Boolean) as string[];

  for (const path of possibleLocalPaths) {
    try {
      const res = await fetch(path, { method: 'HEAD' });
      if (res.ok && res.headers.get('content-type')?.includes('zip')) {
        const a = document.createElement('a');
        a.href = path;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    } catch {}
  }

  if (pkg.download_url && !pkg.download_url.includes('tebex.io')) {
    window.open(pkg.download_url, '_blank', 'noopener,noreferrer');
    return;
  }

  const tebexUrl = `${TEBEX_CONFIG.storeDomain}/checkout/packages/add/${pkg.id}/single`;
  window.open(tebexUrl, '_blank', 'noopener,noreferrer');
}
