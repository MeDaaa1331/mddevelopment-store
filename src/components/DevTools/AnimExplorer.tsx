import React, { useState, useMemo, useEffect } from 'react';
import { Film, Search, Copy, Check, Code2, Sparkles, Activity, Play, Settings, Layers, Sliders } from 'lucide-react';
import { GTA_ANIM_PACKAGE } from '../../data/gtaAnims';
import { trackEvent } from '../../utils/analytics';

export interface DisplayAnimItem {
  id: string;
  name: string;
  type: 'anim' | 'scenario';
  dict?: string;
  clip?: string;
  scenario?: string;
  category: string;
  description: string;
}

const ANIM_FLAGS = [
  { id: 49, label: '49 (Upper Body / Allow Movement & Driving)' },
  { id: 1, label: '1 (Full Body Loop / Stuck in Place)' },
  { id: 0, label: '0 (Normal Single Playthrough)' },
  { id: 16, label: '16 (Hold / Freeze on Last Frame)' },
  { id: 32, label: '32 (Repeat / Standard Loop)' }
];

export const AnimExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'anim' | 'scenario'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFlag, setSelectedFlag] = useState<number>(49);
  const [blendInSpeed, setBlendInSpeed] = useState<string>('8.0');
  const [blendOutSpeed, setBlendOutSpeed] = useState<string>('-8.0');
  const [duration, setDuration] = useState<string>('-1');
  const [displayLimit, setDisplayLimit] = useState<number>(50);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<DisplayAnimItem>({
    id: 'default_1',
    name: 'Handsup Base',
    type: 'anim',
    dict: 'missminuteman_1ig_2',
    clip: 'handsup_base',
    category: 'Emotes & Actions',
    description: 'missminuteman_1ig_2 -> handsup_base'
  });

  useEffect(() => {
    setDisplayLimit(50);
  }, [search, typeFilter, selectedCategory]);

  const allItems = useMemo(() => {
    const results: DisplayAnimItem[] = [];
    const q = search.trim().toLowerCase();

    if (typeFilter === 'all' || typeFilter === 'scenario') {
      for (let i = 0; i < GTA_ANIM_PACKAGE.scenarios.length; i++) {
        const s = GTA_ANIM_PACKAGE.scenarios[i];
        if (selectedCategory !== 'All' && selectedCategory !== 'Ambient Scenarios') {
          if (selectedCategory !== 'All') continue;
        }

        const name = s
          .replace(/^WORLD_HUMAN_/i, '')
          .replace(/^PROP_HUMAN_/i, '')
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase());

        if (q && !s.toLowerCase().includes(q) && !name.toLowerCase().includes(q)) {
          continue;
        }

        results.push({
          id: `scen_${i}`,
          name: `${name} (Scenario)`,
          type: 'scenario',
          scenario: s,
          category: 'Ambient Scenarios',
          description: s
        });
      }
    }

    if (typeFilter === 'all' || typeFilter === 'anim') {
      const categoryIdx = GTA_ANIM_PACKAGE.categories.indexOf(selectedCategory);

      for (let i = 0; i < GTA_ANIM_PACKAGE.dicts.length; i++) {
        const [dict, clips, catId] = GTA_ANIM_PACKAGE.dicts[i];

        if (categoryIdx > 0 && catId !== categoryIdx) {
          continue;
        }

        const dictLower = dict.toLowerCase();
        const dictMatches = q ? dictLower.includes(q) : false;

        for (let j = 0; j < clips.length; j++) {
          const clip = clips[j];
          const clipLower = clip.toLowerCase();

          if (q && !dictMatches && !clipLower.includes(q)) {
            continue;
          }

          const formattedName = clip
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

          results.push({
            id: `anim_${i}_${j}`,
            name: formattedName,
            type: 'anim',
            dict: dict,
            clip: clip,
            category: GTA_ANIM_PACKAGE.categories[catId] || 'Emotes & Actions',
            description: `${dict} -> ${clip}`
          });

          if (!q && results.length >= 300) {
            break;
          }
        }

        if (!q && results.length >= 300) {
          break;
        }
      }
    }

    return results;
  }, [search, typeFilter, selectedCategory]);

  const visibleItems = useMemo(() => {
    return allItems.slice(0, displayLimit);
  }, [allItems, displayLimit]);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    trackEvent('anim', key === 'ox' ? 'copy_ox' : 'copy_lua', selectedItem.name);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const luaPlayAnimCode = useMemo(() => {
    if (selectedItem.type === 'scenario') {
      return `local ped = PlayerPedId()
TaskStartScenarioInPlace(ped, '${selectedItem.scenario}', 0, true)`;
    }

    return `local ped = PlayerPedId()
local dict = '${selectedItem.dict}'
local clip = '${selectedItem.clip}'

RequestAnimDict(dict)
while not HasAnimDictLoaded(dict) do
    Wait(50)
end

TaskPlayAnim(ped, dict, clip, ${blendInSpeed}, ${blendOutSpeed}, ${duration}, ${selectedFlag}, 0, false, false, false)`;
  }, [selectedItem, blendInSpeed, blendOutSpeed, duration, selectedFlag]);

  const oxLibAnimSnippet = useMemo(() => {
    if (selectedItem.type === 'scenario') {
      return `scenario = {
    name = '${selectedItem.scenario}'
}`;
    }

    return `anim = {
    dict = '${selectedItem.dict}',
    clip = '${selectedItem.clip}',
    flag = ${selectedFlag}
}`;
  }, [selectedItem, selectedFlag]);

  const dpEmotesFormat = useMemo(() => {
    if (selectedItem.type === 'scenario') {
      return `['${selectedItem.name.toLowerCase().replace(/[^a-z0-9]/g, '')}'] = {
    '${selectedItem.scenario}',
    'Scenario',
    '${selectedItem.name}',
    AnimationOptions = {
        EmoteLoop = true,
        EmoteMoving = false
    }
}`;
    }

    return `['${selectedItem.clip?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'customanim'}'] = {
    '${selectedItem.dict}',
    '${selectedItem.clip}',
    '${selectedItem.name}',
    AnimationOptions = {
        EmoteLoop = ${selectedFlag === 49 || selectedFlag === 1},
        EmoteMoving = ${selectedFlag === 49}
    }
}`;
  }, [selectedItem, selectedFlag]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              GTA V All Animations & Scenarios Explorer (269,658 Clips)
            </h3>
            <p className="text-xs text-zinc-400">
              Instant searchable database of all 19,771 GTA V animation dictionaries, 269,412 clips, and 246 ambient scenarios with ready-to-use FiveM Lua & ox_lib snippets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-emerald-400">
            {selectedItem.type === 'scenario' ? selectedItem.scenario : selectedItem.clip}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-4 p-5 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search 269,658+ anims (cuff, dance, phone, repair, smoke, drill...)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'anim', 'scenario'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                    typeFilter === t
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-white/5'
                  }`}
                >
                  {t === 'all' ? 'All (269k+)' : t === 'anim' ? 'Animations (269k)' : 'Scenarios (246)'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {GTA_ANIM_PACKAGE.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-1 pt-1">
              <span>Showing {visibleItems.length} matching clips</span>
              {allItems.length > visibleItems.length && (
                <span>({allItems.length.toLocaleString()} total found)</span>
              )}
            </div>
          </div>

          <div data-lenis-prevent className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {visibleItems.map(item => {
              const active = selectedItem.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 group ${
                    active
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/20 hover:bg-zinc-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-black/80 border border-white/10 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-emerald-300 transition-colors">
                      <Film className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate group-hover:text-emerald-300 transition-colors">
                        {item.name}
                      </span>
                      {item.type === 'anim' ? (
                        <>
                          <span className="font-mono text-[10px] text-zinc-400 block truncate">{item.dict}</span>
                          <span className="font-mono text-[9px] text-emerald-400 block truncate">{item.clip}</span>
                        </>
                      ) : (
                        <span className="font-mono text-[10px] text-cyan-400 block truncate">{item.scenario}</span>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-zinc-500 shrink-0 bg-zinc-900 border border-white/10 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
              );
            })}

            {allItems.length > displayLimit && (
              <button
                onClick={() => setDisplayLimit(prev => prev + 50)}
                className="w-full py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer text-center shadow-sm mt-2"
              >
                Load More Animations ({allItems.length - displayLimit} remaining)
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                    {selectedItem.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-mono font-bold text-zinc-400">
                    {selectedItem.type.toUpperCase()}
                  </span>
                </div>

                <h4 className="font-display font-extrabold text-xl text-white">{selectedItem.name}</h4>
                <p className="text-xs text-zinc-400 mt-1 font-mono">{selectedItem.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleCopy('dict', selectedItem.dict || selectedItem.scenario || '')}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'dict' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{selectedItem.type === 'scenario' ? 'Copy Scenario' : 'Copy Dict'}</span>
                </button>

                {selectedItem.type === 'anim' && (
                  <button
                    onClick={() => handleCopy('clip', selectedItem.clip || '')}
                    className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'clip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Clip</span>
                  </button>
                )}
              </div>
            </div>

            {selectedItem.type === 'anim' && (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Animation Flag Behavior
                  </label>
                  <select
                    value={selectedFlag}
                    onChange={e => setSelectedFlag(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {ANIM_FLAGS.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Blend In Speed</span>
                    <input
                      type="text"
                      value={blendInSpeed}
                      onChange={e => setBlendInSpeed(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white text-center focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Blend Out Speed</span>
                    <input
                      type="text"
                      value={blendOutSpeed}
                      onChange={e => setBlendOutSpeed(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white text-center focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Duration (-1 = Loop)</span>
                    <input
                      type="text"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white text-center focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-sm text-white">FiveM TaskPlayAnim / Scenario Script</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('ox', oxLibAnimSnippet)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'ox' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>ox_lib</span>
                </button>

                <button
                  onClick={() => handleCopy('dp', dpEmotesFormat)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'dp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>dpemotes</span>
                </button>

                <button
                  onClick={() => handleCopy('lua', luaPlayAnimCode)}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-mono text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95"
                >
                  {copiedKey === 'lua' ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Lua</span>
                </button>
              </div>
            </div>

            <pre
              data-lenis-prevent
              className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-48"
            >
              {luaPlayAnimCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
