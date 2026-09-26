import { 
  BGParticipant, 
  BGUnit, 
  BGTier, 
  BGFaction, 
  BGSynergyCount, 
  BGCombatLogItem 
} from '../types/battlegrounds';
import { BINDERS } from '../data/binders';
import { BG_UNIT_POOL, createBGUnitInstance } from '../data/battlegroundsUnits';

export interface BGAIPersonalityDef {
  name: string;
  binderId: string;
  personality: string;
  favoredFaction: BGFaction;
}

export const BG_AI_PERSONALITIES: BGAIPersonalityDef[] = [
  { name: 'The Collector', binderId: 'lyra-voss', personality: 'Rift Collector', favoredFaction: 'Riftborn' },
  { name: 'The Garden Mind', binderId: 'mira-thorn', personality: 'Organic Swarm', favoredFaction: 'Thornbloom' },
  { name: 'The Clockmaker', binderId: 'orin-vale', personality: 'Chrono Engineer', favoredFaction: 'Clockwork' },
  { name: 'The Star Eater', binderId: 'seraphine-starforged', personality: 'Celestial Sovereign', favoredFaction: 'Starborn' },
  { name: 'The Hollow King', binderId: 'nox-revenant', personality: 'Revenant Lord', favoredFaction: 'Wraithkin' },
  { name: 'The Mirror', binderId: 'lyra-voss', personality: 'Adaptive Mimic', favoredFaction: 'Neutral' },
  { name: 'Ashen Warlord', binderId: 'kael-drake', personality: 'Molten Berserker', favoredFaction: 'Ashforged' }
];

import { draftAIBGCommanders } from '../data/battlegroundsCommanders';

/**
 * Creates 8 participants (1 Player + 7 varied AI commanders from the pool).
 */
export function initializeBGParticipants(playerBinderId?: string): BGParticipant[] {
  const chosenBinder = BINDERS.find(b => b.id === playerBinderId) || BINDERS[0];

  const participants: BGParticipant[] = [
    {
      id: 'bg-player',
      isHuman: true,
      name: 'You (Champion)',
      binder: chosenBinder,
      health: 35,
      maxHealth: 35,
      armor: 0,
      tier: 1,
      tierUpgradeCost: 5,
      shards: 3,
      board: [],
      bench: [],
      placement: 1,
      isAlive: true,
      personality: 'Master Tactician',
      winStreak: 0
    }
  ];

  // Draft 7 distinct, randomized AI commanders from the pool of 14
  const draftedCommanders = draftAIBGCommanders();
  draftedCommanders.forEach((cmd, idx) => {
    const binder = BINDERS.find(b => b.id === cmd.binderId) || BINDERS[idx % BINDERS.length];
    participants.push({
      id: `bg-ai-${idx + 1}`,
      isHuman: false,
      name: `${cmd.avatarIcon} ${cmd.name}`,
      binder,
      health: 35,
      maxHealth: 35,
      armor: 0,
      tier: 1,
      tierUpgradeCost: 5,
      shards: 3,
      board: [],
      bench: [],
      placement: idx + 2,
      isAlive: true,
      personality: `${cmd.personality} • ${cmd.powerName}`,
      winStreak: 0
    });
  });

  return participants;
}

/**
 * Rolls available units in the Rift Market based on current Tier.
 */
export function rollRiftMarket(tier: BGTier): BGUnit[] {
  const count = tier <= 2 ? 3 : tier <= 4 ? 4 : tier <= 5 ? 5 : 6;
  const eligible = BG_UNIT_POOL.filter(u => u.tier <= tier);
  const picked: BGUnit[] = [];

  for (let i = 0; i < count; i++) {
    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    picked.push(createBGUnitInstance(pick));
  }

  return picked;
}

/**
 * Calculates active faction synergies on a participant's board.
 */
