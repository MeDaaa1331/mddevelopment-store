import React, { useState, useMemo } from 'react';
import { MapPin, Search, Copy, Check, Radio, Eye, Sliders, Layers, Sparkles } from 'lucide-react';
import { GTA_BLIP_SPRITES, GTA_BLIP_COLOURS } from '../../data/gtaBlips';

export const BlipDesigner: React.FC = () => {
  const [spriteId, setSpriteId] = useState(357);
  const [colourId, setColourId] = useState(3);
  const [label, setLabel] = useState('Legion Public Parking');
  const [scale, setScale] = useState(0.85);
  const [display, setDisplay] = useState(2);
  const [shortRange, setShortRange] = useState(true);
  const [flashing, setFlashing] = useState(false);
  const [alpha, setAlpha] = useState(255);
  const [coords, setCoords] = useState({ x: '215.34', y: '-805.12', z: '30.82' });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'Shops' | 'Services' | 'Crime' | 'Vehicles' | 'Properties' | 'Activities' | 'DLC & Special'>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedSprite = useMemo(() => {
    return GTA_BLIP_SPRITES.find(s => s.id === spriteId) || GTA_BLIP_SPRITES[0];
  }, [spriteId]);

  const selectedColour = useMemo(() => {
    return GTA_BLIP_COLOURS.find(c => c.id === colourId) || GTA_BLIP_COLOURS[0];
  }, [colourId]);

  const filteredSprites = useMemo(() => {
    return GTA_BLIP_SPRITES.filter(s => {
      if (category !== 'All' && s.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.id.toString().includes(q);
    });
  }, [category, search]);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const luaCode = useMemo(() => {
    return `CreateThread(function()
    local blip = AddBlipForCoord(${coords.x}, ${coords.y}, ${coords.z})

    SetBlipSprite(blip, ${spriteId})
    SetBlipColour(blip, ${colourId})
    SetBlipScale(blip, ${scale.toFixed(2)})
    SetBlipDisplay(blip, ${display})
    SetBlipAsShortRange(blip, ${shortRange ? 'true' : 'false'})${flashing ? '\n    SetBlipFlashes(blip, true)' : ''}${alpha < 255 ? `\n    SetBlipAlpha(blip, ${alpha})` : ''}

    BeginTextCommandSetBlipName("STRING")
    AddTextComponentSubstringPlayerName('${label.replace(/'/g, "\\'")}')
    EndTextCommandSetBlipName(blip)
end)`;
  }, [coords, spriteId, colourId, scale, display, shortRange, flashing, alpha, label]);

  const oxLibConfig = useMemo(() => {
    return `blip = {
    coords = vec3(${coords.x}, ${coords.y}, ${coords.z}),
    sprite = ${spriteId},
    color = ${colourId},
    scale = ${scale.toFixed(2)},
    label = '${label.replace(/'/g, "\\'")}',
    shortRange = ${shortRange ? 'true' : 'false'}
}`;
  }, [coords, spriteId, colourId, scale, label, shortRange]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">GTA V Blip & Radar Designer</h3>
            <p className="text-xs text-zinc-400">
              Interactive visual editor for GTA V map blips, radar colors, short-range toggles, and live radar simulation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 text-xs font-mono font-bold text-zinc-300">
            Sprite #{spriteId} • Color #{colourId}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-5 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Blip Configuration</span>
            </h4>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Blip Text Label
              </label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Legion Square Parking"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Coordinates (X, Y, Z)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={coords.x}
                  onChange={e => setCoords({ ...coords, x: e.target.value })}
                  placeholder="X"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30 text-center"
                />
                <input
                  type="text"
                  value={coords.y}
                  onChange={e => setCoords({ ...coords, y: e.target.value })}
                  placeholder="Y"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30 text-center"
                />
                <input
                  type="text"
                  value={coords.z}
                  onChange={e => setCoords({ ...coords, z: e.target.value })}
                  placeholder="Z"
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30 text-center"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  Scale: <span className="text-white">{scale.toFixed(2)}</span>
                </label>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.0"
                step="0.05"
                value={scale}
                onChange={e => setScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Blip Colour: <span style={{ color: selectedColour.hex }}>{selectedColour.name} (#{colourId})</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 rounded-xl bg-zinc-900/60 border border-white/5 max-h-32 overflow-y-auto">
                {GTA_BLIP_COLOURS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColourId(c.id)}
                    className={`h-7 rounded-lg transition-all flex items-center justify-center relative ${
                      colourId === c.id ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (#${c.id})`}
                  >
                    {colourId === c.id && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={shortRange}
                  onChange={e => setShortRange(e.target.checked)}
                  className="accent-emerald-400 rounded"
                />
                <span className="text-zinc-300 font-medium text-[11px]">Short Range (Radar)</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-white/5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={flashing}
                  onChange={e => setFlashing(e.target.checked)}
                  className="accent-emerald-400 rounded"
                />
                <span className="text-zinc-300 font-medium text-[11px]">Pulse / Flashing</span>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/80 border border-white/10 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
            <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              GTA V Radar Simulator
            </div>

            <div className="w-32 h-32 rounded-full border-2 border-zinc-700 bg-zinc-900/90 relative flex items-center justify-center shadow-inner overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950/80 to-black/90 pointer-events-none" />
              <div className="absolute w-full h-[1px] bg-zinc-700/50" />
              <div className="absolute h-full w-[1px] bg-zinc-700/50" />
              <div className="absolute w-2 h-2 rounded-full bg-white shadow-sm" />

              <div
                className={`absolute transition-all flex flex-col items-center pointer-events-none ${
                  flashing ? 'animate-ping' : ''
                }`}
                style={{
                  transform: `scale(${scale})`,
                  color: selectedColour.hex
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shadow-md border border-black/40"
                  style={{ backgroundColor: selectedColour.hex, color: colourId === 0 ? '#000' : '#FFF' }}
                >
                  {spriteId}
                </div>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-white text-center truncate max-w-full">
              {label || 'Unnamed Blip'}
            </span>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="font-display font-extrabold text-sm text-white">Select Blip Sprite</h4>
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search sprite (garage, shop, bank...)"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['All', 'Vehicles', 'Shops', 'Services', 'Properties', 'Crime', 'Activities'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                    category === cat ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div data-lenis-prevent className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredSprites.map(sprite => {
                const active = spriteId === sprite.id;
                return (
                  <div
                    key={sprite.id}
                    onClick={() => setSpriteId(sprite.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2 ${
                      active
                        ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                        : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-sm"
                        style={{
                          backgroundColor: active ? selectedColour.hex : '#27272a',
                          color: active && colourId === 0 ? '#000' : '#FFF'
                        }}
                      >
                        {sprite.id}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-white block truncate">{sprite.name}</span>
                        <span className="text-[10px] text-zinc-400 truncate block">{sprite.category}</span>
                      </div>
                    </div>

                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-black/40 text-zinc-400">
                      #{sprite.id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-sm text-white">FiveM Lua Snippet</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('ox', oxLibConfig)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1"
                >
                  {copiedKey === 'ox' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>ox_lib Config</span>
                </button>

                <button
                  onClick={() => handleCopy('lua', luaCode)}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-mono text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                >
                  {copiedKey === 'lua' ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Lua Code</span>
                </button>
              </div>
            </div>

            <pre
              data-lenis-prevent
              className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-48"
            >
              {luaCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
