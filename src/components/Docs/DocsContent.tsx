import React from 'react';
import { 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Layers, 
  Cpu, 
  ShoppingCart,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { DocArticle } from '../../types/docs';
import { DocsCodeBlock } from './DocsCodeBlock';
import { DocsCallout } from './DocsCallout';
import { FormattedText } from './FormattedText';
import { DOCS_ARTICLES } from '../../data/docsData';

interface DocsContentProps {
  article: DocArticle;
  onNavigateArticle: (articleId: string) => void;
}

export const DocsContent: React.FC<DocsContentProps> = ({ article, onNavigateArticle }) => {
  // Find previous and next articles
  const currentIndex = DOCS_ARTICLES.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? DOCS_ARTICLES[currentIndex - 1] : null;
  const nextArticle = currentIndex < DOCS_ARTICLES.length - 1 ? DOCS_ARTICLES[currentIndex + 1] : null;

  const renderContentBlocks = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentUnorderedList: string[] = [];
    let currentOrderedList: string[] = [];
    let paragraphBuffer: string[] = [];

    const flushUnorderedList = (keyPrefix: string | number) => {
      if (currentUnorderedList.length > 0) {
        elements.push(
          <ul key={`ul-${keyPrefix}`} className="list-disc pl-5 space-y-1.5 my-2.5 text-zinc-300">
            {currentUnorderedList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <FormattedText text={item} />
              </li>
            ))}
          </ul>
        );
        currentUnorderedList = [];
      }
    };

    const flushOrderedList = (keyPrefix: string | number) => {
      if (currentOrderedList.length > 0) {
        elements.push(
          <ol key={`ol-${keyPrefix}`} className="list-decimal pl-5 space-y-1.5 my-2.5 text-zinc-300">
            {currentOrderedList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                <FormattedText text={item} />
              </li>
            ))}
          </ol>
        );
        currentOrderedList = [];
      }
    };

    const flushParagraph = (keyPrefix: string | number) => {
      if (paragraphBuffer.length > 0) {
        elements.push(
          <p key={`p-${keyPrefix}`} className="leading-relaxed my-2">
            <FormattedText text={paragraphBuffer.join(' ')} />
          </p>
        );
        paragraphBuffer = [];
      }
    };

    lines.forEach((rawLine, idx) => {
      const line = rawLine.trim();
      if (!line) {
        flushParagraph(idx);
        flushUnorderedList(idx);
        flushOrderedList(idx);
        return;
      }

      // Check ordered list (e.g. "1. Item")
      const olMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (olMatch) {
        flushParagraph(idx);
        flushUnorderedList(idx);
        currentOrderedList.push(olMatch[2]);
        return;
      }

      // Check unordered list (e.g. "- Item" or "* Item")
      if (line.startsWith('- ') || line.startsWith('* ')) {
        flushParagraph(idx);
        flushOrderedList(idx);
        currentUnorderedList.push(line.replace(/^[-*]\s+/, ''));
        return;
      }

      // Normal paragraph text
      flushUnorderedList(idx);
      flushOrderedList(idx);
      paragraphBuffer.push(line);
    });

    flushParagraph('end');
    flushUnorderedList('end');
    flushOrderedList('end');

    return elements;
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-8 py-8 selection:bg-cyan-500/30">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6 font-mono">
        <button 
          onClick={() => onNavigateArticle('welcome')} 
          className="hover:text-zinc-300 transition-colors"
        >
          Docs
        </button>
        <span>/</span>
        <span className="text-zinc-400">{article.category}</span>
        <span>/</span>
        <span className="text-cyan-400 font-bold">{article.title}</span>
      </div>

      {/* Header */}
      <div className="border-b border-white/10 pb-8 mb-8">
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          {article.frameworks && article.frameworks.map(fw => (
            <span 
              key={fw} 
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 shadow-sm"
            >
              <Layers className="w-3 h-3" />
              {fw}
            </span>
          ))}

          {article.resmon && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
              <Cpu className="w-3 h-3" />
              {article.resmon}
            </span>
          )}

          {article.badge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              {article.badge}
            </span>
          )}

          {article.tebexUrl && (
            <a
              href={article.tebexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all shadow-glow-sm hover:scale-105 active:scale-95 shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Get on Tebex</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          )}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
          {article.title}
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-3xl">
          <FormattedText text={article.description} />
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-10">
        {article.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight mb-4 flex items-center gap-2 group">
              <a href={`#${section.id}`} className="text-zinc-500 group-hover:text-cyan-400 transition-colors font-mono text-base">#</a>
              <span>{section.title}</span>
            </h2>

            {section.content && (
              <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans space-y-3 prose prose-invert max-w-none">
                {renderContentBlocks(section.content)}
              </div>
            )}

            {section.callout && (
              <DocsCallout 
                type={section.callout.type} 
                title={section.callout.title} 
                message={section.callout.message} 
              />
            )}

            {section.steps && section.steps.length > 0 && (
              <div className="my-6 space-y-4">
                {section.steps.map((step) => (
                  <div 
                    key={step.number} 
                    className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                        {step.number}
                      </div>
                      <h4 className="font-display font-bold text-sm text-white">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 pl-9">
                      <FormattedText text={step.desc} />
                    </p>
                    {step.code && (
                      <div className="pl-9 mt-2">
                        <DocsCodeBlock 
                          code={step.code.code} 
                          language={step.code.language} 
                          title={step.code.title} 
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {section.code && (
              <DocsCodeBlock 
                code={section.code.code} 
                language={section.code.language} 
                title={section.code.title} 
              />
            )}

            {section.table && (
              <div className="my-6 overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/40 shadow-md">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      {section.table.headers.map((h, i) => (
                        <th key={i} className="px-4 py-3 font-mono font-bold text-zinc-400 uppercase tracking-wider text-[11px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white/[0.02]">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className={`px-4 py-3 ${cIdx === 0 ? 'font-mono text-cyan-300 font-semibold' : 'text-zinc-300'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Prev / Next Article Navigation Cards */}
      <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevArticle ? (
          <button
            onClick={() => onNavigateArticle(prevArticle.id)}
            className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-white/20 transition-all text-left group flex flex-col gap-1"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              Previous Article
            </span>
            <span className="font-display font-bold text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
              {prevArticle.title}
            </span>
          </button>
        ) : <div />}

        {nextArticle ? (
          <button
            onClick={() => onNavigateArticle(nextArticle.id)}
            className="p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/10 hover:border-white/20 transition-all text-right group flex flex-col gap-1 sm:items-end"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
              Next Article
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span className="font-display font-bold text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
              {nextArticle.title}
            </span>
          </button>
        ) : <div />}
      </div>

      {/* Discord Help Banner */}
      <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 to-zinc-950/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#5865F2]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-white">Still have questions?</h4>
            <p className="text-xs text-zinc-400">Our support team and developer are active on Discord every day.</p>
          </div>
        </div>
        <a
          href="https://discord.gg/Ze4m2Uyxjw"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs transition-all shadow-glow-sm flex items-center gap-2 shrink-0 active:scale-95"
        >
          <span>Join Discord Support</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </article>
  );
};
