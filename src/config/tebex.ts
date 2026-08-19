
export const TEBEX_CONFIG = {

  publicToken: (import.meta as any).env?.VITE_TEBEX_PUBLIC_TOKEN || 'yry4-4f39d4771913f90be71cc7be4f234a2cfbd8036e',

  storeDomain: (import.meta as any).env?.VITE_TEBEX_STORE_DOMAIN || 'https://medaaa.tebex.io',

  discordUrl: (import.meta as any).env?.VITE_DISCORD_URL || 'https://discord.gg/Ze4m2Uyxjw',

  storeName: 'MD Development',
  currency: 'EUR',

  autoSyncIntervalMinutes: 5,

  coupons: {
    'NEW15': 15,
  } as Record<string, number>,

  defaultCouponDiscount: 15,
};
