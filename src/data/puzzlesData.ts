import { PuzzleChapter, VeilboundPuzzle } from '../types/puzzle';
import { ALL_CARDS, getCardById } from './cards';
import { BoardMinion } from '../types/card';

// Helper to create a board minion
function makeMinion(id: string, cardId: string, attack: number, health: number, canAttack: boolean, keywords: any[] = []): BoardMinion {
  const card = getCardById(cardId) || ALL_CARDS[0];
  return {
    instanceId: id,
    cardId: card.id,
    card: { ...card, attack, health, keywords },
    currentAttack: attack,
    currentHealth: health,
    maxHealth: health,
    canAttack,
    attacksThisTurn: 0,
    maxAttacksPerTurn: 1,
    hasDivineShield: keywords.includes('DivineShield'),
    isStealthed: keywords.includes('Stealth'),
    isFrozen: false,
    isSilenced: false
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
        objective: 'Defeat the enemy Binder this turn.',
        hint: 'You have 4 Mana and your Ash Knight has Charge. Can you deal 7 total damage?',
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
          { ...ALL_CARDS.find(c => c.id === 'kael-005')!, cost: 2, effects: [{ type: 'Damage', value: 3 }] }, // Fireball / Burn
        ],
        playerBoard: [
          makeMinion('pm-1', 'kael-001', 4, 3, true, ['Charge'])
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
        objective: 'Defeat the enemy Binder while bypassing or clearing the Taunt guard.',
        hint: 'Use your small minion to pop the Divine Shield on the Taunt guard before striking with your heavy weapon!',
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
          { ...ALL_CARDS.find(c => c.id === 'kael-002')!, cost: 1, attack: 2, keywords: ['Rush'] }
        ],
        playerBoard: [
          makeMinion('pm-1', 'kael-001', 5, 4, true)
        ],
        opponentHealth: 5,
        opponentArmor: 0,
        opponentBoard: [
          makeMinion('om-1', 'orin-001', 2, 2, false, ['Taunt'])
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
        objective: 'Defeat the enemy Binder with amplified spell damage.',
        hint: 'Spells deal +1 bonus damage in the Wild Veil state. Shift the Veil before casting your burn spells!',
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
          { ...ALL_CARDS.find(c => c.id === 'lyra-002')!, cost: 1, effects: [{ type: 'Veilshift', targetVeilState: 'Wild' }], name: 'Veil Attunement' },
          { ...ALL_CARDS.find(c => c.id === 'lyra-003')!, cost: 2, effects: [{ type: 'Damage', value: 3 }], name: 'Aether Burst' },
          { ...ALL_CARDS.find(c => c.id === 'lyra-004')!, cost: 2, effects: [{ type: 'Damage', value: 3 }], name: 'Aether Bolt' }
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
        objective: 'Trigger your Ritual climax and strike for lethal.',
        hint: 'Your Chrono-Haste spell accelerates Rituals by 1 turn, releasing the 7/7 Avatar immediately!',
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
          { ...ALL_CARDS.find(c => c.id === 'orin-002')!, cost: 1, name: 'Temporal Haste' }
        ],
        playerBoard: [
          makeMinion('pm-chrono-1', 'orin-003', 7, 7, true, ['Charge'])
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
        objective: 'Buff your wide board of 1/1 Sporelings to defeat the opponent.',
        hint: 'Canopy Roar grants +2 Attack to all friendly minions. With 4 minions, that is +8 damage!',
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
          { ...ALL_CARDS.find(c => c.id === 'mira-002')!, cost: 3, name: 'Canopy Roar', effects: [{ type: 'Buff', value: 2 }] }
        ],
        playerBoard: [
          makeMinion('pm-s1', 'mira-001', 1, 1, true),
          makeMinion('pm-s2', 'mira-001', 1, 1, true),
          makeMinion('pm-s3', 'mira-001', 1, 1, true),
          makeMinion('pm-s4', 'mira-001', 1, 1, true)
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
        objective: 'Sacrifice your minion to harvest Echoes and cast Soul Devour for lethal.',
        hint: 'Corrupted Veil gives 1 Echo on death. Sacrifice your Ghoul, then consume the Echo for bonus damage!',
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
          { ...ALL_CARDS.find(c => c.id === 'nox-003')!, cost: 3, name: 'Soul Devour', effects: [{ type: 'Damage', value: 6 }] }
        ],
        playerBoard: [
          makeMinion('pm-g1', 'nox-001', 3, 2, true)
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
        hint: 'First trade the Rush minion into the Taunt guard. Then cast your spell, and strike face with your remaining champions!',
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
          { ...ALL_CARDS.find(c => c.id === 'kael-005')!, cost: 3, effects: [{ type: 'Damage', value: 4 }], name: 'Aether Cataclysm' }
        ],
        playerBoard: [
          makeMinion('pm-rush', 'kael-002', 4, 3, true, ['Rush']),
          makeMinion('pm-boss-1', 'lyra-001', 6, 6, true),
          makeMinion('pm-boss-2', 'orin-001', 6, 6, true)
        ],
        opponentHealth: 16,
        opponentArmor: 0,
        opponentBoard: [
          makeMinion('om-taunt', 'kael-001', 3, 4, false, ['Taunt'])
        ],
        solutionCheck: (state: any) => state.opponent.health <= 0,
        reward: { gold: 300, essence: 150, unlockedCardId: 'lyra-006' }
      }
    ]
  }
];
