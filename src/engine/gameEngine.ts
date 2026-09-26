import { Card, BoardMinion, BoardRelic, ActiveEventAura, VeilState } from '../types/card';
import { Binder } from '../types/binder';
import { MatchState, PlayerState, CombatLogEntry, WeaponState } from '../types/gameState';
import { shiftVeilTo, getVeilSpellDamageBonus, getVeilHealingBonus, getVeilCostReduction } from './veilEngine';
import { gainEchoes, consumeEchoes } from './echoEngine';
import { addDestinyPoints } from './destinyEngine';
import { getBattlefieldById } from '../data/battlefields';

export function createInitialMatch(
  playerBinder: Binder,
  playerDeck: Card[],
  opponentBinder: Binder,
  opponentDeck: Card[],
  battlefieldId = 'shattered-city',
  isSandbox = false
): MatchState {
  const shuffledPlayerDeck = [...playerDeck].sort(() => 0.5 - Math.random());
  const shuffledOpponentDeck = [...opponentDeck].sort(() => 0.5 - Math.random());

  const playerHand = shuffledPlayerDeck.splice(0, 3);
  const opponentHand = shuffledOpponentDeck.splice(0, 4);

  const initialPlayer: PlayerState = {
    binder: playerBinder,
    health: playerBinder.startingHealth,
    maxHealth: playerBinder.maxHealth,
    armor: 0,
    currentMana: 1,
    maxMana: 1,
    manaCrystalsLocked: 0,
    deck: shuffledPlayerDeck,
    hand: playerHand,
    graveyard: [],
    board: [],
    relics: [],
    weapon: null,
    echoPool: 1,
    echoFragments: [],
    destinyTrack: {
      activeDestiny: 'TheConqueror',
      points: { TheConqueror: 0, TheArchivist: 0, TheWarden: 0, TheVoidwalker: 0, TheRevenant: 0 },
      tiersUnlocked: { TheConqueror: 0, TheArchivist: 0, TheWarden: 0, TheVoidwalker: 0, TheRevenant: 0 }
    },
    heroPowerUsedThisTurn: false,
    forecastModifiers: [],
    stats: { cardsPlayed: 0, minionsLost: 0, damageDealt: 0, veilShiftsTriggered: 0, echoesConsumed: 0 }
  };

  const initialOpponent: PlayerState = {
    binder: opponentBinder,
    health: opponentBinder.startingHealth,
    maxHealth: opponentBinder.maxHealth,
    armor: 0,
    currentMana: 1,
    maxMana: 1,
    manaCrystalsLocked: 0,
    deck: shuffledOpponentDeck,
    hand: opponentHand,
    graveyard: [],
    board: [],
    relics: [],
    weapon: null,
    echoPool: 1,
    echoFragments: [],
    destinyTrack: {
      activeDestiny: 'TheConqueror',
      points: { TheConqueror: 0, TheArchivist: 0, TheWarden: 0, TheVoidwalker: 0, TheRevenant: 0 },
      tiersUnlocked: { TheConqueror: 0, TheArchivist: 0, TheWarden: 0, TheVoidwalker: 0, TheRevenant: 0 }
    },
    heroPowerUsedThisTurn: false,
    forecastModifiers: [],
    stats: { cardsPlayed: 0, minionsLost: 0, damageDealt: 0, veilShiftsTriggered: 0, echoesConsumed: 0 }
  };

  return {
    matchId: `match-${Date.now()}`,
    turnNumber: 1,
    activePlayer: 'player',
    veilState: 'Calm',
    veilIntensity: 1,
    activeEvents: [],
    battlefieldTheme: battlefieldId,
    player: initialPlayer,
    opponent: initialOpponent,
    combatLogs: [
      {
        id: `log-init`,
        turn: 1,
        actor: 'the_veil',
        message: 'The match begins. The Veil is Calm.',
        tag: 'veil'
      }
    ],
    phase: 'playing',
    winner: null,
    isSandboxMode: isSandbox
  };
}

export function drawCard(player: PlayerState): { newPlayer: PlayerState; drawnCard?: Card } {
  if (player.deck.length === 0) {
    // Fatigue damage
    return {
      newPlayer: {
        ...player,
        health: Math.max(0, player.health - 2)
      }
    };
  }

  const nextDeck = [...player.deck];
  const drawn = nextDeck.shift()!;
  
  // Hand limit 10 (or 11 if Archivist Tier 1)
  const maxHand = (player.destinyTrack.tiersUnlocked.TheArchivist >= 1) ? 11 : 10;
  if (player.hand.length >= maxHand) {
    // Burn card
    return {
      newPlayer: {
        ...player,
        deck: nextDeck,
        graveyard: [...player.graveyard, drawn]
      }
    };
  }

  return {
    newPlayer: {
      ...player,
      deck: nextDeck,
      hand: [...player.hand, drawn]
    },
    drawnCard: drawn
  };
}

