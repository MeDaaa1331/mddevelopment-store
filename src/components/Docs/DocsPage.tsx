import React, { useState, useEffect } from 'react';
import { Menu, BookOpen, ChevronRight, Hash, ArrowUp } from 'lucide-react';
import { DOCS_ARTICLES } from '../../data/docsData';
import { DocsSidebar } from './DocsSidebar';
import { DocsContent } from './DocsContent';

export const DocsPage: React.FC = () => {
  // Read initial article from URL query params (e.g. ?article=md-banking)
  const [activeArticleId, setActiveArticleId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const articleParam = params.get('article');
      if (articleParam && DOCS_ARTICLES.some(a => a.id === articleParam)) {
        return articleParam;
      }
    }
    return 'welcome';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Active article object
  const activeArticle = DOCS_ARTICLES.find(a => a.id === activeArticleId) || DOCS_ARTICLES[0];

  // Update URL & document title when article changes
  const handleSelectArticle = (articleId: string) => {
    setActiveArticleId(articleId);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?article=${articleId}`;
      window.history.pushState({ article: articleId }, '', newUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = `${activeArticle.title} | MD Development Documentation`;
    }
  }, [activeArticle]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const articleParam = params.get('article');
      if (articleParam && DOCS_ARTICLES.some(a => a.id === articleParam)) {
        setActiveArticleId(articleParam);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Back to top listener
  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex flex-col font-sans pt-20 selection:bg-cyan-500/30">
      {/* Mobile Top Bar for Docs */}
      <div className="lg:hidden sticky top-20 z-30 flex items-center justify-between px-4 py-3 bg-[#08080c]/95 backdrop-blur-xl border-b border-white/10">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10"
        >
          <Menu className="w-4 h-4 text-cyan-400" />
          <span>Documentation Menu</span>
        </button>

        <span className="text-xs text-zinc-400 truncate max-w-[180px] font-mono">
          {activeArticle.title}
        </span>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto flex items-start">
        {/* Left: Desktop Sidebar */}
        <div className="hidden lg:block w-72 xl:w-80 h-[calc(100vh-5rem)] sticky top-20 shrink-0">
          <DocsSidebar
            activeArticleId={activeArticleId}
            onSelectArticle={handleSelectArticle}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex animate-fadeIn">
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] h-full z-10 shadow-2xl">
              <DocsSidebar
                activeArticleId={activeArticleId}
                onSelectArticle={handleSelectArticle}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCloseMobile={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Center: Article Reading Zone */}
        <main className="flex-1 min-w-0 py-6 sm:py-8">
          <DocsContent
            article={activeArticle}
            onNavigateArticle={handleSelectArticle}
          />
        </main>

        {/* Right: Table of Contents (TOC) for current article */}
        <div className="hidden 2xl:block w-64 h-[calc(100vh-5rem)] sticky top-20 p-6 shrink-0 border-l border-white/5 text-xs">
          <div className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-cyan-400" />
            <span>On This Page</span>
          </div>

          <nav className="space-y-1.5">
            {activeArticle.sections.map(sec => (
              <a
                key={sec.id}
                href={`#${sec.id}`}
                className="block text-zinc-400 hover:text-white transition-colors py-1 truncate font-medium hover:translate-x-1 transition-transform"
              >
                {sec.title}
              </a>
            ))}
          </nav>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
            <div className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">
              MD Dev Standards
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-white/10 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-zinc-300">
                <span>Resmon Target</span>
                <span className="font-mono text-emerald-400 font-bold">0.00ms</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>ESX Legacy</span>
                <span className="font-mono text-cyan-400 font-bold">v1.9+</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>QBCore</span>
                <span className="font-mono text-cyan-400 font-bold">Native</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-xl bg-white text-black font-bold shadow-2xl hover:bg-zinc-200 transition-all active:scale-90"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
