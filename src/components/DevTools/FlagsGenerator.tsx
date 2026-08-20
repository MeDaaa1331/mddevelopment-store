import React, { useState, useMemo } from 'react';
import { Flag, Search, Copy, Check, RotateCcw, SlidersHorizontal, Sparkles, Layers, Code } from 'lucide-react';

interface FlagDefinition {
  bit: number;
  name: string;
  hex: string;
  dec: number;
  description: string;
}

interface FlagCategory {
  id: string;
  name: string;
  description: string;
  flags: FlagDefinition[];
}

const FLAG_CATEGORIES: FlagCategory[] = [
  {
    id: 'CBaseArchetypeDefFlags',
    name: 'CBaseArchetypeDefFlags (YTYP / Mapping)',
    description: 'Archetype definition flags for GTA V props, buildings, and ytyp map assets.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'FLAG_WET_REFLECTION', description: 'Enables wet road/surface reflections on the object mesh.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'FLAG_DONT_CAST_SHADOWS', description: 'Prevents the object from casting dynamic shadows.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'FLAG_DONT_RECEIVE_SHADOWS', description: 'Prevents shadows from being cast onto this object.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'FLAG_DONT_COLLIDE_WITH_FLYER', description: 'Disables collision against planes, helicopters, and flying vehicles.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'FLAG_IS_ALPHA', description: 'Entity uses alpha transparency textures.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'FLAG_IS_TRANSLUCENT', description: 'Enables translucent rendering pass (tinted glass, water, etc.).' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'FLAG_HAS_SHADOW_PROXY', description: 'Object utilizes a custom shadow proxy mesh.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'FLAG_IS_VEHICLE', description: 'Designates the archetype as a vehicle component or vehicle body.' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'FLAG_IS_DESTRUCTIBLE', description: 'Object can be damaged, broken, or knocked down.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'FLAG_IS_EXPLOSIVE', description: 'Object explodes when destroyed or damaged by gunfire/fire.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'FLAG_IS_DOOR', description: 'Archetype is an interactive door or gate.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'FLAG_IS_LIGHT', description: 'Entity has an attached street light, lamp, or emissive light fixture.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'FLAG_ANIMATED', description: 'Object has animated bones, mesh morphing, or vertex animation.' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'FLAG_STATIC', description: 'Static entity that never moves and is baked into world streaming.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'FLAG_HAS_DECALS', description: 'Allows bullet holes, blood, and tire marks to be projected onto surface.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'FLAG_IS_ROAD', description: 'Surface classified as a road or drivable highway.' },
      { bit: 16, dec: 65536, hex: '0x00010000', name: 'FLAG_IS_TREE', description: 'Foliage/tree archetype with wind swaying vertex shaders.' },
      { bit: 17, dec: 131072, hex: '0x00020000', name: 'FLAG_IS_WATER', description: 'Entity acts as water surface with buoyancy.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'FLAG_IS_GLASS', description: 'Breakable window/glass pane that shatters upon impact.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'FLAG_IS_GRASS', description: 'Procedural grass and terrain foliage layer.' },
      { bit: 20, dec: 1048576, hex: '0x00100000', name: 'FLAG_LOD', description: 'Level of Detail (LOD) model used for distance rendering.' },
      { bit: 21, dec: 2097152, hex: '0x00200000', name: 'FLAG_SLOD1', description: 'Super LOD Level 1 mesh.' },
      { bit: 22, dec: 4194304, hex: '0x00400000', name: 'FLAG_SLOD2', description: 'Super LOD Level 2 mesh.' },
      { bit: 23, dec: 8388608, hex: '0x00800000', name: 'FLAG_SLOD3', description: 'Super LOD Level 3 mesh.' },
      { bit: 24, dec: 16777216, hex: '0x01000000', name: 'FLAG_SLOD4', description: 'Super LOD Level 4 mesh.' },
      { bit: 25, dec: 33554432, hex: '0x02000000', name: 'FLAG_OCCLUSION', description: 'Occlusion mesh used to cull hidden geometry behind walls.' },
      { bit: 26, dec: 67108864, hex: '0x04000000', name: 'FLAG_DONT_FADE', description: 'Object will not fade out at far streaming distances.' },
      { bit: 27, dec: 134217728, hex: '0x08000000', name: 'FLAG_EMISSIVE', description: 'Object contains night-emissive or illuminated neon textures.' },
      { bit: 28, dec: 268435456, hex: '0x10000000', name: 'FLAG_DRAW_LAST', description: 'Forces the renderer to draw this model in the final rendering pass.' },
      { bit: 29, dec: 536870912, hex: '0x20000000', name: 'FLAG_HAS_CLOTH', description: 'Entity has cloth simulation physics (flags, banners, curtains).' },
      { bit: 30, dec: 1073741824, hex: '0x40000000', name: 'FLAG_HAS_UV_ANIM', description: 'Object uses animated scrolling UV coordinates (waterfalls, screens).' }
    ]
  },
  {
    id: 'CVehicleModelInfoFlags',
    name: 'CVehicleModelInfoFlags (vehicles.meta)',
    description: 'Vehicle model archetype flags controlling physics, open-top, sirens, and extras.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'FLAG_BIG', description: 'Large vehicle model classification.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'FLAG_NO_BOOT', description: 'Vehicle has no trunk / boot compartment.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'FLAG_ONLY_DURING_OFFICE_HOURS', description: 'Vehicle only spawns in traffic during daytime office hours.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'FLAG_BOOT_IN_FRONT', description: 'Trunk / storage is located at the front of the vehicle.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'FLAG_IS_VAN', description: 'Classified as a van / cargo vehicle.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'FLAG_AVOID_TURNS', description: 'AI drivers avoid tight turns with this vehicle.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'FLAG_HAS_LIVERY', description: 'Vehicle supports custom livery paint jobs and textures.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'FLAG_EXTRAS_REQUIRE', description: 'Vehicle requires specific extra components to spawn.' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'FLAG_DONT_SPAWN_IN_CARGEN', description: 'Prevents random world ambient car generation spawning.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'FLAG_IS_OFFROAD', description: 'Vehicle has specialized offroad capabilities.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'FLAG_CAN_BE_DRIVEN_ON_SNOW', description: 'Maintains traction on snow and icy surfaces.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'FLAG_DELIVERY', description: 'Commercial delivery vehicle.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'FLAG_DUMP', description: 'Dump truck with hydraulic tilting bed.' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'FLAG_HAS_BULLET_RESISTANT_GLASS', description: 'Equipped with armored bullet-resistant glass windows.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'FLAG_IS_ELECTRIC', description: 'Electric vehicle drivetrain with electric audio sound effects.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'FLAG_EMERGENCY_SERVICE', description: 'Emergency services vehicle (Police, EMS, Fire).' },
      { bit: 16, dec: 65536, hex: '0x00010000', name: 'FLAG_IS_BUS', description: 'Bus vehicle with passenger seating layout.' },
      { bit: 17, dec: 131072, hex: '0x00020000', name: 'FLAG_IS_LOWRIDER', description: 'Lowrider vehicle with active hydraulics controls.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'FLAG_HAS_EXTRA_BOOT_SEATS', description: 'Supports passengers riding in the rear cargo/boot area.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'FLAG_OPEN_TOP', description: 'Convertible or open roof vehicle.' },
      { bit: 20, dec: 1048576, hex: '0x00100000', name: 'FLAG_IGNORE_ON_SIDE_CHECK', description: 'Ignores rollover detection when tilted on side.' },
      { bit: 21, dec: 2097152, hex: '0x00200000', name: 'FLAG_LAW_ENFORCEMENT', description: 'Law enforcement vehicle with police radio chatter.' }
    ]
  },
  {
    id: 'HandlingFlags',
    name: 'HandlingFlags (handling.meta)',
    description: 'Vehicle handling flags controlling ABS, TCS, boost, hydraulics, and drift physics.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'FLAG_SMOOTH_FIRST_GEAR', description: 'Provides smooth acceleration in first gear without wheelspin.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'FLAG_SPECIAL_FLIGHT', description: 'Enables Oppressor / Deluxo hover and flight physics mode.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'FLAG_EXT_WHEEL_DAMAGE', description: 'Extended wheel damage and deformation.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'FLAG_HYDRAULICS', description: 'Enables hydraulic suspension bounce and jumping.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'FLAG_KERS', description: 'KERS kinetic energy recovery boost system.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'FLAG_ROCKET_BOOST', description: 'Rocket booster propulsion system.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'FLAG_TRACK_AI', description: 'Track racing AI behavior.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'FLAG_CAN_REDUCE_GEARS', description: 'Allows transmission downshifting.' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'FLAG_OFFROAD_ABILITIES', description: 'Enhanced offroad grip and suspension travel.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'FLAG_DRIFT_TIRES', description: 'Low friction drift tire physics.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'FLAG_ABS', description: 'Anti-lock braking system.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'FLAG_TCS', description: 'Traction control system.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'FLAG_INCREASED_CAMBER', description: 'Increased wheel negative camber angle.' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'FLAG_SUBMARINE', description: 'Submersible vehicle water propulsion capabilities.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'FLAG_PARACHUTE', description: 'Vehicle has deployable parachute system.' }
    ]
  },
  {
    id: 'CExtensionDefFlags',
    name: 'CExtensionDefFlags (YTYP Extensions)',
    description: 'Archetype extension flags for doors, ladders, lights, and audio emitters.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'FLAG_DOOR', description: 'Door extension with hinge swing and lock states.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'FLAG_LADDER', description: 'Climbable ladder extension for players.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'FLAG_LIGHT', description: 'Attached light source extension.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'FLAG_AUDIO', description: 'Spatial audio emitter extension.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'FLAG_EXPRESSION', description: 'Facial/expression animation extension.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'FLAG_PARTICLE', description: 'Particle effect emitter extension.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'FLAG_PROC_OBJECT', description: 'Procedurally generated object extension.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'FLAG_BUOYANCY', description: 'Water buoyancy physics extension.' }
    ]
  }
];

