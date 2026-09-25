import { Card } from '../types/card';
import { Binder } from '../types/binder';
import { ALL_CARDS } from './cards';
import { BINDERS } from './binders';

export interface FreeForAllOpponent {
  matchNumber: number; // 1 to 10
  id: string;
  name: string;
  title: string;
  rankTitle: string;
  avatarIcon: string;
  portraitTheme: string;
  health: number;
  binder: Binder;
  deckTheme: string;
  deckCards: Card[];
  passiveTrait: string;
  quoteIntro: string;
  quoteDefeat: string;
  rewardDescription?: string;
  milestoneReward?: {
    gold: number;
    packs: number;
    packType: string;
    specialReward?: string;
  };
}

// Helper to assemble themed decks for opponents
const getDeck = (factions: string[], minCost: number = 1, maxCost: number = 9, count: number = 20): Card[] => {
  const matching = ALL_CARDS.filter(c => 
    (factions.includes(c.faction) || c.faction === 'Neutral') &&
    c.cost >= minCost && c.cost <= maxCost
  );
  // Duplicate if needed to get full deck
  const deck: Card[] = [];
  while (deck.length < count && matching.length > 0) {
    const pick = matching[deck.length % matching.length];
    deck.push({ ...pick, id: `${pick.id}-ffa-${deck.length}` });
  }
  return deck;
};

