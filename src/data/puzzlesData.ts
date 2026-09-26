import { PuzzleChapter, VeilboundPuzzle } from '../types/puzzle';
import { ALL_CARDS, getCardById } from './cards';
import { BoardMinion, Card } from '../types/card';

// Helper to create a board minion with valid underlying card data
function makeMinion(
  id: string,
  cardId: string,
  attack: number,
  health: number,
  canAttack: boolean,
  keywords: string[] = []
): BoardMinion {
  const baseCard = getCardById(cardId) || ALL_CARDS[0];
  const mergedKeywords = Array.from(new Set([...(baseCard.keywords || []), ...keywords])) as any;

  return {
    instanceId: id,
    cardId: baseCard.id,
    card: {
      ...baseCard,
      attack,
      health,
      keywords: mergedKeywords
    },
    currentAttack: attack,
    currentHealth: health,
    maxHealth: health,
    canAttack,
    attacksThisTurn: 0,
    maxAttacksPerTurn: 1,
    hasDivineShield: mergedKeywords.includes('Shield') || mergedKeywords.includes('DivineShield'),
    isStealthed: mergedKeywords.includes('Stealth'),
    isFrozen: false,
    isSilenced: false
  };
}

// Helper to clone a valid card from the card database with optional overrides
function makeHandCard(cardId: string, overrides: Partial<Card> = {}): Card {
  const baseCard = getCardById(cardId) || ALL_CARDS[0];
  return {
    ...baseCard,
    ...overrides
  };
}

