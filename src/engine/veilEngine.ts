import { VeilState } from '../types/card';
import { MatchState } from '../types/gameState';

export const VEIL_STATES: VeilState[] = ['Calm', 'Wild', 'Corrupted', 'Celestial', 'Fractured'];

export const VEIL_DETAILS: Record<VeilState, {
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  ambientParticle: string;
  bgGlow: string;
  passiveRules: string[];
}> = {
  Calm: {
    name: 'Calm',
    subtitle: 'The Balanced Realm',
    description: 'Reality is stable. Standard rules apply with no anomalous planar distortions.',
    themeColor: '#38bdf8', // sky-400
    ambientParticle: '#7dd3fc',
    bgGlow: 'rgba(56, 189, 248, 0.15)',
    passiveRules: ['Standard card interactions', 'No passive distortions active']
  },
  Wild: {
    name: 'Wild',
    subtitle: 'The Primal Surge',
    description: 'Raw erratic magic floods the field. Damage spells deal +1 bonus damage and battlecries trigger with primal intensity.',
    themeColor: '#f97316', // orange-500
    ambientParticle: '#fb923c',
    bgGlow: 'rgba(249, 115, 22, 0.2)',
    passiveRules: ['Damage spells deal +1 bonus damage', 'Wild minions gain +1 Attack upon summoning']
  },
  Corrupted: {
    name: 'Corrupted',
    subtitle: 'The Umbral Decay',
    description: 'The boundary between life and the abyss dissolves. Death effects trigger with double fury; fallen minions yield extra Echoes.',
    themeColor: '#a855f7', // purple-500
    ambientParticle: '#c084fc',
    bgGlow: 'rgba(168, 85, 247, 0.22)',
    passiveRules: ['Whenever a minion dies, owner gains +1 Echo', 'Wraiths & Undead have +1 Attack']
  },
  Celestial: {
    name: 'Celestial',
    subtitle: 'The Radiant Heights',
    description: 'Starlight descends upon the battlefield. All healing is amplified by +2 and high-cost cards (5+ mana) cost 1 less.',
    themeColor: '#eab308', // yellow-500
    ambientParticle: '#fef08a',
    bgGlow: 'rgba(234, 179, 8, 0.2)',
    passiveRules: ['All healing effects gain +2 restored Health', 'Cards costing 5+ Mana cost 1 less']
  },
  Fractured: {
    name: 'Fractured',
    subtitle: 'The Broken Mirror',
    description: 'Space and time splinter. At the start of turn, a random card in hand has its mana cost reduced by 1, and reality fluctuates.',
    themeColor: '#ec4899', // pink-500
    ambientParticle: '#f472b6',
    bgGlow: 'rgba(236, 72, 153, 0.25)',
    passiveRules: ['Start of turn: 1 random card in hand costs 1 less', 'Cards with Forecast trigger immediately']
  }
};

export function shiftVeilTo(currentState: VeilState, targetState?: VeilState): VeilState {
  if (targetState) return targetState;
  const currentIndex = VEIL_STATES.indexOf(currentState);
  const nextIndex = (currentIndex + 1) % VEIL_STATES.length;
  return VEIL_STATES[nextIndex];
}

export function getVeilSpellDamageBonus(state: VeilState): number {
  return state === 'Wild' ? 1 : 0;
}

export function getVeilHealingBonus(state: VeilState): number {
  return state === 'Celestial' ? 2 : 0;
}

export function getVeilCostReduction(state: VeilState, cardCost: number): number {
  if (state === 'Celestial' && cardCost >= 5) {
    return 1;
  }
  return 0;
}
