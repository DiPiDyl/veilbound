import { MatchState, PlayerState } from '../types/gameState';
import { Card, BoardMinion } from '../types/card';
import { BINDERS } from '../data/binders';
import { ALL_CARDS } from '../data/cards';
import { createInitialMatch, startTurn, endCurrentTurn } from './gameEngine';
import { 
  generateCandidateActions, 
  getNextAIAction, 
  executeSingleAIAction,
  AIPersonality 
} from './aiDecisionEngine';

export interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

export interface AIVsAIReport {
  winner: 'player' | 'opponent';
  turnsTaken: number;
  totalDamageDealt: number;
  totalCardsPlayed: number;
  finalPlayerHealth: number;
  finalOpponentHealth: number;
  success: boolean;
}

// Helper to create a controlled test match
function createTestState(): MatchState {
  const p1 = BINDERS[0];
  const p2 = BINDERS[1];
  const deck1 = ALL_CARDS.slice(0, 15);
  const deck2 = ALL_CARDS.slice(15, 30);
  const match = createInitialMatch(p1, deck1, p2, deck2, 'void_sanctum');
  match.activePlayer = 'opponent'; // Set to AI turn
  match.opponent.currentMana = 10;
  match.opponent.maxMana = 10;
  return match;
}

function createDummyMinion(id: string, attack: number, health: number, canAttack: boolean, keywords: any[] = []): BoardMinion {
  return {
    instanceId: id,
    cardId: `card-${id}`,
    card: {
      id: `card-${id}`,
      name: `Test Unit ${id}`,
      faction: 'Neutral',
      type: 'Minion',
      rarity: 'Common',
      cost: 2,
      attack,
      health,
      keywords,
      effects: [],
      description: 'Test Unit',
      flavorText: 'Test flavor',
      artworkPlaceholderTheme: 'construct'
    },
    currentAttack: attack,
    currentHealth: health,
    maxHealth: health,
    canAttack,
    attacksThisTurn: 0,
    maxAttacksPerTurn: 1,
    hasDivineShield: false,
    isStealthed: false,
    isFrozen: false,
    isSilenced: false
  };
}

/**
 * TEST A: AI has a creature capable of attacking.
 * Expected: AI candidate actions contain attack actions and selects an attack.
 */
export function runTestA(): TestResult {
  const state = createTestState();
  state.opponent.board = [createDummyMinion('ai-minion-1', 3, 4, true)];
  state.player.health = 30;

  const nextAction = getNextAIAction(state);
  const isAttack = nextAction.action.type === 'ATTACK_HERO' || nextAction.action.type === 'ATTACK_MINION';

  return {
    testName: 'TEST A: AI has a creature capable of attacking -> AI attacks',
    passed: isAttack,
    message: isAttack 
      ? `PASSED: AI selected attack action: ${nextAction.action.actionSummary}`
      : `FAILED: AI selected non-attack action: ${nextAction.action.type}`
  };
}

/**
 * TEST B: AI can attack the player directly.
 * Expected: With no enemy taunts on board, AI executes direct player assault.
 */
export function runTestB(): TestResult {
  const state = createTestState();
  state.opponent.board = [createDummyMinion('ai-striker', 4, 3, true)];
  state.player.board = []; // Clear board
  state.player.health = 25;

  const nextAction = getNextAIAction(state, 'Aggressor');
  const isDirectAttack = nextAction.action.type === 'ATTACK_HERO';

  return {
    testName: 'TEST B: AI can attack player directly -> AI attacks player',
    passed: isDirectAttack,
    message: isDirectAttack
      ? `PASSED: AI chose direct face attack: ${nextAction.action.actionSummary}`
      : `FAILED: Expected ATTACK_HERO, got ${nextAction.action.type}`
  };
}

/**
 * TEST C: AI has a favorable target.
 * Expected: AI minion (4/4) trades favorably against player threat (3/2) without suiciding.
 */
export function runTestC(): TestResult {
  const state = createTestState();
  state.opponent.board = [createDummyMinion('ai-bruiser', 4, 4, true)];
  state.player.board = [createDummyMinion('player-threat', 3, 2, false)];

  const nextAction = getNextAIAction(state, 'Tactician');
  const targetedMinion = nextAction.action.type === 'ATTACK_MINION' && nextAction.action.targetMinionInstanceId === 'player-threat';

  return {
    testName: 'TEST C: AI has a favorable trade target -> AI selects favorable target',
    passed: targetedMinion,
    message: targetedMinion
      ? `PASSED: AI selected high-value trade on player-threat: ${nextAction.action.reason}`
      : `FAILED: Expected high-value trade against player-threat, got ${nextAction.action.actionSummary}`
  };
}

