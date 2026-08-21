import React, { useState, useMemo } from 'react';
import { Flag, Search, Copy, Check, RotateCcw } from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

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
  tag: 'YTYP' | 'Vehicles' | 'Handling' | 'AI & Anim';
  description: string;
  flags: FlagDefinition[];
}

const FLAG_CATEGORIES: FlagCategory[] = [
  {
    id: 'CBaseArchetypeDefFlags',
    name: 'CBaseArchetypeDefFlags (YTYP Archetypes)',
    tag: 'YTYP',
    description: 'YTYP archetype rendering, physics, destruction, and vertex channel flags for GTA V props and map assets.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'FLAG_WET_ROAD_REFLECTION', description: 'Enables wet road reflections on the object surface.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'FLAG_DONT_FADE', description: 'Prevents the object from fading out at far streaming distances.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'FLAG_DRAW_LAST', description: 'Forces the engine renderer to draw this model in the final rendering pass.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'FLAG_PROP_CLIMBABLE_BY_AI', description: 'Enables AI navigation climbable mesh tag on the prop.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'FLAG_SUPPRESS_HD_TXDS', description: 'Suppresses high-definition texture dictionary loading.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'FLAG_IS_FIXED', description: 'Entity is Fixed/will not interact with Dynamic objects. Enables indestructibility for archetype, making it static for props.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'FLAG_DONT_WRITE_ZBUFFER', description: 'Prevents writing geometry depth to the Z-buffer.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'FLAG_TOUGHFORBULLETS', description: 'Bullet resistant property used in instanced archetypes (instancedData in #map files).' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'FLAG_IS_GENERIC', description: 'Generic archetype classification.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'FLAG_HAS_ANIM', description: 'Used in archetypes with skeletal bones inside models (YCD animation dictionary).' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'FLAG_HAS_UVANIM', description: 'Used in archetypes with scrolling UV animations (YCD).' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'FLAG_SHADOW_ONLY', description: 'Blocks lights and casts shadows without rendering the visual mesh.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'FLAG_DAMAGE_MODEL', description: 'Enables deformation and damage mesh states.' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'FLAG_DONT_CAST_SHADOWS', description: 'Object will not cast Shadows (Used with overlays/decals).' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'FLAG_CAST_TEXTURE_SHADOWS', description: 'Casts shadows with alpha texture transparency cutouts.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'FLAG_DONT_COLLIDE_WITH_FLYER', description: 'Disables collision detection against flying vehicles (planes, helicopters).' },
      { bit: 16, dec: 65536, hex: '0x00010000', name: 'FLAG_IS_TREE', description: 'Enables double-sided rendering shaders (used for trees and foliage).' },
      { bit: 17, dec: 131072, hex: '0x00020000', name: 'FLAG_IS_TYPE_OBJECT', description: 'Enables destructibility for archetype, making it dynamic for props. Needed for GET_CLOSEST_OBJECT_OF_TYPE and CREATE_OBJECT.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'FLAG_OVERRIDE_PHYSICS_BOUNDS', description: 'Overrides default collision bounding box with custom physics bound.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'FLAG_AUTOSTART_ANIM', description: 'Allows playing YCD animations on dynamic objects (requires FLAG_IS_TYPE_OBJECT).' },
      { bit: 20, dec: 1048576, hex: '0x00100000', name: 'FLAG_HAS_PRE_REFLECTED_WATER_PROXY', description: 'Uses pre-reflected water proxy mesh for water body interaction.' },
      { bit: 21, dec: 2097152, hex: '0x00200000', name: 'FLAG_HAS_DRAWABLE_PROXY_FOR_WATER_REFLECTIONS', description: 'Drawable proxy geometry used specifically for water reflections.' },
      { bit: 22, dec: 4194304, hex: '0x00400000', name: 'FLAG_DOES_NOT_PROVIDE_AI_COVER', description: 'AI peds will not use this object as cover during shootouts.' },
      { bit: 23, dec: 8388608, hex: '0x00800000', name: 'FLAG_DOES_NOT_PROVIDE_PLAYER_COVER', description: 'Player cannot take cover behind this object.' },
      { bit: 24, dec: 16777216, hex: '0x01000000', name: 'FLAG_IS_LADDER_DEPRECATED', description: 'Deprecated legacy ladder definition flag.' },
      { bit: 25, dec: 33554432, hex: '0x02000000', name: 'FLAG_HAS_CLOTH', description: 'Object contains cloth physics simulation data (flags, curtains, banners).' },
      { bit: 26, dec: 67108864, hex: '0x04000000', name: 'FLAG_DOOR_PHYSICS', description: 'Enables special door physics and rotational attributes for door archetypes.' },
      { bit: 27, dec: 134217728, hex: '0x08000000', name: 'FLAG_IS_FIXED_FOR_NAVIGATION', description: 'Bakes entity as a permanent static obstacle in AI navmesh pathfinding.' },
      { bit: 28, dec: 268435456, hex: '0x10000000', name: 'FLAG_DONT_AVOID_BY_PEDS', description: 'Disable red vertex channel for object.' },
      { bit: 29, dec: 536870912, hex: '0x20000000', name: 'FLAG_USE_AMBIENT_SCALE', description: 'Disable green vertex channel for object. Props commonly use this. Prevents archetypes with white vertexes from glowing at night.' },
      { bit: 30, dec: 1073741824, hex: '0x40000000', name: 'FLAG_IS_DEBUG', description: 'Disable blue vertex channel for object.' },
      { bit: 31, dec: 2147483648, hex: '0x80000000', name: 'FLAG_HAS_ALPHA_SHADOW', description: 'Disable Alpha vertex channel for object.' }
    ]
  },
  {
    id: 'ModelFlags',
    name: 'ModelFlags (vehicles.meta)',
    tag: 'Vehicles',
    description: 'Vehicle model archetype flags controlling double doors, ABS, axles, tracks, exhausts, and bulletproof tires.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'MF_IS_VAN', description: 'Allows double doors for the rear doors animation.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'MF_IS_BUS', description: 'Uses bus animations for entry/exit.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'MF_IS_LOW', description: 'Uses animations suitable for cars with a low ride-height.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'MF_IS_BIG', description: 'Changes the way that the AI drives around corners.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'MF_ABS_STD', description: 'Arcade Anti-Lock Braking System (ABS) equipped as standard; minimal slip allowed.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'MF_ABS_OPTION', description: 'Arcade Anti-Lock Braking System (ABS) equipped w/ brakes upgrade.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'MF_ABS_ALT_STD', description: 'Realistic Anti-Lock Braking System (ABS) equipped as standard; some slip allowed.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'MF_ABS_ALT_OPTION', description: 'Realistic Anti-Lock Braking System (ABS) equipped w/ brakes upgrade.' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'MF_NO_DOORS', description: 'For vehicles that don\'t have any operable doors.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'MF_TANDEM_SEATING', description: 'Two people will use the front passenger seat.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'MF_SIT_IN_BOAT', description: 'Uses seated boat animation instead of standing.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'MF_HAS_TRACKS', description: 'For vehicles with tracks instead of tires (tanks, bulldozers).' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'MF_NO_EXHAUST', description: 'Removes all exhaust particles.' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'MF_DOUBLE_EXHAUST', description: 'Creates a second exhaust by mirroring the model\'s exhaust over the y-axis.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'MF_NO_1STPERSON_LOOKBEHIND', description: 'Prevents player using rear view when in first-person mode.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'MF_CAN_ENTER_IF_NO_DOOR', description: 'Allows entry into the vehicle despite no currently accessible doors.' },
      { bit: 16, dec: 65536, hex: '0x00010000', name: 'MF_AXLE_F_TORSION', description: 'Front wheels stay vertical to the car.' },
      { bit: 17, dec: 131072, hex: '0x00020000', name: 'MF_AXLE_F_SOLID', description: 'Front wheels stay parallel to each other.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'MF_AXLE_F_MCPHERSON', description: 'Front wheels can tilt.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'MF_ATTACH_PED_TO_BODYSHELL', description: 'Attaches ped physics anchor directly to vehicle bodyshell.' },
      { bit: 20, dec: 1048576, hex: '0x00100000', name: 'MF_AXLE_R_TORSION', description: 'Rear wheels stay vertical to the car.' },
      { bit: 21, dec: 2097152, hex: '0x00200000', name: 'MF_AXLE_R_SOLID', description: 'Rear wheels stay parallel to each other.' },
      { bit: 22, dec: 4194304, hex: '0x00400000', name: 'MF_AXLE_R_MCPHERSON', description: 'Rear wheels can tilt.' },
      { bit: 23, dec: 8388608, hex: '0x00800000', name: 'MF_DONT_FORCE_GRND_CLEARANCE', description: 'Chassis collision is taken into account when suspension is compressed while hitting the ground, with sparks rendered.' },
      { bit: 24, dec: 16777216, hex: '0x01000000', name: 'MF_DONT_RENDER_STEER', description: 'Does not render steering wheel turning animations.' },
      { bit: 25, dec: 33554432, hex: '0x02000000', name: 'MF_NO_WHEEL_BURST', description: 'Has Bulletproof Tires as standard.' },
      { bit: 26, dec: 67108864, hex: '0x04000000', name: 'MF_INDESTRUCTIBLE', description: 'Can\'t explode or be considered inoperable from damage.' },
      { bit: 27, dec: 134217728, hex: '0x08000000', name: 'MF_DOUBLE_FRONT_WHEELS', description: 'Places a second instance of each front wheel next to the normal one.' },
      { bit: 28, dec: 268435456, hex: '0x10000000', name: 'MF_IS_RC', description: 'For RC vehicles such as the RC Bandito and Invade & Persuade Tank. The player model is hidden upon entering the vehicle.' },
      { bit: 29, dec: 536870912, hex: '0x20000000', name: 'MF_DOUBLE_REAR_WHEELS', description: 'Duplicates the skidmarks of the rear tires.' },
      { bit: 30, dec: 1073741824, hex: '0x40000000', name: 'MF_NO_WHEEL_BREAK', description: 'Prevents wheel bones from detaching off the vehicle due to damage.' },
      { bit: 31, dec: 2147483648, hex: '0x80000000', name: 'MF_EXTRA_CAMBER', description: 'Vehicle needs extra wheel camber to stop the wheels clipping the arches (used for lowriders).' }
    ]
  },
  {
    id: 'HandlingFlags',
    name: 'HandlingFlags (handling.meta)',
    tag: 'Handling',
    description: 'Vehicle handling flags controlling suspension progressive compression, KERS, 4WS, CVT electrics, and off-road grip.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'HF_SMOOTHED_COMPRESSION', description: 'Simulates progressive spring suspension. Makes suspension compression motion smoother.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'HF_REDUCED_MOD_MASS', description: 'Reduces mass added from performance upgrades.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'HF_HAS_KERS', description: 'Partially enables KERS on the vehicle; disables horn and shows the recharge bar below the minimap. KERS boost itself still needs to be enabled by SET_VEHICLE_KERS_ALLOWED.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'HF_HAS_RALLY_TYRES', description: 'Inverts the way grip works on the vehicle; grip starts at fTractionCurveMin and increases up to fTractionCurveMax on slip. Grip stays at max beyond peak slip angle.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'HF_NO_HANDBRAKE', description: 'Disables handbrake control for the vehicle.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'HF_STEER_REARWHEELS', description: 'Steers the rear wheels instead of the front.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'HF_HANDBRAKE_REARWHEELSTEER', description: 'Handbrake control makes the rear wheels steer as well as the front.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'HF_STEER_ALL_WHEELS', description: 'Steers all wheels (4-wheel-steering system). Rear wheels steer at the same lock angle as the front, defined by fSteeringLock.' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'HF_FREEWHEEL_NO_GAS', description: 'Disables engine-braking when no throttle is applied.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'HF_NO_REVERSE', description: 'Disables reversing for the vehicle.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'HF_REDUCED_RIGHTING_FORCE', description: 'Reduces vehicle righting force when tilted.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'HF_STEER_NO_WHEELS', description: 'Disables steering on all wheels (used with tracked vehicles).' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'HF_CVT', description: 'Gives vehicle a fixed-ratio transmission with gear ratio of 0.90 (used for nInitialDriveGears=1, electric vehicles).' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'HF_ALT_EXT_WHEEL_BOUNDS_BEH', description: 'Alternative extra wheel bound behavior. Offset extra wheel bounds forward so they act as bumpers.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'HF_DONT_RAISE_BOUNDS_AT_SPEED', description: 'Turns off extra bound raising at high speed for vehicles whose collision bounds react poorly.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'HF_EXT_WHEEL_BOUNDS_COL', description: 'Extra wheel bounds collide with other vehicle wheels.' },
      { bit: 16, dec: 65536, hex: '0x00010000', name: 'HF_LESS_SNOW_SINK', description: 'Less grip loss from deep mud/snow (notably in North Yankton).' },
      { bit: 17, dec: 131072, hex: '0x00020000', name: 'HF_TYRES_CAN_CLIP', description: 'Tires are allowed to clip into pavement under pressure, dealing better with uneven terrain (reason why Offroad Tires improve performance on specific vehicles).' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'HF_REDUCED_DRIVE_OVER_DAMAGE', description: 'Don\'t explode vehicles when monster trucks drive over them.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'HF_ALT_EXT_WHEEL_BOUNDS_SHRINK', description: 'Shrinks extra wheel collision bounds.' },
      { bit: 20, dec: 1048576, hex: '0x00100000', name: 'HF_OFFROAD_ABILITIES', description: 'Gravity constant increased by 10% to 10.78 m/s^2, resulting in increased grip, faster falling airborne, and +10% acceleration and braking.' },
      { bit: 21, dec: 2097152, hex: '0x00200000', name: 'HF_OFFROAD_ABILITIES_X2', description: 'Gravity increased by 20% to 11.76 m/s^2, +20% acceleration and braking. Vehicle does not react to bushes.' },
      { bit: 22, dec: 4194304, hex: '0x00400000', name: 'HF_TYRES_RAISE_SIDE_IMPACT_THRESHOLD', description: 'Includes tires in the side collision hitbox (recommended for monster-trucks whose wheels extend beyond bodywork).' },
      { bit: 23, dec: 8388608, hex: '0x00800000', name: 'HF_OFFROAD_INCREASED_GRAVITY_NO_FOLIAGE_DRAG', description: 'Gravity constant increased by 20% to 11.76 m/s^2, +20% acceleration/braking. Identical to HF_OFFROAD_ABILITIES_X2.' },
      { bit: 24, dec: 16777216, hex: '0x01000000', name: 'HF_ENABLE_LEAN', description: 'Enables motorcycle or boat lean physics.' },
      { bit: 25, dec: 33554432, hex: '0x02000000', name: 'HF_FORCE_NO_TC_OR_SC', description: 'Allows motorcycles to lose traction without electronic assists interfering.' },
      { bit: 26, dec: 67108864, hex: '0x04000000', name: 'HF_HEAVYARMOUR', description: 'Vehicle is resistant to explosions.' },
      { bit: 27, dec: 134217728, hex: '0x08000000', name: 'HF_ARMOURED', description: 'Vehicle is bullet proof. Prevents vehicle doors, hood, and trunk from opening in collisions.' },
      { bit: 28, dec: 268435456, hex: '0x10000000', name: 'HF_SELF_RIGHTING_IN_WATER', description: 'Vehicle automatically attempts to right itself upright in water.' },
      { bit: 29, dec: 536870912, hex: '0x20000000', name: 'HF_IMPROVED_RIGHTING_FORCE', description: 'Adds extra force to the vehicle when attempting to flip it back on its wheels.' },
      { bit: 30, dec: 1073741824, hex: '0x40000000', name: 'HF_LOW_SPEED_WHEELIES', description: 'Enables low-speed wheelie capabilities.' }
    ]
  },
  {
    id: 'AdvancedFlags',
    name: 'AdvancedFlags (handling.meta)',
    tag: 'Handling',
    description: 'Advanced handling flags for limited slip differentials, stancing, Tuners hard rev limits, downforce bias, and extended mods.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'CF_DIFF_FRONT', description: 'Front Torsen differential resistance configuration.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'CF_DIFF_REAR', description: 'Rear Torsen differential resistance configuration.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'CF_DIFF_CENTRE', description: 'Transfers drive force from slipping wheels to less-driven wheels (Drive Bias Transfer).' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'CF_DIFF_LIMITED_FRONT', description: 'Limited slip front differential with later upshifts.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'CF_DIFF_LIMITED_REAR', description: 'Limited slip rear differential.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'CF_DIFF_LIMITED_CENTRE', description: 'Limited slip center differential.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'CF_DIFF_LOCKING_FRONT', description: 'Front wheels wheelspin if player holds down handbrake and throttle/reverse.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'CF_DIFF_LOCKING_REAR', description: 'Handbrake slows car down smoothly without leaving tire marks (Smooth Handbrake).' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'CF_DIFF_LOCKING_CENTRE', description: 'Center locking differential.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'CF_GEARBOX_FULL_AUTO', description: 'Fully automatic gearbox.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'CF_GEARBOX_MANUAL', description: 'Sets clutch value to 0.0 when idling (Manual clutch simulation).' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'CF_GEARBOX_DIRECT_SHIFT', description: 'Direct shift transmission.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'CF_GEARBOX_ELECTRIC', description: 'Electric vehicle gearbox (Used by the Omnis e-GT).' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'CF_ASSIST_TRACTION_CONTROL', description: 'Traction control assist: reduces throttle on wheel slip.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'CF_ASSIST_STABILITY_CONTROL', description: 'Stability control assist: applies brakes to individual wheels.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'CF_ALLOW_REDUCED_SUSPENSION_FORCE', description: 'Allows the vehicle to be stanced using SET_REDUCED_SUSPENSION_FORCE (Requires CF_FIX_OLD_BUGS).' },
      { bit: 16, dec: 65536, hex: '0x00010000', name: 'CF_HARD_REV_LIMIT', description: 'Uncaps RPM in last gear, lowering top speed (Tuner cars speed cap).' },
      { bit: 17, dec: 131072, hex: '0x00020000', name: 'CF_HOLD_GEAR_WITH_WHEELSPIN', description: 'Later upshifts; usually hits the gear rev limit before shifting.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'CF_INCREASE_SUSPENSION_FORCE_WITH_SPEED', description: 'Anti-downforce suspension; increases suspension spring force as vehicle goes faster.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'CF_BLOCK_INCREASED_ROT_VELOCITY_WITH_DRIVE_FORCE', description: 'Generates fake wheelspin after real wheelspin; tires behave like they are still spinning.' },
      { bit: 20, dec: 1048576, hex: '0x00100000', name: 'CF_REDUCED_SELF_RIGHTING_SPEED', description: 'Reduces righting force of vehicle, making it much harder and slower to flip back on wheels.' },
      { bit: 21, dec: 2097152, hex: '0x00200000', name: 'CF_CLOSE_RATIO_GEARBOX', description: 'Extends the duration of first gear, giving vehicle a slower launch with greatly reduced wheelspin.' },
      { bit: 22, dec: 4194304, hex: '0x00400000', name: 'CF_FORCE_SMOOTH_RPM', description: 'Smooth first-gear revving with resistance to hitting the rev-limit.' },
      { bit: 23, dec: 8388608, hex: '0x00800000', name: 'CF_ALLOW_TURN_ON_SPOT', description: 'Allows vehicle to be rotated left or right while parked on the spot (Neutral steer for tanks).' },
      { bit: 24, dec: 16777216, hex: '0x01000000', name: 'CF_CAN_WHEELIE', description: 'Allows the vehicle to perform a handbrake wheelie (Muscle class hardcoded flag).' },
      { bit: 25, dec: 33554432, hex: '0x02000000', name: 'CF_ENABLE_WHEEL_BLOCKER_SIDE_IMPACTS', description: 'Makes wheels much less likely to clip into ground when vehicle is tipped over.' },
      { bit: 26, dec: 67108864, hex: '0x04000000', name: 'CF_FIX_OLD_BUGS', description: 'Forced stock-tyre clipping boundaries; prevents lowering by shooting wheels. Required for stancing.' },
      { bit: 27, dec: 134217728, hex: '0x08000000', name: 'CF_USE_DOWNFORCE_BIAS', description: 'Open-Wheel class downforce and spoiler tuning system. Curb-boosting is nullified.' },
      { bit: 28, dec: 268435456, hex: '0x10000000', name: 'CF_REDUCE_BODY_ROLL_WITH_SUSPENSION_MODS', description: 'Reduces body roll and adds grip with each suspension upgrade equipped.' },
      { bit: 29, dec: 536870912, hex: '0x20000000', name: 'CF_ALLOWS_EXTENDED_MODS', description: 'Requires AdvancedData. Adds turbo-affecting mods (VMT_KNOB) and power-affecting mods (VMT_ICE).' }
    ]
  },
  {
    id: 'DamageFlags',
    name: 'DamageFlags (vehicles.meta)',
    tag: 'Vehicles',
    description: 'Vehicle damage flags to mark doors, bonnet, and boot bones as non-breakable.',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'DF_DRIVER_SIDE_FRONT_DOOR', description: 'Marks the driver-side front door (door_dside_f) bone as non-breakable.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'DF_DRIVER_SIDE_REAR_DOOR', description: 'Marks the driver-side rear door (door_dside_r) bone as non-breakable.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'DF_DRIVER_PASSENGER_SIDE_FRONT_DOOR', description: 'Marks the passenger-side front door (door_pside_f) bone as non-breakable.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'DF_DRIVER_PASSENGER_SIDE_REAR_DOOR', description: 'Marks the passenger-side rear door (door_pside_r) bone as non-breakable.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'DF_BONNET', description: 'Marks the bonnet / hood bone as non-breakable.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'DF_BOOT', description: 'Marks the boot / trunk bone as non-breakable.' }
    ]
  },
  {
    id: 'DrivingStyleFlags',
    name: 'DrivingStyleFlags (AI Driving Modes)',
    tag: 'AI & Anim',
    description: 'AI ped driving styles for SET_DRIVE_TASK_DRIVING_STYLE native (stopping at lights, overtaking, offroad).',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'DF_STOP_FOR_CARS', description: 'AI driver stops before hitting vehicles.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'DF_STOP_FOR_PEDS', description: 'AI driver stops before hitting pedestrians.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'DF_SWERVE_AROUND_ALL_CARS', description: 'Avoids and swerves around vehicles in traffic.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'DF_STEER_AROUND_STATIONARY_CARS', description: 'Steers around parked and stationary empty vehicles.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'DF_STEER_AROUND_PEDS', description: 'Steers around pedestrians.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'DF_STEER_AROUND_OBJECTS', description: 'Steers around road objects and props.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'DF_DONT_STEER_AROUND_PLAYER_PED', description: 'Will not avoid drive-by shooting player ped.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'DF_STOP_AT_LIGHTS', description: 'Stops at red traffic lights.' },
      { bit: 8, dec: 256, hex: '0x00000100', name: 'DF_GO_OFF_ROAD_WHEN_AVOIDING', description: 'Allows driving off-road when avoiding obstacles.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'DF_DRIVE_INTO_ONCOMING_TRAFFIC', description: 'Allows driving into oncoming traffic lane to overtake if current lane is blocked.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'DF_DRIVE_IN_REVERSE', description: 'Drives vehicle in reverse gear.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'DF_USE_WANDER_FALLBACK_INSTEAD_OF_STRAIGHT_LINE', description: 'If pathfinding fails, cruise randomly instead of driving in a straight line.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'DF_AVOID_RESTRICTED_AREAS', description: 'Avoids restricted and forbidden map zones.' },
      { bit: 13, dec: 8192, hex: '0x00002000', name: 'DF_PREVENT_BACKGROUND_PATHFINDING', description: 'Prevents background pathfinding calculations during cruise missions.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'DF_ADJUST_CRUISE_SPEED_BASED_ON_ROAD_SPEED', description: 'Follows legal road speed limit.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'DF_USE_SHORT_CUT_LINKS', description: 'Takes the shortest path, including dirt paths and off-road trails.' },
      { bit: 19, dec: 524288, hex: '0x00080000', name: 'DF_CHANGE_LANES_AROUND_OBSTRUCTIONS', description: 'Changes lanes to drive around obstructions and slower vehicles.' },
      { bit: 24, dec: 16777216, hex: '0x01000000', name: 'DF_FORCE_STRAIGHT_LINE', description: 'Ignores all road pathing; drives in a straight line directly towards destination.' },
      { bit: 29, dec: 536870912, hex: '0x20000000', name: 'DF_AVOID_HIGHWAYS', description: 'Avoids highways and freeways when possible.' }
    ]
  },
  {
    id: 'AnimationFlags',
    name: 'AnimationFlags (TaskPlayAnim)',
    tag: 'AI & Anim',
    description: 'Animation playback flags for TaskPlayAnim native (looping, movement blocking, ragdoll, upper body).',
    flags: [
      { bit: 0, dec: 1, hex: '0x00000001', name: 'ANIM_FLAG_LOOP', description: 'Loop animation continuously until manually stopped.' },
      { bit: 1, dec: 2, hex: '0x00000002', name: 'ANIM_FLAG_STOP_LAST_FRAME', description: 'Stop animation on the last frame.' },
      { bit: 2, dec: 4, hex: '0x00000004', name: 'ANIM_FLAG_FREEZE_LAST_FRAME', description: 'Freeze ped posture on the last frame.' },
      { bit: 3, dec: 8, hex: '0x00000008', name: 'ANIM_FLAG_INTERRUPTIBLE_BY_PLAYER', description: 'Allow player controls to interrupt the animation.' },
      { bit: 4, dec: 16, hex: '0x00000010', name: 'ANIM_FLAG_ALLOW_ROTATION', description: 'Allow player ped to rotate while playing animation.' },
      { bit: 5, dec: 32, hex: '0x00000020', name: 'ANIM_FLAG_CANCEL_IF_UNSUPPORTED', description: 'Cancel animation if unsupported on ped.' },
      { bit: 6, dec: 64, hex: '0x00000040', name: 'ANIM_FLAG_DONT_ABORT_ON_DEATH', description: 'Don\'t abort animation when ped dies.' },
      { bit: 7, dec: 128, hex: '0x00000080', name: 'ANIM_FLAG_DONT_AVOID_OBSTACLES', description: 'Don\'t avoid obstacles during animation.' },
      { bit: 9, dec: 512, hex: '0x00000200', name: 'ANIM_FLAG_BLOCK_EXIT', description: 'Block exit from animation.' },
      { bit: 10, dec: 1024, hex: '0x00000400', name: 'ANIM_FLAG_BLOCK_VEHICLE_ACTIONS', description: 'Block vehicle actions while animating.' },
      { bit: 11, dec: 2048, hex: '0x00000800', name: 'ANIM_FLAG_BLOCK_LOCKON', description: 'Block auto-aim lock-on targeting.' },
      { bit: 12, dec: 4096, hex: '0x00001000', name: 'ANIM_FLAG_BLOCK_WEAPONS', description: 'Block weapon firing and aiming during animation.' },
      { bit: 14, dec: 16384, hex: '0x00004000', name: 'ANIM_FLAG_BLOCK_MOVEMENT', description: 'Block player movement / walking.' },
      { bit: 15, dec: 32768, hex: '0x00008000', name: 'ANIM_FLAG_BLOCK_CAM_CONTROL', description: 'Block camera rotation control.' },
      { bit: 18, dec: 262144, hex: '0x00040000', name: 'ANIM_FLAG_ALLOW_STRECHING', description: 'Allow model bone stretching.' },
      { bit: 27, dec: 134217728, hex: '0x08000000', name: 'ANIM_FLAG_BLOCK_CLIMBING', description: 'Block climbing over obstacles.' },
      { bit: 28, dec: 268435456, hex: '0x10000000', name: 'ANIM_FLAG_BLOCK_JUMPING', description: 'Block jumping actions.' },
      { bit: 30, dec: 1073741824, hex: '0x40000000', name: 'ANIM_FLAG_BLOCK_RAGDOLL', description: 'Block ragdolling during animation.' }
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
    const parsed = Number(valStr);
    if (!isNaN(parsed) && parsed >= 0) {
      setFlagValue(parsed >>> 0);
    } else if (valStr === '') {
      setFlagValue(0);
    }
  };

  const handleHexChange = (hexStr: string) => {
    const clean = hexStr.replace(/^0x/i, '');
    const parsed = parseInt(clean, 16);
    if (!isNaN(parsed) && parsed >= 0) {
      setFlagValue(parsed >>> 0);
    } else if (clean === '') {
      setFlagValue(0);
    }
  };

  const toggleFlag = (dec: number) => {
    setFlagValue(prev => {
      const uPrev = prev >>> 0;
      const uDec = dec >>> 0;
      const isActive = (uPrev & uDec) !== 0;
      return isActive ? (uPrev & ~uDec) >>> 0 : (uPrev | uDec) >>> 0;
    });
  };

  const isFlagActive = (dec: number) => {
    return ((flagValue >>> 0) & (dec >>> 0)) !== 0;
  };

  const unsignedFlagValue = flagValue >>> 0;

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
    trackEvent('flags', key === 'xml' ? 'copy_xml' : 'copy_hex', `${currentCategory.id}: ${val}`);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const hexString = '0x' + unsignedFlagValue.toString(16).toUpperCase().padStart(8, '0');
  const binaryString = unsignedFlagValue.toString(2).padStart(32, '0').match(/.{1,4}/g)?.join(' ') || '';

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
              Accurate bitwise flag calculator for YTYP archetypes, vehicle model flags, handling flags, advanced handling, damage flags, and AI styles.
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

      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-zinc-900/90 rounded-2xl border border-white/10 text-xs w-full">
        {FLAG_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategoryId(cat.id);
              setSearch('');
            }}
            className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategoryId === cat.id ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className={`px-1.5 py-0.2 text-[9px] rounded font-mono font-black ${
              selectedCategoryId === cat.id
                ? 'bg-black text-white'
                : 'bg-white/10 text-zinc-300'
            }`}>
              {cat.tag}
            </span>
            <span>{cat.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 flex flex-col gap-4 p-6 rounded-2xl bg-zinc-950/80 border border-white/10">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block mb-1">
              Active Category
            </span>
            <h4 className="font-display font-extrabold text-sm text-white">{currentCategory.name}</h4>
            <p className="text-xs text-zinc-400 mt-1 leading-snug">{currentCategory.description}</p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Decimal Value (Integer)
            </label>
            <div className="relative">
              <input
                type="number"
                value={unsignedFlagValue}
                onChange={e => handleDecimalChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-sm font-bold text-white focus:outline-none focus:border-white/30"
              />
              <button
                onClick={() => handleCopy('dec', unsignedFlagValue.toString())}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                data-tooltip="Copy Decimal"
                data-tooltip-pos="left"
                aria-label="Copy Decimal"
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
                data-tooltip="Copy Hex"
                data-tooltip-pos="left"
                aria-label="Copy Hex"
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
            <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
              Code Snippets
            </label>

            <div className="space-y-2">
              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-400 truncate">
                  &lt;flags value="{unsignedFlagValue}"/&gt;
                </span>
                <button
                  onClick={() => handleCopy('xml', `<flags value="${unsignedFlagValue}"/>`)}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  data-tooltip="Copy XML tag"
                  data-tooltip-pos="left"
                  aria-label="Copy XML tag"
                >
                  {copiedKey === 'xml' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-zinc-400 truncate">
                  flags = {unsignedFlagValue}
                </span>
                <button
                  onClick={() => handleCopy('lua', `flags = ${unsignedFlagValue}`)}
                  className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  data-tooltip="Copy Lua code"
                  data-tooltip-pos="left"
                  aria-label="Copy Lua code"
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
                placeholder={`Search in ${currentCategory.name.split(' ')[0]}...`}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div
            data-lenis-prevent
            className="space-y-2 max-h-[620px] overflow-y-auto pr-1"
          >
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
