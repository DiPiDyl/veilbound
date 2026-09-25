import { MatchState } from '../types/gameState';
import { playCardFromHand, attackWithMinion, activateHeroPower, endCurrentTurn } from './gameEngine';

export type AIPersonality = 'Aggressor' | 'Tactician' | 'Control' | 'Necromancer' | 'Mirror';

export function executeAITurn(initialState: MatchState, personality: AIPersonality = 'Tactician'): MatchState {
  if (initialState.phase === 'game_over' || initialState.activePlayer !== 'opponent') {
    return initialState;
  }

  let state = { ...initialState };

  // 1. Play affordable cards from hand
  let playedSomething = true;
  let attempts = 0;
  while (playedSomething && attempts < 10) {
    attempts++;
    playedSomething = false;

    // Find affordable card
    const playableIndex = state.opponent.hand.findIndex(c => c.cost <= state.opponent.currentMana);
    if (playableIndex !== -1) {
      const cardToPlay = state.opponent.hand[playableIndex];
      // Target player minion if spell and there is one
      const targetMinion = state.player.board.length > 0 ? state.player.board[0].instanceId : undefined;
      state = playCardFromHand(state, playableIndex, targetMinion);
      playedSomething = true;
    }
  }

  // 2. Try Hero Power if mana permits
  if (
    !state.opponent.heroPowerUsedThisTurn &&
    state.opponent.currentMana >= state.opponent.binder.heroPower.cost
  ) {
    state = activateHeroPower(state);
  }

  // 3. Attack with all ready minions
  const readyMinions = state.opponent.board.filter(m => m.canAttack && m.currentAttack > 0);
  for (const minion of readyMinions) {
    if (state.phase === 'game_over') break;

    // Check for player taunts
    const playerTaunts = state.player.board.filter(m => m.card.keywords?.includes('Taunt'));
    if (playerTaunts.length > 0) {
      // Must attack taunt
      const targetTaunt = playerTaunts[0];
      state = attackWithMinion(state, minion.instanceId, 'minion', targetTaunt.instanceId);
    } else {
      // If Aggressor or enemy minion trade is unfavorable, attack hero
      if (personality === 'Aggressor' || state.player.board.length === 0) {
        state = attackWithMinion(state, minion.instanceId, 'hero');
      } else {
        // Trade with lowest health player minion
        const target = state.player.board.reduce((prev, curr) => curr.currentHealth < prev.currentHealth ? curr : prev);
        state = attackWithMinion(state, minion.instanceId, 'minion', target.instanceId);
      }
    }
  }

  // 4. End AI Turn
  if (state.phase !== 'game_over') {
    state = endCurrentTurn(state);
  }

  return state;
}
