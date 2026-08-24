import React, { useState, useMemo } from 'react';
import { User, Box, Search, Copy, Check, Sparkles, ExternalLink } from 'lucide-react';
import { GTA_PED_PROP_DATABASE, ModelEntry } from '../../data/gtaPeds';
import { trackEvent } from '../../utils/analytics';

const SCENARIOS = [
  { id: 'WORLD_HUMAN_GUARD_STAND', name: 'Guard Standing Alert' },
  { id: 'WORLD_HUMAN_COP_IDLES', name: 'Police Officer Idle' },
  { id: 'WORLD_HUMAN_CLIPBOARD', name: 'Writing on Clipboard' },
  { id: 'WORLD_HUMAN_SMOKING', name: 'Smoking Cigarette' },
  { id: 'WORLD_HUMAN_DRINKING', name: 'Drinking Coffee' },
  { id: 'WORLD_HUMAN_CHEERING', name: 'Cheering Crowd' },
  { id: 'WORLD_HUMAN_STAND_MOBILE', name: 'Browsing Smartphone' },
  { id: 'PROP_HUMAN_SEAT_CHAIR', name: 'Sitting in Chair' }
];

export const PedPropExplorer: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState('s_m_y_cop_01');
  const [coords, setCoords] = useState({ x: '441.25', y: '-982.14', z: '30.69', h: '90.0' });
  const [freeze, setFreeze] = useState(true);
  const [invincible, setInvincible] = useState(true);
  const [blockEvents, setBlockEvents] = useState(true);
  const [scenario, setScenario] = useState('WORLD_HUMAN_GUARD_STAND');
  const [typeFilter, setTypeFilter] = useState<'all' | 'ped' | 'prop'>('all');
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const selectedModel = useMemo(() => {
    return GTA_PED_PROP_DATABASE.find(m => m.id === selectedModelId) || GTA_PED_PROP_DATABASE[0];
  }, [selectedModelId]);

  const filteredModels = useMemo(() => {
    return GTA_PED_PROP_DATABASE.filter(m => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.hash.toLowerCase().includes(q)
      );
    });
  }, [typeFilter, search]);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    trackEvent('peds', key === 'ox' ? 'copy_ox' : 'copy_lua', selectedModel.name);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getModelImageUrl = (model: ModelEntry) => {
    if (failedImages[model.id]) return null;
    if (model.imageUrl) return model.imageUrl;
    if (model.type === 'ped') {
      return `https://docs.fivem.net/peds/${model.id}.png`;
    }
    return null;
  };

  const handleImageError = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  const clientLuaCode = useMemo(() => {
    if (selectedModel.type === 'ped') {
      return `CreateThread(function()
    local modelHash = GetHashKey('${selectedModel.id}')
    RequestModel(modelHash)
    while not HasModelLoaded(modelHash) do
        Wait(50)
    end

    local ped = CreatePed(4, modelHash, ${coords.x}, ${coords.y}, ${coords.z}, ${coords.h}, false, true)
    ${freeze ? 'FreezeEntityPosition(ped, true)' : '-- FreezeEntityPosition(ped, false)'}
    ${invincible ? 'SetEntityInvincible(ped, true)' : '-- SetEntityInvincible(ped, false)'}
    ${blockEvents ? 'SetBlockingOfNonTemporaryEvents(ped, true)' : ''}
    ${scenario ? `TaskStartScenarioInPlace(ped, '${scenario}', 0, true)` : ''}
    SetModelAsNoLongerNeeded(modelHash)
end)`;
    } else {
      return `CreateThread(function()
    local modelHash = GetHashKey('${selectedModel.id}')
    RequestModel(modelHash)
    while not HasModelLoaded(modelHash) do
        Wait(50)
    end

    local obj = CreateObject(modelHash, ${coords.x}, ${coords.y}, ${coords.z}, false, false, false)
    SetEntityHeading(obj, ${coords.h})
    ${freeze ? 'FreezeEntityPosition(obj, true)' : '-- FreezeEntityPosition(obj, false)'}
    ${invincible ? 'SetEntityInvincible(obj, true)' : ''}
    SetModelAsNoLongerNeeded(modelHash)
end)`;
    }
  }, [selectedModel, coords, freeze, invincible, blockEvents, scenario]);

  const oxTargetHook = useMemo(() => {
    return `exports.ox_target:addLocalEntity(ped, {
    {
        name = '${selectedModel.id}_interaction',
        icon = 'fa-solid fa-comments',
        label = 'Talk with ${selectedModel.name}',
        onSelect = function()
            print('Interacting with ${selectedModel.name}!')
        end
    }
})`;
  }, [selectedModel]);

  const selectedImageUrl = getModelImageUrl(selectedModel);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Ped & Prop Spawner / Model Explorer</h3>
            <p className="text-xs text-zinc-400">
              Live visual directory of all GTA V & FiveM Character Peds with instant high-res renders, scenarios, and Lua code generator.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-emerald-400">
            {selectedModel.id}
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
                placeholder="Search peds & props (cop, medic, michael, ballas, chop...)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-1">
              {(['all', 'ped', 'prop'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition-all ${
                    typeFilter === t
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-white/5'
                  }`}
                >
                  {t === 'all' ? 'All Models' : t === 'ped' ? 'NPC Peds' : 'Props'}
                </button>
              ))}
            </div>
          </div>

          <div data-lenis-prevent className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredModels.map(model => {
              const active = selectedModelId === model.id;
              const imgUrl = getModelImageUrl(model);

              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModelId(model.id)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 group ${
                    active
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/20 hover:bg-zinc-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black/80 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative group-hover:border-white/30 transition-colors">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={model.name}
                          className="w-full h-full object-contain object-top scale-110 group-hover:scale-125 transition-transform duration-300"
                          loading="lazy"
                          onError={() => handleImageError(model.id)}
                        />
                      ) : model.type === 'ped' ? (
                        <User className="w-5 h-5 text-zinc-500" />
                      ) : (
                        <Box className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white block truncate group-hover:text-emerald-300 transition-colors">
                          {model.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-zinc-400 block truncate">{model.id}</span>
                      <span className="text-[10px] font-mono text-zinc-500 block truncate">{model.category}</span>
                    </div>
                  </div>

                  <span className="font-mono text-[10px] text-emerald-400 shrink-0 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {model.hash}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-white/5 pb-4">
              <div className="w-36 h-48 sm:w-40 sm:h-52 rounded-2xl bg-gradient-to-b from-white/10 via-black/40 to-black border border-white/15 p-2 flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={selectedModel.name}
                    className="w-full h-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(selectedModel.id)}
                  />
                ) : selectedModel.type === 'ped' ? (
                  <User className="w-16 h-16 text-zinc-600" />
                ) : (
                  <Box className="w-16 h-16 text-zinc-600" />
                )}
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 border border-white/15 text-[9px] font-mono font-bold text-zinc-300">
                  {selectedModel.type.toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                      {selectedModel.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-mono font-bold text-zinc-400">
                      GTA V Native
                    </span>
                  </div>

                  <h4 className="font-display font-extrabold text-xl text-white">{selectedModel.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedModel.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  <div
                    onClick={() => handleCopy('id', selectedModel.id)}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/25 transition-colors group/copy"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Spawn Model ID</span>
                      <span className="font-mono text-xs font-bold text-white group-hover/copy:text-emerald-300 transition-colors">
                        {selectedModel.id}
                      </span>
                    </div>
                    {copiedKey === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </div>

                  <div
                    onClick={() => handleCopy('hash', selectedModel.hash)}
                    className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/25 transition-colors group/copy"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">Joaat Hash Key</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {selectedModel.hash}
                      </span>
                    </div>
                    {copiedKey === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                Spawn Coordinates & Heading
              </label>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">X Coord</span>
                  <input
                    type="text"
                    value={coords.x}
                    onChange={e => setCoords({ ...coords, x: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white text-center focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Y Coord</span>
                  <input
                    type="text"
                    value={coords.y}
                    onChange={e => setCoords({ ...coords, y: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white text-center focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Z Coord</span>
                  <input
                    type="text"
                    value={coords.z}
                    onChange={e => setCoords({ ...coords, z: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white text-center focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">Heading (0-360)</span>
                  <input
                    type="text"
                    value={coords.h}
                    onChange={e => setCoords({ ...coords, h: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-emerald-400 font-bold text-center focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              {selectedModel.type === 'ped' && (
                <div>
                  <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Ped Scenario / Idle Animation
                  </label>
                  <select
                    value={scenario}
                    onChange={e => setScenario(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    {SCENARIOS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer text-xs select-none hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={freeze}
                    onChange={e => setFreeze(e.target.checked)}
                    className="accent-emerald-400 rounded"
                  />
                  <span className="text-zinc-300 font-medium text-[11px]">Freeze Position</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer text-xs select-none hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={invincible}
                    onChange={e => setInvincible(e.target.checked)}
                    className="accent-emerald-400 rounded"
                  />
                  <span className="text-zinc-300 font-medium text-[11px]">Invincible</span>
                </label>

                {selectedModel.type === 'ped' && (
                  <label className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer text-xs select-none hover:border-white/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={blockEvents}
                      onChange={e => setBlockEvents(e.target.checked)}
                      className="accent-emerald-400 rounded"
                    />
                    <span className="text-zinc-300 font-medium text-[11px]">Block Events</span>
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-sm text-white">FiveM Lua Spawner Code</h4>
              <div className="flex items-center gap-2">
                {selectedModel.type === 'ped' && (
                  <button
                    onClick={() => handleCopy('ox', oxTargetHook)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'ox' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>ox_target Hook</span>
                  </button>
                )}

                <button
                  onClick={() => handleCopy('lua', clientLuaCode)}
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
              {clientLuaCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
