import { Binder } from '../types/binder';

export const BINDERS: Binder[] = [
  {
    id: 'lyra-voss',
    name: 'Lyra Voss',
    title: 'The Veilwalker',
    faction: 'Aetherbound',
    startingHealth: 30,
    maxHealth: 30,
    heroPower: {
      id: 'hp-lyra',
      name: 'Veil Infusion',
      cost: 2,
      description: 'Shift the Veil to the next state, or gain +1 Echo.',
      effectType: 'VeilShift',
      soundTrigger: 'veil_infusion'
    },
    quote: '"Reality is a tapestry; you only need to pull the right thread."',
    lore: 'A daring planar researcher whose curiosity cracked the first stable portal into the Veil. Her right arm is permanently bound in crystalline ether, allowing her to bend planar rules at will.',
    personality: 'Brilliant, insatiably curious, quick-witted, and dangerously adventurous.',
    visualTheme: {
      primaryColor: '#6366f1',
      secondaryColor: '#a855f7',
      accentGlow: 'rgba(99, 102, 241, 0.4)',
      avatarSymbol: 'Sparkles'
    },
    strengths: ['Veil manipulation', 'Spell combos', 'Rapid Echo generation'],
    weaknesses: ['Vulnerable to heavy rush', 'Demands careful sequencing'],
    recommendedArchetypes: ['Veilshift Tempo', 'Echo Burn', 'Aether Miracle']
  },
  {
    id: 'kael-drake',
    name: 'Kael Drake',
    title: 'The Ashen Warden',
    faction: 'AshenCitadel',
    startingHealth: 30,
    maxHealth: 30,
    heroPower: {
      id: 'hp-kael',
      name: 'Molten Bastion',
      cost: 2,
      description: 'Gain 2 Armor. Give a friendly minion +1 Health.',
      effectType: 'ArmorAndBuff',
      soundTrigger: 'molten_armor'
    },
    quote: '"Stand firm behind the steel; let them break against our stone."',
    lore: 'The last commander of the Molten Bastion. Having watched entire legions vaporize in the Calamity, Kael forged armor from cursed dragon-slag to ensure his troops never fall again.',
    personality: 'Stoic, disciplined, unwavering, and protective to a fault.',
    visualTheme: {
      primaryColor: '#ef4444',
      secondaryColor: '#f97316',
      accentGlow: 'rgba(239, 68, 68, 0.4)',
      avatarSymbol: 'Shield'
    },
    strengths: ['Massive armor pool', 'Taunt walls', 'Retaliatory damage'],
    weaknesses: ['Lower burst damage', 'Can run low on card draw'],
    recommendedArchetypes: ['Ashen Fortress Control', 'Molten Retaliation', 'Slag Knight Midrange']
  },
  {
    id: 'mira-thorn',
    name: 'Mira Thorn',
    title: 'The Wildbloom',
    faction: 'ViridianHive',
    startingHealth: 30,
    maxHealth: 30,
    heroPower: {
      id: 'hp-mira',
      name: 'Spore Bloom',
      cost: 2,
      description: 'Summon a 1/1 Sporeling with "Deathrattle: Give a random ally +1/+1".',
      effectType: 'SummonSpore',
      soundTrigger: 'spore_bloom'
    },
    quote: '"Every weed has teeth, and the forest is very, very hungry."',
    lore: 'Symbiotically bound to the deep Rootsea mycelium since childhood. Mira speaks with the subterranean fungus networks and commands predatory vines capable of throttling stone colossi.',
    personality: 'Feral, playful, predatory, and cheerful in the face of carnage.',
    visualTheme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      avatarSymbol: 'Sprout'
    },
    strengths: ['Endless board presence', 'Token swarms', 'Synergistic growth buffs'],
    weaknesses: ['Vulnerable to AoE board clears', 'Single-target removal'],
    recommendedArchetypes: ['Spore Swarm', 'Canopy Overgrowth', 'Predatory Venom']
  },
  {
    id: 'nox-revenant',
    name: 'Nox',
    title: 'The Revenant',
    faction: 'UmbralRemnant',
    startingHealth: 30,
    maxHealth: 30,
    heroPower: {
      id: 'hp-nox',
      name: 'Soul Harvest',
      cost: 2,
      description: 'Deal 1 damage to any target. If it dies, gain 2 Echoes.',
      effectType: 'SoulHarvest',
      soundTrigger: 'soul_harvest'
    },
    quote: '"Do not fear the tomb. All great symphonies conclude in silence."',
    lore: 'A silent figure clad in cracked porcelain death masks. Nox remembers neither their birth name nor homeland, existing solely to guide lingering souls back from the rift into battle.',
    personality: 'Soft-spoken, detached, solemn, and philosophically morbid.',
    visualTheme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#4c1d95',
      accentGlow: 'rgba(139, 92, 246, 0.4)',
      avatarSymbol: 'Skull'
    },
    strengths: ['Sacrifice value', 'Graveyard recursion', 'Powerful deathrattles'],
    weaknesses: ['Sacrifices own health/board tempo early', 'Complex resource balancing'],
    recommendedArchetypes: ['Umbral Sacrifice', 'Deathrattle Rebirth', 'Ghost Harvest']
  },
  {
    id: 'orin-vale',
    name: 'Orin Vale',
    title: 'The Archivist',
    faction: 'ChronocastArchive',
    startingHealth: 30,
    maxHealth: 30,
    heroPower: {
      id: 'hp-orin',
      name: 'Chrono Index',
      cost: 2,
      description: 'Forecast: Look at the top 2 cards of your deck; put one in hand and reduce its cost by 1.',
      effectType: 'ForecastIndex',
      soundTrigger: 'chrono_tick'
    },
    quote: '"Every victory was already written three centuries ago. I am simply turning the page."',
    lore: 'Master of the Grand Orrery and Chrono-Archive. Orin has studied millions of historical battles, utilizing gear-driven pocket astrolabes to anticipate and intercept every strike.',
    personality: 'Analytical, pedantic, mildly condescending, and obsessively meticulous.',
    visualTheme: {
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
      accentGlow: 'rgba(245, 158, 11, 0.4)',
      avatarSymbol: 'BookOpen'
    },
    strengths: ['Unmatched card generation', 'Ritual countdown synergy', 'Predictive counter-play'],
    weaknesses: ['Slow early game', 'Can suffer from overdrawn hand size'],
    recommendedArchetypes: ['Grand Ritualist', 'Clockwork Assembly', 'Archive Discovery']
  },
  {
    id: 'seraphine-starforged',
    name: 'Seraphine',
    title: 'The Starforged',
    faction: 'AstralAscendancy',
    startingHealth: 30,
    maxHealth: 30,
    heroPower: {
      id: 'hp-seraphine',
      name: 'Radiant Beacon',
      cost: 2,
      description: 'Restore 2 Health. If the Veil is Celestial, also give a friendly minion Divine Shield.',
      effectType: 'RadiantBeacon',
      soundTrigger: 'radiant_beacon'
    },
    quote: '"Darkness is only the absence of courage. Step into the starlight."',
    lore: 'High Archon of the Solar Citadel, born beneath a triple eclipse. Her armor is forged from condensed dwarf star fragments, and her blade burns with the radiant fury of dying constellations.',
    personality: 'Regal, authoritative, fearless, and uncompromisingly noble.',
    visualTheme: {
      primaryColor: '#06b6d4',
      secondaryColor: '#eab308',
      accentGlow: 'rgba(6, 182, 212, 0.4)',
      avatarSymbol: 'Sun'
    },
    strengths: ['Extravagant late-game minions', 'Divine Shield resilience', 'Celestial Veil synergy'],
    weaknesses: ['High average mana curve', 'Slow to react to aggressive rush'],
    recommendedArchetypes: ['Solar Celestial', 'Divine Ramp', 'Constellation Titans']
  }
];

export function getBinderById(id: string): Binder {
  return BINDERS.find(b => b.id === id) || BINDERS[0];
}
