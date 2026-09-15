import { TebexPackage } from '../types';
import { getScriptSlug } from './slug';

const BASE_URL = 'https://www.mddevelopment.store';
const DEFAULT_TITLE = 'MD Development | FiveM Scripts & Free FiveM Developer Tools Hub';
const DEFAULT_DESCRIPTION =
  'Premium high-performance FiveM scripts for ESX & QBCore with 0.00ms resmon, modern glassmorphic NUI interfaces, and instant Cfx.re Keymaster delivery.';

function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setCanonical(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Dynamically updates document title, OpenGraph tags, meta description, and Schema.org Product JSON-LD.
 */
export function updateProductSEO(pkg: TebexPackage) {
  if (typeof document === 'undefined' || !pkg) return;

  const slug = getScriptSlug(pkg.name);
  const productUrl = `${BASE_URL}/store/${slug}`;
  const title = `${pkg.name} | FiveM Script | MD Development`;

  // Clean plain-text description for search engine snippets
  const cleanDescription = pkg.description
    ? pkg.description.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim().slice(0, 280)
    : `${pkg.name} - High-performance FiveM script for ESX & QBCore. 0.00ms idle resmon, instant CFX Keymaster delivery.`;

  // 1. Page Title & Canonical
  document.title = title;
  setCanonical(productUrl);

  // 2. Standard SEO Meta
  setMetaTag('name', 'description', cleanDescription);
  const frameworks = pkg.frameworks?.join(', ') || 'ESX, QBCore';
  setMetaTag(
    'name',
    'keywords',
    `${pkg.name}, FiveM ${pkg.name} script, FiveM scripts, FiveM resource, ${frameworks}, FiveM Tebex, MD Development`
  );

  // 3. OpenGraph / Facebook
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', cleanDescription);
  setMetaTag('property', 'og:url', productUrl);
  setMetaTag('property', 'og:type', 'product');
  if (pkg.image) {
    setMetaTag('property', 'og:image', pkg.image);
  }

  // 4. Twitter Cards
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', cleanDescription);
  if (pkg.image) {
    setMetaTag('name', 'twitter:image', pkg.image);
  }

  // 5. Schema.org Product & Offer structured data (Google Rich Snippets)
  try {
    let schemaEl = document.getElementById('seo-product-schema') as HTMLScriptElement | null;
    if (!schemaEl) {
      schemaEl = document.createElement('script');
      schemaEl.id = 'seo-product-schema';
      schemaEl.type = 'application/ld+json';
      document.head.appendChild(schemaEl);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: pkg.name,
      image: pkg.screenshots && pkg.screenshots.length > 0 ? pkg.screenshots : (pkg.image ? [pkg.image] : []),
      description: cleanDescription,
      sku: `MD-${pkg.id}`,
      brand: {
        '@type': 'Brand',
        name: 'MD Development'
      },
      category: 'FiveM Game Scripts',
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: pkg.currency || 'EUR',
        price: (pkg.price ?? 0).toFixed(2),
        priceValidUntil: '2028-12-31',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'MD Development',
          url: BASE_URL
        }
      }
    };

    schemaEl.textContent = JSON.stringify(schemaData);
  } catch (err) {
    console.warn('[SEO] Failed to inject Product JSON-LD:', err);
  }
}

/**
 * Restores default homepage SEO metadata when a modal is closed.
 */
export function restoreDefaultSEO() {
  if (typeof document === 'undefined') return;

  document.title = DEFAULT_TITLE;
  setCanonical(`${BASE_URL}/`);
  setMetaTag('name', 'description', DEFAULT_DESCRIPTION);
  setMetaTag('property', 'og:title', DEFAULT_TITLE);
  setMetaTag('property', 'og:description', DEFAULT_DESCRIPTION);
  setMetaTag('property', 'og:url', `${BASE_URL}/`);
  setMetaTag('property', 'og:type', 'website');

  // Remove product JSON-LD schema
  const schemaEl = document.getElementById('seo-product-schema');
  if (schemaEl) {
    schemaEl.remove();
  }
}
