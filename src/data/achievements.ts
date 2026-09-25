export interface Achievement {
  id: string;
  title: string;
  category: 'Mastery' | 'Veil' | 'Expedition' | 'Collection' | 'Feats';
  description: string;
  rewardGold: number;
  rewardEssence: number;
  rewardTitle?: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-win',
    title: 'First Tear in the Fabric',
    category: 'Mastery',
    description: 'Win your first battle against any Binder.',
    rewardGold: 100,
    rewardEssence: 50,
    rewardTitle: 'The Novice Binder',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    icon: 'Trophy'
  },
  {
    id: 'ach-veil-5',
    title: 'Planar Shifter',
    category: 'Veil',
    description: 'Shift the Veil 5 times in a single match.',
    rewardGold: 150,
    rewardEssence: 75,
    rewardTitle: 'Rift Walker',
    isUnlocked: false,
    progress: 0,
    maxProgress: 5,
    icon: 'Sparkles'
  },
  {
    id: 'ach-echo-10',
    title: 'Echoes of the Past',
    category: 'Veil',
    description: 'Generate 10 Echoes in one match.',
    rewardGold: 150,
    rewardEssence: 75,
    rewardTitle: 'Memory Weaver',
    isUnlocked: false,
    progress: 0,
    maxProgress: 10,
    icon: 'Activity'
  },
  {
    id: 'ach-destiny-tier3',
    title: 'Destiny Fulfilled',
    category: 'Mastery',
    description: 'Reach Tier 3 in any Destiny track during a match.',
    rewardGold: 200,
    rewardEssence: 100,
    rewardTitle: 'The Ascended',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    icon: 'Crown'
  },
  {
    id: 'ach-expedition-clear',
    title: 'Beyond the Threshold',
    category: 'Expedition',
    description: 'Complete a full Veil Expedition run and defeat the final boss.',
    rewardGold: 300,
    rewardEssence: 200,
    rewardTitle: 'Expedition Paragon',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    icon: 'Compass'
  },
  {
    id: 'ach-card-lab',
    title: 'The Alchemist\'s Quill',
    category: 'Collection',
    description: 'Design and test a custom card in the Card Lab sandbox.',
    rewardGold: 100,
    rewardEssence: 50,
    rewardTitle: 'Card Artisan',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    icon: 'Edit3'
  },
  {
    id: 'ach-craft-legendary',
    title: 'Celestial Forging',
    category: 'Collection',
    description: 'Craft your first Legendary or Mythic card.',
    rewardGold: 250,
    rewardEssence: 100,
    rewardTitle: 'Stellar Forger',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    icon: 'Zap'
  },
  {
    id: 'ach-clutch-win',
    title: 'On the Precipice',
    category: 'Feats',
    description: 'Win a match while at 1 Health remaining.',
    rewardGold: 200,
    rewardEssence: 150,
    rewardTitle: 'The Defiant',
    isUnlocked: false,
    progress: 0,
    maxProgress: 1,
    icon: 'HeartPulse'
  }
];

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardGold: number;
  progress: number;
  goal: number;
  isCompleted: boolean;
  type: 'daily' | 'weekly';
}

export const DAILY_QUESTS: Quest[] = [
  {
    id: 'quest-1',
    title: 'Veil Manipulator',
    description: 'Shift the Veil 3 times in any game mode.',
    rewardGold: 80,
    progress: 0,
    goal: 3,
    isCompleted: false,
    type: 'daily'
  },
  {
    id: 'quest-2',
    title: 'Echo Harvester',
    description: 'Consume 6 Echoes across your matches.',
    rewardGold: 80,
    progress: 0,
    goal: 6,
    isCompleted: false,
    type: 'daily'
  },
  {
    id: 'quest-3',
    title: 'Field Champion',
    description: 'Win 2 matches with any Binder.',
    rewardGold: 100,
    progress: 0,
    goal: 2,
    isCompleted: false,
    type: 'daily'
  }
];
