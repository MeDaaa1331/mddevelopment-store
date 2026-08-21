import React, { useState, useMemo } from 'react';
import { Volume2, Search, Copy, Check, Sparkles, Play, Code2 } from 'lucide-react';
import { GTA_AUDIO_DATABASE } from '../../data/gtaAudio';
import { trackEvent } from '../../utils/analytics';

export const AudioExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'HUD & UI' | 'Economy & Shops' | 'Heists & Hacking' | 'Police & Alarms' | 'Phone & Pager' | 'Weapons & Combat' | 'Vehicles & Horns' | 'Casino & Minigames'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSounds = useMemo(() => {
    return GTA_AUDIO_DATABASE.filter(s => {
      if (category !== 'All' && s.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.soundset.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [category, search]);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    trackEvent('audio', 'copy_lua', `Audio ${id}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">GTA V Audio & Sound FX Explorer</h3>
            <p className="text-xs text-zinc-400">
              Database of official GTA V sound names and soundsets with 1-click PlaySoundFrontend and 3D audio snippets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-72">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search sound (cash, alarm, select...)"
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs w-fit flex-wrap">
        {(['All', 'HUD & UI', 'Economy & Shops', 'Heists & Hacking', 'Police & Alarms', 'Phone & Pager', 'Weapons & Combat', 'Vehicles & Horns', 'Casino & Minigames'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
              category === cat ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSounds.map(sound => {
          const frontendSnippet = `PlaySoundFrontend(-1, "${sound.name}", "${sound.soundset}", true)`;
          const entitySnippet = `PlaySoundFromEntity(-1, "${sound.name}", PlayerPedId(), "${sound.soundset}", true, 20)`;

          return (
            <div
              key={sound.id}
              className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-white">{sound.name}</h4>
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-white/10">
                    {sound.category}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-1 leading-snug">{sound.description}</p>

                <div className="mt-2.5 p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] space-y-1">
                  <div className="truncate text-emerald-300">
                    <span className="text-zinc-500">Soundset: </span>{sound.soundset}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleCopy(`entity-${sound.id}`, entitySnippet)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                  title="Copy PlaySoundFromEntity snippet"
                >
                  {copiedId === `entity-${sound.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied 3D</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3 h-3" />
                      <span>3D Entity Audio</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(`fe-${sound.id}`, frontendSnippet)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-[11px] font-mono font-bold text-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                  title="Copy PlaySoundFrontend snippet"
                >
                  {copiedId === `fe-${sound.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-black" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-black" />
                      <span>PlaySoundFrontend</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
