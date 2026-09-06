import React from 'react';
import { 
  Search, 
  Rocket, 
  Coins, 
  Car, 
  Building2, 
  Skull, 
  ShieldAlert, 
  Crosshair, 
  Layout, 
  X,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { DOCS_CATEGORIES } from '../../data/docsData';
import { DocArticle } from '../../types/docs';

interface DocsSidebarProps {
  activeArticleId: string;
  onSelectArticle: (articleId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCloseMobile?: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Rocket: <Rocket className="w-4 h-4" />,
  Coins: <Coins className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Skull: <Skull className="w-4 h-4" />,
  ShieldAlert: <ShieldAlert className="w-4 h-4" />,
  Crosshair: <Crosshair className="w-4 h-4" />,
  Layout: <Layout className="w-4 h-4" />
};

export const DocsSidebar: React.FC<DocsSidebarProps> = ({
  activeArticleId,
  onSelectArticle,
  searchQuery,
  onSearchChange,
  onCloseMobile
}) => {
  const filteredCategories = DOCS_CATEGORIES.map(category => {
    if (!searchQuery.trim()) return category;
    const lower = searchQuery.toLowerCase();
    const matches = category.articles.filter(
      art =>
        art.title.toLowerCase().includes(lower) ||
        art.description.toLowerCase().includes(lower) ||
        art.id.toLowerCase().includes(lower)
    );
    return {
      ...category,
      articles: matches
    };
  }).filter(category => category.articles.length > 0);

  return (
    <aside className="w-full h-full flex flex-col bg-[#08080c] border-r border-white/10 select-none">
      {/* Top Header & Search */}
      <div className="p-4 border-b border-white/10 sticky top-0 bg-[#08080c]/95 backdrop-blur-xl z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-sm text-white tracking-wide">
              DOCUMENTATION
            </span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search scripts & guides..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 custom-scrollbar text-xs">
        {filteredCategories.length === 0 ? (
          <div className="p-6 text-center text-zinc-500 text-xs">
            No documentation matching "{searchQuery}"
          </div>
        ) : (
          filteredCategories.map(category => (
            <div key={category.id} className="space-y-1">
              <div className="px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider uppercase text-zinc-500 flex items-center gap-2">
                <span className="text-zinc-400">{CATEGORY_ICONS[category.icon] || <ChevronRight className="w-3 h-3" />}</span>
                <span>{category.name}</span>
                <span className="ml-auto text-[10px] text-zinc-600 font-mono">
                  {category.articles.length}
                </span>
              </div>

              <div className="space-y-0.5 pt-0.5">
                {category.articles.map((article: DocArticle) => {
                  const isActive = article.id === activeArticleId;
                  return (
                    <button
                      key={article.id}
                      onClick={() => {
                        onSelectArticle(article.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-white text-black font-bold shadow-glow-white scale-[1.01]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate pr-2">{article.title}</span>
                      {article.badge && (
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-mono font-bold rounded shrink-0 uppercase tracking-wider ${
                            isActive
                              ? 'bg-black text-white'
                              : article.badge === 'Flagship' || article.badge === 'Bestseller'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : article.badge === 'Popular'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-white/10 text-zinc-300 border border-white/10'
                          }`}
                        >
                          {article.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Support Info */}
      <div className="p-3 border-t border-white/10 bg-[#060609] text-[11px] text-zinc-400">
        <a
          href="https://discord.gg/Ze4m2Uyxjw"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 hover:border-white/15 transition-all text-zinc-300 hover:text-white group"
        >
          <span className="font-medium">Need help? Open Discord Ticket</span>
          <span className="text-cyan-400 font-mono group-hover:translate-x-0.5 transition-transform">→</span>
        </a>
      </div>
    </aside>
  );
};
