import { BGFaction } from '../types/battlegrounds';

export interface BGCommanderDef {
  id: string;
  name: string;
  title: string;
  binderId: string;
  avatarIcon: string;
  favoredFaction: BGFaction;
  personality: string;
  powerName: string;
  powerCost: number;
  powerDescription: string;
  accentColor: string;
}

export const BG_COMMANDER_POOL: BGCommanderDef[] = [
  {
    id: 'cmd-collector',
    name: 'The Collector',
    title: 'Riftborn Sovereign',
    binderId: 'lyra-voss',
    avatarIcon: '🌌',
    favoredFaction: 'Riftborn',
    personality: 'Rift Hoarder',
    powerName: 'Planar Shard',
    powerCost: 1,
    powerDescription: 'Gain 1 extra Shard on your next preparation turn.',
    accentColor: '#a855f7'
  },
  {
    id: 'cmd-garden-mind',
    name: 'The Garden Mind',
    title: 'Swarm Matron',
    binderId: 'mira-thorn',
    avatarIcon: '🌿',
    favoredFaction: 'Thornbloom',
    personality: 'Organic Swarm',
    powerName: 'Spore Bloom',
    powerCost: 2,
    powerDescription: 'Give your Thornbloom units +1/+1 permanently.',
    accentColor: '#22c55e'
  },
  {
    id: 'cmd-clockmaker',
    name: 'The Clockmaker',
    title: 'Master of Chronos',
    binderId: 'orin-vale',
    avatarIcon: '⏳',
    favoredFaction: 'Clockwork',
    personality: 'Chrono Engineer',
    powerName: 'Free Rewind',
    powerCost: 0,
    powerDescription: 'First Rift Market refresh each round is free.',
    accentColor: '#f59e0b'
  },
  {
    id: 'cmd-star-eater',
    name: 'The Star Eater',
    title: 'Celestial Sovereign',
    binderId: 'seraphine-starforged',
    avatarIcon: '⭐',
    favoredFaction: 'Starborn',
    personality: 'Celestial Bastion',
    powerName: 'Starlight Shield',
    powerCost: 2,
    powerDescription: 'Grant your leftmost unit Divine Shield.',
    accentColor: '#38bdf8'
  },
  {
    id: 'cmd-hollow-king',
    name: 'The Hollow King',
    title: 'Lord of Remnants',
    binderId: 'nox-revenant',
    avatarIcon: '💀',
    favoredFaction: 'Wraithkin',
    personality: 'Revenant Lord',
    powerName: 'Soul Harvest',
    powerCost: 1,
    powerDescription: 'Whenever a friendly unit dies, give a random ally +1 Attack.',
    accentColor: '#c084fc'
  },
  {
    id: 'cmd-ashen-warlord',
    name: 'Ashen Warlord',
    title: 'Molten Berserker',
    binderId: 'kael-drake',
    avatarIcon: '🔥',
    favoredFaction: 'Ashforged',
    personality: 'Molten Berserker',
    powerName: 'Molten Anvil',
    powerCost: 2,
    powerDescription: 'Give your Ashforged units +2 Health.',
    accentColor: '#ef4444'
  },
  {
    id: 'cmd-mirror',
    name: 'The Mirror',
    title: 'Adaptive Mimic',
    binderId: 'lyra-voss',
    avatarIcon: '🪞',
    favoredFaction: 'Neutral',
    personality: 'Adaptive Mimic',
    powerName: 'Echo Clone',
    powerCost: 3,
    powerDescription: 'Add a copy of a random minion from your opponent\'s last board to your hand.',
    accentColor: '#e2e8f0'
  },
  {
    id: 'cmd-pyre-tyrant',
    name: 'Vaelen the Pyre Tyrant',
    title: 'Warmaster of Cinders',
    binderId: 'kael-drake',
    avatarIcon: '⚔️',
    favoredFaction: 'Ashforged',
    personality: 'Aggressive Juggernaut',
    powerName: 'Infernal Strike',
    powerCost: 1,
    powerDescription: 'Your first attacking unit gains +3 Attack this combat.',
    accentColor: '#f97316'
  },
  {
    id: 'cmd-chronos-archivist',
    name: 'Archivist Chronos',
    title: 'Keeper of Records',
    binderId: 'orin-vale',
    avatarIcon: '📜',
    favoredFaction: 'Clockwork',
    personality: 'Fast Leveler',
    powerName: 'Accelerated Research',
    powerCost: 0,
    powerDescription: 'Upgrading the Tavern Tier costs 1 less Shard.',
    accentColor: '#d97706'
  },
  {
    id: 'cmd-sylva-queen',
    name: 'Sylva, Spore Queen',
    title: 'Canopy Empress',
    binderId: 'mira-thorn',
    avatarIcon: '🍄',
    favoredFaction: 'Thornbloom',
    personality: 'Token Multiplier',
    powerName: 'Fungal Cascade',
    powerCost: 2,
    powerDescription: 'Summon an additional 1/1 Sporeling on deathrattle effects.',
    accentColor: '#10b981'
  },
  {
    id: 'cmd-void-wraith',
    name: 'Wraith of the Void',
    title: 'Spectral Haunt',
    binderId: 'nox-revenant',
    avatarIcon: '👻',
    favoredFaction: 'Wraithkin',
    personality: 'Attrition Specialist',
    powerName: 'Deathly Persistence',
    powerCost: 2,
    powerDescription: 'Give your lowest health unit Reborn.',
    accentColor: '#818cf8'
  },
  {
    id: 'cmd-solar-empress',
    name: 'Aurelia, Solar Empress',
    title: 'Dawn Radiance',
    binderId: 'seraphine-starforged',
    avatarIcon: '☀️',
    favoredFaction: 'Starborn',
    personality: 'Burst Commander',
    powerName: 'Supernova',
    powerCost: 2,
    powerDescription: 'Start of Combat: Deal 2 damage to all enemy units.',
    accentColor: '#fbbf24'
  },
  {
    id: 'cmd-rift-strider',
    name: 'Kaelen the Rift Strider',
    title: 'Dimensional Scout',
    binderId: 'lyra-voss',
    avatarIcon: '🌀',
    favoredFaction: 'Riftborn',
    personality: 'Tempo Pioneer',
    powerName: 'Spatial Leap',
    powerCost: 1,
    powerDescription: 'Switch positions of any two units and grant both +1/+1.',
    accentColor: '#8b5cf6'
  },
  {
    id: 'cmd-iron-sentinel',
    name: 'Iron Bastion Colossus',
    title: 'Impenetrable Bulwark',
    binderId: 'kael-drake',
    avatarIcon: '🛡️',
    favoredFaction: 'Ashforged',
    personality: 'Heavy Defense',
    powerName: 'Adamantine Plate',
    powerCost: 1,
    powerDescription: 'Your Taunt units have +3 Health.',
    accentColor: '#94a3b8'
  }
];

/**
 * Returns a randomized set of 7 distinct AI commanders, excluding any chosen player commander ID.
 */
export function draftAIBGCommanders(excludeCommanderId?: string): BGCommanderDef[] {
  const available = BG_COMMANDER_POOL.filter(c => c.id !== excludeCommanderId);
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 7);
}
