import { Binder } from './binder';

export type BGFaction = 
  | 'Thornbloom' 
  | 'Ashforged' 
  | 'Wraithkin' 
  | 'Starborn' 
  | 'Clockwork' 
  | 'Riftborn' 
  | 'Neutral';

export type BGTier = 1 | 2 | 3 | 4 | 5 | 6;

export interface BGUnit {
  id: string;
  instanceId: string;
  name: string;
  tier: BGTier;
  faction: BGFaction;
  attack: number;
  health: number;
  maxHealth: number;
  costShards: number;
  hasTaunt: boolean;
  hasDivineShield: boolean;
  hasReborn: boolean;
  hasWindfury: boolean;
  hasPoison: boolean;
  abilityName?: string;
  abilityDescription?: string;
  deathrattleSummonCount?: number;
  deathrattleSummonStats?: { attack: number; health: number; name: string };
  startOfCombatBuff?: { attack: number; health: number; targetFaction?: BGFaction };
  icon: string;
}

export interface BGParticipant {
  id: string;
  isHuman: boolean;
  name: string;
  binder: Binder;
  health: number;
  maxHealth: number;
  armor: number;
  tier: BGTier;
  tierUpgradeCost: number;
  shards: number;
  board: BGUnit[]; // Max 7
  bench: BGUnit[]; // Max 7
  placement: number;
  isAlive: boolean;
  personality: string;
  winStreak: number;
  eliminatedRound?: number;
}

export type BGPhase = 'HERO_SELECT' | 'PREPARATION' | 'COMBAT' | 'ROUND_SUMMARY' | 'FINAL_VICTORY';

export interface BGSynergyCount {
  faction: BGFaction;
  count: number;
  activeTier: number; // 0, 1, 2, 3
  description: string;
}

export interface BGCombatLogItem {
  id: string;
  message: string;
  actorSide: 'player' | 'opponent';
}