export const FREE_FOR_ALL_OPPONENTS: FreeForAllOpponent[] = [
  {
    matchNumber: 1,
    id: 'ffa-pebbleclash',
    name: 'Pebbleclash Golem',
    title: 'Arena Novice',
    rankTitle: 'Rank 10 Contender',
    avatarIcon: '🗿',
    portraitTheme: 'from-amber-800 to-stone-900',
    health: 22,
    binder: BINDERS[1] || BINDERS[0], // Pyroclast / Forge
    deckTheme: 'Earth & Stone Brawler',
    deckCards: getDeck(['AshenCitadel', 'Neutral'], 1, 4, 18),
    passiveTrait: 'Rocky Hide: Takes 1 less damage from all attacks while at full Health.',
    quoteIntro: '"Crush! Smash! Little binder no match for living boulder!"',
    quoteDefeat: '"Crumbling... too many cracks in my stones..."',
    milestoneReward: {
      gold: 150,
      packs: 1,
      packType: 'Standard Novice Pack',
      specialReward: 'Contender Badge'
    }
  },
  {
    matchNumber: 2,
    id: 'ffa-pippin',
    name: 'Trickster Pippin',
    title: 'The Gilded Jester',
    rankTitle: 'Rank 9 Contender',
    avatarIcon: '🎭',
    portraitTheme: 'from-yellow-700 to-violet-900',
    health: 26,
    binder: BINDERS[0], // Aetherbound
    deckTheme: 'Sleight of Hand & Cantrips',
    deckCards: getDeck(['Aetherbound', 'Neutral'], 1, 5, 20),
    passiveTrait: 'Pocket Coins: Starts the match with 1 extra Echo in their pool.',
    quoteIntro: '"Pick a card, any card! Wait, put that one back, it\'s an explosive rune!"',
    quoteDefeat: '"Aw shucks, my sleeves were completely empty that round."'
  },
  {
    matchNumber: 3,
    id: 'ffa-redbrand',
    name: 'Captain Redbrand',
    title: 'Scourge of the Ashen Rifts',
    rankTitle: 'Rank 8 Contender',
    avatarIcon: '🔥',
    portraitTheme: 'from-red-900 to-orange-800',
    health: 30,
    binder: BINDERS[1] || BINDERS[0],
    deckTheme: 'Aggressive Flame Rush',
    deckCards: getDeck(['AshenCitadel', 'Neutral'], 1, 6, 20),
    passiveTrait: 'Ignition: Spells deal +1 bonus damage if the Veil is Wild.',
    quoteIntro: '"Clear the pit! When my blade catches fire, nobody leaves intact!"',
    quoteDefeat: '"Doused... impossible... my fire was burning so bright!"',
    milestoneReward: {
      gold: 250,
      packs: 1,
      packType: 'Pyroclast Ember Pack',
      specialReward: 'Blazing Embers Crest'
    }
  },
  {
    matchNumber: 4,
    id: 'ffa-vespera',
    name: 'Mistress Vespera',
    title: 'Weaver of Twilight',
    rankTitle: 'Rank 7 Veteran',
    avatarIcon: '🕷️',
    portraitTheme: 'from-purple-950 to-indigo-900',
    health: 34,
    binder: BINDERS[3] || BINDERS[0], // Umbral Remnant
    deckTheme: 'Shadow Swarm & Soul Harvest',
    deckCards: getDeck(['UmbralRemnant', 'Neutral'], 1, 6, 22),
    passiveTrait: 'Soul Web: Gains 1 Armor whenever a friendly creature with Deathrattle dies.',
    quoteIntro: '"The darkness isn\'t empty, child. It\'s hungry, and you smell delicious."',
    quoteDefeat: '"The dawn... burns away my threads..."'
  },
  {
    matchNumber: 5,
    id: 'ffa-ironfang',
    name: 'Warlord Ironfang',
    title: 'Vanguard of Iron Peaks',
    rankTitle: 'Rank 6 Veteran',
    avatarIcon: '🛡️',
    portraitTheme: 'from-slate-800 to-amber-950',
    health: 38,
    binder: BINDERS[1] || BINDERS[0],
    deckTheme: 'Armor Bulwark & Siege Engines',
    deckCards: getDeck(['AshenCitadel', 'Neutral'], 2, 7, 22),
    passiveTrait: 'Juggernaut: Starts with 6 Armor. Creatures with Taunt have +1 Health.',
    quoteIntro: '"You strike like a soft summer breeze against fortress walls. Break upon my shield!"',
    quoteDefeat: '"My shield... cracked? What manner of sorcery is this?!"',
    milestoneReward: {
      gold: 400,
      packs: 2,
      packType: 'Ironbound Fortitude Pack',
      specialReward: 'Fortress Key'
    }
  },
  {
    matchNumber: 6,
    id: 'ffa-rootmother',
    name: 'The Rootmother',
    title: 'Heart of the Living Canopy',
    rankTitle: 'Rank 5 Master',
    avatarIcon: '🌿',
    portraitTheme: 'from-emerald-950 to-green-800',
    health: 42,
    binder: BINDERS[2] || BINDERS[0], // Viridian Hive
    deckTheme: 'Canopy Swarm & Rapid Growth',
    deckCards: getDeck(['ViridianHive', 'Neutral'], 1, 7, 22),
    passiveTrait: 'Photosynthesis: At the start of turn, restores 2 Health to the most wounded ally.',
    quoteIntro: '"We grow through stone. We swallow empires. You are merely mulch for tomorrow\'s bloom."',
    quoteDefeat: '"Winter has come... but roots sleep... they never die..."'
  },
  {
    matchNumber: 7,
    id: 'ffa-thalor',
    name: 'Chronoscribe Thalor',
    title: 'Archivist of Lost Timelines',
    rankTitle: 'Rank 4 Master',
    avatarIcon: '⏳',
    portraitTheme: 'from-blue-950 to-teal-900',
    health: 46,
    binder: BINDERS[4] || BINDERS[0], // Chronocast Archive
    deckTheme: 'Time Manipulation & Ritual Haste',
    deckCards: getDeck(['ChronocastArchive', 'Neutral'], 2, 8, 24),
    passiveTrait: 'Paradox Loop: Whenever a Ritual is completed, draw 1 card.',
    quoteIntro: '"I have written your defeat seventeen times in eleven different eras. Let us make it eighteen."',
    quoteDefeat: '"A temporal anomaly?! The timeline was supposed to be fixed!"',
    milestoneReward: {
      gold: 600,
      packs: 2,
      packType: 'Chronos Radiant Pack',
      specialReward: 'Hourglass of the Void'
    }
  },
  {
    matchNumber: 8,
    id: 'ffa-malakor',
    name: 'Inquisitor Malakor',
    title: 'Purifier of the Veil',
    rankTitle: 'Rank 3 Grandmaster',
    avatarIcon: '⚡',
    portraitTheme: 'from-amber-950 to-rose-950',
    health: 50,
    binder: BINDERS[5] || BINDERS[0], // Astral Ascendancy
    deckTheme: 'Divine Wrath & Radiant Condemnation',
    deckCards: getDeck(['AstralAscendancy', 'Neutral'], 2, 8, 24),
    passiveTrait: 'Zealot Flame: Deals 2 damage to the player whenever the player plays their 3rd card in a turn.',
    quoteIntro: '"Heretic! The Veil must be cleansed of your chaotic corruption with righteous fire!"',
    quoteDefeat: '"My light... extinguished? How could divinity permit this..."'
  },
  {
    matchNumber: 9,
    id: 'ffa-vaelis',
    name: 'Vaelis the Shattered',
    title: 'Abyssal Void Champion',
    rankTitle: 'Rank 2 Grandmaster',
    avatarIcon: '🌌',
    portraitTheme: 'from-indigo-950 to-purple-950',
    health: 55,
    binder: BINDERS[3] || BINDERS[0],
    deckTheme: 'Void Rifts & Reality Fracture',
    deckCards: getDeck(['UmbralRemnant', 'Aetherbound', 'Neutral'], 2, 9, 26),
    passiveTrait: 'Singularity: The Veil begins Fractured. Creatures with 5+ Attack gain Lifesteal.',
    quoteIntro: '"Step beyond the boundary. Feel reality tear away like wet parchment. You are nothing."',
    quoteDefeat: '"The rift consumes me... but you... you will join me in the deep..."'
  },
  {
    matchNumber: 10,
    id: 'ffa-ouroboros',
    name: 'Grandmaster Ouroboros',
    title: 'Lord of the Infinite Arena',
    rankTitle: 'Rank 1 Sovereign Champion',
    avatarIcon: '👑',
    portraitTheme: 'from-amber-600 via-purple-900 to-slate-950',
    health: 65,
    binder: BINDERS[0],
    deckTheme: 'Omni-Ascendance & Legendary Pantheon',
    deckCards: ALL_CARDS.filter(c => c.rarity === 'Legendary' || c.rarity === 'Epic').slice(0, 26),
    passiveTrait: 'Infinite Dominion: Begins with 10 Armor. Destinies advance twice as fast.',
    quoteIntro: '"Thousands have entered this ring. Nine have stood where you stand. None have survived my final rite. Welcome to eternity."',
    quoteDefeat: '"Magnificent! At long last... a mortal worthy of wearing the Crown of the Veil!"',
    milestoneReward: {
      gold: 1200,
      packs: 3,
      packType: 'Sovereign Legendary Box',
      specialReward: 'Crown of the Grandmaster & Arena Legend Title'
    }
  }
];
