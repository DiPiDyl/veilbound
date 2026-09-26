import { MatchState, PlayerState } from '../types/gameState';
import { Card, BoardMinion } from '../types/card';
import { getVeilCostReduction } from './veilEngine';
import { 
  playCardFromHand, 
  attackWithMinion, 
  activateHeroPower, 
  endCurrentTurn 
} from './gameEngine';

export type AIPersonality = 'Aggressor' | 'Tactician' | 'Control' | 'Necromancer';

export type AIActionType = 'PLAY_CARD' | 'ATTACK_HERO' | 'ATTACK_MINION' | 'HERO_POWER' | 'END_TURN';

export interface AICandidateAction {
  type: AIActionType;
  cardIndex?: number;
  attackerInstanceId?: string;
  targetMinionInstanceId?: string;
  utilityScore: number;
  reason: string;
  actionSummary: string;
}

export interface AIActionExecution {
  action: AICandidateAction;
  candidates: AICandidateAction[];
}

/**
 * Evaluates the full board state and produces ranked candidate actions with utility weights.
 */
export function generateCandidateActions(
  state: MatchState,
  personality: AIPersonality = 'Tactician'
): AICandidateAction[] {
  if (state.phase === 'game_over' || state.activePlayer !== 'opponent') {
    return [{
      type: 'END_TURN',
      utilityScore: 0,
      reason: 'Game is over or not AI turn',
      actionSummary: 'Pass Turn'
    }];
  }

  const ai = state.opponent;
  const player = state.player;
  const candidates: AICandidateAction[] = [];

  // Check for enemy Taunt minions
  const playerTaunts = player.board.filter(m => m.card.keywords?.includes('Taunt'));
  const hasTaunt = playerTaunts.length > 0;

  // 1. LETHAL DETECTION
  const readyMinions = ai.board.filter(m => m.canAttack && m.currentAttack > 0);
  const totalMinionAttack = readyMinions.reduce((acc, m) => acc + m.currentAttack, 0);
  const playerEffectiveHealth = player.health + player.armor;

  if (!hasTaunt && totalMinionAttack >= playerEffectiveHealth) {
    // We have board lethal! All ready minions should attack face
    for (const m of readyMinions) {
      candidates.push({
        type: 'ATTACK_HERO',
        attackerInstanceId: m.instanceId,
        utilityScore: 1000 + m.currentAttack,
        reason: `Lethal opportunity: Striking ${player.binder.name} to conclude match!`,
        actionSummary: `${m.card.name} attacks ${player.binder.name} (Lethal strike)`
      });
    }
  }

  // 2. MINION ATTACK CANDIDATES
  for (const m of readyMinions) {
    // If Taunt is present, AI MUST attack Taunt
    if (hasTaunt) {
      for (const t of playerTaunts) {
        let score = 200;
        // Favorable trade bonus: can kill taunt without dying
        if (m.currentAttack >= t.currentHealth && m.currentHealth > t.currentAttack) {
          score += 80;
        } else if (m.currentAttack >= t.currentHealth) {
          score += 40;
        }
        candidates.push({
          type: 'ATTACK_MINION',
          attackerInstanceId: m.instanceId,
          targetMinionInstanceId: t.instanceId,
          utilityScore: score,
          reason: `Breaching enemy Taunt guard (${t.card.name})`,
          actionSummary: `${m.card.name} attacks Taunt minion ${t.card.name}`
        });
      }
    } else {
      // Option A: Attack Hero directly
      let heroScore = personality === 'Aggressor' ? 240 : 210;
      if (player.health <= 15) heroScore += 45;

      candidates.push({
        type: 'ATTACK_HERO',
        attackerInstanceId: m.instanceId,
        utilityScore: heroScore,
        reason: `Direct assault on enemy Binder ${player.binder.name}`,
        actionSummary: `${m.card.name} attacks ${player.binder.name} directly`
      });

      // Option B: Trade with player minions
      for (const enemyMinion of player.board) {
        let tradeScore = 195;
        const killsTarget = m.currentAttack >= enemyMinion.currentHealth;
        const survives = m.currentHealth > enemyMinion.currentAttack;
        const targetHighThreat = enemyMinion.currentAttack >= 4 || enemyMinion.card.keywords?.includes('Lifesteal');

        if (killsTarget && survives) {
          tradeScore += 90; // High value trade
        } else if (killsTarget && targetHighThreat) {
          tradeScore += 70; // Trade up against dangerous threat
        } else if (killsTarget) {
          tradeScore += 40; // 1-for-1 trade
        } else if (!survives && !killsTarget) {
          tradeScore -= 70; // Bad suicidal attack
        }

        if (personality === 'Control') tradeScore += 35;
        if (personality === 'Aggressor') tradeScore -= 25;

        candidates.push({
          type: 'ATTACK_MINION',
          attackerInstanceId: m.instanceId,
          targetMinionInstanceId: enemyMinion.instanceId,
          utilityScore: tradeScore,
          reason: `Tactical trade against ${enemyMinion.card.name} (${enemyMinion.currentAttack}/${enemyMinion.currentHealth})`,
          actionSummary: `${m.card.name} attacks ${enemyMinion.card.name}`
        });
      }
    }
  }

  // 3. CARD PLAY CANDIDATES FROM HAND
  ai.hand.forEach((card, idx) => {
    let effectiveCost = card.cost;
    effectiveCost -= getVeilCostReduction(state.veilState, card.cost);
    if (ai.destinyTrack.tiersUnlocked.TheArchivist >= 2 && card.type === 'Spell') {
      effectiveCost = Math.max(1, effectiveCost - 1);
    }
    effectiveCost = Math.max(0, effectiveCost);

    if (effectiveCost <= ai.currentMana) {
      let playScore = 80 + (effectiveCost * 6);

      if (card.type === 'Minion') {
        if (ai.board.length >= 7) return; // Board full
        if (card.keywords?.includes('Taunt')) playScore += 30;
        if (card.keywords?.includes('Rush') || card.keywords?.includes('Charge')) playScore += 25;
        if (card.keywords?.includes('Battlecry')) playScore += 20;

        candidates.push({
          type: 'PLAY_CARD',
          cardIndex: idx,
          utilityScore: playScore,
          reason: `Summoning minion ${card.name} (${card.attack}/${card.health}) to establish board control`,
          actionSummary: `Play ${card.name} (${effectiveCost} Mana)`
        });
      } else if (card.type === 'Spell') {
        let spellScore = playScore + 15;
        let targetMinionId: string | undefined = undefined;

        // Check if spell is a Buff for friendly minions
        const isBuff = card.effects?.some(e => e.type === 'Buff' || e.targetType === 'FriendlyMinion');
        if (isBuff && ai.board.length > 0) {
          // Buff best friendly minion
          const bestAlly = ai.board.reduce((prev, curr) => curr.currentAttack > prev.currentAttack ? curr : prev);
          targetMinionId = bestAlly.instanceId;
          spellScore += 25;
        } else if (player.board.length > 0) {
          // Removal/Damage targeting highest attack enemy minion
          const dangerousTarget = player.board.reduce((prev, curr) => curr.currentAttack > prev.currentAttack ? curr : prev);
          targetMinionId = dangerousTarget.instanceId;
          spellScore += 20;
        }

        candidates.push({
          type: 'PLAY_CARD',
          cardIndex: idx,
          targetMinionInstanceId: targetMinionId,
          utilityScore: spellScore,
          reason: `Casting ${card.name} (${card.description}) to control the battlefield`,
          actionSummary: `Cast ${card.name} (${effectiveCost} Mana)`
        });
      } else {
        // Relic, Weapon, Ritual
        candidates.push({
          type: 'PLAY_CARD',
          cardIndex: idx,
          utilityScore: playScore,
          reason: `Equipping/channeling ${card.type} ${card.name}`,
          actionSummary: `Play ${card.name} (${effectiveCost} Mana)`
        });
      }
    }
  });

  // 4. HERO POWER CANDIDATE
  if (!ai.heroPowerUsedThisTurn && ai.currentMana >= ai.binder.heroPower.cost) {
    let powerScore = 80;
    if (ai.currentMana === ai.binder.heroPower.cost) powerScore += 25; // Good mana dump
    candidates.push({
      type: 'HERO_POWER',
      utilityScore: powerScore,
      reason: `Activating ${ai.binder.heroPower.name} hero power`,
      actionSummary: `Hero Power: ${ai.binder.heroPower.name}`
    });
  }

  // 5. DEFAULT PASS ACTION (Always candidate with baseline threshold)
  candidates.push({
    type: 'END_TURN',
    utilityScore: 50,
    reason: 'No further advantageous actions available this turn',
    actionSummary: 'Conclude AI Turn'
  });

  // Sort descending by utility score
  candidates.sort((a, b) => b.utilityScore - a.utilityScore);

  return candidates;
}

