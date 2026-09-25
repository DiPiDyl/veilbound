import { FactionId } from '../types/card';

export interface FactionData {
  id: FactionId;
  name: string;
  title: string;
  themeColor: string;
  accentColor: string;
  bgGradient: string;
  emblemIcon: string;
  lore: string;
  creatureTypes: string[];
  signatureKeywords: string[];
  playstyle: string;
  visualLanguage: string;
}

export const FACTIONS: Record<FactionId, FactionData> = {
  Aetherbound: {
    id: 'Aetherbound',
    name: 'The Aetherbound',
    title: 'Keepers of the Dimensional Rift',
    themeColor: '#6366f1', // Indigo
    accentColor: '#818cf8',
    bgGradient: 'from-indigo-950 via-slate-900 to-purple-950',
    emblemIcon: 'Compass',
    lore: 'Scholars and reality-shifters who inhabit the floating observatories around the Great Tear. They treat the Veil not as an obstacle, but as a loom to weave new worlds.',
    creatureTypes: ['VeilBeast', 'Riftborn', 'AncientSpirit'],
    signatureKeywords: ['Veilshift', 'Echo', 'Stealth'],
    playstyle: 'Planar manipulation, spell chains, rapid Echo generation, and unpredictable tempo swings.',
    visualLanguage: 'Cosmic blues, shimmering violet portals, floating geometric astrolabes, and starlight rifts.'
  },
  AshenCitadel: {
    id: 'AshenCitadel',
    name: 'Ashen Citadel',
    title: 'The Molten Bulwark',
    themeColor: '#ef4444', // Red
    accentColor: '#f87171',
    bgGradient: 'from-red-950 via-zinc-900 to-amber-950',
    emblemIcon: 'ShieldAlert',
    lore: 'Warriors of the volcanic slag-fortresses who survived the scorching of the Old Realm. Clad in enchanted volcanic slag-plate, they believe survival is forged only through relentless discipline and impenetrable armor.',
    creatureTypes: ['AshKnight', 'Humanoid', 'Beast'],
    signatureKeywords: ['Taunt', 'Rush', 'Armor'],
    playstyle: 'Heavy defensive walls, retaliatory blast waves, durable weapons, and devastating counter-attacks.',
    visualLanguage: 'Charcoal blackened steel, glowing magma seams, smoking embers, and brutalist fortress motifs.'
  },
  ViridianHive: {
    id: 'ViridianHive',
    name: 'The Viridian Hive',
    title: 'The Bioluminescent Canopy',
    themeColor: '#10b981', // Emerald
    accentColor: '#34d399',
    bgGradient: 'from-emerald-950 via-teal-900 to-green-950',
    emblemIcon: 'Sprout',
    lore: 'An ancient sentient rainforest where overgrown fungal spires and colossal insect swarms merge with predatory flora. What rots today blossoms tomorrow with tenfold vigor.',
    creatureTypes: ['Thornling', 'Beast', 'AncientSpirit'],
    signatureKeywords: ['Awaken', 'Lifesteal', 'Poison'],
    playstyle: 'Token board swarming, rapid growth counters, self-replicating spores, and sudden poisonous strikes.',
    visualLanguage: 'Deep moss greens, vibrant cyan bioluminescent veins, spiraling vines, and chitinous insect carapaces.'
  },
  UmbralRemnant: {
    id: 'UmbralRemnant',
    name: 'Umbral Remnant',
    title: 'The Silent Catacombs',
    themeColor: '#8b5cf6', // Violet
    accentColor: '#a78bfa',
    bgGradient: 'from-violet-950 via-gray-950 to-purple-950',
    emblemIcon: 'Skull',
    lore: 'Spectral mourners, necromancers, and masked wanderers who dwell in the pale mist between life and oblivion. To them, death is merely an investment for a greater awakening.',
    creatureTypes: ['Wraith', 'ForgottenGod', 'AncientSpirit'],
    signatureKeywords: ['Deathrattle', 'Sacrifice', 'Rebirth'],
    playstyle: 'Grave recursion, self-sacrificing thralls, deadly deathrattles, and harvesting fallen souls into Echoes.',
    visualLanguage: 'Pale ghostly whites, cold midnight blues, porcelain death masks, and drifting fog.'
  },
  ChronocastArchive: {
    id: 'ChronocastArchive',
    name: 'Chronocast Archive',
    title: 'The Clockwork Spire',
    themeColor: '#f59e0b', // Amber
    accentColor: '#fbbf24',
    bgGradient: 'from-amber-950 via-stone-900 to-yellow-950',
    emblemIcon: 'Clock',
    lore: 'An endless library of clockwork gears and enchanted tomes. The Archivists record all possibilities of past and future, altering battles through calculated temporal delays and forecasted spells.',
    creatureTypes: ['ClockworkConstruct', 'Humanoid'],
    signatureKeywords: ['Forecast', 'Discover', 'Ritual'],
    playstyle: 'Delayed countdown rituals, hand advantage, discovering precise answers, and temporal cost reductions.',
    visualLanguage: 'Polished bronze gears, weathered parchment scrolls, ticking brass mechanisms, and golden hour light.'
  },
  AstralAscendancy: {
    id: 'AstralAscendancy',
    name: 'Astral Ascendancy',
    title: 'The Starforged Bastion',
    themeColor: '#06b6d4', // Cyan
    accentColor: '#22d3ee',
    bgGradient: 'from-cyan-950 via-sky-950 to-indigo-950',
    emblemIcon: 'Sun',
    lore: 'An exalted order of seraphs, star-weavers, and sun-priests who channel the pure radiance of celestial constellations to smite darkness and construct eternal citadels.',
    creatureTypes: ['Starborn', 'Celestial', 'Humanoid'],
    signatureKeywords: ['DivineShield', 'Ritual', 'Charge'],
    playstyle: 'High-cost majestic champions, permanent divine shields, celestial board clears, and game-ending constellations.',
    visualLanguage: 'Pure gold filigree, ivory marble plates, radiant solar halos, and diamond starlight bursts.'
  },
  Neutral: {
    id: 'Neutral',
    name: 'Rift Wanderers',
    title: 'The Free Mercenaries',
    themeColor: '#94a3b8', // Slate
    accentColor: '#cbd5e1',
    bgGradient: 'from-slate-900 via-neutral-900 to-zinc-900',
    emblemIcon: 'Feather',
    lore: 'Adventurers, lost automatons, dimensional scavengers, and ancient relics unaligned with any single realm.',
    creatureTypes: ['Beast', 'Humanoid', 'ClockworkConstruct', 'AncientSpirit'],
    signatureKeywords: ['Battlecry', 'Taunt', 'Rush'],
    playstyle: 'Flexible utility units, versatile tech cards, and cross-faction synergies.',
    visualLanguage: 'Weathered iron, worn leather, cracked stone runes, and traveling cloaks.'
  }
};
