export interface SoundEntry {
  id: string;
  name: string;
  soundset: string;
  category: 'HUD & UI' | 'Economy & Shops' | 'Heists & Hacking' | 'Police & Alarms' | 'Phone & Pager' | 'Weapons & Combat' | 'Vehicles & Horns' | 'Casino & Minigames';
  description: string;
}

export const GTA_AUDIO_DATABASE: SoundEntry[] = [
  // HUD & UI
  { id: '1', name: 'SELECT', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Standard menu item selection click' },
  { id: '2', name: 'NAV_UP_DOWN', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Navigating up or down in menu' },
  { id: '3', name: 'NAV_LEFT_RIGHT', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Navigating left or right in menu sliders' },
  { id: '4', name: 'BACK', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Menu cancel or return back tone' },
  { id: '5', name: 'QUIT', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Menu exit sound' },
  { id: '6', name: 'ERROR', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Action denied or error buzz' },
  { id: '7', name: 'CONFIRM_BEEP', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD & UI', description: 'Minigame confirmation beep' },
  { id: '8', name: 'CONTINUE', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Positive continuation tone' },
  { id: '9', name: 'LEADERBOARD', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD & UI', description: 'Leaderboard or score card reveal' },
  { id: '10', name: 'TIMER_STOP', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD & UI', description: 'Timer countdown completion chime' },
  { id: '11', name: 'CHECKPOINT_NORMAL', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD & UI', description: 'Race checkpoint passed chime' },
  { id: '12', name: 'CHECKPOINT_PERFECT', soundset: 'HUD_MINI_GAME_SOUNDSET', category: 'HUD & UI', description: 'Perfect checkpoint high tone' },
  { id: '13', name: 'MP_5_SECOND_TIMER', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'HUD & UI', description: 'Final 5-second countdown timer' },
  { id: '14', name: 'RANK_UP', soundset: 'HUD_AWARDS', category: 'HUD & UI', description: 'Level / Rank up award fanfare' },
  { id: '15', name: 'CHALLENGE_UNLOCKED', soundset: 'HUD_AWARDS', category: 'HUD & UI', description: 'Achievement / Challenge unlocked sound' },

  // ECONOMY & SHOPS
  { id: '16', name: 'LOCAL_PLYR_CASH_COUNTER_COMPLETE', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Economy & Shops', description: 'Cash received / money counting finished' },
  { id: '17', name: 'PURCHASE', soundset: 'HUD_LIQUOR_STORE_SOUNDSET', category: 'Economy & Shops', description: 'Cash register till open ding on purchase' },
  { id: '18', name: 'PROPERTY_PURCHASE', soundset: 'HUD_AWARDS', category: 'Economy & Shops', description: 'Triumphant property purchase fanfare' },
  { id: '19', name: 'WEAPON_PURCHASE', soundset: 'HUD_AMMO_SHOP_SOUNDSET', category: 'Economy & Shops', description: 'Ammu-Nation weapon buy chime' },
  { id: '20', name: 'ATM_WINDOW', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'Economy & Shops', description: 'ATM screen interaction beep' },
  { id: '21', name: 'ROBBERY_MONEY_TOTAL', soundset: 'HUD_FRONTEND_CUSTOM_SOUNDSET', category: 'Economy & Shops', description: 'Store robbery cash bag filled' },
  { id: '22', name: 'PICK_UP', soundset: 'HUD_FRONTEND_DEFAULT_SOUNDSET', category: 'Economy & Shops', description: 'Item / cash pickup chime' },

  // HEISTS & HACKING
  { id: '23', name: 'HACKING_CLICK', soundset: 'DLC_HEIST_HACKING_SNAKE_SOUNDS', category: 'Heists & Hacking', description: 'Hacking terminal keyboard keypress' },
  { id: '24', name: 'HACKING_SUCCESS', soundset: 'DLC_HEIST_HACKING_SNAKE_SOUNDS', category: 'Heists & Hacking', description: 'Hacking minigame completed successfully' },
  { id: '25', name: 'HACKING_FAILURE', soundset: 'DLC_HEIST_HACKING_SNAKE_SOUNDS', category: 'Heists & Hacking', description: 'Hacking minigame failed buzzer' },
  { id: '26', name: 'Pin_Bad', soundset: 'DLC_HEIST_FLEECA_SOUNDSET', category: 'Heists & Hacking', description: 'Safe drilling bad pin resistance' },
  { id: '27', name: 'Pin_Centred', soundset: 'DLC_HEIST_FLEECA_SOUNDSET', category: 'Heists & Hacking', description: 'Safe drilling sweet spot tone' },
  { id: '28', name: 'Drill_Pin_Break', soundset: 'DLC_HEIST_FLEECA_SOUNDSET', category: 'Heists & Hacking', description: 'Drill bit snapping / overheated' },
  { id: '29', name: 'Vault_Door_Unlock', soundset: 'DLC_HEISTS_GENERIC_SOUNDS', category: 'Heists & Hacking', description: 'Heavy vault door unlocking mechanism' },
  { id: '30', name: 'Keycard_Success', soundset: 'DLC_HEISTS_BIOLAB_FINALE_SOUNDS', category: 'Heists & Hacking', description: 'Keycard swipe accepted beep' },
  { id: '31', name: 'Keycard_Fail', soundset: 'DLC_HEISTS_BIOLAB_FINALE_SOUNDS', category: 'Heists & Hacking', description: 'Keycard swipe rejected buzzer' },
  { id: '32', name: 'Thermal_Charge_Explode', soundset: 'DLC_HEISTS_BIOLAB_FINALE_SOUNDS', category: 'Heists & Hacking', description: 'Thermite charge burn & metal melting' },

  // POLICE & ALARMS
  { id: '33', name: 'POLICE_REPORT_ABORT', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Police & Alarms', description: 'Police scanner radio alert cancel' },
  { id: '34', name: 'Bank_Alarm_Loop', soundset: 'RES_SECURITY_ALARM_SOUNDSET', category: 'Police & Alarms', description: 'Loud bank security alarm siren' },
  { id: '35', name: 'Prison_Alarm_Loop', soundset: 'DLC_HEIST_PRISON_BREAK_SOUNDS', category: 'Police & Alarms', description: 'Bolingbroke penitentiary prison break siren' },
  { id: '36', name: 'COP_CAR_ALARM', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Police & Alarms', description: 'Emergency vehicle car alarm' },
  { id: '37', name: 'Scanner_Static', soundset: 'DLC_HEIST_BIOLAB_SOUNDS', category: 'Police & Alarms', description: 'Police radio dispatch static burst' },
  { id: '38', name: 'Handcuff_Click', soundset: 'DLC_HEISTS_GENERIC_SOUNDS', category: 'Police & Alarms', description: 'Handcuffs locking around wrists' },
  { id: '39', name: 'Taser_Fire', soundset: 'DLC_GR_Generic_Soundset', category: 'Police & Alarms', description: 'Stun gun discharge probe fire' },

  // PHONE & PAGER
  { id: '40', name: 'Menu_Accept', soundset: 'Phone_SoundSet_Default', category: 'Phone & Pager', description: 'Smartphone menu item selected' },
  { id: '41', name: 'Text_Arrive_Tone', soundset: 'Phone_SoundSet_Default', category: 'Phone & Pager', description: 'Incoming text message notification' },
  { id: '42', name: 'Hang_Up', soundset: 'Phone_SoundSet_Default', category: 'Phone & Pager', description: 'Phone call disconnected / ended' },
  { id: '43', name: 'Dial_and_Remote_Ring', soundset: 'Phone_SoundSet_Default', category: 'Phone & Pager', description: 'Outgoing phone ringing tone' },
  { id: '44', name: 'Camera_Shoot', soundset: 'Phone_SoundSet_Default', category: 'Phone & Pager', description: 'Phone camera shutter click' },
  { id: '45', name: 'Pager_Beep', soundset: 'Phone_SoundSet_Default', category: 'Phone & Pager', description: 'Retro pager alert beep' },

  // WEAPONS & COMBAT
  { id: '46', name: 'Reload', soundset: 'DLC_GR_Generic_Soundset', category: 'Weapons & Combat', description: 'Weapon magazine reload sound' },
  { id: '47', name: 'Weapon_Upgrade', soundset: 'DLC_GR_Generic_Soundset', category: 'Weapons & Combat', description: 'Weapon attachment installed' },
  { id: '48', name: 'KILL_STREAK', soundset: 'HUD_AWARDS', category: 'Weapons & Combat', description: 'Killstreak / Headshot award chime' },
  { id: '49', name: 'Armor_Equip', soundset: 'DLC_HEISTS_GENERIC_SOUNDS', category: 'Weapons & Combat', description: 'Body armor vest equipped sound' },
  { id: '50', name: 'Dry_Fire', soundset: 'DLC_GR_Generic_Soundset', category: 'Weapons & Combat', description: 'Empty weapon hammer dry fire click' },
  { id: '51', name: 'Headshot', soundset: 'HUD_AWARDS', category: 'Weapons & Combat', description: 'Critical headshot hit confirmation' },

  // VEHICLES & HORNS
  { id: '52', name: 'Remote_Vehicle_Lock', soundset: 'GTAO_ImpExp_Soundset', category: 'Vehicles & Horns', description: 'Key fob vehicle lock beep-beep' },
  { id: '53', name: 'Engine_Start', soundset: 'DLC_Biker_Generic_Soundset', category: 'Vehicles & Horns', description: 'Vehicle ignition startup crank' },
  { id: '54', name: 'Airhorn_Loop', soundset: 'DLC_AW_Airhorn_Sounds', category: 'Vehicles & Horns', description: 'Loud stadium airhorn blast' },
  { id: '55', name: 'Garage_Door_Open', soundset: 'GTAO_ImpExp_Soundset', category: 'Vehicles & Horns', description: 'Electric garage shutter door rolling up' },
  { id: '56', name: 'Car_Alarm_Short', soundset: 'DLC_HEISTS_GENERAL_FRONTEND_SOUNDS', category: 'Vehicles & Horns', description: 'Short vehicle lock chirp' },

  // CASINO & MINIGAMES
  { id: '57', name: 'Wheel_Spin', soundset: 'dlc_vw_casino_lucky_wheel_sounds', category: 'Casino & Minigames', description: 'Casino lucky wheel spinning ticker' },
  { id: '58', name: 'Jackpot', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino & Minigames', description: 'Slot machine grand jackpot celebration' },
  { id: '59', name: 'Card_Deal', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino & Minigames', description: 'Blackjack / Poker card dealing sound' },
  { id: '60', name: 'Chips_Win', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino & Minigames', description: 'Casino chips payout sliding' },
  { id: '61', name: 'Roulette_Spin', soundset: 'DLC_VW_Casino_General_Sounds', category: 'Casino & Minigames', description: 'Roulette ball rolling in wheel' }
];
