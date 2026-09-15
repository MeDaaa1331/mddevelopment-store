import { TebexPackage } from '../types';

/**
 * Generates an SEO-clean slug from a FiveM script name.
 * Rule: Strips leading "MD" prefix, removes all spaces, hyphens, and special characters.
 * Returns only lowercase letters and numbers [a-z0-9].
 *
 * Examples:
 * - "MD Fuel & Gas Stations" -> "fuelgasstations"
 * - "MD Heist Tables" -> "heisttables"
 * - "MD Heist Tablet" -> "heisttablet"
 * - "MD Banking & Contactless POS System" -> "bankingcontactlesspossystem"
 */
export function getScriptSlug(nameOrPkg: string | { name?: string; slug?: string }): string {
  const rawName = typeof nameOrPkg === 'string' ? nameOrPkg : (nameOrPkg?.name || nameOrPkg?.slug || '');
  if (!rawName) return 'script';

  // Strip pipe suffixes often used in store names like "MD Fuel | ESX & QB"
  const cleanTitle = rawName.split('|')[0].trim();

  // Strip leading "MD", "MD_", "MD-", "MD " (case-insensitive)
  const withoutMdPrefix = cleanTitle.replace(/^\s*md[\s_.:-]*\s*/i, '');

  // Strip any standalone "MD" word if still present
  const withoutAnyMd = withoutMdPrefix.replace(/\bmd\b/gi, '');

  // Remove everything except letters and numbers, then convert to lowercase
  const slug = withoutAnyMd.toLowerCase().replace(/[^a-z0-9]/g, '');

  return slug || 'script';
}

/**
 * Formats canonical product URL path: e.g. "/store/fuelgasstations"
 */
export function getScriptUrl(nameOrPkg: string | { name?: string; slug?: string }): string {
  const slug = getScriptSlug(nameOrPkg);
  return `/store/${slug}`;
}

/**
 * Checks if a given package matches a requested URL slug.
 * Supports matching against:
 * 1. Normalized script name (e.g. "fuelgasstations")
 * 2. Package slug field (e.g. "md-banking" or "banking")
 * 3. Package numeric ID
 */
export function matchesScriptSlug(pkg: TebexPackage, rawSlug: string): boolean {
  if (!rawSlug) return false;

  // Clean the incoming slug to [a-z0-9]
  const cleanRequested = rawSlug
    .replace(/^\/?(store|scripts)\//i, '') // strip /store/ or /scripts/ prefix
    .replace(/^\s*md[\s_.:-]*\s*/i, '')   // strip leading md if included in URL
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (!cleanRequested) return false;

  // 1. Check generated name slug
  const pkgNameSlug = getScriptSlug(pkg.name);
  if (pkgNameSlug === cleanRequested) return true;

  // 2. Check package predefined slug if available
  if (pkg.slug) {
    const cleanPkgSlug = pkg.slug
      .replace(/^\s*md[\s_.:-]*\s*/i, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    if (cleanPkgSlug === cleanRequested) return true;
  }

  // 3. Check numeric ID
  if (pkg.id && pkg.id.toString() === cleanRequested) return true;

  // 4. Substring / fuzzy match for common singular/plural variants (e.g., heisttable vs heisttables / heisttablet)
  if (
    cleanRequested.length >= 6 &&
    (pkgNameSlug.startsWith(cleanRequested) || cleanRequested.startsWith(pkgNameSlug))
  ) {
    return true;
  }

  return false;
}
