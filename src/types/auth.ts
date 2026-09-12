import { SpinReward } from './wheel';

export interface UserHistoryItem {
  id: string;
  type: 'download' | 'purchase' | 'export' | 'copy';
  title: string;
  timestamp: number;
  meta?: string;
}

export interface PointsHistoryItem {
  id: string;
  activity: string;
  label: string;
  points: number; // positive for earn, negative for spend
  timestamp: number;
  meta?: string;
}

export interface RedeemedCoupon {
  id: string;
  code: string;
  discount: number;
  cost: number;
  createdAt: number;
  expiresAt?: number | null;
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

  // MD Points Loyalty System
  points?: number;
  totalPointsEarned?: number;
  claimedActivities?: {
    discord_login?: boolean;
    discord_guild?: boolean;
    [key: string]: boolean | undefined;
  };
  claimedFreeScripts?: (string | number)[];
  lastDevToolsUse?: number;
  redeemedCoupons?: RedeemedCoupon[];
  pointsHistory?: PointsHistoryItem[];
}

