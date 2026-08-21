import React, { useState } from 'react';
import { Gamepad2, Search, Copy, Check, Code2, Sparkles } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

interface GTAControl {
  id: number;
  name: string;
  key: string;
  category: 'foot' | 'veh' | 'combat' | 'general';
  description: string;
}

const CONTROLS_DATA: GTAControl[] = [
  { id: 38, name: 'INPUT_CONTEXT', key: 'E', category: 'foot', description: 'Context interaction / Open menu' },
  { id: 23, name: 'INPUT_ENTER', key: 'F', category: 'foot', description: 'Enter vehicle / Secondary interact' },
  { id: 47, name: 'INPUT_DETONATE', key: 'G', category: 'foot', description: 'Detonate / Special action' },
  { id: 22, name: 'INPUT_JUMP', key: 'SPACE', category: 'foot', description: 'Jump / Handbrake' },
  { id: 21, name: 'INPUT_SPRINT', key: 'LEFT SHIFT', category: 'foot', description: 'Sprint / Boost' },
  { id: 36, name: 'INPUT_DUCK', key: 'LEFT CTRL', category: 'foot', description: 'Crouch / Stealth mode' },
  { id: 29, name: 'INPUT_SPECIAL_ABILITY_SECONDARY', key: 'B', category: 'foot', description: 'Point finger / Special action' },
  { id: 45, name: 'INPUT_RELOAD', key: 'R', category: 'combat', description: 'Reload weapon' },
  { id: 24, name: 'INPUT_ATTACK', key: 'LEFT MOUSE', category: 'combat', description: 'Attack / Shoot' },
  { id: 25, name: 'INPUT_AIM', key: 'RIGHT MOUSE', category: 'combat', description: 'Aim down sights' },
  { id: 37, name: 'INPUT_SELECT_WEAPON', key: 'TAB', category: 'combat', description: 'Weapon wheel / Quick select' },
  { id: 71, name: 'INPUT_VEH_ACCELERATE', key: 'W', category: 'veh', description: 'Accelerate vehicle' },
  { id: 72, name: 'INPUT_VEH_BRAKE', key: 'S', category: 'veh', description: 'Brake / Reverse vehicle' },
  { id: 59, name: 'INPUT_VEH_MOVE_LR', key: 'A / D', category: 'veh', description: 'Steer vehicle Left/Right' },
  { id: 76, name: 'INPUT_VEH_HANDBRAKE', key: 'SPACE', category: 'veh', description: 'Vehicle handbrake' },
  { id: 86, name: 'INPUT_VEH_HORN', key: 'E', category: 'veh', description: 'Vehicle horn / Siren toggle' },
  { id: 74, name: 'INPUT_VEH_HEADLIGHT', key: 'H', category: 'veh', description: 'Vehicle headlights' },
  { id: 75, name: 'INPUT_VEH_EXIT', key: 'F', category: 'veh', description: 'Exit vehicle' },
  { id: 81, name: 'INPUT_VEH_NEXT_RADIO', key: '.', category: 'veh', description: 'Next radio station' },
  { id: 82, name: 'INPUT_VEH_PREV_RADIO', key: ',', category: 'veh', description: 'Previous radio station' },
  { id: 199, name: 'INPUT_FRONTEND_PAUSE', key: 'ESC / P', category: 'general', description: 'Pause menu' },
  { id: 244, name: 'INPUT_INTERACTION_MENU', key: 'M', category: 'general', description: 'Interaction menu' },
  { id: 288, name: 'INPUT_REPLAY_START_STOP_RECORDING', key: 'F1', category: 'general', description: 'F1 Special function' },
  { id: 289, name: 'INPUT_REPLAY_START_STOP_RECORDING_SECONDARY', key: 'F2', category: 'general', description: 'F2 Inventory / Menu' },
  { id: 170, name: 'INPUT_SAVE_REPLAY_CLIP', key: 'F3', category: 'general', description: 'F3 Emote menu' },
  { id: 166, name: 'INPUT_SELECT_RADAR_MODE', key: 'F5', category: 'general', description: 'F5 Job / Action menu' },
  { id: 167, name: 'INPUT_VEH_SUB_DOWN_ONLY', key: 'F6', category: 'general', description: 'F6 Job menu' },
  { id: 168, name: 'INPUT_VEH_SUB_UP_ONLY', key: 'F7', category: 'general', description: 'F7 Billing menu' },
  { id: 56, name: 'INPUT_DROP_WEAPON', key: 'F9', category: 'general', description: 'F9 Action' },
  { id: 57, name: 'INPUT_DROP_AMMO', key: 'F10', category: 'general', description: 'F10 Admin / System' }
];

export const ControlsLookup: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'foot' | 'veh' | 'combat' | 'general'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = CONTROLS_DATA.filter(c => {
    if (category !== 'all' && c.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q) ||
        c.id.toString().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    trackEvent('controls', 'copy_lua', `Control ${key}: ${text}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">GTA V Controls & Keybinds Lookup</h3>
            <p className="text-xs text-zinc-400">
              Instant search for GTA V Control IDs, ~INPUT~ text codes, and FiveM Lua key checks.
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
              placeholder="Search key (E, F, 38, INPUT_...)"
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs w-fit">
        {(['all', 'foot', 'veh', 'combat', 'general'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all uppercase ${
              category === cat ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Controls' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map(ctrl => (
          <div
            key={ctrl.id}
            className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-white text-black font-mono font-black text-xs shadow-sm">
                    {ctrl.key}
                  </span>
                  <span className="font-mono text-xs font-bold text-white">
                    ID: {ctrl.id}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-emerald-400 font-semibold mt-1.5">
                  {ctrl.name}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                  {ctrl.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-zinc-500 bg-black/40 px-2 py-1 rounded border border-white/5 truncate max-w-[150px]">
                ~{ctrl.name}~
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleCopy(`press-${ctrl.id}`, `IsControlJustPressed(0, ${ctrl.id})`)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[10px] font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                  data-tooltip="Copy IsControlJustPressed snippet"
                  data-tooltip-pos="left"
                  aria-label="Copy IsControlJustPressed code"
                >
                  {copiedId === `press-${ctrl.id}` ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Code2 className="w-3 h-3" />
                      <span>JustPressed</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleCopy(`tag-${ctrl.id}`, `~${ctrl.name}~`)}
                  className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-colors"
                  data-tooltip="Copy ~INPUT~ tag"
                  data-tooltip-pos="left"
                  aria-label="Copy input tag"
                >
                  {copiedId === `tag-${ctrl.id}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
