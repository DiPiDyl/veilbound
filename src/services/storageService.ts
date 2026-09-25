import { Card } from '../types/card';
import { ALL_CARDS } from '../data/cards';
import { STARTER_DECKS, DeckDefinition } from '../data/starterDecks';
import { ACHIEVEMENTS, Achievement, DAILY_QUESTS, Quest } from '../data/achievements';
import { CustomCardDraft } from '../types/lab';

export interface UserProfile {
  username: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gold: number;
  essence: number;
  wins: number;
  losses: number;
  cardBackTheme: string;
  battlefieldTheme: string;
  favoriteFaction: string;
  completedExpeditions: number;
}

export interface StorageData {
  profile: UserProfile;
  collection: Record<string, number>; // cardId -> count
  decks: DeckDefinition[];
  customCards: CustomCardDraft[];
  achievements: Achievement[];
  quests: Quest[];
  settings: {
    volume: number;
    isMuted: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

const STORAGE_KEY = 'VEILBOUND_SAVE_DATA_V1';

export function getDefaultStorage(): StorageData {
  // Give starter cards: 2 copies of all Common & Rare cards in ALL_CARDS, 1 copy of all Epic & Legendary
  const initialCollection: Record<string, number> = {};
  for (const card of ALL_CARDS) {
    if (card.rarity === 'Common' || card.rarity === 'Rare') {
      initialCollection[card.id] = 2;
    } else if (card.rarity === 'Epic' || card.rarity === 'Legendary') {
      initialCollection[card.id] = 1;
    } else {
      initialCollection[card.id] = 0; // Mythic unlocked through packs or crafting
    }
  }

  return {
    profile: {
      username: 'Novice Binder',
      title: 'Seeker of the Veil',
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      gold: 500, // Enough to immediately buy multiple packs!
      essence: 320, // Enough to immediately craft an Epic card!
      wins: 0,
      losses: 0,
      cardBackTheme: 'cosmic',
      battlefieldTheme: 'shattered-city',
      favoriteFaction: 'Aetherbound',
      completedExpeditions: 0
    },
    collection: initialCollection,
    decks: [...STARTER_DECKS],
    customCards: [],
    achievements: [...ACHIEVEMENTS],
    quests: [...DAILY_QUESTS],
    settings: {
      volume: 0.6,
      isMuted: false,
      reducedMotion: false,
      highContrast: false
    }
  };
}

export function loadGameData(): StorageData {
  if (typeof window === 'undefined') return getDefaultStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const def = getDefaultStorage();
      saveGameData(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    return { ...getDefaultStorage(), ...parsed };
  } catch (e) {
    console.error('Failed to load Veilbound save data, using defaults', e);
    return getDefaultStorage();
  }
}

export function saveGameData(data: StorageData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save Veilbound game data', e);
  }
}
