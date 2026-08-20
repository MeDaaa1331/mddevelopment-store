import React, { useState, useMemo } from 'react';
import { Volume2, Search, Copy, Check, Sparkles, Play, Code2 } from 'lucide-react';

interface SoundEntry {
  id: string;
  name: string;
  soundset: string;
  category: 'HUD' | 'Economy' | 'Heists' | 'Police' | 'Phone' | 'Weapons' | 'Vehicles' | 'Casino';
  description: string;
}

const SOUND_DATABASE: SoundEntry[] = [
  { id: '1', name: 'SELECT', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD', description: 'Standard menu selection click' },
  { id: '2', name: 'NAV_UP_DOWN', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD', description: 'Navigating up or down in a menu' },
  { id: '3', name: 'BACK', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD', description: 'Menu cancel or back button tone' },
  { id: '4', name: 'QUIT', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD', description: 'Menu exit sound' },
  { id: '5', name: 'ERROR', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD', description: 'Action denied or error beep' },
  { id: '6', name: 'CONFIRM_BEEP', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD', description: 'Minigame confirmation tone' },
  { id: '7', name: 'CONTINUE', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD', description: 'Positive continuation sound' },
  { id: '8', name: 'LEADERBOARD', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD', description: 'Highscore or leaderboard reveal' },
  { id: '9', name: 'TIMER_STOP', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD', description: 'Timer countdown completion chime' },

  { id: '10', name: 'LOCAL_PLYR_CASH_COUNTER_COMPLETE', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Economy', description: 'Cash received / money counting finished' },
  { id: '11', name: 'PURCHASE', soundset: 'HUD_LIQUOR_STORE_SOUNDSET', category: 'Economy', description: 'Cash register till ding on purchase' },
  { id: '12', name: 'PROPERTY_PURCHASE', soundset: 'HUD_AWARDS', category: 'Economy', description: 'Triumphant property purchase fanfare' },
  { id: '13', name: 'WEAPON_PURCHASE', soundset: 'HUD_AMMO_SHOP_SOUNDSET', category: 'Economy', description: 'Ammu-Nation weapon buy chime' },
  { id: '14', name: 'ATM_WINDOW', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'Economy', description: 'ATM screen interaction beep' },

  { id: '15', name: 'HACKING_CLICK', soundset: 'DLC_HEIST_HACKING_SNAKE_SOUNDS', category: 'Heists', description: 'Hacking terminal keypress' },
  { id: '16', name: 'HACKING_SUCCESS', soundset: 'DLC_HEIST_HACKING_SNAKE_SOUNDS', category: 'Heists', description: 'Hacking minigame completed successfully' },
  { id: '17', name: 'HACKING_FAILURE', soundset: 'DLC_HEIST_HACKING_SNAKE_SOUNDS', category: 'Heists', description: 'Hacking minigame failed / alarm trigger' },
  { id: '18', name: 'Pin_Bad', soundset: 'DLC_HEIST_FLEECA_SOUNDSET', category: 'Heists', description: 'Safe drilling pin bad resistance' },
  { id: '19', name: 'Pin_Centred', soundset: 'DLC_HEIST_FLEECA_SOUNDSET', category: 'Heists', description: 'Safe drilling sweet spot tone' },
  { id: '20', name: 'Drill_Pin_Break', soundset: 'DLC_HEIST_FLEECA_SOUNDSET', category: 'Heists', description: 'Drill bit snapping / overheated' },
  { id: '21', name: 'Vault_Door_Unlock', soundset: 'DLC_HEISTS_GENERIC_SOUNDS', category: 'Heists', description: 'Heavy vault door unlocking mechanism' },
  { id: '22', name: 'Keycard_Success', soundset: 'DLC_HEISTS_BIOLAB_FINALE_SOUNDS', category: 'Heists', description: 'Keycard swipe accepted beep' },
  { id: '23', name: 'Keycard_Fail', soundset: 'DLC_HEISTS_BIOLAB_FINALE_SOUNDS', category: 'Heists', description: 'Keycard swipe rejected buzzer' },

  { id: '24', name: 'POLICE_REPORT_ABORT', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Police', description: 'Police scanner radio alert cancel' },
  { id: '25', name: 'Bank_Alarm_Loop', soundset: 'RES_SECURITY_ALARM_SOUNDSET', category: 'Police', description: 'Loud bank security alarm siren' },
  { id: '26', name: 'Prison_Alarm_Loop', soundset: 'DLC_HEIST_PRISON_BREAK_SOUNDS', category: 'Police', description: 'Bolingbroke penitentiary prison break siren' },
  { id: '27', name: 'COP_CAR_ALARM', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Police', description: 'Emergency vehicle alarm' },
  { id: '28', name: 'Scanner_Static', soundset: 'DLC_HEIST_BIOLAB_SOUNDS', category: 'Police', description: 'Police radio dispatch static burst' },
  { id: '29', name: 'Handcuff_Click', soundset: 'DLC_HEISTS_GENERIC_SOUNDS', category: 'Police', description: 'Handcuffs locking around wrists' },

  { id: '30', name: 'Menu_Accept', soundset: 'Phone_SoundSet_Default', category: 'Phone', description: 'Smartphone menu item selected' },
  { id: '31', name: 'Text_Arrive_Tone', soundset: 'Phone_SoundSet_Default', category: 'Phone', description: 'Incoming text message notification' },
  { id: '32', name: 'Hang_Up', soundset: 'Phone_SoundSet_Default', category: 'Phone', description: 'Phone call disconnected / ended' },
  { id: '33', name: 'Dial_and_Remote_Ring', soundset: 'Phone_SoundSet_Default', category: 'Phone', description: 'Outgoing phone ringing tone' },
  { id: '34', name: 'Camera_Shoot', soundset: 'Phone_SoundSet_Default', category: 'Phone', description: 'Phone camera shutter click' },

  { id: '35', name: 'Reload', soundset: 'DLC_GR_Generic_Soundset', category: 'Weapons', description: 'Weapon magazine reload sound' },
  { id: '36', name: 'Weapon_Upgrade', soundset: 'DLC_GR_Generic_Soundset', category: 'Weapons', description: 'Weapon attachment installed' },
  { id: '37', name: 'KILL_STREAK', soundset: 'HUD_AWARDS', category: 'Weapons', description: 'Killstreak / Headshot award chime' },
  { id: '38', name: 'Armor_Equip', soundset: 'DLC_HEISTS_GENERIC_SOUNDS', category: 'Weapons', description: 'Body armor vest equipped sound' },

  { id: '39', name: 'Remote_Vehicle_Lock', soundset: 'GTAO_ImpExp_Soundset', category: 'Vehicles', description: 'Key fob vehicle lock beep-beep' },
  { id: '40', name: 'Engine_Start', soundset: 'DLC_Biker_Generic_Soundset', category: 'Vehicles', description: 'Vehicle ignition startup crank' },
  { id: '41', name: 'Airhorn_Loop', soundset: 'DLC_AW_Airhorn_Sounds', category: 'Vehicles', description: 'Loud stadium airhorn blast' },
  { id: '42', name: 'Garage_Door_Open', soundset: 'GTAO_ImpExp_Soundset', category: 'Vehicles', description: 'Electric garage shutter door rolling up' },

  { id: '43', name: 'Wheel_Spin', soundset: 'dlc_vw_casino_lucky_wheel_sounds', category: 'Casino', description: 'Casino lucky wheel spinning ticker' },
  { id: '44', name: 'Jackpot', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino', description: 'Slot machine grand jackpot celebration' },
  { id: '45', name: 'Card_Deal', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino', description: 'Blackjack / Poker card dealing sound' },
  { id: '46', name: 'Chips_Win', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino', description: 'Casino chips payout sliding' }
];

export const AudioExplorer: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'All' | 'HUD' | 'Economy' | 'Heists' | 'Police' | 'Phone' | 'Weapons' | 'Vehicles' | 'Casino'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredSounds = useMemo(() => {
    return SOUND_DATABASE.filter(s => {
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
        {(['All', 'HUD', 'Economy', 'Heists', 'Police', 'Phone', 'Weapons', 'Vehicles', 'Casino'] as const).map(cat => (
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
