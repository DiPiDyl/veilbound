import { Card, CardType, FactionId, CardRarity, CreatureType, Keyword, CardEffect } from './card';

export interface CustomCardDraft {
  id: string;
  name: string;
  faction: FactionId;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  attack: number;
  health: number;
  durability: number;
  creatureType: CreatureType;
  keywords: Keyword[];
  description: string;
  flavorText: string;
  artworkPlaceholderTheme: string;
  effects: CardEffect[];
  ritualCountdown?: number;
  echoCost?: number;
  authorNote?: string;
  createdAt: number;
}

export interface SandboxPreset {
  id: string;
  name: string;
  description: string;
  dummyHealth: number;
  dummyBoardCardIds: string[];
  startingMana: number;
  startingVeil: 'Calm' | 'Wild' | 'Corrupted' | 'Celestial' | 'Fractured';
}
