import animPackage from './gtaAnimsData.json';

export interface AnimPackageData {
  categories: string[];
  scenarios: string[];
  dicts: [string, string[], number][];
}

export const GTA_ANIM_PACKAGE: AnimPackageData = animPackage as AnimPackageData;
