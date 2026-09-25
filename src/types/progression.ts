export type UnlockableFeature = 
  | '1V1'
  | 'COLLECTION'
  | 'DECKS'
  | 'CARD_LAB'
  | 'PACKS'
  | 'PUZZLES'
  | 'BATTLEGROUNDS'
  | 'EXPEDITION';

export interface LevelMilestone {
  level: number;
  title: string;
  unlockedFeatures: UnlockableFeature[];
  unlockedBinderIds: string[];
  rewardGold: number;
  rewardEssence: number;
  celebrationMessage: string;
}

export interface PlayerProgressionState {
  playerLevel: number;
  currentXp: number;
  xpToNextLevel: number;
  unlockedFeatures: UnlockableFeature[];
  unlockedBinderIds: string[];
  dismissedMilestoneLevels: number[];
}
