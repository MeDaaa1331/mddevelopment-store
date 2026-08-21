import React, { useState } from 'react';
import { Film, Search, Copy, Check, Code2, Sparkles, Activity } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

interface AnimEntry {
  id: string;
  name: string;
  type: 'anim' | 'scenario';
  dict?: string;
  clip?: string;
  scenario?: string;
  category: 'emotes' | 'police' | 'jobs' | 'crime';
  description: string;
  flag?: number;
}

const ANIM_DATA: AnimEntry[] = [
  { id: '1', name: 'Hands Up / Surrender', type: 'anim', dict: 'missminuteman_1ig_2', clip: 'handsup_base', flag: 49, category: 'emotes', description: 'Player puts hands behind head / surrender' },
  { id: '2', name: 'Check Phone / Texting', type: 'anim', dict: 'cellphone@', clip: 'cellphone_text_read_base', flag: 49, category: 'emotes', description: 'Holding phone and typing message' },
  { id: '3', name: 'Smoke Cigarette', type: 'scenario', scenario: 'WORLD_HUMAN_SMOKING', category: 'emotes', description: 'Casual smoking scenario with props' },
  { id: '4', name: 'Drink Coffee', type: 'scenario', scenario: 'WORLD_HUMAN_AA_COFFEE', category: 'emotes', description: 'Drinking coffee cup in hand' },
  { id: '5', name: 'Police Handcuff Player', type: 'anim', dict: 'mp_arrest_paired', clip: 'cop_p2_back_left', flag: 49, category: 'police', description: 'Officer cuffing suspect from behind' },
  { id: '6', name: 'Being Handcuffed', type: 'anim', dict: 'mp_arrest_paired', clip: 'crook_p2_back_left', flag: 49, category: 'police', description: 'Suspect hands behind back cuffed' },
  { id: '7', name: 'CPR / Revive Patient', type: 'anim', dict: 'mini@cpr@char_a@cpr_str', clip: 'cpr_pumpchest', flag: 1, category: 'police', description: 'Performing chest compressions' },
  { id: '8', name: 'Heal / Bandage Wound', type: 'anim', dict: 'anim@heists@narcotics@funding@gang_idle', clip: 'gang_chatting_idle01', flag: 49, category: 'police', description: 'Applying bandage/medkit' },
  { id: '9', name: 'Mechanic Engine Repair', type: 'anim', dict: 'mini@repair', clip: 'fixing_a_ped', flag: 49, category: 'jobs', description: 'Leaning over hood repairing vehicle engine' },
  { id: '10', name: 'Welding Torch Action', type: 'scenario', scenario: 'WORLD_HUMAN_WELDING', category: 'jobs', description: 'Holding welding torch with sparks' },
  { id: '11', name: 'Type on Computer / Laptop', type: 'anim', dict: 'anim@heists@prison_heiststation@cop_reactions', clip: 'cop_b_idle', flag: 49, category: 'jobs', description: 'Typing on desk keyboard or laptop' },
  { id: '12', name: 'Drill Safe / Vault', type: 'anim', dict: 'anim@heists@fleeca_bank@drilling', clip: 'drill_straight_idle', flag: 49, category: 'crime', description: 'Drilling into bank safe vault' },
  { id: '13', name: 'Lockpick Vehicle Door', type: 'anim', dict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@', clip: 'machinic_loop_mechandplayer', flag: 49, category: 'crime', description: 'Lockpicking vehicle lock' },
  { id: '14', name: 'Plant Bomb / C4', type: 'anim', dict: 'anim@heists@ornate_bank@thermal_charge', clip: 'thermal_charge', flag: 49, category: 'crime', description: 'Planting thermal charge on door' },
  { id: '15', name: 'Search Body / Looting', type: 'anim', dict: 'amb@medic@standing@kneel@base', clip: 'base', flag: 49, category: 'crime', description: 'Kneeling down and searching pockets' },
  { id: '16', name: 'Yoga / Meditation', type: 'scenario', scenario: 'WORLD_HUMAN_YOGA', category: 'emotes', description: 'Peaceful yoga poses' },
  { id: '17', name: 'Cheering / Applauding', type: 'scenario', scenario: 'WORLD_HUMAN_CHEERING', category: 'emotes', description: 'Cheering and clapping hands' }
];

export const AnimExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | 'emotes' | 'police' | 'jobs' | 'crime'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = ANIM_DATA.filter(a => {
    if (category !== 'all' && a.category !== category) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        (a.dict && a.dict.toLowerCase().includes(q)) ||
        (a.clip && a.clip.toLowerCase().includes(q)) ||
        (a.scenario && a.scenario.toLowerCase().includes(q)) ||
        a.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    const item = ANIM_DATA.find(a => a.id === id);
    trackEvent('anim', 'copy_lua', item ? `${item.name} (${item.dict || item.scenario})` : `Animation #${id}`);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getTaskPlayAnimCode = (a: AnimEntry) => {
    if (a.type === 'scenario') {
      return `TaskStartScenarioInPlace(PlayerPedId(), '${a.scenario}', 0, true)`;
    }
    return `lib.requestAnimDict('${a.dict}')
TaskPlayAnim(PlayerPedId(), '${a.dict}', '${a.clip}', 8.0, -8.0, -1, ${a.flag || 49}, 0, false, false, false)`;
  };

  const getOxLibAnimCode = (a: AnimEntry) => {
    if (a.type === 'scenario') {
      return `scenario = {
    name = '${a.scenario}'
}`;
    }
    return `anim = {
    dict = '${a.dict}',
    clip = '${a.clip}',
    flag = ${a.flag || 49}
}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-950/60 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-glow-sm">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Anim & Scenario Explorer</h3>
            <p className="text-xs text-zinc-400">
              Search GTA V animations, clips, and scenarios with instant TaskPlayAnim & ox_lib code snippets.
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
              placeholder="Search anim (cuff, phone, repair...)"
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-xl border border-white/10 text-xs w-fit flex-wrap">
        {(['all', 'emotes', 'police', 'jobs', 'crime'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all uppercase ${
              category === cat ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Animations' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(anim => (
          <div
            key={anim.id}
            className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-3 group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-white">{anim.name}</h4>
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                  anim.type === 'scenario'
                    ? 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {anim.type.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-zinc-400 mt-1 leading-snug">{anim.description}</p>

              <div className="mt-2.5 p-2.5 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] space-y-1">
                {anim.type === 'scenario' ? (
                  <div className="truncate text-purple-300">
                    <span className="text-zinc-500">Scenario: </span>{anim.scenario}
                  </div>
                ) : (
                  <>
                    <div className="truncate text-emerald-300">
                      <span className="text-zinc-500">Dict: </span>{anim.dict}
                    </div>
                    <div className="truncate text-zinc-300">
                      <span className="text-zinc-500">Clip: </span>{anim.clip}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
              <button
                onClick={() => handleCopy(`ox-${anim.id}`, getOxLibAnimCode(anim))}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1 active:scale-95"
                title="Copy ox_lib anim table"
              >
                {copiedId === `ox-${anim.id}` ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied ox_lib</span>
                  </>
                ) : (
                  <>
                    <Code2 className="w-3 h-3" />
                    <span>ox_lib Anim</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleCopy(`play-${anim.id}`, getTaskPlayAnimCode(anim))}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-[11px] font-mono font-bold text-black transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                title="Copy TaskPlayAnim / Scenario code"
              >
                {copiedId === `play-${anim.id}` ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-black" />
                    <span>Play Anim Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
