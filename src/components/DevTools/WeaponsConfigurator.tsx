import React, { useState, useMemo } from 'react';
import { Crosshair, Search, Copy, Check, Shield, Sliders, Layers } from 'lucide-react';

interface WeaponComponent {
  name: string;
  hash: string;
  description: string;
}

interface WeaponData {
  id: string;
  name: string;
  hashName: string;
  hexHash: string;
  decHash: number;
  category: 'Handguns' | 'SMG' | 'Shotguns' | 'Rifles' | 'MG' | 'Snipers' | 'Heavy' | 'Melee' | 'Throwables';
  ammoType: string;
  clipSize: number;
  damage: number;
  components: WeaponComponent[];
}

const WEAPONS_DATABASE: WeaponData[] = [
  {
    id: 'weapon_pistol',
    name: 'Pistol 9mm',
    hashName: 'WEAPON_PISTOL',
    hexHash: '0x1B06D571',
    decHash: 453432689,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 12,
    damage: 26,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_PISTOL_CLIP_01', description: 'Standard 12-round magazine' },
      { name: 'Extended Clip', hash: 'COMPONENT_PISTOL_CLIP_02', description: 'Extended 16-round magazine' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Tactical rail mounted flashlight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP_02', description: 'Sound suppressor for stealth' },
      { name: 'Yusuf Amir Luxury Finish', hash: 'COMPONENT_PISTOL_VARMOD_LUXE', description: 'Engraved gold finish' }
    ]
  },
  {
    id: 'weapon_combatpistol',
    name: 'Combat Pistol',
    hashName: 'WEAPON_COMBATPISTOL',
    hexHash: '0x5EF9FCDE',
    decHash: 1593441988,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 16,
    damage: 27,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_COMBATPISTOL_CLIP_01', description: 'Standard 16-round magazine' },
      { name: 'Extended Clip', hash: 'COMPONENT_COMBATPISTOL_CLIP_02', description: 'Extended 20-round magazine' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Tactical weapon flashlight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Tactical suppressor' },
      { name: 'Luxury Finish', hash: 'COMPONENT_COMBATPISTOL_VARMOD_LOWRIDER', description: 'Lowrider custom engraving' }
    ]
  },
  {
    id: 'weapon_appistol',
    name: 'AP Pistol (Automatic)',
    hashName: 'WEAPON_APPISTOL',
    hexHash: '0x22D8FE39',
    decHash: 584646201,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 18,
    damage: 29,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_APPISTOL_CLIP_01', description: '18-round automatic mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_APPISTOL_CLIP_02', description: '36-round extended mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Weapon mounted light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'AP suppressor' },
      { name: 'Luxury Finish', hash: 'COMPONENT_APPISTOL_VARMOD_LUXE', description: 'Gilded luxury finish' }
    ]
  },
  {
    id: 'weapon_pistol50',
    name: 'Pistol .50 (Desert Eagle)',
    hashName: 'WEAPON_PISTOL50',
    hexHash: '0x99AEEB3B',
    decHash: -1716589765,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 9,
    damage: 51,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_PISTOL50_CLIP_01', description: '9-round high caliber mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_PISTOL50_CLIP_02', description: '12-round extended mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Tactical light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Heavy .50 suppressor' }
    ]
  },
  {
    id: 'weapon_stungun',
    name: 'Taser / Stun Gun',
    hashName: 'WEAPON_STUNGUN',
    hexHash: '0x365604D0',
    decHash: 911657153,
    category: 'Handguns',
    ammoType: 'AMMO_STUNGUN',
    clipSize: 1,
    damage: 1,
    components: []
  },
  {
    id: 'weapon_smg',
    name: 'SMG (MP5)',
    hashName: 'WEAPON_SMG',
    hexHash: '0x2BE6766B',
    decHash: 736523883,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 30,
    damage: 22,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_SMG_CLIP_01', description: '30-round box magazine' },
      { name: 'Extended Clip', hash: 'COMPONENT_SMG_CLIP_02', description: '45-round extended magazine' },
      { name: 'Drum Magazine', hash: 'COMPONENT_SMG_CLIP_03', description: '100-round drum magazine' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Tactical weapon light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO_02', description: 'Red dot holographic sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Tactical SMG suppressor' },
      { name: 'Yusuf Amir Finish', hash: 'COMPONENT_SMG_VARMOD_LUXE', description: 'Luxury gold finish' }
    ]
  },
  {
    id: 'weapon_microsmg',
    name: 'Micro SMG (Uzi)',
    hashName: 'WEAPON_MICROSMG',
    hexHash: '0x13532244',
    decHash: 324215364,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 16,
    damage: 21,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_MICROSMG_CLIP_01', description: '16-round magazine' },
      { name: 'Extended Clip', hash: 'COMPONENT_MICROSMG_CLIP_02', description: '30-round magazine' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Weapon light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO', description: 'Holographic sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Micro SMG suppressor' }
    ]
  },
  {
    id: 'weapon_pumpshotgun',
    name: 'Pump Shotgun',
    hashName: 'WEAPON_PUMPSHOTGUN',
    hexHash: '0x1D073A89',
    decHash: 487013001,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 8,
    damage: 67,
    components: [
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Mounted shotgun flashlight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_SR_SUPP', description: '12-gauge shotgun suppressor' },
      { name: 'Luxury Finish', hash: 'COMPONENT_PUMPSHOTGUN_VARMOD_LOWRIDER', description: 'Lowrider custom engraving' }
    ]
  },
  {
    id: 'weapon_carbinerifle',
    name: 'Carbine Rifle (M4A1)',
    hashName: 'WEAPON_CARBINERIFLE',
    hexHash: '0x83BF0278',
    decHash: -2084633992,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 32,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_CARBINERIFLE_CLIP_01', description: 'Standard 30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_CARBINERIFLE_CLIP_02', description: 'Extended 60-round mag' },
      { name: 'Drum Magazine', hash: 'COMPONENT_CARBINERIFLE_CLIP_03', description: '100-round drum mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Tactical rail light' },
      { name: 'Medium Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM', description: 'ACOG 4x medium optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: '5.56 tactical suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Vertical foregrip' },
      { name: 'Yusuf Amir Finish', hash: 'COMPONENT_CARBINERIFLE_VARMOD_LUXE', description: 'Gold plated luxury finish' }
    ]
  },
  {
    id: 'weapon_assaultrifle',
    name: 'Assault Rifle (AK-47)',
    hashName: 'WEAPON_ASSAULTRIFLE',
    hexHash: '0xBFEFFF6D',
    decHash: -1074790547,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 30,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_ASSAULTRIFLE_CLIP_01', description: '30-round banana mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_ASSAULTRIFLE_CLIP_02', description: '60-round extended mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_ASSAULTRIFLE_CLIP_03', description: '100-round drum mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Tactical weapon light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO', description: 'Cobra red dot optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: '7.62 heavy suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Tactical angled grip' }
    ]
  },
  {
    id: 'weapon_specialcarbine',
    name: 'Special Carbine (G36C)',
    hashName: 'WEAPON_SPECIALCARBINE',
    hexHash: '0xC0A3098D',
    decHash: -1063025011,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 34,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_SPECIALCARBINE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_SPECIALCARBINE_CLIP_02', description: '60-round mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_SPECIALCARBINE_CLIP_03', description: '100-round drum mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Weapon light' },
      { name: 'Medium Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM', description: 'Tactical optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Foregrip' }
    ]
  },
  {
    id: 'weapon_sniperrifle',
    name: 'Sniper Rifle',
    hashName: 'WEAPON_SNIPERRIFLE',
    hexHash: '0x05FC3C11',
    decHash: 100416529,
    category: 'Snipers',
    ammoType: 'AMMO_SNIPER',
    clipSize: 10,
    damage: 101,
    components: [
      { name: 'Advanced Scope', hash: 'COMPONENT_AT_SCOPE_MAX', description: 'High magnification variable zoom scope' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Heavy caliber sniper suppressor' }
    ]
  },
  {
    id: 'weapon_heavysniper',
    name: 'Heavy Sniper (.50 BMG)',
    hashName: 'WEAPON_HEAVYSNIPER',
    hexHash: '0x0C472FE2',
    decHash: 205991906,
    category: 'Snipers',
    ammoType: 'AMMO_SNIPER',
    clipSize: 6,
    damage: 216,
    components: [
      { name: 'Advanced Scope', hash: 'COMPONENT_AT_SCOPE_MAX', description: 'Max magnification optic' }
    ]
  },
  {
    id: 'weapon_knife',
    name: 'Combat Knife',
    hashName: 'WEAPON_KNIFE',
    hexHash: '0x99B507EA',
    decHash: -1716189206,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 30,
    components: []
  },
  {
    id: 'weapon_bat',
    name: 'Baseball Bat',
    hashName: 'WEAPON_BAT',
    hexHash: '0x958798FB',
    decHash: -1786099057,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 30,
    components: []
  }
];

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
  const [category, setCategory] = useState<'All' | 'Handguns' | 'SMG' | 'Shotguns' | 'Rifles' | 'Snipers' | 'Melee'>('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedWeapon = useMemo(() => {
    return WEAPONS_DATABASE.find(w => w.id === selectedWeaponId) || WEAPONS_DATABASE[0];
  }, [selectedWeaponId]);

  const toggleComponent = (compHash: string) => {
    setSelectedComponents(prev =>
      prev.includes(compHash) ? prev.filter(c => c !== compHash) : [...prev, compHash]
    );
  };

  const filteredWeapons = useMemo(() => {
    return WEAPONS_DATABASE.filter(w => {
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
    setTimeout(() => setCopiedKey(null), 1800);
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
              Complete GTA V weapon database with attachments, tints, ammo types, and 1-click Lua & ox_inventory generation.
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

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['All', 'Handguns', 'SMG', 'Shotguns', 'Rifles', 'Snipers', 'Melee'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
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

          <div data-lenis-prevent className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
            {filteredWeapons.map(weapon => {
              const active = selectedWeaponId === weapon.id;
              return (
                <div
                  key={weapon.id}
                  onClick={() => {
                    setSelectedWeaponId(weapon.id);
                    setSelectedComponents([]);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
                    active
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                      : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block truncate">{weapon.name}</span>
                    <span className="font-mono text-[10px] text-zinc-400 block truncate">{weapon.hashName}</span>
                  </div>

                  <div className="text-right font-mono text-[10px] text-zinc-500 shrink-0">
                    <span className="text-emerald-400 font-bold block">{weapon.ammoType}</span>
                    <span>{weapon.hexHash}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {selectedWeapon.category}
                </span>
                <h4 className="font-display font-extrabold text-base text-white">{selectedWeapon.name}</h4>
              </div>

              <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
                <span>Damage: <strong className="text-white">{selectedWeapon.damage}</strong></span>
                <span>Clip: <strong className="text-white">{selectedWeapon.clipSize}</strong></span>
                <span>Hash: <strong className="text-emerald-300">{selectedWeapon.hexHash}</strong></span>
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
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                  Available Attachments & Components
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedWeapon.components.map(comp => {
                    const active = selectedComponents.includes(comp.hash);
                    return (
                      <div
                        key={comp.hash}
                        onClick={() => toggleComponent(comp.hash)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                          active
                            ? 'bg-emerald-950/30 border-emerald-500/40'
                            : 'bg-zinc-900/60 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-emerald-500 cursor-pointer mt-0.5"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-white block truncate">{comp.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400 block truncate">{comp.hash}</span>
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
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 font-mono text-[11px] font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1"
                >
                  {copiedKey === 'ox' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>ox_inventory</span>
                </button>

                <button
                  onClick={() => handleCopy('lua', luaClientCode)}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-zinc-200 text-black font-mono text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
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