export function startTurn(state: MatchState): MatchState {
  if (state.phase === 'game_over') return state;

  const isPlayer = state.activePlayer === 'player';
  let curPlayer = isPlayer ? { ...state.player } : { ...state.opponent };
  const otherPlayer = isPlayer ? { ...state.opponent } : { ...state.player };
  const logs = [...state.combatLogs];

  // Increment max mana up to 10
  const nextMaxMana = Math.min(10, curPlayer.maxMana + 1);
  curPlayer.maxMana = nextMaxMana;
  curPlayer.currentMana = nextMaxMana - curPlayer.manaCrystalsLocked;
  curPlayer.manaCrystalsLocked = 0;
  curPlayer.heroPowerUsedThisTurn = false;

  // Warden Destiny Tier 1 bonus: +1 Armor
  if (curPlayer.destinyTrack.tiersUnlocked.TheWarden >= 1) {
    curPlayer.armor += 1;
    logs.push({
      id: `log-${Date.now()}-warden`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} gains 1 Armor from The Warden Destiny.`,
      tag: 'destiny'
    });
  }

  // Draw card
  const drawRes = drawCard(curPlayer);
  curPlayer = drawRes.newPlayer;
  if (drawRes.drawnCard) {
    logs.push({
      id: `log-${Date.now()}-draw`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} drew ${drawRes.drawnCard.name}.`,
      tag: 'play'
    });
  }

  // Unfreeze & reset minion attack status
  curPlayer.board = curPlayer.board.map(m => ({
    ...m,
    canAttack: true,
    attacksThisTurn: 0,
    isFrozen: false
  }));

  // Binder Passive: Orin Vale - Chronocast Blueprint
  if (curPlayer.binder.id === 'orin-vale' && curPlayer.hand.length > 0) {
    const highestIdx = curPlayer.hand.reduce((maxI, c, i, arr) => c.cost > arr[maxI].cost ? i : maxI, 0);
    if (curPlayer.hand[highestIdx].cost > 0) {
      curPlayer.hand[highestIdx] = {
        ...curPlayer.hand[highestIdx],
        cost: Math.max(0, curPlayer.hand[highestIdx].cost - 1)
      };
      logs.push({
        id: `log-${Date.now()}-orin-passive`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name}'s Chronocast Blueprint discounted ${curPlayer.hand[highestIdx].name} (-1 Mana)!`,
        tag: 'destiny'
      });
    }
  }

  // Advance Rituals in relics
  const updatedRelics: BoardRelic[] = [];
  for (const relic of curPlayer.relics) {
    if (relic.card.type === 'Ritual' && relic.countdown !== undefined) {
      const nextCountdown = relic.countdown - 1;
      if (nextCountdown <= 0) {
        // Trigger Ritual Climax!
        logs.push({
          id: `log-${Date.now()}-rit-climax`,
          turn: state.turnNumber,
          actor: state.activePlayer,
          message: `RITUAL COMPLETE: ${relic.card.name} unleashes its ancient power!`,
          tag: 'ritual'
        });
        // Summon or effect
        if (curPlayer.board.length < 7) {
          curPlayer.board.push({
            instanceId: `minion-rit-${Date.now()}`,
            cardId: relic.card.id,
            card: {
              ...relic.card,
              name: `${relic.card.name} Avatar`,
              cost: 0,
              attack: 7,
              health: 7,
              type: 'Minion'
            },
            currentAttack: 7,
            currentHealth: 7,
            maxHealth: 7,
            canAttack: true,
            attacksThisTurn: 0,
            maxAttacksPerTurn: 1,
            hasDivineShield: true,
            isStealthed: false,
            isFrozen: false,
            isSilenced: false
          });
        }
      } else {
        updatedRelics.push({ ...relic, countdown: nextCountdown });
        logs.push({
          id: `log-${Date.now()}-rit-tick`,
          turn: state.turnNumber,
          actor: state.activePlayer,
          message: `${relic.card.name} charges... (${nextCountdown} turns remaining).`,
          tag: 'ritual'
        });
      }
    } else {
      updatedRelics.push(relic);
    }
  }
  curPlayer.relics = updatedRelics;

  // Advance global active events
  const nextEvents: ActiveEventAura[] = [];
  for (const ev of state.activeEvents) {
    if (ev.remainingTurns > 1) {
      nextEvents.push({ ...ev, remainingTurns: ev.remainingTurns - 1 });
    } else {
      logs.push({
        id: `log-${Date.now()}-event-end`,
        turn: state.turnNumber,
        actor: 'the_veil',
        message: `Event Expired: ${ev.card.name} has concluded.`,
        tag: 'event'
      });
    }
  }

  return {
    ...state,
    activeEvents: nextEvents,
    combatLogs: logs,
    player: isPlayer ? curPlayer : otherPlayer,
    opponent: isPlayer ? otherPlayer : curPlayer
  };
}

