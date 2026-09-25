import { Card } from './card';
import { Binder } from './binder';

export type NodeType = 'Combat' | 'Elite' | 'Event' | 'Treasure' | 'Merchant' | 'Rift' | 'Boss';

export interface PvETreasure {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  icon: string;
  effectType: 
    | 'StartHealthBonus'
    | 'VeilShiftBonus'
    | 'EchoOnSpell'
    | 'DestinyAcceleration'
    | 'RitualHaste'
    | 'CardDrawStart'
    | 'ArmorStart'
    | 'DiscountFirstCard';
  value: number;
}

export interface NarrativeChoice {
  id: string;
  text: string;
  requirementDescription?: string;
  outcomeDescription: string;
  effect: {
    goldChange?: number;
    healthChange?: number;
    maxHealthChange?: number;
    addRandomCard?: boolean;
    cardRarityFilter?: string;
    addTreasureId?: string;
    shiftVeilTo?: string;
    gainEchoes?: number;
  };
}

export interface NarrativeEvent {
  id: string;
  title: string;
  location: string;
  narration: string;
  flavorQuote?: string;
  choices: NarrativeChoice[];
}

export interface PvEEnemy {
  id: string;
  name: string;
  title: string;
  isBoss: boolean;
  isElite: boolean;
  health: number;
  binder: Binder;
  deckTheme: string;
  deckCards: Card[];
  passiveTrait: string;
  customMechanicDescription: string;
  dialogueIntro: string;
  dialogueDefeat: string;
}

export interface ExpeditionNode {
  id: string;
  tier: number;
  step: number;
  type: NodeType;
  title: string;
  description: string;
  connectedToIds: string[];
  isCompleted: boolean;
  isCurrent: boolean;
  isAvailable: boolean;
  enemy?: PvEEnemy;
  event?: NarrativeEvent;
  treasuresOffered?: PvETreasure[];
}

export interface ExpeditionRun {
  id: string;
  binder: Binder;
  deck: Card[];
  currentHealth: number;
  maxHealth: number;
  gold: number;
  essence: number;
  treasures: PvETreasure[];
  nodes: ExpeditionNode[];
  currentNodeId: string;
  stepIndex: number;
  status: 'active' | 'victory' | 'defeat';
  battlesWon: number;
  elitesDefeated: number;
}
