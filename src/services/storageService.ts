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
  activeBinderId: string;
  activeDeckId: string;
  unlockedBinderIds: string[];
  unlockedBattlefieldIds: string[];
  unlockedCardBackIds: string[];
  discoveredCardIds: string[];
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

const STORAGE_KEY = 'VEILBOUND_SAVE_DATA_V2';

export function getDefaultStorage(): StorageData {
  // Curated starter collection: Only Starter Deck cards for Lyra Voss are owned (2x copies each)
  const initialCollection: Record<string, number> = {};
  const discoveredCards: string[] = [];

  const starterDeck = STARTER_DECKS.find(d => d.id === 'deck-lyra-starter') || STARTER_DECKS[0];
  starterDeck.cardIds.forEach(cardId => {
    initialCollection[cardId] = (initialCollection[cardId] || 0) + 1;
    if (!discoveredCards.includes(cardId)) {
      discoveredCards.push(cardId);
    }
  });

  // Also mark common neutral cards as discovered (preview available)
  for (const card of ALL_CARDS) {
    if (!initialCollection[card.id]) {
      initialCollection[card.id] = 0;
      if (card.rarity === 'Common' && card.faction === 'Neutral') {
        discoveredCards.push(card.id);
      }
    }
  }

  return {
    profile: {
      username: 'Novice Binder',
      title: 'Seeker of the Veil',
      level: 1,
      xp: 0,
      xpToNextLevel: 300,
      gold: 250,
      essence: 100,
      wins: 0,
      losses: 0,
      activeBinderId: 'lyra-voss',
      activeDeckId: starterDeck.id,
      unlockedBinderIds: ['lyra-voss'],
      unlockedBattlefieldIds: ['shattered-city', 'rootsea'],
      unlockedCardBackIds: ['cosmic'],
      discoveredCardIds: Array.from(new Set(discoveredCards)),
      cardBackTheme: 'cosmic',
      battlefieldTheme: 'shattered-city',
      favoriteFaction: 'Aetherbound',
      completedExpeditions: 0
    },
    collection: initialCollection,
    decks: [starterDeck],
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
    const defaults = getDefaultStorage();
    return {
      ...defaults,
      ...parsed,
      profile: {
        ...defaults.profile,
        ...(parsed.profile || {})
      },
      collection: {
        ...defaults.collection,
        ...(parsed.collection || {})
      },
      settings: {
        ...defaults.settings,
        ...(parsed.settings || {})
      }
    };
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

export function getCardOwnershipStatus(
  cardId: string,
  collection: Record<string, number>,
  discoveredCardIds: string[]
): 'OWNED' | 'DISCOVERED' | 'UNDISCOVERED' {
  if ((collection[cardId] || 0) > 0) return 'OWNED';
  if (discoveredCardIds.includes(cardId)) return 'DISCOVERED';
  return 'UNDISCOVERED';
}