export function endCurrentTurn(state: MatchState): MatchState {
  if (state.phase === 'game_over') return state;

  const isPlayer = state.activePlayer === 'player';
  let curPlayer = isPlayer ? { ...state.player } : { ...state.opponent };
  const logs = [...state.combatLogs];

  // Binder Passive: Seraphine - Aegis of the Stars
  if (curPlayer.binder.id === 'seraphine-starforged' && curPlayer.currentMana > 0) {
    curPlayer.health = Math.min(curPlayer.maxHealth, curPlayer.health + 2);
    if (curPlayer.board.length > 0) {
      const lowestAlly = curPlayer.board.reduce((prev, curr) => curr.currentHealth < prev.currentHealth ? curr : prev);
      lowestAlly.hasDivineShield = true;
    }
    logs.push({
      id: `log-${Date.now()}-seraphine-passive`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name}'s Aegis of the Stars granted Divine Shield and +2 Health!`,
      tag: 'destiny'
    });
  }

  const nextActive = isPlayer ? 'opponent' : 'player';
  const nextTurnNumber = state.turnNumber + 1;

  const nextState: MatchState = {
    ...state,
    player: isPlayer ? curPlayer : state.player,
    opponent: isPlayer ? state.opponent : curPlayer,
    combatLogs: logs,
    turnNumber: nextTurnNumber,
    activePlayer: nextActive
  };

  return startTurn(nextState);
}

