import { SpinReward } from './wheel';

export interface UserHistoryItem {
  id: string;
  type: 'download' | 'purchase' | 'export' | 'copy';
  title: string;
  timestamp: number;
  meta?: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
  avatar?: string;
  avatarUrl: string;
  email?: string;
  country?: string;
  firstJoined: number;
  lastActive: number;
  lastSpin?: number;
  rewards?: SpinReward[];
  cart?: any[];
  favorites?: string[];
  downloadsCount: number;
  history: UserHistoryItem[];
}
