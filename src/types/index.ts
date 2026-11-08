export type RoomCategory = 'squad' | 'enterprise' | 'global';
export type DifficultyTier = 'Standard' | 'Hardened' | 'Fortress' | 'GodMode';
export type RoomStatus = 'active' | 'breached' | 'expired';
export type ThreatLevel = 'low' | 'medium' | 'critical' | 'fatal';

export interface GuardianConfig {
  name: string;
  avatar: string;
  tagline: string;
  model: string;
  systemPrompt: string;
  canary: string; // The secret passphrase / auth token that wins the bounty
  rules: string[];
  defenseLayers: {
    name: string;
    description: string;
    active: boolean;
  }[];
}

export interface ArenaRoom {
  id: string;
  name: string;
  description: string;
  category: RoomCategory;
  host: string; // e.g. "near-foundation.near", "ref-finance.near", "alice.testnet"
  hostAvatar?: string;
  bounty: number; // in NEAR
  entryFee: number; // in NEAR per attempt (or buy-in)
  difficulty: DifficultyTier;
  guardian: GuardianConfig;
  status: RoomStatus;
  winner?: string;
  winningPrompt?: string;
  winningTxHash?: string;
  attemptsCount: number;
  breachRate: number; // percentage
  createdAt: number;
  expiresAt?: number;
  isLiveWebhook?: boolean;
  webhookUrl?: string;
  targetObjective: string; // Plain English goal: "Extract the master treasury seed phrase"
}

export interface AttackAttempt {
  id: string;
  roomId: string;
  attacker: string;
  timestamp: number;
  prompt: string;
  response: string;
  success: boolean;
  threatLevel: ThreatLevel;
  defenseTriggered?: string;
  attackVector?: string; // e.g. "DAN Jailbreak", "Recursive System Override", "Base64 Obfuscation"
  txHash: string;
  feePaid: number;
}

export interface UserAccount {
  accountId: string;
  balance: number;
  attemptsCount: number;
  bountiesWon: number;
  totalEarnings: number;
  isConnected: boolean;
}

export interface AttackVectorMetric {
  vector: string;
  count: number;
  successRate: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

