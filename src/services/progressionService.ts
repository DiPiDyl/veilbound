import { LevelMilestone, PlayerProgressionState, UnlockableFeature } from '../types/progression';

export type { LevelMilestone, PlayerProgressionState, UnlockableFeature };

export const LEVEL_MILESTONES: LevelMilestone[] = [
  {
    level: 1,
    title: 'Planar Initiate',
    unlockedFeatures: ['1V1'],
    unlockedBinderIds: ['lyra-voss'],
    rewardGold: 0,
    rewardEssence: 0,
    celebrationMessage: 'Welcome to Veilbound! You command Lyra Voss and the Aetherbound Starter Deck in 1v1 duels.'
  },
  {
    level: 2,
    title: 'Archivist Apprentice',
    unlockedFeatures: ['COLLECTION', 'DECKS'],
    unlockedBinderIds: [],
    rewardGold: 100,
    rewardEssence: 50,
    celebrationMessage: 'The Collection Vault and Deck Builder have unlocked! Inspect your cards and build custom decks.'
  },
  {
    level: 3,
    title: 'Flamebound Disciple',
    unlockedFeatures: ['CARD_LAB'],
    unlockedBinderIds: ['kael-drake'],
    rewardGold: 150,
    rewardEssence: 75,
    celebrationMessage: 'Binder Kael Drake (Ashen Citadel) and the Card Workshop have unlocked! Synthesize custom cards.'
  },
  {
    level: 4,
    title: 'Relic Seeker',
    unlockedFeatures: ['PACKS'],
    unlockedBinderIds: ['mira-thorn'],
    rewardGold: 200,
    rewardEssence: 100,
    celebrationMessage: 'Binder Mira Thorn (Viridian Hive) and Booster Packs (Relic Vault) have unlocked! Open planar packs.'
  },
  {
    level: 5,
    title: 'Tactical Mind',
    unlockedFeatures: ['PUZZLES'],
    unlockedBinderIds: ['orin-vale'],
    rewardGold: 250,
    rewardEssence: 125,
    celebrationMessage: 'Binder Orin Vale (Chronocast Archive) and Tactical Puzzles Mode have unlocked! Test your wits in 6 chapters.'
  },
  {
    level: 6,
    title: 'Arena Gladiator',
    unlockedFeatures: ['BATTLEGROUNDS'],
    unlockedBinderIds: ['nox-revenant'],
    rewardGold: 300,
    rewardEssence: 150,
    celebrationMessage: 'Binder Nox (Umbral Remnant) and Veilbound Battlegrounds (10-Player Auto-Battler) have unlocked!'
  },
  {
    level: 7,
    title: 'Ascended Sovereign',
    unlockedFeatures: ['EXPEDITION'],
    unlockedBinderIds: ['seraphine-starforged'],
    rewardGold: 500,
    rewardEssence: 250,
    celebrationMessage: 'Binder Seraphine and The Veil Expedition have unlocked! Embark on roguelike planar adventures.'
  }
];

const STORAGE_KEY = 'VEILBOUND_PROGRESSION_V2';

export class ProgressionService {
  public static loadProgression(): PlayerProgressionState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}

    // Default start at Level 1 with 1 Binder and 1v1 mode
    return {
      playerLevel: 1,
      currentXp: 0,
      xpToNextLevel: 100,
      unlockedFeatures: ['1V1'],
      unlockedBinderIds: ['lyra-voss'],
      dismissedMilestoneLevels: [1]
    };
  }

  public static saveProgression(state: PlayerProgressionState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  public static addXp(
    current: PlayerProgressionState,
    amount: number
  ): { nextState: PlayerProgressionState; newMilestone?: LevelMilestone } {
    let xp = current.currentXp + amount;
    let level = current.playerLevel;
    let xpNeeded = current.xpToNextLevel;
    let unlockedFeats = [...current.unlockedFeatures];
    let unlockedBinders = [...current.unlockedBinderIds];
    let newMilestone: LevelMilestone | undefined = undefined;

    while (xp >= xpNeeded && level < 20) {
      xp -= xpNeeded;
      level += 1;
      xpNeeded = Math.round(xpNeeded * 1.35);

      // Check if this level unlocks a milestone
      const milestone = LEVEL_MILESTONES.find(m => m.level === level);
      if (milestone) {
        newMilestone = milestone;
        milestone.unlockedFeatures.forEach(f => {
          if (!unlockedFeats.includes(f)) unlockedFeats.push(f);
        });
        milestone.unlockedBinderIds.forEach(b => {
          if (!unlockedBinders.includes(b)) unlockedBinders.push(b);
        });
      }
    }

    const nextState: PlayerProgressionState = {
      playerLevel: level,
      currentXp: xp,
      xpToNextLevel: xpNeeded,
      unlockedFeatures: unlockedFeats,
      unlockedBinderIds: unlockedBinders,
      dismissedMilestoneLevels: current.dismissedMilestoneLevels
    };

    ProgressionService.saveProgression(nextState);

    return { nextState, newMilestone };
  }

  public static isFeatureUnlocked(state: PlayerProgressionState, feature: UnlockableFeature): boolean {
    return state.unlockedFeatures.includes(feature);
  }

  public static isBinderUnlocked(state: PlayerProgressionState, binderId: string): boolean {
    return state.unlockedBinderIds.includes(binderId);
  }
}
