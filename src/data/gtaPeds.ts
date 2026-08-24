import rawData from './gtaModelsData.json';

export interface ModelEntry {
  id: string;
  name: string;
  hash: string;
  category: string;
  type: 'ped' | 'prop';
  description: string;
  imageUrl?: string;
  dimensions?: string;
}

export const GTA_PED_PROP_DATABASE: ModelEntry[] = rawData as ModelEntry[];
