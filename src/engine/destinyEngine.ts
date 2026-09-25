import { DestinyType, DestinyTrack } from '../types/binder';
import { PlayerState } from '../types/gameState';

export const DESTINY_INFO: Record<DestinyType, {
  name: string;
  description: string;
  accentColor: string;
  icon: string;
  tier1Benefit: string;
  tier2Benefit: string;
  tier3Benefit: string;
}> = {
  TheConqueror: {
    name: 'The Conqueror',
    description: 'Path of relentless aggression and martial dominance.',
    accentColor: '#ef4444',
    icon: 'Sword',
    tier1Benefit: 'Minions deal +1 Attack when hitting opposing Binder',
    tier2Benefit: 'Attacking with weapon or hero restores 2 Health',
    tier3Benefit: 'All friendly attacks pierce through armor and deal +2 damage'
  },
  TheArchivist: {
    name: 'The Archivist',
    description: 'Path of forbidden knowledge, card generation, and prophecy.',
    accentColor: '#3b82f6',
    icon: 'BookOpen',
    tier1Benefit: 'Max hand size increased to 11 cards',
    tier2Benefit: 'All spells cost 1 less (minimum 1)',
    tier3Benefit: 'Turn start: Add a random generated spell from any faction to hand'
  },
  TheWarden: {
    name: 'The Warden',
    description: 'Path of unyielding defense, shielding, and survival.',
    accentColor: '#10b981',
    icon: 'Shield',
    tier1Benefit: 'Gain +1 Armor at the beginning of each turn',
    tier2Benefit: 'Taunt minions gain +2 Max Health upon entry',
    tier3Benefit: 'Hero takes 2 less damage from all incoming sources (minimum 1)'
  },
  TheVoidwalker: {
    name: 'The Voidwalker',
    description: 'Path of planar mastery and bending the Veil to one’s will.',
    accentColor: '#8b5cf6',
    icon: 'Sparkles',
    tier1Benefit: 'Shifting the Veil restores 2 Health to your hero',
    tier2Benefit: 'Whenever the Veil changes, immediately gain +1 Echo',
    tier3Benefit: 'Whenever the Veil shifts, deal 2 damage to all enemies'
  },
  TheRevenant: {
    name: 'The Revenant',
    description: 'Path of spectral sacrifice, death triggers, and soul harvest.',
    accentColor: '#6b7280',
    icon: 'Skull',
    tier1Benefit: 'Whenever a friendly minion dies, gain +1 Echo',
    tier2Benefit: 'Friendly Deathrattle effects trigger twice',
    tier3Benefit: 'The first friendly minion to die each turn revives as a 1/1 Spectral Shade'
  }
};

export function addDestinyPoints(player: PlayerState, type: DestinyType, amount: number): PlayerState {
  const currentPts = player.destinyTrack.points[type] || 0;
  const newPts = currentPts + amount;
  
  let newTier = player.destinyTrack.tiersUnlocked[type] || 0;
  if (newPts >= 15) newTier = 3;
  else if (newPts >= 10) newTier = 2;
  else if (newPts >= 5) newTier = 1;

  // Determine active dominant destiny (highest points)
  let activeDestiny = player.destinyTrack.activeDestiny;
  let maxPoints = newPts;
  for (const [key, pts] of Object.entries({ ...player.destinyTrack.points, [type]: newPts })) {
    if (pts > maxPoints) {
      maxPoints = pts;
      activeDestiny = key as DestinyType;
    }
  }

  return {
    ...player,
    destinyTrack: {
      ...player.destinyTrack,
      activeDestiny,
      points: {
        ...player.destinyTrack.points,
        [type]: newPts
      },
      tiersUnlocked: {
        ...player.destinyTrack.tiersUnlocked,
        [type]: newTier
      }
    }
  };
}
