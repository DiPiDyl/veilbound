import { Card } from '../types/card';
import { MatchState } from '../types/gameState';
import { BINDERS } from '../data/binders';
import { ALL_CARDS } from '../data/cards';
import { createInitialMatch } from './gameEngine';
import { CustomCardDraft } from '../types/lab';

export function draftToCard(draft: CustomCardDraft): Card {
  return {
    id: draft.id,
    name: draft.name,
    faction: draft.faction,
    type: draft.type,
    rarity: draft.rarity,
    cost: draft.cost,
    attack: draft.attack,
    health: draft.health,
    maxHealth: draft.health,
    durability: draft.durability,
    creatureType: draft.creatureType,
    keywords: draft.keywords,
    description: draft.description,
    flavorText: draft.flavorText || 'Forged in the Card Lab.',
    artworkPlaceholderTheme: draft.artworkPlaceholderTheme || 'custom_art',
    effects: draft.effects,
    ritualCountdown: draft.ritualCountdown,
    echoCost: draft.echoCost,
    isCustom: true
  };
}

export function createSandboxMatch(customCard: Card, startingMana = 10): MatchState {
  const playerBinder = BINDERS[0];
  const targetDummyBinder = {
    ...BINDERS[1],
    name: 'Target Dummy Automaton',
    title: 'Testing Apparatus',
    startingHealth: 50,
    maxHealth: 50
  };

  // Build a test deck around the custom card
  const testDeck: Card[] = [
    customCard,
    customCard,
    ...ALL_CARDS.slice(0, 28)
  ];

  const dummyDeck: Card[] = ALL_CARDS.slice(10, 40);

  const match = createInitialMatch(
    playerBinder,
    testDeck,
    targetDummyBinder,
    dummyDeck,
    'the-veil',
    true // isSandbox
  );

  // Put custom card directly into hand
  match.player.hand.unshift(customCard);
  match.player.currentMana = startingMana;
  match.player.maxMana = startingMana;

  return match;
}
