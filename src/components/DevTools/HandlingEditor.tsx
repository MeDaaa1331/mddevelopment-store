import React, { useState, useMemo, useRef } from 'react';
import {
  Car,
  Upload,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Shield,
  Gauge,
  Zap,
  Activity,
  Search,
  FileCode,
  Sparkles,
  Info,
  ChevronDown,
  Layers,
  Fuel,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { trackEvent } from '../../utils/analytics';

export interface HandlingData {
  handlingName: string;
  fMass: number;
  fInitialDragCoeff: number;
  fPercentSubmerged: number;
  vecCentreOfMassOffsetX: number;
  vecCentreOfMassOffsetY: number;
  vecCentreOfMassOffsetZ: number;
  vecInertiaMultiplierX: number;
  vecInertiaMultiplierY: number;
  vecInertiaMultiplierZ: number;
  fDriveBiasFront: number;
  nInitialDriveGears: number;
  fInitialDriveForce: number;
  fDriveInertia: number;
  fClutchChangeRateScaleUpShift: number;
  fClutchChangeRateScaleDownShift: number;
  fInitialDriveMaxFlatVel: number;
  fBrakeForce: number;
  fBrakeBiasFront: number;
  fHandBrakeForce: number;
  fSteeringLock: number;
  fTractionCurveMax: number;
  fTractionCurveMin: number;
  fTractionCurveLateral: number;
  fTractionSpringDeltaMax: number;
  fLowSpeedTractionLossMult: number;
  fCamberStiffnesss: number;
  fTractionBiasFront: number;
  fTractionLossMult: number;
  fSuspensionForce: number;
  fSuspensionCompDamp: number;
  fSuspensionReboundDamp: number;
  fSuspensionUpperLimit: number;
  fSuspensionLowerLimit: number;
  fSuspensionRaise: number;
  fSuspensionBiasFront: number;
  fAntiRollBarForce: number;
  fAntiRollBarBiasFront: number;
  fRollCentreHeightFront: number;
  fRollCentreHeightRear: number;
  fCollisionDamageMult: number;
  fWeaponDamageMult: number;
  fDeformationDamageMult: number;
  fEngineDamageMult: number;
  fPetrolTankVolume: number;
  fOilVolume: number;
  fDownforceModifier: number;
  fPopUpLightRotationAngle: number;
  fHandlingBoundsRadius: number;
  fWeaponDamageScaledToVehHealthMult: number;
  fDamageBoundsScaledToVehHealthMult: number;
  fDamageBoundsScale: number;
  fSeatOffsetDistX: number;
  fSeatOffsetDistY: number;
  fSeatOffsetDistZ: number;
  nMonetaryValue: number;
  strModelFlags: string;
  strHandlingFlags: string;
  strDamageFlags: string;
  AIHandling: string;
  rawSubHandlingXml?: string;
}

const DEFAULT_HANDLING: HandlingData = {
  handlingName: 'SPORTS_CAR',
  fMass: 1450.0,
  fInitialDragCoeff: 8.5,
  fPercentSubmerged: 85.0,
  vecCentreOfMassOffsetX: 0.0,
  vecCentreOfMassOffsetY: -0.05,
  vecCentreOfMassOffsetZ: 0.0,
  vecInertiaMultiplierX: 1.0,
  vecInertiaMultiplierY: 1.2,
  vecInertiaMultiplierZ: 1.6,
  fDriveBiasFront: 0.0,
  nInitialDriveGears: 6,
  fInitialDriveForce: 0.32,
  fDriveInertia: 1.0,
  fClutchChangeRateScaleUpShift: 2.3,
  fClutchChangeRateScaleDownShift: 2.3,
  fInitialDriveMaxFlatVel: 155.0,
  fBrakeForce: 1.1,
  fBrakeBiasFront: 0.55,
  fHandBrakeForce: 0.8,
  fSteeringLock: 38.0,
  fTractionCurveMax: 2.45,
  fTractionCurveMin: 2.15,
  fTractionCurveLateral: 22.5,
  fTractionSpringDeltaMax: 0.15,
  fLowSpeedTractionLossMult: 1.0,
  fCamberStiffnesss: 0.0,
  fTractionBiasFront: 0.48,
  fTractionLossMult: 1.0,
  fSuspensionForce: 2.8,
  fSuspensionCompDamp: 1.4,
  fSuspensionReboundDamp: 2.2,
  fSuspensionUpperLimit: 0.09,
  fSuspensionLowerLimit: -0.09,
  fSuspensionRaise: 0.0,
  fSuspensionBiasFront: 0.5,
  fAntiRollBarForce: 0.8,
  fAntiRollBarBiasFront: 0.5,
  fRollCentreHeightFront: 0.35,
  fRollCentreHeightRear: 0.35,
  fCollisionDamageMult: 0.7,
  fWeaponDamageMult: 1.0,
  fDeformationDamageMult: 0.7,
  fEngineDamageMult: 1.2,
  fPetrolTankVolume: 65.0,
  fOilVolume: 5.0,
  fDownforceModifier: 1.5,
  fPopUpLightRotationAngle: 0.0,
  fHandlingBoundsRadius: 0.0,
  fWeaponDamageScaledToVehHealthMult: 0.0,
  fDamageBoundsScaledToVehHealthMult: 0.0,
  fDamageBoundsScale: 1.0,
  fSeatOffsetDistX: 0.0,
  fSeatOffsetDistY: 0.0,
  fSeatOffsetDistZ: 0.0,
  nMonetaryValue: 85000,
  strModelFlags: '440010',
  strHandlingFlags: '0',
  strDamageFlags: '0',
  AIHandling: 'AVERAGE'
};

const PRESETS: Record<string, { label: string; data: HandlingData }> = {
  supercar: {
    label: 'Supercar (AWD Track)',
    data: {
      ...DEFAULT_HANDLING,
      handlingName: 'SUPER_AWD',
      fMass: 1380.0,
      fInitialDragCoeff: 7.2,
      fDriveBiasFront: 0.35,
      nInitialDriveGears: 7,
      fInitialDriveForce: 0.42,
      fDriveInertia: 1.1,
      fClutchChangeRateScaleUpShift: 3.2,
      fClutchChangeRateScaleDownShift: 3.2,
      fInitialDriveMaxFlatVel: 175.0,
      fBrakeForce: 1.4,
      fBrakeBiasFront: 0.58,
      fHandBrakeForce: 1.1,
      fSteeringLock: 40.0,
      fTractionCurveMax: 2.75,
      fTractionCurveMin: 2.45,
      fTractionCurveLateral: 24.0,
      fSuspensionForce: 3.4,
      fSuspensionCompDamp: 1.8,
      fSuspensionReboundDamp: 2.6,
      fSuspensionUpperLimit: 0.07,
      fSuspensionLowerLimit: -0.07,
      fSuspensionRaise: -0.02,
      fAntiRollBarForce: 1.2,
      fDownforceModifier: 3.0,
      nMonetaryValue: 350000
    }
  },
  drift: {
    label: 'JDM Drift Tuner (RWD)',
    data: {
      ...DEFAULT_HANDLING,
      handlingName: 'DRIFT_RWD',
      fMass: 1250.0,
      fInitialDragCoeff: 8.0,
      fDriveBiasFront: 0.0,
      nInitialDriveGears: 6,
      fInitialDriveForce: 0.38,
      fDriveInertia: 1.2,
      fClutchChangeRateScaleUpShift: 2.8,
      fClutchChangeRateScaleDownShift: 2.8,
      fInitialDriveMaxFlatVel: 148.0,
      fBrakeForce: 0.95,
      fBrakeBiasFront: 0.65,
      fHandBrakeForce: 1.8,
      fSteeringLock: 52.0,
      fTractionCurveMax: 1.95,
      fTractionCurveMin: 1.45,
      fTractionCurveLateral: 18.5,
      fLowSpeedTractionLossMult: 1.6,
      fTractionBiasFront: 0.44,
      fSuspensionForce: 2.6,
      fSuspensionCompDamp: 1.2,
      fSuspensionReboundDamp: 2.0,
      fSuspensionRaise: -0.03,
      fAntiRollBarForce: 0.6,
      nMonetaryValue: 45000
    }
  },
  muscle: {
    label: 'American Muscle (High Torque RWD)',
    data: {
      ...DEFAULT_HANDLING,
      handlingName: 'MUSCLE_V8',
      fMass: 1650.0,
      fInitialDragCoeff: 9.8,
      fDriveBiasFront: 0.0,
      nInitialDriveGears: 5,
      fInitialDriveForce: 0.36,
      fDriveInertia: 1.0,
      fClutchChangeRateScaleUpShift: 2.0,
      fClutchChangeRateScaleDownShift: 2.0,
      fInitialDriveMaxFlatVel: 142.0,
      fBrakeForce: 0.9,
      fBrakeBiasFront: 0.58,
      fHandBrakeForce: 0.9,
      fSteeringLock: 36.0,
      fTractionCurveMax: 2.15,
      fTractionCurveMin: 1.75,
      fTractionCurveLateral: 20.0,
      fLowSpeedTractionLossMult: 1.8,
      fSuspensionForce: 2.2,
      fSuspensionCompDamp: 1.1,
      fSuspensionReboundDamp: 1.8,
      fSuspensionRaise: 0.01,
      fAntiRollBarForce: 0.5,
      nMonetaryValue: 55000
    }
  },
  offroad: {
    label: 'Off-Road 4x4 / SUV',
    data: {
      ...DEFAULT_HANDLING,
      handlingName: 'OFFROAD_4X4',
      fMass: 2200.0,
      fInitialDragCoeff: 12.0,
      fDriveBiasFront: 0.5,
      nInitialDriveGears: 6,
      fInitialDriveForce: 0.28,
      fDriveInertia: 0.9,
      fInitialDriveMaxFlatVel: 125.0,
      fBrakeForce: 0.85,
      fBrakeBiasFront: 0.52,
      fHandBrakeForce: 0.7,
      fSteeringLock: 35.0,
      fTractionCurveMax: 2.05,
      fTractionCurveMin: 1.85,
      fTractionCurveLateral: 22.0,
      fTractionLossMult: 0.4,
      fSuspensionForce: 2.2,
      fSuspensionCompDamp: 1.5,
      fSuspensionReboundDamp: 2.0,
      fSuspensionUpperLimit: 0.20,
      fSuspensionLowerLimit: -0.22,
      fSuspensionRaise: 0.12,
      fAntiRollBarForce: 0.4,
      fCollisionDamageMult: 0.4,
      fDeformationDamageMult: 0.4,
      fEngineDamageMult: 0.8,
      strHandlingFlags: '40000',
      nMonetaryValue: 65000
    }
  },
  police: {
    label: 'Police Interceptor (Balanced Pursuit)',
    data: {
      ...DEFAULT_HANDLING,
      handlingName: 'POLICE_INTERCEPTOR',
      fMass: 1750.0,
      fInitialDragCoeff: 8.8,
      fDriveBiasFront: 0.2,
      nInitialDriveGears: 6,
      fInitialDriveForce: 0.35,
      fDriveInertia: 1.1,
      fClutchChangeRateScaleUpShift: 2.6,
      fClutchChangeRateScaleDownShift: 2.6,
      fInitialDriveMaxFlatVel: 162.0,
      fBrakeForce: 1.25,
      fBrakeBiasFront: 0.56,
      fHandBrakeForce: 1.0,
      fSteeringLock: 40.0,
      fTractionCurveMax: 2.55,
      fTractionCurveMin: 2.25,
      fTractionCurveLateral: 23.0,
      fSuspensionForce: 3.0,
      fSuspensionCompDamp: 1.5,
      fSuspensionReboundDamp: 2.3,
      fSuspensionUpperLimit: 0.10,
      fSuspensionLowerLimit: -0.10,
      fAntiRollBarForce: 1.1,
      fCollisionDamageMult: 0.45,
      fDeformationDamageMult: 0.45,
      fEngineDamageMult: 0.9,
      nMonetaryValue: 95000
    }
  }
};

const HANDLING_FLAGS_LIST = [
  { bit: 1, mask: 0x1, label: 'SMOOTH_FIRST_GEAR', desc: 'Smoother acceleration transition in first gear' },
  { bit: 2, mask: 0x2, label: 'HAS_EXTRA_REAR_LIGHTS', desc: 'Activates extra rear lights when braking' },
  { bit: 5, mask: 0x20, label: 'ALT_FRONT_DIFF', desc: 'Alternative front differential response' },
  { bit: 10, mask: 0x400, label: 'EXTRUDED_WHEEL_ARCH', desc: 'Prevents tire clipping through extended wheel fenders' },
  { bit: 17, mask: 0x20000, label: 'INCREASED_BRAKING', desc: 'High-performance enhanced brake bite' },
  { bit: 18, mask: 0x40000, label: 'OFFROAD_ABILITIES', desc: 'Reduced traction loss on dirt and offroad terrain' },
  { bit: 19, mask: 0x80000, label: 'SUPERCHARGER_WHINE', desc: 'Audible supercharger high-pitch engine whine' },
  { bit: 24, mask: 0x1000000, label: 'REAR_WHEEL_STEER', desc: 'All-wheel or rear-wheel active steering' },
  { bit: 25, mask: 0x2000000, label: 'HANDBRAKE_ALL_WHEELS', desc: 'Handbrake locks all 4 wheels instead of just rear' }
];

export const HandlingEditor: React.FC = () => {
  const [handlingList, setHandlingList] = useState<HandlingData[]>([DEFAULT_HANDLING]);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<'drivetrain' | 'traction' | 'suspension' | 'brakes' | 'damage' | 'mass' | 'flags' | 'xml'>('drivetrain');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentHandling = handlingList[selectedIdx] || DEFAULT_HANDLING;

  const updateCurrent = (key: keyof HandlingData, val: any) => {
    const updated = [...handlingList];
    updated[selectedIdx] = { ...updated[selectedIdx], [key]: val };
    setHandlingList(updated);
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      const updated = [...handlingList];
      updated[selectedIdx] = { ...preset.data };
      setHandlingList(updated);
      trackEvent('handling', 'format', `Applied ${preset.label}`);
    }
  };

  const parseHandlingXml = (xmlText: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      const items = Array.from(doc.querySelectorAll('Item[type="CHandlingData"], Item:not([type]) > handlingName, HandlingData > Item'));

      const foundList: HandlingData[] = [];

      items.forEach(itemElem => {
        const getTagValue = (tagName: string, defaultVal: number | string) => {
          const el = itemElem.querySelector(tagName);
          if (!el) return defaultVal;
          const valAttr = el.getAttribute('value');
          if (valAttr !== null) {
            return typeof defaultVal === 'number' ? parseFloat(valAttr) || 0 : valAttr;
          }
          const text = el.textContent?.trim() || '';
          return typeof defaultVal === 'number' ? parseFloat(text) || 0 : text;
        };

        const getVecValue = (tagName: string, axis: 'x' | 'y' | 'z', defaultVal: number) => {
          const el = itemElem.querySelector(tagName);
          if (!el) return defaultVal;
          const valAttr = el.getAttribute(axis);
          if (valAttr !== null) return parseFloat(valAttr) || 0;
          return defaultVal;
        };

        const handlingName = getTagValue('handlingName', 'CUSTOM_VEHICLE') as string;
        if (!handlingName && !itemElem.querySelector('fMass')) return;

        const subHandlingElem = itemElem.querySelector('SubHandlingData');
        const rawSubHandlingXml = subHandlingElem ? subHandlingElem.innerHTML.trim() : undefined;

        const parsed: HandlingData = {
          handlingName: handlingName || 'CUSTOM_VEHICLE',
          fMass: getTagValue('fMass', 1400.0) as number,
          fInitialDragCoeff: getTagValue('fInitialDragCoeff', 8.0) as number,
          fPercentSubmerged: getTagValue('fPercentSubmerged', 85.0) as number,
          vecCentreOfMassOffsetX: getVecValue('vecCentreOfMassOffset', 'x', 0.0),
          vecCentreOfMassOffsetY: getVecValue('vecCentreOfMassOffset', 'y', 0.0),
          vecCentreOfMassOffsetZ: getVecValue('vecCentreOfMassOffset', 'z', 0.0),
          vecInertiaMultiplierX: getVecValue('vecInertiaMultiplier', 'x', 1.0),
          vecInertiaMultiplierY: getVecValue('vecInertiaMultiplier', 'y', 1.2),
          vecInertiaMultiplierZ: getVecValue('vecInertiaMultiplier', 'z', 1.6),
          fDriveBiasFront: getTagValue('fDriveBiasFront', 0.0) as number,
          nInitialDriveGears: Math.round(getTagValue('nInitialDriveGears', 6) as number),
          fInitialDriveForce: getTagValue('fInitialDriveForce', 0.3) as number,
          fDriveInertia: getTagValue('fDriveInertia', 1.0) as number,
          fClutchChangeRateScaleUpShift: getTagValue('fClutchChangeRateScaleUpShift', 2.0) as number,
          fClutchChangeRateScaleDownShift: getTagValue('fClutchChangeRateScaleDownShift', 2.0) as number,
          fInitialDriveMaxFlatVel: getTagValue('fInitialDriveMaxFlatVel', 150.0) as number,
          fBrakeForce: getTagValue('fBrakeForce', 1.0) as number,
          fBrakeBiasFront: getTagValue('fBrakeBiasFront', 0.5) as number,
          fHandBrakeForce: getTagValue('fHandBrakeForce', 0.8) as number,
          fSteeringLock: getTagValue('fSteeringLock', 38.0) as number,
          fTractionCurveMax: getTagValue('fTractionCurveMax', 2.4) as number,
          fTractionCurveMin: getTagValue('fTractionCurveMin', 2.1) as number,
          fTractionCurveLateral: getTagValue('fTractionCurveLateral', 22.5) as number,
          fTractionSpringDeltaMax: getTagValue('fTractionSpringDeltaMax', 0.15) as number,
          fLowSpeedTractionLossMult: getTagValue('fLowSpeedTractionLossMult', 1.0) as number,
          fCamberStiffnesss: getTagValue('fCamberStiffnesss', 0.0) as number,
          fTractionBiasFront: getTagValue('fTractionBiasFront', 0.48) as number,
          fTractionLossMult: getTagValue('fTractionLossMult', 1.0) as number,
          fSuspensionForce: getTagValue('fSuspensionForce', 2.8) as number,
          fSuspensionCompDamp: getTagValue('fSuspensionCompDamp', 1.4) as number,
          fSuspensionReboundDamp: getTagValue('fSuspensionReboundDamp', 2.0) as number,
          fSuspensionUpperLimit: getTagValue('fSuspensionUpperLimit', 0.1) as number,
          fSuspensionLowerLimit: getTagValue('fSuspensionLowerLimit', -0.1) as number,
          fSuspensionRaise: getTagValue('fSuspensionRaise', 0.0) as number,
          fSuspensionBiasFront: getTagValue('fSuspensionBiasFront', 0.5) as number,
          fAntiRollBarForce: getTagValue('fAntiRollBarForce', 0.8) as number,
          fAntiRollBarBiasFront: getTagValue('fAntiRollBarBiasFront', 0.5) as number,
          fRollCentreHeightFront: getTagValue('fRollCentreHeightFront', 0.3) as number,
          fRollCentreHeightRear: getTagValue('fRollCentreHeightRear', 0.3) as number,
          fCollisionDamageMult: getTagValue('fCollisionDamageMult', 0.7) as number,
          fWeaponDamageMult: getTagValue('fWeaponDamageMult', 1.0) as number,
          fDeformationDamageMult: getTagValue('fDeformationDamageMult', 0.7) as number,
          fEngineDamageMult: getTagValue('fEngineDamageMult', 1.2) as number,
          fPetrolTankVolume: getTagValue('fPetrolTankVolume', 65.0) as number,
          fOilVolume: getTagValue('fOilVolume', 5.0) as number,
          fDownforceModifier: getTagValue('fDownforceModifier', 1.0) as number,
          fPopUpLightRotationAngle: getTagValue('fPopUpLightRotationAngle', 0.0) as number,
          fHandlingBoundsRadius: getTagValue('fHandlingBoundsRadius', 0.0) as number,
          fWeaponDamageScaledToVehHealthMult: getTagValue('fWeaponDamageScaledToVehHealthMult', 0.0) as number,
          fDamageBoundsScaledToVehHealthMult: getTagValue('fDamageBoundsScaledToVehHealthMult', 0.0) as number,
          fDamageBoundsScale: getTagValue('fDamageBoundsScale', 1.0) as number,
          fSeatOffsetDistX: getVecValue('fSeatOffsetDist', 'x', 0.0),
          fSeatOffsetDistY: getVecValue('fSeatOffsetDist', 'y', 0.0),
          fSeatOffsetDistZ: getVecValue('fSeatOffsetDist', 'z', 0.0),
          nMonetaryValue: Math.round(getTagValue('nMonetaryValue', 50000) as number),
          strModelFlags: (getTagValue('strModelFlags', '440010') as string).replace('0x', ''),
          strHandlingFlags: (getTagValue('strHandlingFlags', '0') as string).replace('0x', ''),
          strDamageFlags: (getTagValue('strDamageFlags', '0') as string).replace('0x', ''),
          AIHandling: (getTagValue('AIHandling', 'AVERAGE') as string) || 'AVERAGE',
          rawSubHandlingXml
        };

        foundList.push(parsed);
      });

      if (foundList.length > 0) {
        setHandlingList(foundList);
        setSelectedIdx(0);
        trackEvent('handling', 'format', `Imported ${foundList.length} handling item(s)`);
      }
    } catch (err) {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) parseHandlingXml(text);
    };
    reader.readAsText(file);
  };

  const generateSingleItemXml = (h: HandlingData): string => {
    const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : n.toString());
    const hex = (s: string) => {
      const clean = (s || '0').replace(/^0x/i, '');
      return clean.length === 0 ? '0' : clean.toUpperCase();
    };

    return `    <Item type="CHandlingData">
      <handlingName>${h.handlingName || 'VEHICLE'}</handlingName>
      <fMass value="${f(h.fMass)}" />
      <fInitialDragCoeff value="${f(h.fInitialDragCoeff)}" />
      <fPercentSubmerged value="${f(h.fPercentSubmerged)}" />
      <vecCentreOfMassOffset x="${f(h.vecCentreOfMassOffsetX)}" y="${f(h.vecCentreOfMassOffsetY)}" z="${f(h.vecCentreOfMassOffsetZ)}" />
      <vecInertiaMultiplier x="${f(h.vecInertiaMultiplierX)}" y="${f(h.vecInertiaMultiplierY)}" z="${f(h.vecInertiaMultiplierZ)}" />
      <fDriveBiasFront value="${f(h.fDriveBiasFront)}" />
      <nInitialDriveGears value="${h.nInitialDriveGears}" />
      <fInitialDriveForce value="${f(h.fInitialDriveForce)}" />
      <fDriveInertia value="${f(h.fDriveInertia)}" />
      <fClutchChangeRateScaleUpShift value="${f(h.fClutchChangeRateScaleUpShift)}" />
      <fClutchChangeRateScaleDownShift value="${f(h.fClutchChangeRateScaleDownShift)}" />
      <fInitialDriveMaxFlatVel value="${f(h.fInitialDriveMaxFlatVel)}" />
      <fBrakeForce value="${f(h.fBrakeForce)}" />
      <fBrakeBiasFront value="${f(h.fBrakeBiasFront)}" />
      <fHandBrakeForce value="${f(h.fHandBrakeForce)}" />
      <fSteeringLock value="${f(h.fSteeringLock)}" />
      <fTractionCurveMax value="${f(h.fTractionCurveMax)}" />
      <fTractionCurveMin value="${f(h.fTractionCurveMin)}" />
      <fTractionCurveLateral value="${f(h.fTractionCurveLateral)}" />
      <fTractionSpringDeltaMax value="${f(h.fTractionSpringDeltaMax)}" />
      <fLowSpeedTractionLossMult value="${f(h.fLowSpeedTractionLossMult)}" />
      <fCamberStiffnesss value="${f(h.fCamberStiffnesss)}" />
      <fTractionBiasFront value="${f(h.fTractionBiasFront)}" />
      <fTractionLossMult value="${f(h.fTractionLossMult)}" />
      <fSuspensionForce value="${f(h.fSuspensionForce)}" />
      <fSuspensionCompDamp value="${f(h.fSuspensionCompDamp)}" />
      <fSuspensionReboundDamp value="${f(h.fSuspensionReboundDamp)}" />
      <fSuspensionUpperLimit value="${f(h.fSuspensionUpperLimit)}" />
      <fSuspensionLowerLimit value="${f(h.fSuspensionLowerLimit)}" />
      <fSuspensionRaise value="${f(h.fSuspensionRaise)}" />
      <fSuspensionBiasFront value="${f(h.fSuspensionBiasFront)}" />
      <fAntiRollBarForce value="${f(h.fAntiRollBarForce)}" />
      <fAntiRollBarBiasFront value="${f(h.fAntiRollBarBiasFront)}" />
      <fRollCentreHeightFront value="${f(h.fRollCentreHeightFront)}" />
      <fRollCentreHeightRear value="${f(h.fRollCentreHeightRear)}" />
      <fCollisionDamageMult value="${f(h.fCollisionDamageMult)}" />
      <fWeaponDamageMult value="${f(h.fWeaponDamageMult)}" />
      <fDeformationDamageMult value="${f(h.fDeformationDamageMult)}" />
      <fEngineDamageMult value="${f(h.fEngineDamageMult)}" />
      <fPetrolTankVolume value="${f(h.fPetrolTankVolume)}" />
      <fOilVolume value="${f(h.fOilVolume)}" />
      <fDownforceModifier value="${f(h.fDownforceModifier)}" />
      <fPopUpLightRotationAngle value="${f(h.fPopUpLightRotationAngle)}" />
      <fHandlingBoundsRadius value="${f(h.fHandlingBoundsRadius)}" />
      <fWeaponDamageScaledToVehHealthMult value="${f(h.fWeaponDamageScaledToVehHealthMult)}" />
      <fDamageBoundsScaledToVehHealthMult value="${f(h.fDamageBoundsScaledToVehHealthMult)}" />
      <fDamageBoundsScale value="${f(h.fDamageBoundsScale)}" />
      <fSeatOffsetDist x="${f(h.fSeatOffsetDistX)}" y="${f(h.fSeatOffsetDistY)}" z="${f(h.fSeatOffsetDistZ)}" />
      <nMonetaryValue value="${h.nMonetaryValue}" />
      <strModelFlags>${hex(h.strModelFlags)}</strModelFlags>
      <strHandlingFlags>${hex(h.strHandlingFlags)}</strHandlingFlags>
      <strDamageFlags>${hex(h.strDamageFlags)}</strDamageFlags>
      <AIHandling>${h.AIHandling || 'AVERAGE'}</AIHandling>
      <SubHandlingData>${h.rawSubHandlingXml ? `\n        ${h.rawSubHandlingXml}\n      ` : ''}</SubHandlingData>
    </Item>`;
  };

  const fullXmlOutput = useMemo(() => {
    const itemsXml = handlingList.map(h => generateSingleItemXml(h)).join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<CHandlingDataMgr>
  <HandlingData>
${itemsXml}
  </HandlingData>
</CHandlingDataMgr>`;
  }, [handlingList]);

  const estTopSpeedKmh = useMemo(() => {
    const base = currentHandling.fInitialDriveMaxFlatVel * 1.35;
    const dragPenalty = currentHandling.fInitialDragCoeff * 2.2;
    const powerBonus = currentHandling.fInitialDriveForce * 120;
    return Math.max(60, Math.round(base - dragPenalty + powerBonus));
  }, [currentHandling.fInitialDriveMaxFlatVel, currentHandling.fInitialDragCoeff, currentHandling.fInitialDriveForce]);

  const estTopSpeedMph = Math.round(estTopSpeedKmh * 0.621371);

  const estAccelerationRating = useMemo(() => {
    const powerToWeight = (currentHandling.fInitialDriveForce * 10000) / Math.max(800, currentHandling.fMass);
    return Math.min(10, Math.max(1, parseFloat((powerToWeight * 1.4).toFixed(1))));
  }, [currentHandling.fInitialDriveForce, currentHandling.fMass]);

  const drivetrainLabel = useMemo(() => {
    const b = currentHandling.fDriveBiasFront;
    if (b <= 0.05) return 'RWD (100% Rear)';
    if (b >= 0.95) return 'FWD (100% Front)';
    const frontPct = Math.round(b * 100);
    const rearPct = 100 - frontPct;
    return `AWD (${frontPct}% Front / ${rearPct}% Rear)`;
  }, [currentHandling.fDriveBiasFront]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    trackEvent('handling', 'copy_xml', `${currentHandling.handlingName} handling.meta`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullXmlOutput], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentHandling.handlingName.toLowerCase() || 'handling'}.meta`;
    a.click();
    URL.revokeObjectURL(url);
    trackEvent('handling', 'copy_xml', `Downloaded ${currentHandling.handlingName}.meta`);
  };

  const toggleHandlingFlag = (mask: number) => {
    const currentNum = parseInt(currentHandling.strHandlingFlags || '0', 16) || 0;
    const isSet = (currentNum & mask) !== 0;
    const newNum = isSet ? currentNum & ~mask : currentNum | mask;
    updateCurrent('strHandlingFlags', newNum.toString(16).toUpperCase());
  };

  const isFlagActive = (mask: number) => {
    const currentNum = parseInt(currentHandling.strHandlingFlags || '0', 16) || 0;
    return (currentNum & mask) !== 0;
  };

  const renderSlider = (
    label: string,
    key: keyof HandlingData,
    min: number,
    max: number,
    step: number,
    unit: string,
    desc?: string
  ) => {
    const val = currentHandling[key] as number;
    return (
      <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs font-bold text-white block">{label}</span>
            {desc && <span className="text-[10px] text-zinc-400 block">{desc}</span>}
          </div>
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
            <span>{val}</span>
            <span className="text-[10px] text-zinc-500">{unit}</span>
          </div>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={e => updateCurrent(key, parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-950/80 border border-white/10 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-sm shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-extrabold text-xl text-white">Vehicle Handling Editor</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                handling.meta
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Edit, tune, calculate and export 100% valid FiveM & GTA V vehicle handling files.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".meta,.xml,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load handling.meta</span>
          </button>

          <button
            onClick={() => handleCopy(fullXmlOutput, 'all')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            {copiedType === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>Copy XML</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-glow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-black" />
            <span>Download .meta</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Est. Top Speed</span>
          <div className="mt-2">
            <span className="font-display font-black text-2xl text-white">{estTopSpeedKmh}</span>
            <span className="text-xs text-zinc-500 font-mono ml-1">km/h</span>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">({estTopSpeedMph} mph)</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">0–100 Acceleration</span>
          <div className="mt-2">
            <span className="font-display font-black text-2xl text-emerald-400">{estAccelerationRating}</span>
            <span className="text-xs text-zinc-500 font-mono ml-1">/ 10</span>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Power to Weight</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Drivetrain</span>
          <div className="mt-2">
            <span className="font-display font-black text-base text-cyan-400 block truncate">{drivetrainLabel}</span>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-1.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                style={{ width: `${Math.round(currentHandling.fDriveBiasFront * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Cornering Grip</span>
          <div className="mt-2">
            <span className="font-display font-black text-2xl text-amber-400">{currentHandling.fTractionCurveMax}</span>
            <span className="text-xs text-zinc-500 font-mono ml-1">G</span>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Lateral angle: {currentHandling.fTractionCurveLateral}°</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 col-span-2 sm:col-span-4 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Vehicle Weight</span>
          <div className="mt-2">
            <span className="font-display font-black text-2xl text-white">{currentHandling.fMass.toLocaleString()}</span>
            <span className="text-xs text-zinc-500 font-mono ml-1">kg</span>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Braking: {currentHandling.fBrakeForce}x</div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-400">Handling Name:</span>
            <input
              type="text"
              value={currentHandling.handlingName}
              onChange={e => updateCurrent('handlingName', e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs font-black text-emerald-400 uppercase focus:outline-none focus:border-emerald-500/50 w-44"
              placeholder="MODEL_NAME"
            />
          </div>

          {handlingList.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">Vehicles in file:</span>
              <select
                value={selectedIdx}
                onChange={e => setSelectedIdx(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono text-white focus:outline-none"
              >
                {handlingList.map((h, i) => (
                  <option key={i} value={i}>
                    #{i + 1}: {h.handlingName || `Vehicle ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">Load Preset:</span>
          {Object.entries(PRESETS).map(([k, p]) => (
            <button
              key={k}
              onClick={() => handlePresetSelect(k)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/5 hover:border-white/20 text-[11px] font-mono font-semibold text-zinc-300 hover:text-white transition-all whitespace-nowrap"
            >
              {p.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/80 rounded-2xl border border-white/10 overflow-x-auto">
        {[
          { id: 'drivetrain', label: 'Engine & Gears', icon: Zap },
          { id: 'traction', label: 'Traction & Steering', icon: Activity },
          { id: 'suspension', label: 'Suspension', icon: Sliders },
          { id: 'brakes', label: 'Brakes', icon: Gauge },
          { id: 'damage', label: 'Damage & Tank', icon: Shield },
          { id: 'mass', label: 'Mass & Inertia', icon: Layers },
          { id: 'flags', label: 'Handling Flags', icon: Wrench },
          { id: 'xml', label: 'XML Preview', icon: FileCode }
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                active
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/40 hover:bg-zinc-900/80 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeCategory === 'drivetrain' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderSlider('fDriveBiasFront', 'fDriveBiasFront', 0.0, 1.0, 0.05, '', '0.0 = RWD, 0.5 = AWD, 1.0 = FWD')}
          {renderSlider('nInitialDriveGears', 'nInitialDriveGears', 1, 10, 1, 'gears', 'Total transmission forward gears')}
          {renderSlider('fInitialDriveForce', 'fInitialDriveForce', 0.05, 1.2, 0.01, '', 'Engine torque / power multiplier')}
          {renderSlider('fDriveInertia', 'fDriveInertia', 0.1, 2.5, 0.05, '', 'Engine rpm climb responsiveness')}
          {renderSlider('fInitialDriveMaxFlatVel', 'fInitialDriveMaxFlatVel', 40.0, 350.0, 1.0, 'mph', 'Theoretical top speed multiplier')}
          {renderSlider('fClutchChangeRateScaleUpShift', 'fClutchChangeRateScaleUpShift', 0.5, 10.0, 0.1, '', 'Upshift clutch transition speed')}
          {renderSlider('fClutchChangeRateScaleDownShift', 'fClutchChangeRateScaleDownShift', 0.5, 10.0, 0.1, '', 'Downshift clutch transition speed')}
          {renderSlider('fDownforceModifier', 'fDownforceModifier', 0.0, 10.0, 0.1, '', 'Aerodynamic downforce at high speed')}
        </div>
      )}

      {activeCategory === 'traction' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderSlider('fSteeringLock', 'fSteeringLock', 20.0, 65.0, 0.5, 'deg', 'Max front wheel steering angle')}
          {renderSlider('fTractionCurveMax', 'fTractionCurveMax', 0.8, 3.8, 0.05, 'G', 'Peak cornering traction')}
          {renderSlider('fTractionCurveMin', 'fTractionCurveMin', 0.5, 3.2, 0.05, 'G', 'Sliding / drifting minimum traction')}
          {renderSlider('fTractionCurveLateral', 'fTractionCurveLateral', 10.0, 45.0, 0.5, 'deg', 'Angle before traction loss begins')}
          {renderSlider('fLowSpeedTractionLossMult', 'fLowSpeedTractionLossMult', 0.0, 3.0, 0.05, '', 'Wheelspin on launch / low speeds')}
          {renderSlider('fTractionBiasFront', 'fTractionBiasFront', 0.2, 0.8, 0.01, '', 'Grip distribution (0.5 = 50/50 balance)')}
          {renderSlider('fTractionLossMult', 'fTractionLossMult', 0.1, 3.0, 0.05, '', 'Grip penalty on dirt/offroad')}
          {renderSlider('fTractionSpringDeltaMax', 'fTractionSpringDeltaMax', 0.01, 0.5, 0.01, '', 'Grip recovery spring threshold')}
          {renderSlider('fCamberStiffnesss', 'fCamberStiffnesss', 0.0, 2.0, 0.05, '', 'Tire camber angle stiffness')}
        </div>
      )}

      {activeCategory === 'suspension' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderSlider('fSuspensionForce', 'fSuspensionForce', 0.5, 6.0, 0.05, '', 'Spring stiffness (higher = stiffer)')}
          {renderSlider('fSuspensionCompDamp', 'fSuspensionCompDamp', 0.1, 4.0, 0.05, '', 'Bump compression damping')}
          {renderSlider('fSuspensionReboundDamp', 'fSuspensionReboundDamp', 0.1, 5.0, 0.05, '', 'Rebound return damping')}
          {renderSlider('fSuspensionUpperLimit', 'fSuspensionUpperLimit', 0.01, 0.35, 0.01, 'm', 'Max upward suspension travel')}
          {renderSlider('fSuspensionLowerLimit', 'fSuspensionLowerLimit', -0.35, -0.01, 0.01, 'm', 'Max downward suspension travel')}
          {renderSlider('fSuspensionRaise', 'fSuspensionRaise', -0.15, 0.25, 0.01, 'm', 'Ride height offset')}
          {renderSlider('fSuspensionBiasFront', 'fSuspensionBiasFront', 0.2, 0.8, 0.01, '', 'Suspension force front/rear bias')}
          {renderSlider('fAntiRollBarForce', 'fAntiRollBarForce', 0.0, 4.0, 0.05, '', 'Body roll resistance sway bar')}
          {renderSlider('fAntiRollBarBiasFront', 'fAntiRollBarBiasFront', 0.0, 1.0, 0.05, '', 'Anti-roll bar front/rear bias')}
          {renderSlider('fRollCentreHeightFront', 'fRollCentreHeightFront', -0.3, 0.8, 0.02, 'm', 'Front chassis roll center height')}
          {renderSlider('fRollCentreHeightRear', 'fRollCentreHeightRear', -0.3, 0.8, 0.02, 'm', 'Rear chassis roll center height')}
        </div>
      )}

      {activeCategory === 'brakes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderSlider('fBrakeForce', 'fBrakeForce', 0.1, 3.0, 0.05, '', 'Primary pedal braking power')}
          {renderSlider('fBrakeBiasFront', 'fBrakeBiasFront', 0.0, 1.0, 0.02, '', 'Braking balance (0.55 = 55% front)')}
          {renderSlider('fHandBrakeForce', 'fHandBrakeForce', 0.1, 4.0, 0.05, '', 'Emergency e-brake locking force')}
        </div>
      )}

      {activeCategory === 'damage' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderSlider('fCollisionDamageMult', 'fCollisionDamageMult', 0.0, 4.0, 0.05, '', 'Chassis impact damage multiplier')}
          {renderSlider('fDeformationDamageMult', 'fDeformationDamageMult', 0.0, 3.0, 0.05, '', 'Body panel denting & deformation')}
          {renderSlider('fWeaponDamageMult', 'fWeaponDamageMult', 0.0, 3.0, 0.05, '', 'Bullet and weapon damage multiplier')}
          {renderSlider('fEngineDamageMult', 'fEngineDamageMult', 0.0, 4.0, 0.05, '', 'Engine failure damage multiplier')}
          {renderSlider('fPetrolTankVolume', 'fPetrolTankVolume', 10.0, 200.0, 1.0, 'L', 'Gas tank capacity')}
          {renderSlider('fOilVolume', 'fOilVolume', 1.0, 20.0, 0.5, 'L', 'Engine oil capacity')}
        </div>
      )}

      {activeCategory === 'mass' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {renderSlider('fMass', 'fMass', 500.0, 12000.0, 10.0, 'kg', 'Total vehicle curb mass')}
          {renderSlider('fInitialDragCoeff', 'fInitialDragCoeff', 1.0, 35.0, 0.1, '', 'Aerodynamic drag resistance')}
          {renderSlider('fPercentSubmerged', 'fPercentSubmerged', 10.0, 100.0, 1.0, '%', 'Water submergence before engine drowns')}
          {renderSlider('vecCentreOfMassOffsetX', 'vecCentreOfMassOffsetX', -0.5, 0.5, 0.01, 'm', 'Lateral weight center offset')}
          {renderSlider('vecCentreOfMassOffsetY', 'vecCentreOfMassOffsetY', -0.5, 0.5, 0.01, 'm', 'Longitudinal weight center offset')}
          {renderSlider('vecCentreOfMassOffsetZ', 'vecCentreOfMassOffsetZ', -0.5, 0.5, 0.01, 'm', 'Vertical weight center offset')}
          {renderSlider('vecInertiaMultiplierX', 'vecInertiaMultiplierX', 0.1, 4.0, 0.05, '', 'Pitch inertia resistance')}
          {renderSlider('vecInertiaMultiplierY', 'vecInertiaMultiplierY', 0.1, 4.0, 0.05, '', 'Roll inertia resistance')}
          {renderSlider('vecInertiaMultiplierZ', 'vecInertiaMultiplierZ', 0.1, 4.0, 0.05, '', 'Yaw inertia resistance')}
        </div>
      )}

      {activeCategory === 'flags' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="text-xs font-mono font-bold text-white block">Handling Flags (Hex):</span>
              <span className="text-[11px] text-zinc-400">Current bitmask: 0x{currentHandling.strHandlingFlags || '0'}</span>
            </div>
            <input
              type="text"
              value={currentHandling.strHandlingFlags}
              onChange={e => updateCurrent('strHandlingFlags', e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 font-mono text-xs font-bold text-emerald-400 w-36 uppercase focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {HANDLING_FLAGS_LIST.map(flag => {
              const active = isFlagActive(flag.mask);
              return (
                <button
                  key={flag.bit}
                  onClick={() => toggleHandlingFlag(flag.mask)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    active
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-white shadow-glow-sm'
                      : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                    active ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/20'
                  }`}>
                    {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="font-mono text-xs font-bold block">{flag.label}</span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{flag.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeCategory === 'xml' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-zinc-400">Generated handling.meta XML:</span>
            <button
              onClick={() => handleCopy(fullXmlOutput, 'xml_tab')}
              className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              {copiedType === 'xml_tab' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>Copy XML</span>
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-zinc-950 border border-white/10 font-mono text-xs text-zinc-300 overflow-x-auto max-h-96 selection:bg-emerald-500/30">
            {fullXmlOutput}
          </pre>
        </div>
      )}
    </div>
  );
};
