import { Card } from '../types/card';
import { getCardById } from '../data/cards';

export interface DeckValidationResult {
  isValid: boolean;
  errors: string[];
  totalCards: number;
  manaCurve: Record<number, number>; // 0 to 7 (7 represents 7+)
  typeBreakdown: Record<string, number>;
  averageCost: number;
}

export function validateAndAnalyzeDeck(cardIds: string[], binderFaction: string): DeckValidationResult {
  const errors: string[] = [];
  const cardCounts: Record<string, number> = {};
  const manaCurve: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
  const typeBreakdown: Record<string, number> = {
    Minion: 0,
    Spell: 0,
    Relic: 0,
    Weapon: 0,
    Ritual: 0,
    Event: 0,
    Champion: 0
  };

  let totalCost = 0;

  for (const id of cardIds) {
    const card = getCardById(id);
    if (!card) {
      errors.push(`Unknown card ID: ${id}`);
      continue;
    }

    // Faction validation
    if (card.faction !== binderFaction && card.faction !== 'Neutral') {
      errors.push(`Card "${card.name}" belongs to ${card.faction}, which is not allowed for ${binderFaction}.`);
    }

    // Copy counts
    cardCounts[id] = (cardCounts[id] || 0) + 1;
    const maxAllowed = (card.rarity === 'Legendary' || card.rarity === 'Mythic') ? 1 : 2;
    if (cardCounts[id] > maxAllowed) {
      errors.push(`Too many copies of "${card.name}" (${cardCounts[id]}/${maxAllowed}).`);
    }

    // Mana curve
    const bucket = Math.min(7, Math.max(0, card.cost));
    manaCurve[bucket] = (manaCurve[bucket] || 0) + 1;
    totalCost += card.cost;

    // Type count
    typeBreakdown[card.type] = (typeBreakdown[card.type] || 0) + 1;
  }

  if (cardIds.length !== 30) {
    errors.push(`Deck must contain exactly 30 cards (currently ${cardIds.length}).`);
  }

  const averageCost = cardIds.length > 0 ? Number((totalCost / cardIds.length).toFixed(1)) : 0;

  return {
    isValid: errors.length === 0,
    errors,
    totalCards: cardIds.length,
    manaCurve,
    typeBreakdown,
    averageCost
  };
}
