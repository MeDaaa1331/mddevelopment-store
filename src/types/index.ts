export type Framework = 'all' | 'esx' | 'qb';

export interface TebexAccount {
  id: number;
  name: string;
  currency: string;
  domain: string;
  description?: string;
  online_mode?: boolean;
  game_type?: string;
}

export interface TebexPackage {
  id: number;
  name: string;
  description: string;
  image?: string;
  banner?: string;
  screenshots?: string[];
  price: number;
  original_price?: number;
  discount?: number; 
  currency: string;
  category_id?: number;
  category_name?: string;
  category_type?: 'paid' | 'deals' | 'opensource';
  slug?: string;
  order?: number;
  created_at?: string;
  updated_at?: string;

  frameworks?: ('ESX' | 'QB')[];
  resmon?: string;
  youtube_id?: string;
  features?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
  is_open_source?: boolean;
  config_preview?: string;
}

export interface TebexCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  order: number;
  packages: TebexPackage[];
}

export interface CartItem {
  package: TebexPackage;
  quantity: number;
  selectedPrice: number;
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  description: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'installation' | 'payments';
}

export interface FilterState {
  search: string;
  category: string; 
  framework: Framework; 
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc';
  onlyDiscounted: boolean;
}

export interface BasketResult {
  ident?: string;
  checkoutUrl: string;
  success: boolean;
  isLive?: boolean;
  hasPackagesInBasket?: boolean;
  requiresAuth?: boolean;
}