export const FlagsGenerator: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('CBaseArchetypeDefFlags');
  const [flagValue, setFlagValue] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentCategory = useMemo(() => {
    return FLAG_CATEGORIES.find(c => c.id === selectedCategoryId) || FLAG_CATEGORIES[0];
  }, [selectedCategoryId]);

  const handleDecimalChange = (valStr: string) => {
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setFlagValue(parsed);
    } else if (valStr === '') {
      setFlagValue(0);
    }
  };

  const handleHexChange = (hexStr: string) => {
    const clean = hexStr.replace(/^0x/i, '');
    const parsed = parseInt(clean, 16);
    if (!isNaN(parsed) && parsed >= 0) {
      setFlagValue(parsed);
    } else if (clean === '') {
      setFlagValue(0);
    }
  };

  const toggleFlag = (dec: number) => {
    setFlagValue(prev => (prev & dec ? prev & ~dec : prev | dec));
  };

  const isFlagActive = (dec: number) => {
    return (flagValue & dec) !== 0;
  };

  const activeCount = useMemo(() => {
    return currentCategory.flags.filter(f => isFlagActive(f.dec)).length;
  }, [currentCategory, flagValue]);

  const filteredFlags = useMemo(() => {
    if (!search.trim()) return currentCategory.flags;
    const q = search.toLowerCase();
    return currentCategory.flags.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.hex.toLowerCase().includes(q) ||
        f.dec.toString().includes(q) ||
        `bit ${f.bit}`.includes(q)
    );
  }, [currentCategory, search]);

  const handleCopy = (key: string, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const hexString = '0x' + (flagValue >>> 0).toString(16).toUpperCase().padStart(8, '0');
  const binaryString = (flagValue >>> 0).toString(2).padStart(32, '0').match(/.{1,4}/g)?.join(' ') || '';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">FiveM & GTA V Flags Generator</h3>
            <p className="text-xs text-zinc-400">
              Interactive bitwise flag calculator for YTYP archetypes, vehicle flags, and handling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFlagValue(0)}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (0)</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs w-fit overflow-x-auto max-w-full">
        {FLAG_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategoryId(cat.id);
              setSearch('');
            }}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all whitespace-nowrap ${
              selectedCategoryId === cat.id ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {cat.name.split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-4 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Decimal Value (Integer)
            </label>
            <div className="relative">
              <input
                type="number"
                value={flagValue}
                onChange={e => handleDecimalChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-sm font-bold text-white focus:outline-none focus:border-white/30"
              />
              <button
                onClick={() => handleCopy('dec', flagValue.toString())}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Copy Decimal"
              >
                {copiedKey === 'dec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Hexadecimal (Hex)
            </label>
            <div className="relative">
              <input
                type="text"
                value={hexString}
                onChange={e => handleHexChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-sm font-bold text-emerald-400 focus:outline-none focus:border-white/30 uppercase"
              />
              <button
                onClick={() => handleCopy('hex', hexString)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="Copy Hex"
              >
                {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Binary (32-Bit)
            </label>
            <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-zinc-300 break-all select-all">
              {binaryString}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block flex items-center justify-between">
              <span>Code Snippets</span>
            </label>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-400 truncate">
                  &lt;flags value="{flagValue}"/&gt;
                </span>
                <button
                  onClick={() => handleCopy('xml', `<flags value="${flagValue}"/>`)}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                >
                  {copiedKey === 'xml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-400 truncate">
                  flags = {flagValue}
                </span>
                <button
                  onClick={() => handleCopy('lua', `flags = ${flagValue}`)}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                >
                  {copiedKey === 'lua' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Active Flags:</span>
            <span className="font-mono font-bold text-emerald-400">
              {activeCount} / {currentCategory.flags.length} selected
            </span>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search flag by name, bit, or description..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredFlags.map(flag => {
              const active = isFlagActive(flag.dec);
              return (
                <div
                  key={flag.bit}
                  onClick={() => toggleFlag(flag.dec)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 group ${
                    active
                      ? 'bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950/80 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {}}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {flag.name}
                        </span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-black/60 text-zinc-400 rounded border border-white/10">
                          Bit {flag.bit}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-zinc-500">{flag.hex}</span>
                        <span className="text-zinc-400">({flag.dec})</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 leading-snug">
                      {flag.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
