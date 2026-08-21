export interface WeaponComponent {
  name: string;
  hash: string;
  description: string;
}

export interface WeaponData {
  id: string;
  name: string;
  hashName: string;
  hexHash: string;
  decHash: number;
  category: 'Handguns' | 'SMG' | 'Shotguns' | 'Rifles' | 'MG' | 'Snipers' | 'Heavy' | 'Melee' | 'Throwables' | 'Mk II Weapons';
  ammoType: string;
  clipSize: number;
  damage: number;
  components: WeaponComponent[];
}

export const GTA_WEAPONS_DATABASE: WeaponData[] = [
  {
    id: 'weapon_dagger',
    name: 'Antique Cavalry Dagger',
    hashName: 'WEAPON_DAGGER',
    hexHash: '0x92E03C03',
    decHash: -1830848509,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 32,
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
  },
  {
    id: 'weapon_bottle',
    name: 'Broken Bottle',
    hashName: 'WEAPON_BOTTLE',
    hexHash: '0xF9E6AA4B',
    decHash: -102323893,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 28,
    components: []
  },
  {
    id: 'weapon_crowbar',
    name: 'Crowbar',
    hashName: 'WEAPON_CROWBAR',
    hexHash: '0x84BD7BFD',
    decHash: -2067956739,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 25,
    components: []
  },
  {
    id: 'weapon_flashlight',
    name: 'Flashlight',
    hashName: 'WEAPON_FLASHLIGHT',
    hexHash: '0x8BB05FD7',
    decHash: -1951375401,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 15,
    components: []
  },
  {
    id: 'weapon_golfclub',
    name: 'Golf Club',
    hashName: 'WEAPON_GOLFCLUB',
    hexHash: '0x440E4788',
    decHash: 1141786504,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 30,
    components: []
  },
  {
    id: 'weapon_hammer',
    name: 'Hammer',
    hashName: 'WEAPON_HAMMER',
    hexHash: '0x4E875F73',
    decHash: 1317494643,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 25,
    components: []
  },
  {
    id: 'weapon_hatchet',
    name: 'Hatchet',
    hashName: 'WEAPON_HATCHET',
    hexHash: '0xF9DCBF2D',
    decHash: -102973651,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 35,
    components: []
  },
  {
    id: 'weapon_knuckle',
    name: 'Brass Knuckles',
    hashName: 'WEAPON_KNUCKLE',
    hexHash: '0xD8ADD1FC',
    decHash: -659727876,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 20,
    components: []
  },
  {
    id: 'weapon_knife',
    name: 'Knife',
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
    id: 'weapon_machete',
    name: 'Machete',
    hashName: 'WEAPON_MACHETE',
    hexHash: '0xDD5DF8D9',
    decHash: -581044007,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 38,
    components: []
  },
  {
    id: 'weapon_switchblade',
    name: 'Switchblade',
    hashName: 'WEAPON_SWITCHBLADE',
    hexHash: '0xDFE37640',
    decHash: -538742848,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 30,
    components: []
  },
  {
    id: 'weapon_nightstick',
    name: 'Police Nightstick',
    hashName: 'WEAPON_NIGHTSTICK',
    hexHash: '0x678B81B1',
    decHash: 1737195953,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 25,
    components: []
  },
  {
    id: 'weapon_wrench',
    name: 'Pipe Wrench',
    hashName: 'WEAPON_WRENCH',
    hexHash: '0x19044EE0',
    decHash: 419712736,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 27,
    components: []
  },
  {
    id: 'weapon_battleaxe',
    name: 'Battle Axe',
    hashName: 'WEAPON_BATTLEAXE',
    hexHash: '0xCD274149',
    decHash: -853065399,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 42,
    components: []
  },
  {
    id: 'weapon_poolcue',
    name: 'Pool Cue',
    hashName: 'WEAPON_POOLCUE',
    hexHash: '0x94117305',
    decHash: -1810795259,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 26,
    components: []
  },
  {
    id: 'weapon_stone_hatchet',
    name: 'Stone Hatchet',
    hashName: 'WEAPON_STONE_HATCHET',
    hexHash: '0x3813FC08',
    decHash: 940833800,
    category: 'Melee',
    ammoType: 'AMMO_MELEE',
    clipSize: 0,
    damage: 50,
    components: []
  },

  {
    id: 'weapon_pistol',
    name: 'Pistol 9mm (Beretta 92FS)',
    hashName: 'WEAPON_PISTOL',
    hexHash: '0x1B06D571',
    decHash: 453432689,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 12,
    damage: 26,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_PISTOL_CLIP_01', description: 'Standard 12-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_PISTOL_CLIP_02', description: 'Extended 16-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Tactical weapon flashlight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP_02', description: 'Sound suppressor' },
      { name: 'Yusuf Amir Luxury Finish', hash: 'COMPONENT_PISTOL_VARMOD_LUXE', description: 'Engraved gold skin' }
    ]
  },
  {
    id: 'weapon_combatpistol',
    name: 'Combat Pistol (Glock 17)',
    hashName: 'WEAPON_COMBATPISTOL',
    hexHash: '0x5EF9FCDE',
    decHash: 1593441988,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 16,
    damage: 27,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_COMBATPISTOL_CLIP_01', description: 'Standard 16-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_COMBATPISTOL_CLIP_02', description: 'Extended 20-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Tactical rail light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Combat suppressor' },
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
      { name: 'Default Clip', hash: 'COMPONENT_APPISTOL_CLIP_01', description: '18-round mag' },
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
    id: 'weapon_snspistol',
    name: 'SNS Pistol (Saturday Night Special)',
    hashName: 'WEAPON_SNSPISTOL',
    hexHash: '0xBFD21232',
    decHash: -1076751822,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 6,
    damage: 28,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_SNSPISTOL_CLIP_01', description: '6-round compact mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_SNSPISTOL_CLIP_02', description: '12-round extended mag' }
    ]
  },
  {
    id: 'weapon_heavypistol',
    name: 'Heavy Pistol (1911)',
    hashName: 'WEAPON_HEAVYPISTOL',
    hexHash: '0xD205520E',
    decHash: -771403250,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 18,
    damage: 40,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_HEAVYPISTOL_CLIP_01', description: '18-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_HEAVYPISTOL_CLIP_02', description: '36-round extended mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Tactical light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Suppressor' }
    ]
  },
  {
    id: 'weapon_vintagepistol',
    name: 'Vintage Pistol',
    hashName: 'WEAPON_VINTAGEPISTOL',
    hexHash: '0x83839C4',
    decHash: 137902532,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 7,
    damage: 34,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_VINTAGEPISTOL_CLIP_01', description: '7-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_VINTAGEPISTOL_CLIP_02', description: '14-round mag' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Vintage suppressor' }
    ]
  },
  {
    id: 'weapon_marksmanpistol',
    name: 'Marksman Pistol',
    hashName: 'WEAPON_MARKSMANPISTOL',
    hexHash: '0xDC4DB296',
    decHash: -598887786,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 1,
    damage: 220,
    components: []
  },
  {
    id: 'weapon_revolver',
    name: 'Heavy Revolver',
    hashName: 'WEAPON_REVOLVER',
    hexHash: '0xC1B3C3D1',
    decHash: -1046429423,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 6,
    damage: 160,
    components: []
  },
  {
    id: 'weapon_doubleaction',
    name: 'Double-Action Revolver',
    hashName: 'WEAPON_DOUBLEACTION',
    hexHash: '0x97EA20B8',
    decHash: -1746263880,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 6,
    damage: 145,
    components: []
  },
  {
    id: 'weapon_raypistol',
    name: 'Up-n-Atomizer',
    hashName: 'WEAPON_RAYPISTOL',
    hexHash: '0xAF3696A1',
    decHash: -1355376991,
    category: 'Handguns',
    ammoType: 'AMMO_RAYPISTOL',
    clipSize: 1,
    damage: 30,
    components: []
  },
  {
    id: 'weapon_ceramicpistol',
    name: 'Ceramic Pistol',
    hashName: 'WEAPON_CERAMICPISTOL',
    hexHash: '0x2B5EF5EC',
    decHash: 727643628,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 12,
    damage: 31,
    components: []
  },
  {
    id: 'weapon_navyrevolver',
    name: 'Navy Revolver',
    hashName: 'WEAPON_NAVYREVOLVER',
    hexHash: '0x917F6C8C',
    decHash: -1853744004,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 6,
    damage: 165,
    components: []
  },
  {
    id: 'weapon_gadgetpistol',
    name: 'Perico Pistol',
    hashName: 'WEAPON_GADGETPISTOL',
    hexHash: '0x57A96363',
    decHash: 1470764899,
    category: 'Handguns',
    ammoType: 'AMMO_PISTOL',
    clipSize: 1,
    damage: 200,
    components: []
  },
  {
    id: 'weapon_stungun',
    name: 'Stun Gun / Taser',
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
    id: 'weapon_flaregun',
    name: 'Flare Gun',
    hashName: 'WEAPON_FLAREGUN',
    hexHash: '0x47757124',
    decHash: 1198879012,
    category: 'Handguns',
    ammoType: 'AMMO_FLAREGUN',
    clipSize: 1,
    damage: 10,
    components: []
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
      { name: 'Default Clip', hash: 'COMPONENT_MICROSMG_CLIP_01', description: '16-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_MICROSMG_CLIP_02', description: '30-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_PI_FLSH', description: 'Weapon light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO', description: 'Holographic sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Micro SMG suppressor' }
    ]
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
      { name: 'Default Clip', hash: 'COMPONENT_SMG_CLIP_01', description: '30-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_SMG_CLIP_02', description: '45-round mag' },
      { name: 'Drum Magazine', hash: 'COMPONENT_SMG_CLIP_03', description: '100-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Tactical light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO_02', description: 'Holo sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'SMG suppressor' },
      { name: 'Yusuf Amir Finish', hash: 'COMPONENT_SMG_VARMOD_LUXE', description: 'Gold finish' }
    ]
  },
  {
    id: 'weapon_assaultsmg',
    name: 'Assault SMG (P90)',
    hashName: 'WEAPON_ASSAULTSMG',
    hexHash: '0xEFE7DE30',
    decHash: -270015344,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 30,
    damage: 23,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_ASSAULTSMG_CLIP_01', description: '30-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_ASSAULTSMG_CLIP_02', description: '60-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Weapon light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO', description: 'Optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' }
    ]
  },
  {
    id: 'weapon_combatpdw',
    name: 'Combat PDW (SIG MPX)',
    hashName: 'WEAPON_COMBATPDW',
    hexHash: '0x0A3D4D34',
    decHash: 1718222836,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 30,
    damage: 28,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_COMBATPDW_CLIP_01', description: '30-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_COMBATPDW_CLIP_02', description: '60-round mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_COMBATPDW_CLIP_03', description: '100-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_SMALL', description: 'Holo sight' }
    ]
  },
  {
    id: 'weapon_machinepistol',
    name: 'Machine Pistol (TEC-9)',
    hashName: 'WEAPON_MACHINEPISTOL',
    hexHash: '0xDBBD7280',
    decHash: -608281088,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 12,
    damage: 28,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_MACHINEPISTOL_CLIP_01', description: '12-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_MACHINEPISTOL_CLIP_02', description: '20-round mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_MACHINEPISTOL_CLIP_03', description: '30-round drum' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Suppressor' }
    ]
  },
  {
    id: 'weapon_minismg',
    name: 'Mini SMG (Skorpion)',
    hashName: 'WEAPON_MINISMG',
    hexHash: '0xBD248B55',
    decHash: -1121678507,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 20,
    damage: 22,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_MINISMG_CLIP_01', description: '20-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_MINISMG_CLIP_02', description: '30-round mag' }
    ]
  },
  {
    id: 'weapon_tecpistol',
    name: 'Tactical SMG',
    hashName: 'WEAPON_TECPISTOL',
    hexHash: '0x14E53AD5',
    decHash: 350567125,
    category: 'SMG',
    ammoType: 'AMMO_SMG',
    clipSize: 30,
    damage: 29,
    components: []
  },

  {
    id: 'weapon_pumpshotgun',
    name: 'Pump Shotgun (Remington 870)',
    hashName: 'WEAPON_PUMPSHOTGUN',
    hexHash: '0x1D073A89',
    decHash: 487013001,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 8,
    damage: 67,
    components: [
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Shotgun light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_SR_SUPP', description: '12-gauge suppressor' },
      { name: 'Lowrider Finish', hash: 'COMPONENT_PUMPSHOTGUN_VARMOD_LOWRIDER', description: 'Custom engraving' }
    ]
  },
  {
    id: 'weapon_sawnoffshotgun',
    name: 'Sawed-Off Shotgun',
    hashName: 'WEAPON_SAWNOFFSHOTGUN',
    hexHash: '0x7846A318',
    decHash: 2017895192,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 8,
    damage: 80,
    components: [
      { name: 'Luxury Finish', hash: 'COMPONENT_SAWNOFFSHOTGUN_VARMOD_LUXE', description: 'Engraved wood finish' }
    ]
  },
  {
    id: 'weapon_assaultshotgun',
    name: 'Assault Shotgun (UTAS UTS-15)',
    hashName: 'WEAPON_ASSAULTSHOTGUN',
    hexHash: '0xE284C527',
    decHash: -494615257,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 8,
    damage: 32,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_ASSAULTSHOTGUN_CLIP_01', description: '8-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_ASSAULTSHOTGUN_CLIP_02', description: '32-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Weapon light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Foregrip' }
    ]
  },
  {
    id: 'weapon_bullpupshotgun',
    name: 'Bullpup Shotgun (Kel-Tec KSG)',
    hashName: 'WEAPON_BULLPUPSHOTGUN',
    hexHash: '0x9D61E50F',
    decHash: -1654424177,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 14,
    damage: 40,
    components: [
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Weapon light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Foregrip' }
    ]
  },
  {
    id: 'weapon_musket',
    name: 'Musket',
    hashName: 'WEAPON_MUSKET',
    hexHash: '0xA89CB99E',
    decHash: -1466123874,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_heavyshotgun',
    name: 'Heavy Shotgun (Saiga-12)',
    hashName: 'WEAPON_HEAVYSHOTGUN',
    hexHash: '0x3AABBBA3',
    decHash: 984333219,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 6,
    damage: 117,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_HEAVYSHOTGUN_CLIP_01', description: '6-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_HEAVYSHOTGUN_CLIP_02', description: '12-round mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_HEAVYSHOTGUN_CLIP_03', description: '30-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_dbshotgun',
    name: 'Double Barrel Shotgun',
    hashName: 'WEAPON_DBSHOTGUN',
    hexHash: '0xEF951FBB',
    decHash: -275439429,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 2,
    damage: 160,
    components: []
  },
  {
    id: 'weapon_autoshotgun',
    name: 'Sweeper Shotgun (Protecta)',
    hashName: 'WEAPON_AUTOSHOTGUN',
    hexHash: '0x12E823F2',
    decHash: 317205874,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 10,
    damage: 42,
    components: []
  },
  {
    id: 'weapon_combatshotgun',
    name: 'Combat Shotgun (SPAS-12)',
    hashName: 'WEAPON_COMBATSHOTGUN',
    hexHash: '0x5A96BA4',
    decHash: 94989220,
    category: 'Shotguns',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 6,
    damage: 86,
    components: [
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Mounted light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Shotgun suppressor' }
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
      { name: 'Default Mag', hash: 'COMPONENT_ASSAULTRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_ASSAULTRIFLE_CLIP_02', description: '60-round mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_ASSAULTRIFLE_CLIP_03', description: '100-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Weapon light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MACRO', description: 'Cobra optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: '7.62 suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Angled grip' }
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
      { name: 'Default Mag', hash: 'COMPONENT_CARBINERIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_CARBINERIFLE_CLIP_02', description: '60-round mag' },
      { name: 'Drum Magazine', hash: 'COMPONENT_CARBINERIFLE_CLIP_03', description: '100-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Tactical light' },
      { name: 'Medium Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM', description: 'ACOG 4x optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: '5.56 suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Vertical foregrip' },
      { name: 'Yusuf Amir Finish', hash: 'COMPONENT_CARBINERIFLE_VARMOD_LUXE', description: 'Gold finish' }
    ]
  },
  {
    id: 'weapon_advancedrifle',
    name: 'Advanced Rifle (TAR-21)',
    hashName: 'WEAPON_ADVANCEDRIFLE',
    hexHash: '0xAF113F99',
    decHash: -1357824103,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 34,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_ADVANCEDRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_ADVANCEDRIFLE_CLIP_02', description: '60-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_SMALL', description: 'Small optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' }
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
      { name: 'Drum Mag', hash: 'COMPONENT_SPECIALCARBINE_CLIP_03', description: '100-round drum' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Medium Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM', description: 'Medium optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_bullpuprifle',
    name: 'Bullpup Rifle (QBZ-95)',
    hashName: 'WEAPON_BULLPUPRIFLE',
    hexHash: '0x7F22987F',
    decHash: 2132975743,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 32,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_BULLPUPRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_BULLPUPRIFLE_CLIP_02', description: '60-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_SMALL', description: 'Small optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_compactrifle',
    name: 'Compact Rifle (Mini Draco)',
    hashName: 'WEAPON_COMPACTRIFLE',
    hexHash: '0x624FE30',
    decHash: 103099952,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 36,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_COMPACTRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_COMPACTRIFLE_CLIP_02', description: '60-round mag' },
      { name: 'Drum Mag', hash: 'COMPONENT_COMPACTRIFLE_CLIP_03', description: '100-round drum' }
    ]
  },
  {
    id: 'weapon_militaryrifle',
    name: 'Military Rifle (AUG A3)',
    hashName: 'WEAPON_MILITARYRIFLE',
    hexHash: '0x9D07F764',
    decHash: -1660422300,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 35,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_MILITARYRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_MILITARYRIFLE_CLIP_02', description: '45-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_SMALL', description: 'Optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' }
    ]
  },
  {
    id: 'weapon_heavyrifle',
    name: 'Heavy Rifle (SCAR-L)',
    hashName: 'WEAPON_HEAVYRIFLE',
    hexHash: '0xC472FE2',
    decHash: -879347409,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 40,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_HEAVYRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_HEAVYRIFLE_CLIP_02', description: '45-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_tacticalrifle',
    name: 'Tactical Rifle (M16)',
    hashName: 'WEAPON_TACTICALRIFLE',
    hexHash: '0xD1D5F52B',
    decHash: -774507221,
    category: 'Rifles',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 38,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_TACTICALRIFLE_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_TACTICALRIFLE_CLIP_02', description: '60-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },

  {
    id: 'weapon_sniperrifle',
    name: 'Sniper Rifle (AWM)',
    hashName: 'WEAPON_SNIPERRIFLE',
    hexHash: '0x05FC3C11',
    decHash: 100416529,
    category: 'Snipers',
    ammoType: 'AMMO_SNIPER',
    clipSize: 10,
    damage: 101,
    components: [
      { name: 'Advanced Scope', hash: 'COMPONENT_AT_SCOPE_MAX', description: 'Max zoom optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Sniper suppressor' }
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
      { name: 'Advanced Scope', hash: 'COMPONENT_AT_SCOPE_MAX', description: 'Max zoom optic' }
    ]
  },
  {
    id: 'weapon_marksmanrifle',
    name: 'Marksman Rifle (M14 EBR)',
    hashName: 'WEAPON_MARKSMANRIFLE',
    hexHash: '0xC734385A',
    decHash: -952879014,
    category: 'Snipers',
    ammoType: 'AMMO_SNIPER',
    clipSize: 8,
    damage: 65,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_MARKSMANRIFLE_CLIP_01', description: '8-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_MARKSMANRIFLE_CLIP_02', description: '16-round mag' },
      { name: 'Flashlight', hash: 'COMPONENT_AT_AR_FLSH', description: 'Light' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_precisionrifle',
    name: 'Precision Rifle',
    hashName: 'WEAPON_PRECISIONRIFLE',
    hexHash: '0x6E7DDDEC',
    decHash: 1853744620,
    category: 'Snipers',
    ammoType: 'AMMO_SNIPER',
    clipSize: 5,
    damage: 130,
    components: []
  },

  {
    id: 'weapon_mg',
    name: 'MG (PKM)',
    hashName: 'WEAPON_MG',
    hexHash: '0x9D07F764',
    decHash: -1660422300,
    category: 'MG',
    ammoType: 'AMMO_MG',
    clipSize: 54,
    damage: 40,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_MG_CLIP_01', description: '54-round box' },
      { name: 'Extended Mag', hash: 'COMPONENT_MG_CLIP_02', description: '100-round box' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_SMALL_02', description: 'Small optic' }
    ]
  },
  {
    id: 'weapon_combatmg',
    name: 'Combat MG (M249 SAW)',
    hashName: 'WEAPON_COMBATMG',
    hexHash: '0x7FD62962',
    decHash: 2144741730,
    category: 'MG',
    ammoType: 'AMMO_MG',
    clipSize: 100,
    damage: 45,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_COMBATMG_CLIP_01', description: '100-round box' },
      { name: 'Extended Mag', hash: 'COMPONENT_COMBATMG_CLIP_02', description: '200-round box' },
      { name: 'Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM', description: 'Medium optic' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_gusenberg',
    name: 'Gusenberg Sweeper (Tommy Gun)',
    hashName: 'WEAPON_GUSENBERG',
    hexHash: '0x61014EE7',
    decHash: 1627465383,
    category: 'MG',
    ammoType: 'AMMO_MG',
    clipSize: 30,
    damage: 34,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_GUSENBERG_CLIP_01', description: '30-round mag' },
      { name: 'Extended Drum', hash: 'COMPONENT_GUSENBERG_CLIP_02', description: '50-round drum' }
    ]
  },
  {
    id: 'weapon_rpg',
    name: 'RPG (Rocket Launcher)',
    hashName: 'WEAPON_RPG',
    hexHash: '0xB1CA77B1',
    decHash: -1312131151,
    category: 'Heavy',
    ammoType: 'AMMO_RPG',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_grenadelauncher',
    name: 'Grenade Launcher',
    hashName: 'WEAPON_GRENADELAUNCHER',
    hexHash: '0xA284510B',
    decHash: -1569615261,
    category: 'Heavy',
    ammoType: 'AMMO_GRENADELAUNCHER',
    clipSize: 10,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_minigun',
    name: 'Minigun (M134)',
    hashName: 'WEAPON_MINIGUN',
    hexHash: '0x42BF8A4F',
    decHash: 1119849093,
    category: 'Heavy',
    ammoType: 'AMMO_MINIGUN',
    clipSize: 9999,
    damage: 30,
    components: []
  },
  {
    id: 'weapon_firework',
    name: 'Firework Launcher',
    hashName: 'WEAPON_FIREWORK',
    hexHash: '0x7F7497E5',
    decHash: 2138347493,
    category: 'Heavy',
    ammoType: 'AMMO_FIREWORK',
    clipSize: 1,
    damage: 50,
    components: []
  },
  {
    id: 'weapon_railgun',
    name: 'Railgun',
    hashName: 'WEAPON_RAILGUN',
    hexHash: '0x6D544C3E',
    decHash: 1833602238,
    category: 'Heavy',
    ammoType: 'AMMO_RAILGUN',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_hominglauncher',
    name: 'Homing Launcher (Stinger)',
    hashName: 'WEAPON_HOMINGLAUNCHER',
    hexHash: '0x63AB0442',
    decHash: 1672151938,
    category: 'Heavy',
    ammoType: 'AMMO_HOMINGLAUNCHER',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_compactlauncher',
    name: 'Compact Grenade Launcher',
    hashName: 'WEAPON_COMPACTLAUNCHER',
    hexHash: '0x07817D48',
    decHash: 125957618,
    category: 'Heavy',
    ammoType: 'AMMO_GRENADELAUNCHER',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_rayminigun',
    name: 'Widowmaker Laser Minigun',
    hashName: 'WEAPON_RAYMINIGUN',
    hexHash: '0xB62D1F67',
    decHash: -1238556825,
    category: 'Heavy',
    ammoType: 'AMMO_MINIGUN',
    clipSize: 9999,
    damage: 30,
    components: []
  },

  {
    id: 'weapon_grenade',
    name: 'Frag Grenade',
    hashName: 'WEAPON_GRENADE',
    hexHash: '0x23C9F95C',
    decHash: 600439132,
    category: 'Throwables',
    ammoType: 'AMMO_GRENADE',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_bzgas',
    name: 'BZ Gas Grenade',
    hashName: 'WEAPON_BZGAS',
    hexHash: '0xA0973D5E',
    decHash: -1600701090,
    category: 'Throwables',
    ammoType: 'AMMO_BZGAS',
    clipSize: 1,
    damage: 5,
    components: []
  },
  {
    id: 'weapon_molotov',
    name: 'Molotov Cocktail',
    hashName: 'WEAPON_MOLOTOV',
    hexHash: '0x24B17070',
    decHash: 615608432,
    category: 'Throwables',
    ammoType: 'AMMO_MOLOTOV',
    clipSize: 1,
    damage: 100,
    components: []
  },
  {
    id: 'weapon_stickybomb',
    name: 'Sticky Bomb (C4)',
    hashName: 'WEAPON_STICKYBOMB',
    hexHash: '0x787F0BB',
    decHash: 126349499,
    category: 'Throwables',
    ammoType: 'AMMO_STICKYBOMB',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_proxmine',
    name: 'Proximity Mine',
    hashName: 'WEAPON_PROXMINE',
    hexHash: '0xAB564B97',
    decHash: -1420407913,
    category: 'Throwables',
    ammoType: 'AMMO_PROXMINE',
    clipSize: 1,
    damage: 250,
    components: []
  },
  {
    id: 'weapon_snowball',
    name: 'Snowball',
    hashName: 'WEAPON_SNOWBALL',
    hexHash: '0x787F0BB',
    decHash: 126349499,
    category: 'Throwables',
    ammoType: 'AMMO_SNOWBALL',
    clipSize: 1,
    damage: 1,
    components: []
  },
  {
    id: 'weapon_pipebomb',
    name: 'Pipe Bomb',
    hashName: 'WEAPON_PIPEBOMB',
    hexHash: '0xBA45E8B8',
    decHash: -1169823560,
    category: 'Throwables',
    ammoType: 'AMMO_PIPEBOMB',
    clipSize: 1,
    damage: 200,
    components: []
  },
  {
    id: 'weapon_smokegrenade',
    name: 'Tear Gas / Smoke Grenade',
    hashName: 'WEAPON_SMOKEGRENADE',
    hexHash: '0xFDBC8A50',
    decHash: -37922480,
    category: 'Throwables',
    ammoType: 'AMMO_SMOKEGRENADE',
    clipSize: 1,
    damage: 5,
    components: []
  },
  {
    id: 'weapon_flare',
    name: 'Signal Flare',
    hashName: 'WEAPON_FLARE',
    hexHash: '0x497FACC3',
    decHash: 1233104067,
    category: 'Throwables',
    ammoType: 'AMMO_FLARE',
    clipSize: 1,
    damage: 5,
    components: []
  },

  {
    id: 'weapon_pistol_mk2',
    name: 'Pistol Mk II',
    hashName: 'WEAPON_PISTOL_MK2',
    hexHash: '0xBFE256D4',
    decHash: -1075685676,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_PISTOL',
    clipSize: 12,
    damage: 32,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_PISTOL_MK2_CLIP_01', description: '12-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_PISTOL_MK2_CLIP_02', description: '16-round mag' },
      { name: 'Tracer Rounds', hash: 'COMPONENT_PISTOL_MK2_CLIP_TRACER', description: 'Tracer ammo' },
      { name: 'Incendiary Rounds', hash: 'COMPONENT_PISTOL_MK2_CLIP_INCENDIARY', description: 'Fire ammo' },
      { name: 'Hollow Point Rounds', hash: 'COMPONENT_PISTOL_MK2_CLIP_HOLLOWPOINT', description: 'Extra unarmored damage' },
      { name: 'FMJ Rounds', hash: 'COMPONENT_PISTOL_MK2_CLIP_FMJ', description: 'Vehicle bullet penetration' },
      { name: 'Mounted Sight', hash: 'COMPONENT_AT_PI_RAIL', description: 'Micro reflex sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP_02', description: 'Suppressor' },
      { name: 'Compensator', hash: 'COMPONENT_AT_PI_COMP', description: 'Recoil compensator' }
    ]
  },
  {
    id: 'weapon_smg_mk2',
    name: 'SMG Mk II',
    hashName: 'WEAPON_SMG_MK2',
    hexHash: '0x78A97CC0',
    decHash: 2024373440,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_SMG',
    clipSize: 30,
    damage: 25,
    components: [
      { name: 'Default Clip', hash: 'COMPONENT_SMG_MK2_CLIP_01', description: '30-round mag' },
      { name: 'Extended Clip', hash: 'COMPONENT_SMG_MK2_CLIP_02', description: '60-round mag' },
      { name: 'Incendiary Rounds', hash: 'COMPONENT_SMG_MK2_CLIP_INCENDIARY', description: 'Fire ammo' },
      { name: 'Hollow Point Rounds', hash: 'COMPONENT_SMG_MK2_CLIP_HOLLOWPOINT', description: 'Hollow point ammo' },
      { name: 'FMJ Rounds', hash: 'COMPONENT_SMG_MK2_CLIP_FMJ', description: 'FMJ armor piercing ammo' },
      { name: 'Holographic Sight', hash: 'COMPONENT_AT_SIGHTS_SMG', description: 'Holo sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_PI_SUPP', description: 'Suppressor' },
      { name: 'Muzzle Brake', hash: 'COMPONENT_AT_MUZZLE_01', description: 'Muzzle brake' }
    ]
  },
  {
    id: 'weapon_assaultrifle_mk2',
    name: 'Assault Rifle Mk II',
    hashName: 'WEAPON_ASSAULTRIFLE_MK2',
    hexHash: '0x394F415C',
    decHash: 961495388,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 38,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_ASSAULTRIFLE_MK2_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_ASSAULTRIFLE_MK2_CLIP_02', description: '60-round mag' },
      { name: 'Armor Piercing Rounds', hash: 'COMPONENT_ASSAULTRIFLE_MK2_CLIP_ARMORPIERCING', description: 'Body armor bypass' },
      { name: 'Incendiary Rounds', hash: 'COMPONENT_ASSAULTRIFLE_MK2_CLIP_INCENDIARY', description: 'Incendiary fire rounds' },
      { name: 'Medium Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM_MK2', description: 'Tactical optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP_02', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_carbinerifle_mk2',
    name: 'Carbine Rifle Mk II',
    hashName: 'WEAPON_CARBINERIFLE_MK2',
    hexHash: '0xFAD1F033',
    decHash: -86904375,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 36,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_CARBINERIFLE_MK2_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_CARBINERIFLE_MK2_CLIP_02', description: '60-round mag' },
      { name: 'Armor Piercing Rounds', hash: 'COMPONENT_CARBINERIFLE_MK2_CLIP_ARMORPIERCING', description: 'Body armor piercing' },
      { name: 'FMJ Rounds', hash: 'COMPONENT_CARBINERIFLE_MK2_CLIP_FMJ', description: 'Vehicle penetration' },
      { name: 'Medium Scope', hash: 'COMPONENT_AT_SCOPE_MEDIUM_MK2', description: 'Tactical optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP_02', description: 'Grip' }
    ]
  },
  {
    id: 'weapon_heavysniper_mk2',
    name: 'Heavy Sniper Mk II',
    hashName: 'WEAPON_HEAVYSNIPER_MK2',
    hexHash: '0xA91479D',
    decHash: 177293209,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_SNIPER',
    clipSize: 4,
    damage: 230,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_HEAVYSNIPER_MK2_CLIP_01', description: '4-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_HEAVYSNIPER_MK2_CLIP_02', description: '6-round mag' },
      { name: 'Explosive Rounds', hash: 'COMPONENT_HEAVYSNIPER_MK2_CLIP_EXPLOSIVE', description: 'Explosive high damage rounds' },
      { name: 'Incendiary Rounds', hash: 'COMPONENT_HEAVYSNIPER_MK2_CLIP_INCENDIARY', description: 'Fire rounds' },
      { name: 'Armor Piercing Rounds', hash: 'COMPONENT_HEAVYSNIPER_MK2_CLIP_ARMORPIERCING', description: 'Armor bypass' },
      { name: 'Thermal Scope', hash: 'COMPONENT_AT_SCOPE_THERMAL', description: 'Thermal infrared vision scope' },
      { name: 'Night Vision Scope', hash: 'COMPONENT_AT_SCOPE_NV', description: 'Night vision optic' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_SR_SUPP_03', description: 'Heavy sniper suppressor' },
      { name: 'Muzzle Brake', hash: 'COMPONENT_AT_MUZZLE_08', description: 'Recoil muzzle brake' }
    ]
  },
  {
    id: 'weapon_pumpshotgun_mk2',
    name: 'Pump Shotgun Mk II',
    hashName: 'WEAPON_PUMPSHOTGUN_MK2',
    hexHash: '0x555AF99A',
    decHash: 1432025498,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_SHOTGUN',
    clipSize: 8,
    damage: 75,
    components: [
      { name: 'Explosive Slugs', hash: 'COMPONENT_PUMPSHOTGUN_MK2_CLIP_EXPLOSIVE', description: 'Explosive 12-gauge slug' },
      { name: 'Dragon\'s Breath', hash: 'COMPONENT_PUMPSHOTGUN_MK2_CLIP_INCENDIARY', description: 'Incendiary buckshot' },
      { name: 'Steel Buckshot', hash: 'COMPONENT_PUMPSHOTGUN_MK2_CLIP_ARMORPIERCING', description: 'Armor piercing buckshot' },
      { name: 'Reflex Sight', hash: 'COMPONENT_AT_SIGHTS', description: 'Holo sight' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_SR_SUPP_03', description: 'Shotgun suppressor' }
    ]
  },
  {
    id: 'weapon_specialcarbine_mk2',
    name: 'Special Carbine Mk II',
    hashName: 'WEAPON_SPECIALCARBINE_MK2',
    hexHash: '0x969C3D67',
    decHash: -1768145561,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_RIFLE',
    clipSize: 30,
    damage: 38,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_SPECIALCARBINE_MK2_CLIP_01', description: '30-round mag' },
      { name: 'Extended Mag', hash: 'COMPONENT_SPECIALCARBINE_MK2_CLIP_02', description: '60-round mag' },
      { name: 'Armor Piercing Rounds', hash: 'COMPONENT_SPECIALCARBINE_MK2_CLIP_ARMORPIERCING', description: 'AP ammo' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP_02', description: 'Suppressor' }
    ]
  },
  {
    id: 'weapon_marksmanrifle_mk2',
    name: 'Marksman Rifle Mk II',
    hashName: 'WEAPON_MARKSMANRIFLE_MK2',
    hexHash: '0x8A4D2727',
    decHash: -1974635737,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_SNIPER',
    clipSize: 8,
    damage: 75,
    components: [
      { name: 'Extended Mag', hash: 'COMPONENT_MARKSMANRIFLE_MK2_CLIP_02', description: '16-round mag' },
      { name: 'Armor Piercing', hash: 'COMPONENT_MARKSMANRIFLE_MK2_CLIP_ARMORPIERCING', description: 'AP ammo' },
      { name: 'Suppressor', hash: 'COMPONENT_AT_AR_SUPP', description: 'Suppressor' }
    ]
  },
  {
    id: 'weapon_revolver_mk2',
    name: 'Heavy Revolver Mk II',
    hashName: 'WEAPON_REVOLVER_MK2',
    hexHash: '0xCB963956',
    decHash: -879347409,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_PISTOL',
    clipSize: 6,
    damage: 200,
    components: [
      { name: 'Hollow Point Rounds', hash: 'COMPONENT_REVOLVER_MK2_CLIP_HOLLOWPOINT', description: '1-shot unarmored kill' },
      { name: 'Incendiary Rounds', hash: 'COMPONENT_REVOLVER_MK2_CLIP_INCENDIARY', description: 'Ignites targets on fire' },
      { name: 'Reflex Sight', hash: 'COMPONENT_AT_SIGHTS', description: 'Micro reflex sight' },
      { name: 'Compensator', hash: 'COMPONENT_AT_PI_COMP_02', description: 'Recoil compensator' }
    ]
  },
  {
    id: 'weapon_combatmg_mk2',
    name: 'Combat MG Mk II',
    hashName: 'WEAPON_COMBATMG_MK2',
    hexHash: '0xDBBD7280',
    decHash: -608281088,
    category: 'Mk II Weapons',
    ammoType: 'AMMO_MG',
    clipSize: 100,
    damage: 47,
    components: [
      { name: 'Default Mag', hash: 'COMPONENT_COMBATMG_MK2_CLIP_01', description: '100-round box' },
      { name: 'Extended Mag', hash: 'COMPONENT_COMBATMG_MK2_CLIP_02', description: '200-round box' },
      { name: 'Armor Piercing', hash: 'COMPONENT_COMBATMG_MK2_CLIP_ARMORPIERCING', description: 'AP ammo' },
      { name: 'Grip', hash: 'COMPONENT_AT_AR_AFGRIP_02', description: 'Tactical grip' },
      { name: 'Muzzle Brake', hash: 'COMPONENT_AT_MUZZLE_01', description: 'Muzzle brake' }
    ]
  }
];
