import React, { useState, useEffect } from 'react';
import { ExternalLink, Star, ThumbsUp, Copy, Check, Sparkles, Award, ShieldCheck } from 'lucide-react';

interface TopVCreatorData {
  slug: string;
  displayName: string;
  category: string;
  platforms: string[];
  frameworks: string[];
  rating: number;
  reviews: number;
  views: number;
  votes: number;
  rank: number;
  logoUrl?: string;
  links?: {
    topv?: string;
    vote?: string;
    tebex?: string;
    discord?: string;
  };
}

const COLOR_VARIANTS = [
  { id: 'violet', name: 'Violet', hex: '#8b5cf6', bgClass: 'bg-purple-500' },
  { id: 'mint', name: 'Mint', hex: '#10b981', bgClass: 'bg-emerald-500' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6', bgClass: 'bg-blue-500' },
  { id: 'gold', name: 'Gold', hex: '#eab308', bgClass: 'bg-yellow-500' },
  { id: 'coral', name: 'Coral', hex: '#fb7185', bgClass: 'bg-rose-400' },
  { id: 'rose', name: 'Rose', hex: '#f43f5e', bgClass: 'bg-pink-500' },
  { id: 'red', name: 'Red', hex: '#ef4444', bgClass: 'bg-red-500' },
  { id: 'orange', name: 'Orange', hex: '#f97316', bgClass: 'bg-orange-500' },
];

export const TopVSection: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState<string>('violet');
  const [creatorData, setCreatorData] = useState<TopVCreatorData | null>(null);
  const [copiedType, setCopiedType] = useState<'widget' | 'badge' | null>(null);

  const CREATOR_SLUG = 'frajermeda';
  const PROFILE_URL = `https://topv.gg/creators/${CREATOR_SLUG}`;
  const VOTE_URL = `https://topv.gg/vote/creator/${CREATOR_SLUG}`;
  const WIDGET_IMG_URL = `https://topv.gg/api/widget/${CREATOR_SLUG}?color=${selectedColor}`;
  const BADGE_IMG_URL = `https://topv.gg/api/badge/${CREATOR_SLUG}?color=${selectedColor}`;

  useEffect(() => {
    let isMounted = true;
    fetch(`https://topv.gg/api/public/creator/${CREATOR_SLUG}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (isMounted && data) {
          setCreatorData(data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const copySnippet = (type: 'widget' | 'badge') => {
    const snippet =
      type === 'widget'
        ? `<a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer"><img src="${WIDGET_IMG_URL}" alt="Vote on TopV" /></a>`
        : `<a href="${PROFILE_URL}" target="_blank" rel="noopener noreferrer"><img src="${BADGE_IMG_URL}" alt="TopV" /></a>`;

    navigator.clipboard?.writeText(snippet);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <section id="topv-section" className="py-20 border-t border-white/10 relative overflow-hidden bg-[#07070b]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono text-purple-300 mb-3 tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Community Reputation & Visibility</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            SUPPORT US ON <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">TOPV.GG</span>
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            Show your support for MD Development by voting on TopV.gg. Check our verified creator badge, ratings, and reputation in the FiveM community.
          </p>
        </div>

        {/* Color Switcher Bar (mirroring TopV customizer) */}
        <div className="mb-10 max-w-2xl mx-auto p-4 rounded-2xl bg-zinc-900/60 border border-white/10 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono uppercase font-bold text-zinc-400 tracking-wider">Badge Color:</span>
              <span className="font-mono text-purple-400 font-semibold uppercase">{selectedColor}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_VARIANTS.map(c => {
                const isActive = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white/15 text-white border border-white/30 shadow-glow-sm'
                        : 'bg-black/40 text-zinc-400 hover:text-white border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Grid: Widgets Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Card 1: Large Vote Widget */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl relative group hover:border-purple-500/40 transition-all duration-300 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <ThumbsUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">TopV Vote Widget</h3>
                    <p className="text-[11px] font-mono text-zinc-400">Large card (400×80) with direct VOTE button</p>
                  </div>
                </div>
                <button
                  onClick={() => copySnippet('widget')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
                  title="Copy HTML embed code"
                >
                  {copiedType === 'widget' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                Clicking the widget takes you directly to our official TopV creator page where you can cast a vote or leave a review.
              </p>

              {/* Widget Display Container */}
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center relative overflow-hidden group/w min-h-[140px]">
                {/* Checkerboard subtle pattern */}
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

                <a
                  href={PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 inline-block transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                  title="Vote on TopV.gg"
                >
                  <img
                    src={WIDGET_IMG_URL}
                    alt="Vote on TopV"
                    className="w-full max-w-[400px] h-auto rounded-xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <a
                href={VOTE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-glow-sm transition-all duration-200 cursor-pointer"
              >
                <span>Vote for frajermeda</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] font-mono text-zinc-500">
                Endpoint: <code className="text-purple-400">/api/widget/frajermeda</code>
              </span>
            </div>
          </div>

          {/* Card 2: Compact Badge & Creator Stats */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-zinc-900/40 border border-white/10 backdrop-blur-xl relative hover:border-emerald-500/40 transition-all duration-300 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Compact Badge</h3>
                    <p className="text-[11px] font-mono text-zinc-400">Compact SVG (160×32) for footers & READMEs</p>
                  </div>
                </div>
                <button
                  onClick={() => copySnippet('badge')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-colors cursor-pointer"
                  title="Copy HTML embed code"
                >
                  {copiedType === 'badge' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>

              {/* Compact Badge Preview */}
              <div className="p-5 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center mb-6 min-h-[90px]">
                <a
                  href={PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform duration-200 hover:scale-105 inline-block"
                  title="TopV.gg frajermeda badge"
                >
                  <img
                    src={BADGE_IMG_URL}
                    alt="TopV Badge"
                    className="w-full max-w-[160px] h-auto rounded drop-shadow-md"
                    loading="lazy"
                  />
                </a>
              </div>

              {/* Live Creator Profile Details */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Category & Platform</span>
                  <span className="font-mono text-white font-semibold">Solo Dev · FiveM</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Supported Frameworks</span>
                  <span className="font-mono text-zinc-200 text-[11px]">ESX, QB, Qbox, Ox Lib</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Creator Rank</span>
                  <span className="font-mono text-purple-400 font-bold">
                    {creatorData?.rank ? `#${creatorData.rank}` : '#383'}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Rating & Reviews</span>
                  <div className="flex items-center gap-1.5 font-mono text-amber-300 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{creatorData?.rating?.toFixed(1) || '5.0'}★ ({creatorData?.reviews || 0})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom link */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <a
                href={PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                <span>View profile on TopV.gg</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
              </a>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Setup</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
