import { TebexAccount, TebexCategory, TebexPackage } from '../types';
import { SAMPLE_CATEGORIES, SAMPLE_PACKAGES } from './sampleData';
import { TEBEX_CONFIG } from '../config/tebex';
import { extractYouTubeId } from '../utils/youtube';

const TEBEX_HEADLESS_BASE = 'https://headless.tebex.io/api';

export class TebexService {
  private static token: string = TEBEX_CONFIG.publicToken;

  public static getToken(): string {
    return this.token || TEBEX_CONFIG.publicToken;
  }

  public static setToken(token: string): void {
    this.token = token.trim() || TEBEX_CONFIG.publicToken;
  }

  public static hasToken(): boolean {
    const activeToken = this.getToken();
    return Boolean(activeToken && activeToken.length > 5);
  }

  public static async fetchStoreData(): Promise<{
    account: TebexAccount;
    categories: TebexCategory[];
    packages: TebexPackage[];
    isLive: boolean;
  }> {
    const token = this.getToken();

    if (!token) {
      return {
        account: {
          id: 1,
          name: TEBEX_CONFIG.storeName,
          currency: TEBEX_CONFIG.currency,
          domain: TEBEX_CONFIG.storeDomain.replace('https://', ''),
          online_mode: true,
          description: 'Official MD Development FiveM Store'
        },
        categories: SAMPLE_CATEGORIES,
        packages: SAMPLE_PACKAGES,
        isLive: false
      };
    }

    try {
      const accRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}`, {
        headers: { 'Accept': 'application/json' }
      });
      const accJson = accRes.ok ? await accRes.json() : null;
      const accData = accJson?.data || accJson || {};

      const account: TebexAccount = {
        id: accData.id || 1,
        name: accData.name || TEBEX_CONFIG.storeName,
        currency: accData.currency || TEBEX_CONFIG.currency,
        domain: accData.domain || TEBEX_CONFIG.storeDomain.replace('https://', ''),
        description: accData.description,
        online_mode: accData.online_mode ?? true
      };

      const allPackages: TebexPackage[] = [];
      const seenPackageIds = new Set<number>();

      const parsePackage = (rawPkg: any, categoryName?: string, categoryId?: number) => {
        if (!rawPkg || !rawPkg.id || seenPackageIds.has(rawPkg.id)) return;
        seenPackageIds.add(rawPkg.id);

        let discountPercent: number | undefined = undefined;
        let origPrice: number | undefined = undefined;

        if (rawPkg.discount && rawPkg.discount > 0) {
          const discountAmt = Number(rawPkg.discount);
          const basePrice = Number(rawPkg.base_price ?? rawPkg.price ?? 0);
          const origBase = basePrice + discountAmt;
          if (origBase > 0) {
            discountPercent = Math.round((discountAmt / origBase) * 100);
            const taxMultiplier = basePrice > 0 ? (Number(rawPkg.total_price ?? 0) / basePrice) : 1;
            origPrice = Number((origBase * (taxMultiplier > 0 ? taxMultiplier : 1)).toFixed(2));
          }
        } else if (rawPkg.original_price && rawPkg.original_price > Number(rawPkg.total_price ?? rawPkg.price ?? 0)) {
          origPrice = Number(rawPkg.original_price);
          const current = Number(rawPkg.total_price ?? rawPkg.price ?? 0);
          discountPercent = Math.round(((origPrice - current) / origPrice) * 100);
        }

        const pkgPrice = Number(rawPkg.total_price ?? rawPkg.price ?? 0);
        const pkgName = rawPkg.name || 'Script Package';
        const isFree = pkgPrice === 0 || /free/i.test(categoryName || '') || /free/i.test(pkgName) || rawPkg.category_type === 'free';
        const isOpenSource = !isFree && (/open[\s-_]?source|unlocked/i.test(pkgName) || /open[\s-_]?source/i.test(categoryName || ''));
        const isDeal = !isFree && Boolean(
          (discountPercent && discountPercent > 0) || 
          /deal|sale|bundle|discount/i.test(categoryName || '') || 
          /deal|bundle|all[\s-_]?in[\s-_]?one/i.test(pkgName)
        );

        const categoryType = isFree ? 'free' : (isOpenSource ? 'opensource' : (isDeal ? 'deals' : 'paid'));
        const desc = rawPkg.description || '<p>High performance FiveM resource for ESX & QBCore.</p>';
        const youtubeId = extractYouTubeId(desc) || rawPkg.youtube_id || undefined;

        const primaryImage = rawPkg.image || (rawPkg.media && rawPkg.media[0]?.url) || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=75&fm=webp';
        const screenshotsSet = new Set<string>();
        if (primaryImage) screenshotsSet.add(primaryImage);

        if (Array.isArray(rawPkg.media)) {
          rawPkg.media.forEach((m: any) => {
            const url = typeof m === 'string' ? m : (m?.url || m?.image_url);
            if (url && typeof url === 'string') screenshotsSet.add(url);
          });
        }

        const imgMatches = desc.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
        for (const match of imgMatches) {
          if (match[1] && match[1].startsWith('http')) {
            screenshotsSet.add(match[1]);
          }
        }

        const screenshots = Array.from(screenshotsSet);

        const pkg: TebexPackage = {
          id: rawPkg.id,
          name: rawPkg.name,
          description: desc,
          image: primaryImage,
          screenshots: screenshots.length > 0 ? screenshots : [primaryImage],
          price: pkgPrice,
          original_price: origPrice,
          discount: discountPercent,
          currency: account.currency,
          category_id: categoryId || rawPkg.category?.id || 1,
          category_name: categoryName || rawPkg.category?.name || (isFree ? 'Free' : 'Scripts'),
          category_type: categoryType,
          slug: rawPkg.slug || `package-${rawPkg.id}`,
          order: rawPkg.order || 0,
          frameworks: ['ESX', 'QB'],
          resmon: '0.00ms',
          youtube_id: youtubeId,
          is_open_source: isOpenSource,
          is_free: isFree,
          download_url: isFree ? (rawPkg.download_url || 'https://github.com/MeDaaa1331/mddevelopment-store/archive/refs/heads/main.zip') : undefined,
          features: [
            isFree ? 'Discord Member Exclusive direct free download' : 'Instant CFX.re Keymaster asset delivery',
            'Native ESX & QBCore framework support',
            '0.00ms ultra-optimized idle resmon',
            'Lifetime updates and Discord support access'
          ],
          config_preview: `Config = {}\nConfig.Framework = "auto"\nConfig.Debug = false`
        };

        allPackages.push(pkg);
      };

      try {
        const catRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}/categories?includePackages=1`, {
          headers: { 'Accept': 'application/json' }
        });