export function playCardFromHand(
  state: MatchState,
  cardIndex: number,
  targetMinionInstanceId?: string
): MatchState {
  if (state.phase === 'game_over') return state;

  const isPlayer = state.activePlayer === 'player';
  let curPlayer = isPlayer ? { ...state.player } : { ...state.opponent };
  let enemyPlayer = isPlayer ? { ...state.opponent } : { ...state.player };
  let veilState = state.veilState;
  const logs = [...state.combatLogs];

  const card = curPlayer.hand[cardIndex];
  if (!card) return state;

  // Calculate actual cost
  let effectiveCost = card.cost;
  effectiveCost -= getVeilCostReduction(veilState, card.cost);
  if (curPlayer.destinyTrack.tiersUnlocked.TheArchivist >= 2 && card.type === 'Spell') {
    effectiveCost = Math.max(1, effectiveCost - 1);
  }
  effectiveCost = Math.max(0, effectiveCost);

  if (curPlayer.currentMana < effectiveCost) {
    return state; // Insufficient mana
  }

  // Deduct mana & remove card from hand
  curPlayer.currentMana -= effectiveCost;
  const newHand = [...curPlayer.hand];
  newHand.splice(cardIndex, 1);
  curPlayer.hand = newHand;
  curPlayer.stats.cardsPlayed += 1;

  // Destiny Tracking: Archivist on spells
  if (card.type === 'Spell') {
    curPlayer = addDestinyPoints(curPlayer, 'TheArchivist', 1);
  }

  // Handle Echo keyword
  if (card.keywords?.includes('Echo')) {
    curPlayer = gainEchoes(curPlayer, 1, card);
    logs.push({
      id: `log-${Date.now()}-echo`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${card.name} generated an Echo in the pool!`,
      tag: 'echo'
    });
  }

  // Handle Veilshift keyword
  if (card.keywords?.includes('Veilshift')) {
    const targetVeil = card.effects?.find(e => e.type === 'Veilshift')?.targetVeilState;
    veilState = shiftVeilTo(veilState, targetVeil);
    curPlayer.stats.veilShiftsTriggered += 1;
    curPlayer = addDestinyPoints(curPlayer, 'TheVoidwalker', 2);
    logs.push({
      id: `log-${Date.now()}-veilshift`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${card.name} shifts the Veil to ${veilState}!`,
      tag: 'veil'
    });

    // Voidwalker Tier 1: heal 2 on veil shift
    if (curPlayer.destinyTrack.tiersUnlocked.TheVoidwalker >= 1) {
      curPlayer.health = Math.min(curPlayer.maxHealth, curPlayer.health + 2);
    }

    // Binder Passive: Lyra Voss - Veil Resonance
    if (curPlayer.binder.id === 'lyra-voss') {
      curPlayer = gainEchoes(curPlayer, 1);
      if (curPlayer.hand.length > 0) {
        const randIdx = Math.floor(Math.random() * curPlayer.hand.length);
        if (curPlayer.hand[randIdx].cost > 0) {
          curPlayer.hand[randIdx] = {
            ...curPlayer.hand[randIdx],
            cost: Math.max(0, curPlayer.hand[randIdx].cost - 1)
          };
        }
      }
      logs.push({
        id: `log-${Date.now()}-lyra-passive`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name}'s Veil Resonance triggered (+1 Echo, discounted a card in hand)!`,
        tag: 'veil'
      });
    }
  }

  // 1. Minion
  if (card.type === 'Minion' || card.type === 'Champion') {
    if (curPlayer.board.length < 7) {
      const hasCharge = card.keywords?.includes('Charge');
      const hasRush = card.keywords?.includes('Rush');
      const hasShield = card.keywords?.includes('DivineShield');
      const hasStealth = card.keywords?.includes('Stealth');

      const newMinion: BoardMinion = {
        instanceId: `minion-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cardId: card.id,
        card: card,
        currentAttack: card.attack || 1,
        currentHealth: card.health || 1,
        maxHealth: card.health || 1,
        canAttack: !!(hasCharge || hasRush),
        attacksThisTurn: 0,
        maxAttacksPerTurn: 1,
        hasDivineShield: !!hasShield,
        isStealthed: !!hasStealth,
        isFrozen: false,
        isSilenced: false
      };

      // Warden Tier 2 bonus: +2 Health to Taunt minions
      if (card.keywords?.includes('Taunt') && curPlayer.destinyTrack.tiersUnlocked.TheWarden >= 2) {
        newMinion.maxHealth += 2;
        newMinion.currentHealth += 2;
      }

      curPlayer.board.push(newMinion);
      logs.push({
        id: `log-${Date.now()}-summon`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} summoned ${card.name} (${newMinion.currentAttack}/${newMinion.currentHealth}).`,
        tag: 'play'
      });
    }
  }
  // 2. Spell
  else if (card.type === 'Spell') {
    logs.push({
      id: `log-${Date.now()}-spell`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} cast ${card.name}!`,
      tag: 'play'
    });

    // Resolve spell effects
    if (card.effects) {
      for (const eff of card.effects) {
        if (eff.type === 'Damage') {
          const dmg = (eff.value || 0) + getVeilSpellDamageBonus(veilState);
          if (eff.targetType === 'AllEnemies') {
            enemyPlayer.board.forEach(m => {
              if (m.hasDivineShield) m.hasDivineShield = false;
              else m.currentHealth -= dmg;
            });
            enemyPlayer.health = Math.max(0, enemyPlayer.health - dmg);
          } else if (eff.targetType === 'AllMinions') {
            [...curPlayer.board, ...enemyPlayer.board].forEach(m => {
              if (m.hasDivineShield) m.hasDivineShield = false;
              else m.currentHealth -= dmg;
            });
          } else if (targetMinionInstanceId) {
            const targetMinion = enemyPlayer.board.find(m => m.instanceId === targetMinionInstanceId)
              || curPlayer.board.find(m => m.instanceId === targetMinionInstanceId);
            if (targetMinion) {
              if (targetMinion.hasDivineShield) targetMinion.hasDivineShield = false;
              else targetMinion.currentHealth -= dmg;
            }
          } else {
            // Default damage to enemy hero
            if (enemyPlayer.armor > 0) {
              const absorbed = Math.min(enemyPlayer.armor, dmg);
              enemyPlayer.armor -= absorbed;
              enemyPlayer.health -= (dmg - absorbed);
            } else {
              enemyPlayer.health -= dmg;
            }
          }
          curPlayer.stats.damageDealt += dmg;
          curPlayer = addDestinyPoints(curPlayer, 'TheConqueror', 1);
        } else if (eff.type === 'Heal') {
          const heal = (eff.value || 0) + getVeilHealingBonus(veilState);
          curPlayer.health = Math.min(curPlayer.maxHealth, curPlayer.health + heal);
          curPlayer = addDestinyPoints(curPlayer, 'TheWarden', 1);
        } else if (eff.type === 'Armor') {
          curPlayer.armor += (eff.value || 0);
          curPlayer = addDestinyPoints(curPlayer, 'TheWarden', 1);
        } else if (eff.type === 'Draw') {
          for (let i = 0; i < (eff.value || 1); i++) {
            const dr = drawCard(curPlayer);
            curPlayer = dr.newPlayer;
          }
        } else if (eff.type === 'EchoGain') {
          curPlayer = gainEchoes(curPlayer, eff.value || 1, card);
        }
      }
    }
  }
  // 3. Weapon
  else if (card.type === 'Weapon') {
    curPlayer.weapon = {
      card,
      attack: card.attack || 2,
      durability: card.durability || 2
    };
    logs.push({
      id: `log-${Date.now()}-weapon`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} equipped ${card.name} (${curPlayer.weapon.attack}/${curPlayer.weapon.durability}).`,
      tag: 'play'
    });
  }
  // 4. Ritual
  else if (card.type === 'Ritual') {
    curPlayer.relics.push({
      instanceId: `ritual-${Date.now()}`,
      card,
      durability: 1,
      countdown: card.ritualCountdown || 3
    });
    logs.push({
      id: `log-${Date.now()}-ritual`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} initiated RITUAL: ${card.name} (Countdown ${card.ritualCountdown || 3}).`,
      tag: 'ritual'
    });
  }
  // 5. Relic
  else if (card.type === 'Relic') {
    curPlayer.relics.push({
      instanceId: `relic-${Date.now()}`,
      card,
      durability: card.durability || 3
    });
    logs.push({
      id: `log-${Date.now()}-relic`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} placed Relic: ${card.name}.`,
      tag: 'play'
    });
  }
  // 6. Event
  else if (card.type === 'Event') {
    state.activeEvents.push({
      instanceId: `event-${Date.now()}`,
      card,
      remainingTurns: 2,
      effectDescription: card.description
    });
    logs.push({
      id: `log-${Date.now()}-event`,
      turn: state.turnNumber,
      actor: 'the_veil',
      message: `GLOBAL EVENT TRIGGERED: ${card.name}!`,
      tag: 'event'
    });
  }

  // Cleanup dead minions
  curPlayer.board = curPlayer.board.filter(m => m.currentHealth > 0);
  enemyPlayer.board = enemyPlayer.board.filter(m => m.currentHealth > 0);

  // Check win condition
  let winner: 'player' | 'opponent' | null = null;
  let phase: 'playing' | 'game_over' = 'playing';

  if (enemyPlayer.health <= 0) {
    winner = isPlayer ? 'player' : 'opponent';
    phase = 'game_over';
  } else if (curPlayer.health <= 0) {
    winner = isPlayer ? 'opponent' : 'player';
    phase = 'game_over';
  }

  return {
    ...state,
    veilState,
    combatLogs: logs,
    phase,
    winner,
    player: isPlayer ? curPlayer : enemyPlayer,
    opponent: isPlayer ? enemyPlayer : curPlayer
  };
}

