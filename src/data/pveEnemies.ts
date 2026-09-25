import { PvEEnemy } from '../types/pve';
import { ALL_CARDS } from './cards';
import { BINDERS } from './binders';

export const PVE_ENEMIES: PvEEnemy[] = [
  // =========================================================================
  // 6 MAJOR BOSSES
  // =========================================================================
  {
    id: 'boss-mirror-queen',
    name: 'The Mirror Queen',
    title: 'Architect of Reflections',
    isBoss: true,
    isElite: false,
    health: 45,
    binder: BINDERS[0],
    deckTheme: 'Distortion & Copying',
    deckCards: ALL_CARDS.filter(c => c.faction === 'Aetherbound' || c.faction === 'Neutral').slice(0, 15),
    passiveTrait: 'Mirror Distortion: At start of turn, copies the lowest cost card played by the player last turn.',
    customMechanicDescription: 'Whenever the player plays a spell, The Mirror Queen casts an exact copy at a random target.',
    dialogueIntro: '"Look closely into the glass, mortal. Everything you think you own is merely my reflection."',
    dialogueDefeat: '"The mirror shatters... but a thousand shards remain..."'
  },
  {
    id: 'boss-hollow-king',
    name: 'The Hollow King',
    title: 'Monarch of the Empty Crypt',
    isBoss: true,
    isElite: false,
    health: 50,
    binder: BINDERS[3],
    deckTheme: 'Sacrifice & Undead Swarms',
    deckCards: ALL_CARDS.filter(c => c.faction === 'UmbralRemnant' || c.faction === 'Neutral').slice(0, 15),
    passiveTrait: 'Endless Grave: Friendly minions with Deathrattle trigger their effects twice.',
    customMechanicDescription: 'Whenever a friendly minion dies, summons a 1/1 Spectral Shade and gains 1 Echo.',
    dialogueIntro: '"My throne room was built upon empires that thought they could defeat eternity."',
    dialogueDefeat: '"Back into the mist... until the bell tolls again."'
  },
  {
    id: 'boss-collector',
    name: 'The Collector',
    title: 'Hoarder of Lost Relics',
    isBoss: true,
    isElite: false,
    health: 45,
    binder: BINDERS[4],
    deckTheme: 'Card Theft & Relic Arsenal',
    deckCards: ALL_CARDS.filter(c => c.faction === 'ChronocastArchive' || c.faction === 'Neutral').slice(0, 15),
    passiveTrait: 'Sticky Fingers: At the end of turn, steals 1 random Echo from the player pool.',
    customMechanicDescription: 'Has 3 active ancient Relics that grant Armor, draw cards, and damage random enemies.',
    dialogueIntro: '"Such exquisite cards! Hand them over, or I will pry them from your frozen fingers."',
    dialogueDefeat: '"My treasures! My precious archive... ruined!"'
  },
  {
    id: 'boss-garden-mind',
    name: 'The Garden Mind',
    title: 'Heart of the Rootsea',
    isBoss: true,
    isElite: false,
    health: 48,
    binder: BINDERS[2],
    deckTheme: 'Canopy Swarm & Overgrowth',
    deckCards: ALL_CARDS.filter(c => c.faction === 'ViridianHive' || c.faction === 'Neutral').slice(0, 15),
    passiveTrait: 'Mycelial Bloom: At the start of turn, fills empty board slots with 1/1 Sporelings.',
    customMechanicDescription: 'All Sporelings have Deathrattle: Give all remaining allies +1/+1.',
    dialogueIntro: '"You walk on our soil and breathe our air. Now become our fertilizer."',
    dialogueDefeat: '"The roots retreat... but spring always returns..."'
  },
  {
    id: 'boss-clockmaker',
    name: 'The Clockmaker',
    title: 'Architect of the Final Second',
    isBoss: true,
    isElite: false,
    health: 50,
    binder: BINDERS[4],
    deckTheme: 'Temporal Countdown & Haste',
    deckCards: ALL_CARDS.filter(c => c.faction === 'ChronocastArchive' || c.faction === 'Neutral').slice(0, 15),
    passiveTrait: 'Temporal Acceleration: Rituals countdown by 2 turns at the end of each round.',
    customMechanicDescription: 'Every 3 turns, locks 2 of the player\'s Mana crystals for 1 turn.',
    dialogueIntro: '"Tick, tock. Your lifespan has been calculated down to the second. You have four minutes left."',
    dialogueDefeat: '"My pendulums... they have stopped..."'
  },
  {
    id: 'boss-star-eater',
    name: 'The Star Eater',
    title: 'Cosmic Singularity Beast',
    isBoss: true,
    isElite: false,
    health: 55,
    binder: BINDERS[5],
    deckTheme: 'Solar Radiance & Devouring Lights',
    deckCards: ALL_CARDS.filter(c => c.faction === 'AstralAscendancy' || c.faction === 'Neutral').slice(0, 15),
    passiveTrait: 'Celestial Devourer: The Veil is perpetually forced to Celestial. Gains +2/+2 whenever a card is played.',
    customMechanicDescription: 'Whenever the player plays a card that costs 5 or more, The Star Eater deals 4 damage to the player Binder.',
    dialogueIntro: '"Stars die in agony to fill my gullet. What is a mortal soul compared to the sun?"',
    dialogueDefeat: '"The black hole closes... light returns to the void..."'
  },

  // =========================================================================
  // STANDARD & ELITE ENEMIES
  // =========================================================================
  {
    id: 'enemy-rift-stalker',
    name: 'Rift Stalker',
    title: 'Predator of the Veil',
    isBoss: false,
    isElite: false,
    health: 22,
    binder: BINDERS[0],
    deckTheme: 'Stealth & Veilshift',
    deckCards: ALL_CARDS.filter(c => c.faction === 'Aetherbound').slice(0, 12),
    passiveTrait: 'Phasing claws: Deals +1 damage when attacking from Stealth.',
    customMechanicDescription: 'Shifts Veil every 2 turns.',
    dialogueIntro: '"I smell fresh meat from the other side..."',
    dialogueDefeat: '"Dissolving into mist..."'
  },
  {
    id: 'enemy-cinder-knight',
    name: 'Cinder Knight Captain',
    title: 'Veteran of the Ashen Gate',
    isBoss: false,
    isElite: false,
    health: 26,
    binder: BINDERS[1],
    deckTheme: 'Heavy Armor & Slag',
    deckCards: ALL_CARDS.filter(c => c.faction === 'AshenCitadel').slice(0, 12),
    passiveTrait: 'Iron Plate: Starts with 4 Armor.',
    customMechanicDescription: 'Gains 1 Armor whenever taking damage.',
    dialogueIntro: '"None shall pass the Ashen Gate while I draw breath."',
    dialogueDefeat: '"My shield... has cracked..."'
  },
  {
    id: 'enemy-spore-tender',
    name: 'Spore Tender',
    title: 'Fungal Cultist',
    isBoss: false,
    isElite: false,
    health: 20,
    binder: BINDERS[2],
    deckTheme: 'Spore Swarms',
    deckCards: ALL_CARDS.filter(c => c.faction === 'ViridianHive').slice(0, 12),
    passiveTrait: 'Fertile Ground: Summons a 1/1 Sporeling on death of any ally.',
    customMechanicDescription: 'Buffs small minions with +1/+1.',
    dialogueIntro: '"Join our bloom. You will feel no pain."',
    dialogueDefeat: '"The pollen disperses..."'
  },
  {
    id: 'enemy-grave-robber',
    name: 'Masked Grave Robber',
    title: 'Scavenger of the Catacombs',
    isBoss: false,
    isElite: false,
    health: 24,
    binder: BINDERS[3],
    deckTheme: 'Wraiths & Steal',
    deckCards: ALL_CARDS.filter(c => c.faction === 'UmbralRemnant').slice(0, 12),
    passiveTrait: 'Soul Jar: Starts with 3 Echoes.',
    customMechanicDescription: 'Casts spells that siphon hero health.',
    dialogueIntro: '"Gold, bones, memories... everything has a price."',
    dialogueDefeat: '"I should have stayed in the cemetery..."'
  },
  {
    id: 'enemy-clockwork-scout',
    name: 'Brass Automaton',
    title: 'Clockwork Recon Unit',
    isBoss: false,
    isElite: false,
    health: 22,
    binder: BINDERS[4],
    deckTheme: 'Mechanized Rush',
    deckCards: ALL_CARDS.filter(c => c.faction === 'ChronocastArchive').slice(0, 12),
    passiveTrait: 'Ticking Core: Deals 2 damage to all minions on death.',
    customMechanicDescription: 'Summons 1/1 Coglings.',
    dialogueIntro: '"Target identified. Engaging extermination protocols."',
    dialogueDefeat: '"System overload. Powering down..."'
  },
  {
    id: 'enemy-solar-zealot',
    name: 'Solar Zealot',
    title: 'Purifier of the Dawn',
    isBoss: false,
    isElite: false,
    health: 25,
    binder: BINDERS[5],
    deckTheme: 'Divine Shield & Healing',
    deckCards: ALL_CARDS.filter(c => c.faction === 'AstralAscendancy').slice(0, 12),
    passiveTrait: 'Aura of Light: Starts with Divine Shield.',
    customMechanicDescription: 'Restores 2 Health to allies on turn start.',
    dialogueIntro: '"Burn away your sins in the light of the sun!"',
    dialogueDefeat: '"The dawn has dimmed..."'
  },
  // Elite Enemies
  {
    id: 'elite-magma-gargoyle',
    name: 'Slag Gargoyle',
    title: 'Molten Behemoth',
    isBoss: false,
    isElite: true,
    health: 36,
    binder: BINDERS[1],
    deckTheme: 'Heavy Retaliation',
    deckCards: ALL_CARDS.filter(c => c.faction === 'AshenCitadel').slice(0, 14),
    passiveTrait: 'Volcanic Skin: Deals 2 damage to any character that attacks it.',
    customMechanicDescription: 'Starts with 8 Armor and summons 3/3 Slag Berserkers.',
    dialogueIntro: '"ROAAAR! Molten stone crushes fragile bone!"',
    dialogueDefeat: '"Crumbling into cold gravel..."'
  },
  {
    id: 'elite-veil-phantom',
    name: 'Veil Phantom',
    title: 'Planar Assassin',
    isBoss: false,
    isElite: true,
    health: 34,
    binder: BINDERS[0],
    deckTheme: 'Echo Burst & Fractals',
    deckCards: ALL_CARDS.filter(c => c.faction === 'Aetherbound').slice(0, 14),
    passiveTrait: 'Echo Storm: Generates 2 Echoes at the start of every turn.',
    customMechanicDescription: 'Can cast Echo spells without spending mana.',
    dialogueIntro: '"I am the whisper between heartbeats."',
    dialogueDefeat: '"Fading across dimensions..."'
  },
  {
    id: 'elite-chitin-dreadnought',
    name: 'Chitin Dreadnought',
    title: 'Brood Terror of the Deep Canopy',
    isBoss: false,
    isElite: true,
    health: 38,
    binder: BINDERS[2],
    deckTheme: 'Poison Swarm & Growth',
    deckCards: ALL_CARDS.filter(c => c.faction === 'ViridianHive').slice(0, 14),
    passiveTrait: 'Thorny Exoskeleton: Immune to Poison and Freeze effects.',
    customMechanicDescription: 'Gains +1/+1 whenever an enemy minion is damaged.',
    dialogueIntro: '"Mandibles clicking in ravenous hunger."',
    dialogueDefeat: '"The dreadnought crashes into the loam."'
  }
];

export function getRandomEnemy(isElite = false, isBoss = false): PvEEnemy {
  const filtered = PVE_ENEMIES.filter(e => e.isBoss === isBoss && e.isElite === isElite);
  return filtered[Math.floor(Math.random() * filtered.length)] || PVE_ENEMIES[0];
}
