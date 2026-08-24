import { TebexPackage } from '../types';
import { TEBEX_CONFIG } from '../config/tebex';

export async function triggerDirectScriptDownload(pkg: TebexPackage): Promise<void> {
  const safeSlug = (pkg.slug || pkg.name || 'md_free_resource')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_');
  const filename = `${safeSlug}.zip`;

  const nameClean = (pkg.name || '')
    .toLowerCase()
    .replace(/^md\s*[-_]?\s*/i, '')
    .replace(/[^a-z0-9]/g, '');

  const possibleLocalPaths = [
    pkg.download_url,
    `/downloads/${safeSlug}.zip`,
    `/downloads/${safeSlug.replace(/_/g, '-')}.zip`,
    `/downloads/md-${nameClean}.zip`,
    `/downloads/md_${nameClean}.zip`,
    `/downloads/${nameClean}.zip`,
    `/downloads/md-hunting.zip`,
    `/downloads/md_hunting.zip`,
    `/downloads/hunting.zip`
  ].filter(Boolean) as string[];

  for (const path of possibleLocalPaths) {
    if (!path || !path.startsWith('/downloads/')) continue;
    try {
      const res = await fetch(path);
      if (res.ok && res.status === 200) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
          return;
        }
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