export const PUZZLE_CHAPTERS: PuzzleChapter[] = [
  // ==========================================
  // CHAPTER 1: The First Echo
  // ==========================================
  {
    chapterNumber: 1,
    title: 'The First Echo',
    subtitle: 'Fundamentals of Lethal Sequence',
    description: 'Learn to spot exact lethal opportunities using charge minions, direct burn, and weapon swings.',
    icon: '🔮',
    puzzles: [
      {
        id: 'puz-1-1',
        chapterNumber: 1,
        puzzleNumber: 1,
        title: 'The Last Spark',
        category: 'Lethal',
        objective: 'Defeat enemy Binder Orin Vale this turn (7 Health remaining).',
        hint: 'You have 4 Mana and your Cinder Sentry has Charge. Attack for 4, then cast Slag Strike for 3 to reach 7 damage!',
        playerBinderId: 'kael-drake',
        opponentBinderId: 'orin-vale',
        playerHealth: 8,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 4,
        playerMaxMana: 4,
        playerEcho: 0,
        veilState: 'Calm',
        playerHand: [
          makeHandCard('ash-02', { cost: 2, effects: [{ type: 'Damage', targetType: 'EnemyHero', value: 3 }] })
        ],
        playerBoard: [
          makeMinion('pm-1', 'ash-01', 4, 3, true, ['Charge'])
        ],
        opponentHealth: 7,
        opponentArmor: 0,
        opponentBoard: [],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 100, essence: 50 }
      },
      {
        id: 'puz-1-2',
        chapterNumber: 1,
        puzzleNumber: 2,
        title: 'Piercing the Shield',
        category: 'Lethal',
        objective: 'Defeat the enemy Binder while clearing the Divine Shield Taunt guard.',
        hint: 'Summon your 1-cost Rush minion to pop the Divine Shield and destroy the Taunt guard, then strike face with your 5-attack champion!',
        playerBinderId: 'kael-drake',
        opponentBinderId: 'lyra-voss',
        playerHealth: 12,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 3,
        playerMaxMana: 3,
        playerEcho: 0,
        veilState: 'Calm',
        playerHand: [
          makeHandCard('ash-01', { cost: 1, attack: 2, health: 2, keywords: ['Rush'] })
        ],
        playerBoard: [
          makeMinion('pm-1', 'ash-03', 5, 4, true)
        ],
        opponentHealth: 5,
        opponentArmor: 0,
        opponentBoard: [
          makeMinion('om-1', 'chr-01', 2, 2, false, ['Taunt', 'Shield'])
        ],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 120, essence: 60 }
      }
    ]
  },

  // ==========================================
  // CHAPTER 2: Through the Veil
  // ==========================================
  {
    chapterNumber: 2,
    title: 'Through the Veil',
    subtitle: 'Harnessing Planar State Shifts',
    description: 'Master the 5 Veil states: Wild for damage boosts, Celestial for healing, and Corrupted for echoes.',
    icon: '🌀',
    puzzles: [
      {
        id: 'puz-2-1',
        chapterNumber: 2,
        puzzleNumber: 1,
        title: 'Wildfire Surge',
        category: 'Veil',
        objective: 'Defeat enemy Binder Mira Thorn (8 Health remaining) using amplified planar spell damage.',
        hint: 'Spells deal +1 bonus damage in the Wild Veil state. Summon your Rift Sprite to shift the Veil to Wild before casting your spells!',
        playerBinderId: 'lyra-voss',
        opponentBinderId: 'mira-thorn',
        playerHealth: 10,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 5,
        playerMaxMana: 5,
        playerEcho: 1,
        veilState: 'Calm',
        playerHand: [
          makeHandCard('aeth-01', { cost: 1, effects: [{ type: 'Veilshift', targetVeilState: 'Wild' }] }),
          makeHandCard('aeth-02', { cost: 2, effects: [{ type: 'Damage', targetType: 'EnemyHero', value: 3 }] }),
          makeHandCard('aeth-04', { cost: 2, effects: [{ type: 'Damage', targetType: 'EnemyHero', value: 3 }] })
        ],
        playerBoard: [],
        opponentHealth: 8,
        opponentArmor: 0,
        opponentBoard: [],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 150, essence: 75 }
      }
    ]
  },

  // ==========================================
  // CHAPTER 3: The Broken Clock
  // ==========================================
  {
    chapterNumber: 3,
    title: 'The Broken Clock',
    subtitle: 'Chronocast & Delayed Rites',
    description: 'Manipulate time loops, tick rituals down to climax, and execute multi-turn payoff chains.',
    icon: '⏳',
    puzzles: [
      {
        id: 'puz-3-1',
        chapterNumber: 3,
        puzzleNumber: 1,
        title: 'The Final Second',
        category: 'Combo',
        objective: 'Trigger your Chrono Sentinel and strike for lethal victory.',
        hint: 'Your 7/7 Clockwork Sentinel has Charge ready. Direct assault on the enemy Binder concludes the match!',
        playerBinderId: 'orin-vale',
        opponentBinderId: 'nox-revenant',
        playerHealth: 15,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 4,
        playerMaxMana: 4,
        playerEcho: 0,
        veilState: 'Calm',
        playerHand: [
          makeHandCard('chr-02', { cost: 1 })
        ],
        playerBoard: [
          makeMinion('pm-chrono-1', 'chr-05', 7, 7, true, ['Charge'])
        ],
        opponentHealth: 7,
        opponentArmor: 0,
        opponentBoard: [],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 180, essence: 90 }
      }
    ]
  },

  // ==========================================
  // CHAPTER 4: Garden of Giants
  // ==========================================
  {
    chapterNumber: 4,
    title: 'Garden of Giants',
    subtitle: 'Canopy Swarms & Overgrowth',
    description: 'Grow massive board presence through Viridian swarm buffs and canopy blessings.',
    icon: '🌿',
    puzzles: [
      {
        id: 'puz-4-1',
        chapterNumber: 4,
        puzzleNumber: 1,
        title: 'Sporeling Swarm',
        category: 'Lethal',
        objective: 'Buff your wide board of 1/1 Sporelings to defeat the opponent (12 Health remaining).',
        hint: 'Canopy Roar grants +2 Attack to all friendly minions. With 4 minions, your total attack becomes 12!',
        playerBinderId: 'mira-thorn',
        opponentBinderId: 'kael-drake',
        playerHealth: 20,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 4,
        playerMaxMana: 4,
        playerEcho: 0,
        veilState: 'Calm',
        playerHand: [
          makeHandCard('vir-02', {
            cost: 3,
            name: 'Canopy Roar',
            type: 'Spell',
            effects: [{ type: 'Buff', targetType: 'AllAllies', value: 2 }]
          })
        ],
        playerBoard: [
          makeMinion('pm-s1', 'vir-01', 1, 1, true),
          makeMinion('pm-s2', 'vir-01', 1, 1, true),
          makeMinion('pm-s3', 'vir-01', 1, 1, true),
          makeMinion('pm-s4', 'vir-01', 1, 1, true)
        ],
        opponentHealth: 12,
        opponentArmor: 0,
        opponentBoard: [],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 200, essence: 100 }
      }
    ]
  },

  // ==========================================
  // CHAPTER 5: The Hollow Star
  // ==========================================
  {
    chapterNumber: 5,
    title: 'The Hollow Star',
    subtitle: 'Sacrifices & Divine Protection',
    description: 'Navigate complex soul harvests, deathrattle chains, and celestial shields.',
    icon: '⭐',
    puzzles: [
      {
        id: 'puz-5-1',
        chapterNumber: 5,
        puzzleNumber: 1,
        title: 'Soul Feast',
        category: 'Echo',
        objective: 'Defeat Seraphine (9 Health remaining) by coordinating Grave Thrall with Soul Flay.',
        hint: 'Your Grave Thrall deals 3 damage directly to face, then cast Soul Flay for the remaining 6 damage!',
        playerBinderId: 'nox-revenant',
        opponentBinderId: 'seraphine-starforged',
        playerHealth: 6,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 4,
        playerMaxMana: 4,
        playerEcho: 1,
        veilState: 'Corrupted',
        playerHand: [
          makeHandCard('umb-02', {
            cost: 3,
            name: 'Soul Flay',
            type: 'Spell',
            effects: [{ type: 'Damage', targetType: 'EnemyHero', value: 6 }]
          })
        ],
        playerBoard: [
          makeMinion('pm-g1', 'umb-01', 3, 2, true)
        ],
        opponentHealth: 9,
        opponentArmor: 0,
        opponentBoard: [],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 220, essence: 110 }
      }
    ]
  },

  // ==========================================
  // CHAPTER 6: The Final Rift
  // ==========================================
  {
    chapterNumber: 6,
    title: 'The Final Rift',
    subtitle: 'The Grandmaster Sequences',
    description: 'Solve intricate multi-step puzzles requiring perfect sequencing, resource management, and foresight.',
    icon: '🌌',
    puzzles: [
      {
        id: 'puz-6-1',
        chapterNumber: 6,
        puzzleNumber: 1,
        title: 'Ouroboros Paradox',
        category: 'Combo',
        objective: 'Achieve exact lethal against 16 Health through a multi-step sequence.',
        hint: 'First trade the 4/4 Rush minion into the 3/4 Taunt guard. Then strike face with both 6/6 champions (12 damage) and finish with Aether Resonance (4 damage)!',
        playerBinderId: 'lyra-voss',
        opponentBinderId: 'kael-drake',
        playerHealth: 1,
        playerMaxHealth: 30,
        playerArmor: 0,
        playerMana: 6,
        playerMaxMana: 6,
        playerEcho: 2,
        veilState: 'Calm',
        playerHand: [
          makeHandCard('aeth-02', {
            cost: 2,
            name: 'Aether Resonance',
            type: 'Spell',
            effects: [{ type: 'Damage', targetType: 'EnemyHero', value: 4 }]
          })
        ],
        playerBoard: [
          makeMinion('pm-rush', 'aeth-03', 4, 4, true, ['Rush']),
          makeMinion('pm-boss-1', 'ast-10', 6, 6, true),
          makeMinion('pm-boss-2', 'chr-08', 6, 6, true)
        ],
        opponentHealth: 16,
        opponentArmor: 0,
        opponentBoard: [
          makeMinion('om-taunt', 'ash-03', 3, 4, false, ['Taunt'])
        ],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 300, essence: 150, unlockedCardId: 'aeth-05' }
      }
    ]
  }
];
