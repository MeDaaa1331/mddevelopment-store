import React, { useState, useMemo } from 'react';
import { Crosshair, Search, Copy, Check, Shield, Sliders, Layers, Sparkles, Zap, Package } from 'lucide-react';
import { GTA_WEAPONS_DATABASE, WeaponData } from '../../data/gtaWeapons';
import { trackEvent } from '../../utils/analytics';

const WEAPON_TINTS = [
  { id: 0, name: 'Normal / Stock' },
  { id: 1, name: 'Green' },
  { id: 2, name: 'Gold' },
  { id: 3, name: 'Pink' },
  { id: 4, name: 'Army Camo' },
  { id: 5, name: 'LSPD Blue' },
  { id: 6, name: 'Orange' },
  { id: 7, name: 'Platinum' }
];

export const WeaponsConfigurator: React.FC = () => {
  const [selectedWeaponId, setSelectedWeaponId] = useState('weapon_carbinerifle');
  const [selectedComponents, setSelectedComponents] = useState<string[]>([
    'COMPONENT_CARBINERIFLE_CLIP_02',
    'COMPONENT_AT_AR_FLSH',
    'COMPONENT_AT_AR_SUPP'
  ]);
  const [tintIndex, setTintIndex] = useState(0);
  const [ammoAmount, setAmmoAmount] = useState(250);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'Handguns' | 'SMG' | 'Shotguns' | 'Rifles' | 'MG' | 'Snipers' | 'Heavy' | 'Melee' | 'Throwables' | 'Mk II Weapons'>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const selectedWeapon = useMemo(() => {
    return GTA_WEAPONS_DATABASE.find(w => w.id === selectedWeaponId) || GTA_WEAPONS_DATABASE[0];
  }, [selectedWeaponId]);

  const toggleComponent = (compHash: string) => {
    setSelectedComponents(prev =>
      prev.includes(compHash) ? prev.filter(c => c !== compHash) : [...prev, compHash]
    );
  };

  const filteredWeapons = useMemo(() => {
    return GTA_WEAPONS_DATABASE.filter(w => {
      if (category !== 'All' && w.category !== category) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.hashName.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q)
      );
    });
  }, [category, search]);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    trackEvent('weapons', key === 'ox' ? 'copy_ox' : 'copy_lua', selectedWeapon.name);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const getWeaponImageUrl = (w: WeaponData) => {
    if (failedImages[w.hashName]) return null;
    return `https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/${w.hashName}.png`;
  };

  const getComponentImageUrl = (hash: string) => {
    if (failedImages[hash]) return null;
    const h = hash.toUpperCase();
    if (h.includes('SUPP')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_suppressor.png';
    if (h.includes('FLSH') || h.includes('FLASH')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_flashlight.png';
    if (h.includes('GRIP')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_grip.png';
    if (h.includes('DRUM')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_clip_drum.png';
    if (h.includes('CLIP_02') || h.includes('CLIP_03') || h.includes('EXT')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_clip_extended.png';
    if (h.includes('CLIP')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_clip_extended2.png';
    if (h.includes('SCOPE_NV')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_nv.png';
    if (h.includes('SCOPE_THERMAL')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_thermal.png';
    if (h.includes('SCOPE_ADV')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_advanced.png';
    if (h.includes('SCOPE_MAX') || h.includes('SCOPE_LRG') || h.includes('SCOPE_LARGE')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_large.png';
    if (h.includes('SCOPE_MED') || h.includes('SCOPE_MEDIUM')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_medium.png';
    if (h.includes('SCOPE_HOL') || h.includes('SCOPE_HOLO')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_holo.png';
    if (h.includes('SCOPE')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_small.png';
    if (h.includes('BARREL')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_barrel.png';
    if (h.includes('MUZZLE_01') || h.includes('MUZZLE_FAT')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_muzzle_fat.png';
    if (h.includes('MUZZLE_02') || h.includes('MUZZLE_HEAVY')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_muzzle_heavy.png';
    if (h.includes('MUZZLE_03') || h.includes('MUZZLE_TACTICAL')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_muzzle_tactical.png';
    if (h.includes('MUZZLE')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_muzzle_flat.png';
    if (h.includes('COMP')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_muzzle_tactical.png';
    return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/at_scope_small.png';
  };

  const getAmmoImageUrl = (ammoType: string) => {
    const a = ammoType.toUpperCase();
    if (a.includes('9')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-9.png';
    if (a.includes('45')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-45.png';
    if (a.includes('38')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-38.png';
    if (a.includes('44')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-44.png';
    if (a.includes('50')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-50.png';
    if (a.includes('RIFLE')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-rifle.png';
    if (a.includes('SHOTGUN')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-shotgun.png';
    if (a.includes('SNIPER')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-sniper.png';
    if (a.includes('HEAVY') || a.includes('MG')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-heavysniper.png';
    if (a.includes('ROCKET') || a.includes('RPG')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-rocket.png';
    if (a.includes('FIREWORK')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-firework.png';
    if (a.includes('EMP')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-emp.png';
    if (a.includes('LASER')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-laser.png';
    if (a.includes('RAILGUN')) return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-railgun.png';
    return 'https://raw.githubusercontent.com/overextended/ox_inventory/main/web/images/ammo-rifle.png';
  };

  const handleImageError = (id: string) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  const luaClientCode = useMemo(() => {
    const compLines = selectedComponents
      .map(c => `    GiveWeaponComponentToPed(ped, GetHashKey('${selectedWeapon.hashName}'), GetHashKey('${c}'))`)
      .join('\n');

    return `local ped = PlayerPedId()
local weaponHash = GetHashKey('${selectedWeapon.hashName}')

-- Give weapon with ammo
GiveWeaponToPed(ped, weaponHash, ${ammoAmount}, false, true)
SetPedAmmo(ped, weaponHash, ${ammoAmount})
SetPedWeaponTintIndex(ped, weaponHash, ${tintIndex})

-- Equip attached components
${compLines || '    -- No components selected'}`;
  }, [selectedWeapon, selectedComponents, tintIndex, ammoAmount]);

  const oxInventoryItem = useMemo(() => {
    return `['${selectedWeapon.id}'] = {
    label = '${selectedWeapon.name}',
    weight = 2500,
    durability = 0.05,
    ammoname = '${selectedWeapon.ammoType.toLowerCase().replace('ammo_', 'ammo-')}',
    weapon = true
},`;
  }, [selectedWeapon]);

  const currentWeaponImg = getWeaponImageUrl(selectedWeapon);
  const currentAmmoImg = getAmmoImageUrl(selectedWeapon.ammoType);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Weapons & Ammo Database & Configurator</h3>
            <p className="text-xs text-zinc-400">
              Complete GTA V weapon database with visual renders, attachments, tints, ammo types, and 1-click Lua & ox_inventory generation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-emerald-400">
            {selectedWeapon.hashName}
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
                placeholder="Search weapons (M4, Pistol, AK...)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {(['All', 'Handguns', 'SMG', 'Shotguns', 'Rifles', 'MG', 'Snipers', 'Heavy', 'Melee', 'Throwables', 'Mk II Weapons'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                    category === cat
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white bg-zinc-900/60 border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div data-lenis-prevent className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredWeapons.map(weapon => {
              const active = selectedWeaponId === weapon.id;
              const imgUrl = getWeaponImageUrl(weapon);

              return (
                <div
                  key={weapon.id}
                  onClick={() => {
                    setSelectedWeaponId(weapon.id);
                    setSelectedComponents([]);
                  }}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 group ${
                    active
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/20 hover:bg-zinc-900/90'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-black/80 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative group-hover:border-white/30 transition-colors p-1">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={weapon.name}
                          className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={() => handleImageError(weapon.hashName)}
                        />
                      ) : (
                        <Crosshair className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate group-hover:text-emerald-300 transition-colors">
                        {weapon.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 block truncate">{weapon.hashName}</span>
                      <span className="text-[9px] font-mono text-zinc-500 block truncate">{weapon.category}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[10px] text-zinc-500 shrink-0 flex flex-col items-end">
                    <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[9px] mb-0.5">
                      {weapon.hexHash}
                    </span>
                    <span className="text-[9px] text-zinc-400">{weapon.ammoType.replace('AMMO_', '')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-white/5 pb-4">
              <div className="w-40 h-32 sm:w-48 sm:h-36 rounded-2xl bg-gradient-to-b from-white/10 via-black/40 to-black border border-white/15 p-3 flex items-center justify-center relative overflow-hidden shadow-2xl shrink-0 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 via-transparent to-transparent opacity-60 pointer-events-none" />

                {currentWeaponImg ? (
                  <img
                    src={currentWeaponImg}
                    alt={selectedWeapon.name}
                    className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(selectedWeapon.hashName)}
                  />
                ) : (
                  <Crosshair className="w-12 h-12 text-zinc-600" />
                )}

                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 border border-white/15 text-[9px] font-mono font-bold text-zinc-300">
                  {selectedWeapon.category.toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1 text-center sm:text-left">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                      {selectedWeapon.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-mono font-bold text-zinc-400">
                      {selectedWeapon.hexHash}
                    </span>
                  </div>

                  <h4 className="font-display font-extrabold text-xl text-white">{selectedWeapon.name}</h4>
                  <span className="font-mono text-xs text-zinc-400 block mt-0.5">{selectedWeapon.hashName}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="p-2 rounded-xl bg-zinc-900/90 border border-white/10 text-left">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Base Damage</span>
                    <span className="font-mono text-sm font-bold text-white">{selectedWeapon.damage} HP</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/90 border border-white/10 text-left">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Mag Capacity</span>
                    <span className="font-mono text-sm font-bold text-white">{selectedWeapon.clipSize} rounds</span>
                  </div>
                  <div className="p-2 rounded-xl bg-zinc-900/90 border border-white/10 text-left flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block">Ammo Type</span>
                      <span className="font-mono text-xs font-bold text-emerald-400 truncate block">
                        {selectedWeapon.ammoType.replace('AMMO_', '')}
                      </span>
                    </div>
                    {currentAmmoImg && (
                      <img src={currentAmmoImg} alt="Ammo" className="w-6 h-6 object-contain shrink-0 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Ammo Amount: <span className="text-white">{ammoAmount} rounds</span>
                </label>
                <input
                  type="number"
                  value={ammoAmount}
                  onChange={e => setAmmoAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Weapon Tint (Skin)
                </label>
                <select
                  value={tintIndex}
                  onChange={e => setTintIndex(parseInt(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-white focus:outline-none focus:border-white/30"
                >
                  {WEAPON_TINTS.map(t => (
                    <option key={t.id} value={t.id}>
                      Tint #{t.id} - {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedWeapon.components.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                    Available Attachments & Components ({selectedWeapon.components.length})
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {selectedComponents.length} equipped
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedWeapon.components.map(comp => {
                    const active = selectedComponents.includes(comp.hash);
                    const compImg = getComponentImageUrl(comp.hash);

                    return (
                      <div
                        key={comp.hash}
                        onClick={() => toggleComponent(comp.hash)}
                        className={`p-2.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 group ${
                          active
                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                            : 'bg-zinc-900/60 border-white/5 hover:border-white/20 hover:bg-zinc-900/90'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-black/80 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 p-1 group-hover:border-white/25 transition-colors">
                            {compImg ? (
                              <img
                                src={compImg}
                                alt={comp.name}
                                className="w-full h-full object-contain drop-shadow"
                                onError={() => handleImageError(comp.hash)}
                              />
                            ) : (
                              <Crosshair className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate group-hover:text-emerald-300 transition-colors">
                              {comp.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 block truncate">{comp.hash}</span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                            active
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'border-white/20 bg-zinc-900'
                          }`}
                        >
                          {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-sm text-white">Generated FiveM Client Lua</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('ox', oxInventoryItem)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'ox' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>ox_inventory</span>
                </button>

                <button
                  onClick={() => handleCopy('lua', luaClientCode)}
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
              {luaClientCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