        if (catRes.ok) {
          const catJson = await catRes.json();
          const rawCategories = Array.isArray(catJson.data) ? catJson.data : (Array.isArray(catJson) ? catJson : []);

          const extractFromCategory = (cat: any) => {
            (cat.packages || []).forEach((p: any) => parsePackage(p, cat.name, cat.id));
            (cat.subcategories || []).forEach(extractFromCategory);
          };

          rawCategories.forEach(extractFromCategory);
        }
      } catch (catErr) {
        console.warn('[Tebex] Categories fetch notice:', catErr);
      }

      if (allPackages.length === 0) {
        try {
          const pkgRes = await fetch(`${TEBEX_HEADLESS_BASE}/accounts/${token}/packages`, {
            headers: { 'Accept': 'application/json' }
          });
          if (pkgRes.ok) {
            const pkgJson = await pkgRes.json();
            const rawPackages = Array.isArray(pkgJson.data) ? pkgJson.data : (Array.isArray(pkgJson) ? pkgJson : []);
            rawPackages.forEach((p: any) => parsePackage(p));
          }
        } catch (pkgErr) {
          console.warn('[Tebex] Direct packages fetch notice:', pkgErr);
        }
      }

      const finalPackages = allPackages.length > 0 ? allPackages : SAMPLE_PACKAGES;

      const structuredCategories: TebexCategory[] = [
        {
          id: 0,
          name: 'All Scripts',
          slug: 'all',
          description: 'Browse all available FiveM scripts created by MD Development.',
          order: 1,
          packages: finalPackages
        },
        {
          id: 1,
          name: 'Paid',
          slug: 'paid',
          description: 'Premium scripts for ESX and QBCore.',
          order: 2,
          packages: finalPackages.filter(p => !p.is_open_source && p.category_type !== 'opensource' && p.category_type !== 'free')
        },
        {
          id: 2,
          name: 'Deals',
          slug: 'deals',
          description: 'Discounted scripts, bundles and special offers.',
          order: 3,
          packages: finalPackages.filter(p => 
            (p.category_type === 'deals' || 
            (p.discount && p.discount > 0) || 
            Boolean(p.original_price && p.original_price > p.price) ||
            /deal|sale|bundle|discount/i.test(p.category_name || '') ||
            /deal|bundle|all[\s-_]?in[\s-_]?one/i.test(p.name)) &&
            p.category_type !== 'free'
          )
        },
        {
          id: 3,
          name: 'Open Source',
          slug: 'opensource',
          description: '100% unlocked source code for developers.',
          order: 4,
          packages: finalPackages.filter(p => (p.is_open_source || p.category_type === 'opensource') && p.category_type !== 'free')
        },
        {
          id: 4,
          name: 'Free',
          slug: 'free',
          description: 'Free community FiveM resources (Discord Member Exclusive).',
          order: 5,
          packages: finalPackages.filter(p => p.price === 0 || p.category_type === 'free' || p.is_free || /free/i.test(p.category_name || '') || /free/i.test(p.name))
        }
      ];

      return {
        account,
        categories: structuredCategories,
        packages: finalPackages,
        isLive: true
      };

    } catch (err) {
      console.warn('Failed to load live Tebex data, falling back to cached/sample data:', err);
      return {
        account: {
          id: 1,
          name: TEBEX_CONFIG.storeName,
          currency: TEBEX_CONFIG.currency,
          domain: TEBEX_CONFIG.storeDomain.replace('https://', ''),
          online_mode: true
        },
        categories: SAMPLE_CATEGORIES,
        packages: SAMPLE_PACKAGES,
        isLive: false
      };
    }
  }

  public static getCheckoutUrl(packageId: number, couponCode?: string): string {
    const couponQuery = couponCode ? `?code=${encodeURIComponent(couponCode)}` : '';
    return `${TEBEX_CONFIG.storeDomain}/checkout/packages/add/${packageId}/single${couponQuery}`;
  }
}