export function attackWithMinion(
  state: MatchState,
  attackerInstanceId: string,
  targetType: 'minion' | 'hero',
  targetMinionInstanceId?: string
): MatchState {
  if (state.phase === 'game_over') return state;

  const isPlayer = state.activePlayer === 'player';
  let curPlayer = isPlayer ? { ...state.player } : { ...state.opponent };
  let enemyPlayer = isPlayer ? { ...state.opponent } : { ...state.player };
  const logs = [...state.combatLogs];

  const attacker = curPlayer.board.find(m => m.instanceId === attackerInstanceId);
  if (!attacker || !attacker.canAttack || attacker.currentAttack <= 0) {
    return state;
  }

  // Check enemy Taunts
  const enemyTaunts = enemyPlayer.board.filter(m => m.card.keywords?.includes('Taunt'));
  if (enemyTaunts.length > 0) {
    if (targetType === 'hero') return state; // Must attack Taunt!
    if (targetMinionInstanceId && !enemyTaunts.some(m => m.instanceId === targetMinionInstanceId)) {
      return state; // Target is not a Taunt minion!
    }
  }

  attacker.canAttack = false;
  attacker.attacksThisTurn += 1;
  attacker.isStealthed = false;

  if (targetType === 'hero') {
    let dmg = attacker.currentAttack;
    // Conqueror Destiny Tier 1 bonus: +1 damage vs hero
    if (curPlayer.destinyTrack.tiersUnlocked.TheConqueror >= 1) {
      dmg += 1;
    }

    if (enemyPlayer.armor > 0) {
      const absorbed = Math.min(enemyPlayer.armor, dmg);
      enemyPlayer.armor -= absorbed;
      enemyPlayer.health -= (dmg - absorbed);
    } else {
      enemyPlayer.health -= dmg;
    }

    curPlayer.stats.damageDealt += dmg;
    curPlayer = addDestinyPoints(curPlayer, 'TheConqueror', 1);

    logs.push({
      id: `log-${Date.now()}-atk-hero`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${attacker.card.name} attacked ${enemyPlayer.binder.name} for ${dmg} damage!`,
      tag: 'attack'
    });

    // Binder Passive: Kael Drake - Molten Retaliation
    if (enemyPlayer.binder.id === 'kael-drake') {
      enemyPlayer.armor += 1;
      let targetName = curPlayer.binder.name;
      if (curPlayer.board.length > 0) {
        const retTarget = curPlayer.board[Math.floor(Math.random() * curPlayer.board.length)];
        retTarget.currentHealth -= 1;
        targetName = retTarget.card.name;
      } else {
        curPlayer.health -= 1;
      }
      logs.push({
        id: `log-${Date.now()}-kael-passive`,
        turn: state.turnNumber,
        actor: state.activePlayer === 'player' ? 'opponent' : 'player',
        message: `${enemyPlayer.binder.name}'s Molten Retaliation dealt 1 damage to ${targetName} and gained 1 Armor!`,
        tag: 'destiny'
      });
    }
  } else if (targetType === 'minion' && targetMinionInstanceId) {
    const defender = enemyPlayer.board.find(m => m.instanceId === targetMinionInstanceId);
    if (!defender) return state;

    // Attacker deals damage
    if (defender.hasDivineShield) {
      defender.hasDivineShield = false;
      logs.push({
        id: `log-${Date.now()}-ds-break`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${defender.card.name}'s Divine Shield absorbed the blow!`,
        tag: 'attack'
      });
    } else {
      defender.currentHealth -= attacker.currentAttack;
    }

    // Defender retaliates
    if (attacker.hasDivineShield) {
      attacker.hasDivineShield = false;
    } else {
      attacker.currentHealth -= defender.currentAttack;
    }

    logs.push({
      id: `log-${Date.now()}-atk-minion`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${attacker.card.name} clashed with ${defender.card.name}!`,
      tag: 'attack'
    });
  }

  // Handle deaths
  const deadAllies = curPlayer.board.filter(m => m.currentHealth <= 0);
  const deadEnemies = enemyPlayer.board.filter(m => m.currentHealth <= 0);

  if (deadAllies.length > 0) {
    curPlayer.stats.minionsLost += deadAllies.length;
    curPlayer = addDestinyPoints(curPlayer, 'TheRevenant', deadAllies.length);
    // Corrupted Veil or Revenant Destiny grants Echoes on death
    if (state.veilState === 'Corrupted' || curPlayer.destinyTrack.tiersUnlocked.TheRevenant >= 1) {
      curPlayer = gainEchoes(curPlayer, deadAllies.length);
    }

    // Binder Passive: Mira Thorn - Overgrowth
    if (curPlayer.binder.id === 'mira-thorn') {
      const survivors = curPlayer.board.filter(m => m.currentHealth > 0);
      if (survivors.length > 0) {
        deadAllies.forEach(() => {
          const buffTarget = survivors[Math.floor(Math.random() * survivors.length)];
          buffTarget.currentAttack += 1;
          buffTarget.currentHealth += 1;
          buffTarget.maxHealth += 1;
        });
        logs.push({
          id: `log-${Date.now()}-mira-passive`,
          turn: state.turnNumber,
          actor: state.activePlayer,
          message: `${curPlayer.binder.name}'s Overgrowth triggered! Remaining allies gain +1/+1.`,
          tag: 'destiny'
        });
      }
    }
  }

  // Binder Passive: Nox - Soul Siphon
  const totalDeaths = deadAllies.length + deadEnemies.length;
  if (totalDeaths > 0) {
    if (curPlayer.binder.id === 'nox-revenant') {
      curPlayer = gainEchoes(curPlayer, totalDeaths);
      if (curPlayer.echoPool >= 4) {
        curPlayer.health = Math.min(curPlayer.maxHealth, curPlayer.health + 2);
        logs.push({
          id: `log-${Date.now()}-nox-passive`,
          turn: state.turnNumber,
          actor: state.activePlayer,
          message: `${curPlayer.binder.name}'s Soul Siphon harvested ${totalDeaths} souls (+${totalDeaths} Echoes, healed 2 HP)!`,
          tag: 'echo'
        });
      }
    }
    if (enemyPlayer.binder.id === 'nox-revenant') {
      enemyPlayer = gainEchoes(enemyPlayer, totalDeaths);
      if (enemyPlayer.echoPool >= 4) {
        enemyPlayer.health = Math.min(enemyPlayer.maxHealth, enemyPlayer.health + 2);
      }
    }
  }

  curPlayer.board = curPlayer.board.filter(m => m.currentHealth > 0);
  enemyPlayer.board = enemyPlayer.board.filter(m => m.currentHealth > 0);

  // Check game over
  let winner: 'player' | 'opponent' | null = null;
  let phase: 'playing' | 'game_over' = 'playing';

  if (enemyPlayer.health <= 0) {
    winner = isPlayer ? 'player' : 'opponent';
    phase = 'game_over';
  } else if (curPlayer.health <= 0) {
    winner = isPlayer ? 'opponent' : 'player';
    phase = 'game_over';
  }

  return {
    ...state,
    combatLogs: logs,
    phase,
    winner,
    player: isPlayer ? curPlayer : enemyPlayer,
    opponent: isPlayer ? enemyPlayer : curPlayer
  };
}