/**
 * TEST D: AI has lethal on board.
 * Expected: AI recognizes lethal and attacks hero to conclude match.
 */
export function runTestD(): TestResult {
  const state = createTestState();
  state.player.health = 5;
  state.player.armor = 0;
  state.player.board = [createDummyMinion('player-dummy', 1, 1, false)]; // Non-taunt minion
  state.opponent.board = [createDummyMinion('ai-finisher', 6, 6, true)]; // 6 attack >= 5 health

  const nextAction = getNextAIAction(state);
  const isLethal = nextAction.action.type === 'ATTACK_HERO' && nextAction.action.utilityScore >= 1000;

  return {
    testName: 'TEST D: AI has lethal -> AI attempts lethal immediately',
    passed: isLethal,
    message: isLethal
      ? `PASSED: AI executed lethal sequence: ${nextAction.action.actionSummary} (Score: ${nextAction.action.utilityScore})`
      : `FAILED: AI missed lethal! Action was: ${nextAction.action.actionSummary}`
  };
}

/**
 * TEST E: AI has no useful action.
 * Expected: AI ends turn cleanly without infinite loops.
 */
export function runTestE(): TestResult {
  const state = createTestState();
  state.opponent.board = [];
  state.opponent.hand = [];
  state.opponent.currentMana = 0;
  state.opponent.heroPowerUsedThisTurn = true;

  const nextAction = getNextAIAction(state);
  const isPass = nextAction.action.type === 'END_TURN';

  return {
    testName: 'TEST E: AI has no useful action -> AI ends turn',
    passed: isPass,
    message: isPass
      ? `PASSED: AI recognized exhaustion of actions and ended turn: ${nextAction.action.reason}`
      : `FAILED: AI attempted illegal action when empty: ${nextAction.action.type}`
  };
}

/**
 * AI VS AI MATCH SIMULATOR
 * Runs two autonomous AI bots against each other until a victor emerges.
 */
export function runAIVsAISimulation(maxTurns: number = 80): AIVsAIReport {
  let state = createInitialMatch(
    BINDERS[0],
    ALL_CARDS.slice(0, 18),
    BINDERS[1],
    ALL_CARDS.slice(18, 36),
    'void_sanctum'
  );

  let turnsCount = 0;
  let totalDamage = 0;
  let totalCards = 0;

  while (state.phase !== 'game_over' && turnsCount < maxTurns) {
    turnsCount++;

    // Execute current active player's turn using AI decision logic
    let actionAttempts = 0;
    while (state.phase !== 'game_over' && actionAttempts < 15) {
      actionAttempts++;

      // Force activePlayer perspective into AI evaluator
      const isOpponent = state.activePlayer === 'opponent';
      const simState = isOpponent ? state : {
        ...state,
        activePlayer: 'opponent' as const,
        player: state.opponent,
        opponent: state.player
      };

      const next = getNextAIAction(simState, isOpponent ? 'Aggressor' : 'Tactician');

      if (next.action.type === 'END_TURN') {
        state = endCurrentTurn(state);
        break;
      }

      // Execute action in real state
      if (isOpponent) {
        state = executeSingleAIAction(state, next.action);
      } else {
        // Inverse execution for player 1
        const inverseAction = { ...next.action };
        const updatedSim = executeSingleAIAction(simState, inverseAction);
        state = {
          ...updatedSim,
          activePlayer: 'player',
          player: updatedSim.opponent,
          opponent: updatedSim.player
        };
      }

      if (next.action.type === 'PLAY_CARD') totalCards++;
      if (next.action.type === 'ATTACK_HERO' || next.action.type === 'ATTACK_MINION') totalDamage += 3;
    }

    // Safety fallback
    if (state.activePlayer === (turnsCount % 2 === 0 ? 'player' : 'opponent')) {
      state = endCurrentTurn(state);
    }
  }

  return {
    winner: state.winner || (state.player.health > state.opponent.health ? 'player' : 'opponent'),
    turnsTaken: turnsCount,
    totalDamageDealt: totalDamage,
    totalCardsPlayed: totalCards,
    finalPlayerHealth: state.player.health,
    finalOpponentHealth: state.opponent.health,
    success: state.phase === 'game_over' || turnsCount < maxTurns
  };
}

/**
 * Runs the full test suite and returns all results.
 */
export function runAllAITests(): { results: TestResult[]; aiVsAi: AIVsAIReport; allPassed: boolean } {
  const results = [
    runTestA(),
    runTestB(),
    runTestC(),
    runTestD(),
    runTestE()
  ];

  const aiVsAi = runAIVsAISimulation(60);
  const allPassed = results.every(r => r.passed) && aiVsAi.success;

  return {
    results,
    aiVsAi,
    allPassed
  };
}