/**
 * Returns the highest ranked single atomic action for the AI to take next.
 */
export function getNextAIAction(
  state: MatchState,
  personality: AIPersonality = 'Tactician'
): AIActionExecution {
  const candidates = generateCandidateActions(state, personality);
  const bestAction = candidates[0] || {
    type: 'END_TURN',
    utilityScore: 0,
    reason: 'End of turn default',
    actionSummary: 'Pass Turn'
  };

  return {
    action: bestAction,
    candidates
  };
}

/**
 * Applies a single atomic AI action to the game state.
 */
export function executeSingleAIAction(
  state: MatchState,
  action: AICandidateAction
): MatchState {
  if (state.phase === 'game_over') return state;

  switch (action.type) {
    case 'PLAY_CARD':
      if (action.cardIndex !== undefined) {
        return playCardFromHand(state, action.cardIndex, action.targetMinionInstanceId);
      }
      return state;

    case 'ATTACK_HERO':
      if (action.attackerInstanceId) {
        return attackWithMinion(state, action.attackerInstanceId, 'hero');
      }
      return state;

    case 'ATTACK_MINION':
      if (action.attackerInstanceId && action.targetMinionInstanceId) {
        return attackWithMinion(
          state,
          action.attackerInstanceId,
          'minion',
          action.targetMinionInstanceId
        );
      }
      return state;

    case 'HERO_POWER':
      return activateHeroPower(state);

    case 'END_TURN':
      return endCurrentTurn(state);

    default:
      return state;
  }
}