export function activateHeroPower(state: MatchState): MatchState {
  if (state.phase === 'game_over') return state;

  const isPlayer = state.activePlayer === 'player';
  let curPlayer = isPlayer ? { ...state.player } : { ...state.opponent };
  let enemyPlayer = isPlayer ? { ...state.opponent } : { ...state.player };
  let veilState = state.veilState;
  const logs = [...state.combatLogs];

  if (curPlayer.heroPowerUsedThisTurn || curPlayer.currentMana < curPlayer.binder.heroPower.cost) {
    return state;
  }

  curPlayer.currentMana -= curPlayer.binder.heroPower.cost;
  curPlayer.heroPowerUsedThisTurn = true;

  const hpType = curPlayer.binder.heroPower.effectType;

  if (hpType === 'VeilShift') {
    veilState = shiftVeilTo(veilState);
    curPlayer = gainEchoes(curPlayer, 1);
    curPlayer.stats.veilShiftsTriggered += 1;
    if (curPlayer.hand.length > 0) {
      const randIdx = Math.floor(Math.random() * curPlayer.hand.length);
      if (curPlayer.hand[randIdx].cost > 0) {
        curPlayer.hand[randIdx] = {
          ...curPlayer.hand[randIdx],
          cost: Math.max(0, curPlayer.hand[randIdx].cost - 1)
        };
      }
    }
    logs.push({
      id: `log-${Date.now()}-hp-veil`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} activated Veilstep! Veil shifted to ${veilState}, gained 1 Echo and discounted a card in hand.`,
      tag: 'veil'
    });
  } else if (hpType === 'ArmorAndBuff') {
    curPlayer.armor += 3;
    if (curPlayer.board.length > 0) {
      const targetMinion = curPlayer.board[0];
      targetMinion.currentHealth += 1;
      targetMinion.maxHealth += 1;
      const kw = targetMinion.card.keywords || [];
      if (!kw.includes('Taunt')) {
        targetMinion.card = { ...targetMinion.card, keywords: [...kw, 'Taunt'] };
      }
      logs.push({
        id: `log-${Date.now()}-hp-armor`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} activated Ashen Guard (+3 Armor, gave ${targetMinion.card.name} +1 Health & Taunt).`,
        tag: 'play'
      });
    } else {
      logs.push({
        id: `log-${Date.now()}-hp-armor`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} activated Ashen Guard (+3 Armor).`,
        tag: 'play'
      });
    }
  } else if (hpType === 'SummonSpore') {
    if (curPlayer.board.length < 7) {
      curPlayer.board.push({
        instanceId: `spore-${Date.now()}`,
        cardId: 'vir-01',
        card: {
          id: 'vir-01',
          name: 'Sporeling',
          faction: 'ViridianHive',
          type: 'Minion',
          rarity: 'Common',
          cost: 1,
          attack: 1,
          health: 1,
          keywords: ['Deathrattle'],
          description: 'Deathrattle: Give a random ally +1/+1.',
          flavorText: 'Living spore.',
          artworkPlaceholderTheme: 'viridian_spore'
        },
        currentAttack: 1,
        currentHealth: 1,
        maxHealth: 1,
        canAttack: false,
        attacksThisTurn: 0,
        maxAttacksPerTurn: 1,
        hasDivineShield: false,
        isStealthed: false,
        isFrozen: false,
        isSilenced: false
      });
      logs.push({
        id: `log-${Date.now()}-hp-spore`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} sprouted a 1/1 Sporeling!`,
        tag: 'play'
      });
    } else {
      curPlayer.board.forEach(m => m.currentAttack += 1);
      logs.push({
        id: `log-${Date.now()}-hp-spore-full`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name}'s board is full! Wildbloom grants all allies +1 Attack!`,
        tag: 'play'
      });
    }
  } else if (hpType === 'SoulHarvest') {
    // Deal 1 damage to lowest health enemy minion or hero
    if (enemyPlayer.board.length > 0) {
      const target = enemyPlayer.board.reduce((prev, curr) => curr.currentHealth < prev.currentHealth ? curr : prev);
      target.currentHealth -= 1;
      if (target.currentHealth <= 0) {
        curPlayer = gainEchoes(curPlayer, 2);
        // Summon a 1/1 Lost Soul if space
        if (curPlayer.board.length < 7) {
          curPlayer.board.push({
            instanceId: `soul-${Date.now()}`,
            cardId: 'umb-01',
            card: {
              id: 'umb-01',
              name: 'Lost Soul',
              faction: 'UmbralRemnant',
              type: 'Minion',
              rarity: 'Common',
              cost: 1,
              attack: 1,
              health: 1,
              keywords: [],
              description: 'Soul summoned from the veil.',
              flavorText: 'Whispers from the graveyard.',
              artworkPlaceholderTheme: 'umbral_specter'
            },
            currentAttack: 1,
            currentHealth: 1,
            maxHealth: 1,
            canAttack: false,
            attacksThisTurn: 0,
            maxAttacksPerTurn: 1,
            hasDivineShield: false,
            isStealthed: false,
            isFrozen: false,
            isSilenced: false
          });
        }
      }
      enemyPlayer.board = enemyPlayer.board.filter(m => m.currentHealth > 0);
    } else {
      enemyPlayer.health -= 1;
    }
    logs.push({
      id: `log-${Date.now()}-hp-soul`,
      turn: state.turnNumber,
      actor: state.activePlayer,
      message: `${curPlayer.binder.name} channeled Soul Return for 1 damage!`,
      tag: 'play'
    });
  } else if (hpType === 'ForecastIndex') {
    const dr = drawCard(curPlayer);
    curPlayer = dr.newPlayer;
    if (dr.drawnCard && curPlayer.hand.length > 0) {
      const lastIdx = curPlayer.hand.length - 1;
      curPlayer.hand[lastIdx] = {
        ...curPlayer.hand[lastIdx],
        cost: Math.max(0, curPlayer.hand[lastIdx].cost - 1)
      };
      logs.push({
        id: `log-${Date.now()}-hp-chrono`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} archived the timeline, drawing ${dr.drawnCard.name} (Cost reduced by 1)!`,
        tag: 'play'
      });
    }
  } else if (hpType === 'RadiantBeacon') {
    curPlayer.health = Math.min(curPlayer.maxHealth, curPlayer.health + 2);
    curPlayer.board.forEach(m => {
      m.currentHealth = Math.min(m.maxHealth, m.currentHealth + 2);
    });
    if (veilState === 'Celestial') {
      enemyPlayer.board.forEach(m => {
        if (m.hasDivineShield) m.hasDivineShield = false;
        else m.currentHealth -= 1;
      });
      enemyPlayer.board = enemyPlayer.board.filter(m => m.currentHealth > 0);
      logs.push({
        id: `log-${Date.now()}-hp-radiant-celestial`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} summoned Starfall under the Celestial Veil! Healed all allies for 2 and smote all enemies for 1 damage!`,
        tag: 'veil'
      });
    } else {
      logs.push({
        id: `log-${Date.now()}-hp-radiant`,
        turn: state.turnNumber,
        actor: state.activePlayer,
        message: `${curPlayer.binder.name} summoned Starfall (+2 Health to all allies).`,
        tag: 'play'
      });
    }
  }

  return {
    ...state,
    veilState,
    combatLogs: logs,
    player: isPlayer ? curPlayer : enemyPlayer,
    opponent: isPlayer ? enemyPlayer : curPlayer
  };
}
