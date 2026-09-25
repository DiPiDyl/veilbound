import { PvETreasure } from '../types/pve';

export const PVE_TREASURES: PvETreasure[] = [
  {
    id: 'tr-01',
    name: 'Glass Heart',
    rarity: 'Common',
    description: 'Your Binder starts each combat encounter with +8 Health.',
    icon: 'Heart',
    effectType: 'StartHealthBonus',
    value: 8
  },
  {
    id: 'tr-02',
    name: 'Broken Compass',
    rarity: 'Rare',
    description: 'Whenever you play an Event or Ritual, shift the Veil one additional step.',
    icon: 'Compass',
    effectType: 'VeilShiftBonus',
    value: 1
  },
  {
    id: 'tr-03',
    name: 'Memory Crystal',
    rarity: 'Rare',
    description: 'The first time you generate an Echo each turn, draw a card.',
    icon: 'Sparkles',
    effectType: 'EchoOnSpell',
    value: 1
  },
  {
    id: 'tr-04',
    name: 'Chronometer of Haste',
    rarity: 'Epic',
    description: 'All your Ritual cards countdown 1 turn faster.',
    icon: 'Clock',
    effectType: 'RitualHaste',
    value: 1
  },
  {
    id: 'tr-05',
    name: 'Iron Bastion Plating',
    rarity: 'Common',
    description: 'Start each match with 6 Armor.',
    icon: 'Shield',
    effectType: 'ArmorStart',
    value: 6
  },
  {
    id: 'tr-06',
    name: 'Solar Prism',
    rarity: 'Epic',
    description: 'While the Veil is Celestial, your healing effects are tripled instead of doubled.',
    icon: 'Sun',
    effectType: 'DiscountFirstCard',
    value: 2
  },
  {
    id: 'tr-07',
    name: 'Grimoire of First Light',
    rarity: 'Rare',
    description: 'Draw 2 additional cards at the start of every combat.',
    icon: 'BookOpen',
    effectType: 'CardDrawStart',
    value: 2
  },
  {
    id: 'tr-08',
    name: 'Umbral Censer',
    rarity: 'Rare',
    description: 'Whenever a friendly minion dies, gain +2 Echoes instead of 1.',
    icon: 'Flame',
    effectType: 'EchoOnSpell',
    value: 2
  },
  {
    id: 'tr-09',
    name: 'Destiny Loom',
    rarity: 'Epic',
    description: 'Destiny points gained from all actions are increased by +1.',
    icon: 'Activity',
    effectType: 'DestinyAcceleration',
    value: 1
  },
  {
    id: 'tr-10',
    name: 'Primal Spore Pouch',
    rarity: 'Common',
    description: 'At the start of combat, summon a 1/1 Sporeling with Deathrattle: Give an ally +1/+1.',
    icon: 'Sprout',
    effectType: 'StartHealthBonus',
    value: 2
  },
  {
    id: 'tr-11',
    name: 'Aetheric Capacitor',
    rarity: 'Rare',
    description: 'Whenever you cast a spell that costs 3 or more, gain 2 Echoes.',
    icon: 'Zap',
    effectType: 'EchoOnSpell',
    value: 2
  },
  {
    id: 'tr-12',
    name: 'Molten Core Shard',
    rarity: 'Common',
    description: 'Whenever you gain Armor, deal 1 damage to a random enemy minion.',
    icon: 'Flame',
    effectType: 'ArmorStart',
    value: 2
  },
  {
    id: 'tr-13',
    name: 'Planar Stabilizer',
    rarity: 'Rare',
    description: 'You take 2 less damage from all enemy spells.',
    icon: 'Anchor',
    effectType: 'ArmorStart',
    value: 2
  },
  {
    id: 'tr-14',
    name: 'Eye of the Voidwalker',
    rarity: 'Epic',
    description: 'Whenever the Veil shifts to Fractured or Wild, deal 3 damage to all enemies.',
    icon: 'Eye',
    effectType: 'VeilShiftBonus',
    value: 3
  },
  {
    id: 'tr-15',
    name: 'Gilded Pocketwatch',
    rarity: 'Common',
    description: 'Start each combat with 1 extra temporary Mana Crystal on Turn 1.',
    icon: 'Watch',
    effectType: 'DiscountFirstCard',
    value: 1
  },
  {
    id: 'tr-16',
    name: 'Death Mask of the Paragon',
    rarity: 'Epic',
    description: 'Your Binder gains Rebirth: When defeated, revive once with 10 Health.',
    icon: 'Smile',
    effectType: 'StartHealthBonus',
    value: 10
  },
  {
    id: 'tr-17',
    name: 'Crown of the Constellation',
    rarity: 'Legendary',
    description: 'The first card you play each turn that costs 6 or more costs (2) less.',
    icon: 'Crown',
    effectType: 'DiscountFirstCard',
    value: 2
  },
  {
    id: 'tr-18',
    name: 'Titan\'s Whetstone',
    rarity: 'Rare',
    description: 'Your weapons have +1 Attack and +1 Durability.',
    icon: 'Sword',
    effectType: 'DiscountFirstCard',
    value: 1
  },
  {
    id: 'tr-19',
    name: 'Living Vines Trinket',
    rarity: 'Common',
    description: 'At the end of your turn, restore 2 Health to all damaged friendly minions.',
    icon: 'Leaf',
    effectType: 'StartHealthBonus',
    value: 2
  },
  {
    id: 'tr-20',
    name: 'Chrono-Loop Ring',
    rarity: 'Legendary',
    description: 'Whenever you play a card with Forecast, create a copy of it in your deck.',
    icon: 'Repeat',
    effectType: 'CardDrawStart',
    value: 1
  },
  {
    id: 'tr-21',
    name: 'Singularity Stone',
    rarity: 'Rare',
    description: 'Echoes can be consumed for 1 less Echo cost (minimum 1).',
    icon: 'Circle',
    effectType: 'EchoOnSpell',
    value: 1
  },
  {
    id: 'tr-22',
    name: 'Dragon Flame Brand',
    rarity: 'Rare',
    description: 'Your hero power also deals 1 damage to all enemy minions when used.',
    icon: 'Flame',
    effectType: 'VeilShiftBonus',
    value: 1
  },
  {
    id: 'tr-23',
    name: 'Spectral Bell',
    rarity: 'Epic',
    description: 'Whenever any minion dies, gain 2 Armor and 1 Echo.',
    icon: 'Bell',
    effectType: 'ArmorStart',
    value: 2
  },
  {
    id: 'tr-24',
    name: 'Orrery Astrolabe',
    rarity: 'Common',
    description: 'You can see the top card of your deck at all times during matches.',
    icon: 'Compass',
    effectType: 'CardDrawStart',
    value: 1
  },
  {
    id: 'tr-25',
    name: 'The Veilbound Monolith',
    rarity: 'Legendary',
    description: 'Whenever the Veil shifts, fully heal your hero and gain 3 temporary Mana.',
    icon: 'Box',
    effectType: 'StartHealthBonus',
    value: 15
  }
];

export function getRandomTreasures(count: number, excludeIds: string[] = []): PvETreasure[] {
  const available = PVE_TREASURES.filter(t => !excludeIds.includes(t.id));
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