export function calculateSynergies(board: BGUnit[]): BGSynergyCount[] {
  const counts: Record<BGFaction, number> = {
    Thornbloom: 0,
    Ashforged: 0,
    Wraithkin: 0,
    Starborn: 0,
    Clockwork: 0,
    Riftborn: 0,
    Neutral: 0
  };

  board.forEach(u => {
    if (u.faction !== 'Neutral') {
      counts[u.faction] = (counts[u.faction] || 0) + 1;
    }
  });

  const synergies: BGSynergyCount[] = [];

  if (counts.Thornbloom >= 2) {
    synergies.push({
      faction: 'Thornbloom',
      count: counts.Thornbloom,
      activeTier: counts.Thornbloom >= 4 ? 2 : 1,
      description: counts.Thornbloom >= 4 
        ? '⭐⭐ All allies gain +4/+4 & Deathrattle: Summon 3/3 Treant' 
        : '⭐ Thornbloom units gain +2/+2'
    });
  }

  if (counts.Ashforged >= 2) {
    synergies.push({
      faction: 'Ashforged',
      count: counts.Ashforged,
      activeTier: counts.Ashforged >= 4 ? 2 : 1,
      description: counts.Ashforged >= 4
        ? '⭐⭐ Retaliates 3 damage when struck & +6 Health'
        : '⭐ Ashforged gain Taunt & +3 Health'
    });
  }

  if (counts.Wraithkin >= 2) {
    synergies.push({
      faction: 'Wraithkin',
      count: counts.Wraithkin,
      activeTier: counts.Wraithkin >= 4 ? 2 : 1,
      description: counts.Wraithkin >= 4
        ? '⭐⭐ All friendly minions gain Reborn & summon 2/2 Specters'
        : '⭐ Friendly minions gain Reborn'
    });
  }

  if (counts.Starborn >= 2) {
    synergies.push({
      faction: 'Starborn',
      count: counts.Starborn,
      activeTier: counts.Starborn >= 4 ? 2 : 1,
      description: counts.Starborn >= 4
        ? '⭐⭐ Celestial Shield on all & Supernova: 6 AoE on death'
        : '⭐ Starborn gain Divine Shield'
    });
  }

  if (counts.Clockwork >= 2) {
    synergies.push({
      faction: 'Clockwork',
      count: counts.Clockwork,
      activeTier: counts.Clockwork >= 4 ? 2 : 1,
      description: counts.Clockwork >= 4
        ? '⭐⭐ Clockwork gain Windfury & +3 Attack per attack'
        : '⭐ Clockwork gain +2 Attack'
    });
  }

  if (counts.Riftborn >= 2) {
    synergies.push({
      faction: 'Riftborn',
      count: counts.Riftborn,
      activeTier: counts.Riftborn >= 4 ? 2 : 1,
      description: counts.Riftborn >= 4
        ? '⭐⭐ Poisonous & Windfury'
        : '⭐ Riftborn gain Windfury'
    });
  }

  return synergies;
}

/**
 * Simulates AI participants building their armies for the round.
 */
export function advanceAIParticipants(participants: BGParticipant[], roundNumber: number) {
  participants.forEach(p => {
    if (p.isHuman || !p.isAlive) return;

    // AI upgrades tier if affordable
    if (p.shards >= p.tierUpgradeCost && p.tier < 6 && Math.random() < 0.6) {
      p.shards -= p.tierUpgradeCost;
      p.tier = (p.tier + 1) as BGTier;
      p.tierUpgradeCost = p.tier * 2 + 3;
    }

    // AI recruits units up to max 7
    while (p.board.length < 7 && p.shards >= 3) {
      p.shards -= 3;
      const eligible = BG_UNIT_POOL.filter(u => u.tier <= p.tier);
      const pick = eligible[Math.floor(Math.random() * eligible.length)];
      p.board.push(createBGUnitInstance(pick));
    }

    // Passive level stat scaling based on round
    if (p.board.length < 3 && roundNumber > 1) {
      const fallback = BG_UNIT_POOL.filter(u => u.tier <= p.tier)[0];
      if (fallback) p.board.push(createBGUnitInstance(fallback));
    }
  });
}

export interface BGCombatStep {
  attackerSide: 'player' | 'opponent';
  attackerIndex: number;
  defenderSide: 'player' | 'opponent';
  defenderIndex: number;
  damage: number;
  isFatal: boolean;
  message: string;
}

export interface BGCombatSimulationResult {
  winner: 'player' | 'opponent' | 'tie';
  damageDealt: number;
  survivingUnitsCount: number;
  steps: BGCombatStep[];
  playerBoardEnd: BGUnit[];
  opponentBoardEnd: BGUnit[];
}

/**
 * Simulates a full auto-battle clash between two boards with left-to-right targeting & Taunt priority.
 */
