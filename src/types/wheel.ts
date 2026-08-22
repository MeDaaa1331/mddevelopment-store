export interface WheelPrize {
  id: string;
  label: string;
  shortLabel: string;
  discount: number;
  color: string;
  textColor: string;
  probability: number;
  isJackpot?: boolean;
}

export interface SpinReward {
  id: string;
  prizeId: string;
  label: string;
  discount: number;
  code: string;
  createdAt: number;
  expiresAt: number;
  isUsed?: boolean;
}

export interface SpinHistoryEntry {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  prizeLabel: string;
  discount: number;
  code?: string;
  timestamp: number;
  country?: string;
}
