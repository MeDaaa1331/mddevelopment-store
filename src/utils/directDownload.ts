import { TebexPackage } from '../types';
import { TEBEX_CONFIG } from '../config/tebex';

export async function triggerDirectScriptDownload(pkg: TebexPackage): Promise<void> {
  const rawName = (pkg.name || '').trim();
  const rawSlug = (pkg.slug || '').trim();

  const nameWithoutBrackets = rawName
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^\)]*\)/g, '')
    .trim();

  const nameClean = nameWithoutBrackets
    .toLowerCase()
    .replace(/^md\s*[-_]?\s*/i, '')
    .replace(/[^a-z0-9]/g, '');

  const nameKebab = nameWithoutBrackets
    .toLowerCase()
    .replace(/^md\s*[-_]?\s*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const slugClean = rawSlug
    .toLowerCase()
    .replace(/^\d+[-_]/, '')
    .replace(/^md\s*[-_]?\s*/i, '')
    .replace(/[^a-z0-9]/g, '');

  const slugKebab = rawSlug
    .toLowerCase()
    .replace(/^\d+[-_]/, '')
    .replace(/^md\s*[-_]?\s*/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const downloadPaths = new Set<string>();

  if (pkg.download_url && pkg.download_url.startsWith('/downloads/')) {
    downloadPaths.add(pkg.download_url);
  }

  if (nameClean) {
    downloadPaths.add(`/downloads/md-${nameClean}.zip`);
    downloadPaths.add(`/downloads/md_${nameClean}.zip`);
    downloadPaths.add(`/downloads/md${nameClean}.zip`);
    downloadPaths.add(`/downloads/${nameClean}.zip`);
  }

  if (nameKebab) {
    downloadPaths.add(`/downloads/md-${nameKebab}.zip`);
    downloadPaths.add(`/downloads/md_${nameKebab.replace(/-/g, '_')}.zip`);
    downloadPaths.add(`/downloads/${nameKebab}.zip`);
  }

  if (slugClean) {
    downloadPaths.add(`/downloads/md-${slugClean}.zip`);
    downloadPaths.add(`/downloads/md_${slugClean}.zip`);
    downloadPaths.add(`/downloads/${slugClean}.zip`);
  }

  if (slugKebab) {
    downloadPaths.add(`/downloads/md-${slugKebab}.zip`);
    downloadPaths.add(`/downloads/${slugKebab}.zip`);
  }

  const downloadFilename = `md-${nameClean || slugClean || 'script'}.zip`;

  for (const path of Array.from(downloadPaths)) {
    try {
      const res = await fetch(path);
      if (res.ok && res.status === 200) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = downloadFilename;
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