export function simulateAutoCombat(
  playerUnits: BGUnit[],
  opponentUnits: BGUnit[],
  winnerTier: BGTier
): BGCombatSimulationResult {
  const pBoard: BGUnit[] = playerUnits.map(u => ({ ...u }));
  const oBoard: BGUnit[] = opponentUnits.map(u => ({ ...u }));
  const steps: BGCombatStep[] = [];

  let pTurn = Math.random() < 0.5; // Random coin flip for who strikes first
  let pIdx = 0;
  let oIdx = 0;
  let rounds = 0;

  while (pBoard.length > 0 && oBoard.length > 0 && rounds < 40) {
    rounds++;

    if (pTurn) {
      // Player attacks
      if (pBoard.length === 0) break;
      pIdx = pIdx % pBoard.length;
      const attacker = pBoard[pIdx];

      // Opponent target selection (prioritizes Taunt)
      const taunts = oBoard.filter(u => u.hasTaunt);
      const targetPool = taunts.length > 0 ? taunts : oBoard;
      const target = targetPool[Math.floor(Math.random() * targetPool.length)];
      const targetIdx = oBoard.indexOf(target);

      // Damage resolution
      let dmg = attacker.attack;
      if (target.hasDivineShield) {
        target.hasDivineShield = false;
        dmg = 0;
      } else {
        target.health -= dmg;
      }

      // Retaliation
      if (attacker.hasDivineShield) {
        attacker.hasDivineShield = false;
      } else {
        attacker.health -= target.attack;
      }

      steps.push({
        attackerSide: 'player',
        attackerIndex: pIdx,
        defenderSide: 'opponent',
        defenderIndex: targetIdx,
        damage: attacker.attack,
        isFatal: target.health <= 0,
        message: `${attacker.name} attacked ${target.name} for ${attacker.attack} damage!`
      });

      // Handle deaths & Reborn
      if (target.health <= 0) {
        if (target.hasReborn) {
          target.health = 1;
          target.hasReborn = false;
        } else {
          oBoard.splice(targetIdx, 1);
        }
      }

      if (attacker.health <= 0) {
        if (attacker.hasReborn) {
          attacker.health = 1;
          attacker.hasReborn = false;
        } else {
          pBoard.splice(pIdx, 1);
        }
      } else {
        pIdx++;
      }
    } else {
      // Opponent attacks
      if (oBoard.length === 0) break;
      oIdx = oIdx % oBoard.length;
      const attacker = oBoard[oIdx];

      // Player target selection (prioritizes Taunt)
      const taunts = pBoard.filter(u => u.hasTaunt);
      const targetPool = taunts.length > 0 ? taunts : pBoard;
      const target = targetPool[Math.floor(Math.random() * targetPool.length)];
      const targetIdx = pBoard.indexOf(target);

      // Damage resolution
      let dmg = attacker.attack;
      if (target.hasDivineShield) {
        target.hasDivineShield = false;
        dmg = 0;
      } else {
        target.health -= dmg;
      }

      // Retaliation
      if (attacker.hasDivineShield) {
        attacker.hasDivineShield = false;
      } else {
        attacker.health -= target.attack;
      }

      steps.push({
        attackerSide: 'opponent',
        attackerIndex: oIdx,
        defenderSide: 'player',
        defenderIndex: targetIdx,
        damage: attacker.attack,
        isFatal: target.health <= 0,
        message: `${attacker.name} struck ${target.name} for ${attacker.attack} damage!`
      });

      // Handle deaths & Reborn
      if (target.health <= 0) {
        if (target.hasReborn) {
          target.health = 1;
          target.hasReborn = false;
        } else {
          pBoard.splice(targetIdx, 1);
        }
      }

      if (attacker.health <= 0) {
        if (attacker.hasReborn) {
          attacker.health = 1;
          attacker.hasReborn = false;
        } else {
          oBoard.splice(oIdx, 1);
        }
      } else {
        oIdx++;
      }
    }

    pTurn = !pTurn;
  }

  // Calculate winner and damage
  let winner: 'player' | 'opponent' | 'tie' = 'tie';
  let damageDealt = 0;
  let survivingCount = 0;

  if (pBoard.length > 0 && oBoard.length === 0) {
    winner = 'player';
    survivingCount = pBoard.length;
    damageDealt = winnerTier + pBoard.reduce((sum, u) => sum + u.tier, 0);
  } else if (oBoard.length > 0 && pBoard.length === 0) {
    winner = 'opponent';
    survivingCount = oBoard.length;
    damageDealt = winnerTier + oBoard.reduce((sum, u) => sum + u.tier, 0);
  }

  return {
    winner,
    damageDealt,
    survivingUnitsCount: survivingCount,
    steps,
    playerBoardEnd: pBoard,
    opponentBoardEnd: oBoard
  };
}

/**
 * Simulates background combat between non-player AI participants and updates leaderboard.
 */
export function resolveBackgroundDuels(participants: BGParticipant[], roundNumber: number) {
  const aliveAIs = participants.filter(p => !p.isHuman && p.isAlive);
  
  // Pair them up in twos
  for (let i = 0; i < aliveAIs.length - 1; i += 2) {
    const ai1 = aliveAIs[i];
    const ai2 = aliveAIs[i + 1];

    const result = simulateAutoCombat(ai1.board, ai2.board, Math.max(ai1.tier, ai2.tier) as BGTier);

    if (result.winner === 'player') {
      ai2.health = Math.max(0, ai2.health - result.damageDealt);
      ai1.winStreak += 1;
      ai2.winStreak = 0;
      if (ai2.health <= 0) {
        ai2.isAlive = false;
        ai2.eliminatedRound = roundNumber;
      }
    } else if (result.winner === 'opponent') {
      ai1.health = Math.max(0, ai1.health - result.damageDealt);
      ai2.winStreak += 1;
      ai1.winStreak = 0;
      if (ai1.health <= 0) {
        ai1.isAlive = false;
        ai1.eliminatedRound = roundNumber;
      }
    }
  }

  // Update leaderboard placements
  participants.sort((a, b) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    if (a.isAlive && b.isAlive) return b.health - a.health;
    return (b.eliminatedRound || 0) - (a.eliminatedRound || 0);
  });

  participants.forEach((p, idx) => {
    p.placement = idx + 1;
  });
}
