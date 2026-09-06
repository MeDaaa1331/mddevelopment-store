export interface DocSection {
  id: string;
  title: string;
  content?: string;
  code?: {
    language: 'lua' | 'sql' | 'bash' | 'json' | 'typescript';
    title?: string;
    code: string;
  };
  callout?: {
    type: 'tip' | 'warning' | 'info' | 'danger' | 'ox';
    title?: string;
    message: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
  steps?: Array<{
    number: number;
    title: string;
    desc: string;
    code?: { language: string; code: string; title?: string };
  }>;
}

export interface DocArticle {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  description: string;
  badge?: string;
  frameworks?: ('ESX' | 'QBCore' | 'Standalone')[];
  resmon?: string;
  tebexUrl?: string;
  tebexSlug?: string;
  updatedAt?: string;
  sections: DocSection[];
}

export interface DocCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  articles: DocArticle[];
}
