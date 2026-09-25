export interface BattlefieldTheme {
  id: string;
  name: string;
  subtitle: string;
  bgGradient: string;
  boardTexture: string;
  ambientParticles: string[];
  ambientParticleCount: number;
  runesColor: string;
  soundAmbiance: string;
}

export const BATTLEFIELDS: BattlefieldTheme[] = [
  {
    id: 'shattered-city',
    name: 'The Shattered City',
    subtitle: 'Ruins of the Ancient Spire',
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    boardTexture: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
    ambientParticles: ['#818cf8', '#c084fc', '#94a3b8'],
    ambientParticleCount: 28,
    runesColor: 'rgba(99, 102, 241, 0.25)',
    soundAmbiance: 'wind_ruins'
  },
  {
    id: 'rootsea',
    name: 'The Rootsea',
    subtitle: 'Subterranean Bioluminescent Jungle',
    bgGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    boardTexture: 'radial-gradient(ellipse at center, rgba(6, 78, 59, 0.7) 0%, rgba(2, 44, 34, 0.95) 100%)',
    ambientParticles: ['#34d399', '#6ee7b7', '#a7f3d0'],
    ambientParticleCount: 35,
    runesColor: 'rgba(16, 185, 129, 0.3)',
    soundAmbiance: 'forest_hum'
  },
  {
    id: 'astral-library',
    name: 'The Astral Library',
    subtitle: 'Orrery of Infinite Tomes',
    bgGradient: 'from-amber-950 via-indigo-950 to-stone-950',
    boardTexture: 'radial-gradient(ellipse at center, rgba(69, 26, 3, 0.75) 0%, rgba(28, 25, 23, 0.95) 100%)',
    ambientParticles: ['#fbbf24', '#f59e0b', '#fde68a'],
    ambientParticleCount: 30,
    runesColor: 'rgba(245, 158, 11, 0.3)',
    soundAmbiance: 'clock_ticking'
  },
  {
    id: 'ashen-citadel',
    name: 'The Ashen Citadel',
    subtitle: 'Fortress of Molten Slag',
    bgGradient: 'from-red-950 via-orange-950 to-stone-950',
    boardTexture: 'radial-gradient(ellipse at center, rgba(69, 10, 10, 0.8) 0%, rgba(28, 25, 23, 0.95) 100%)',
    ambientParticles: ['#f87171', '#fb923c', '#fdba74'],
    ambientParticleCount: 32,
    runesColor: 'rgba(239, 68, 68, 0.35)',
    soundAmbiance: 'fire_crackle'
  },
  {
    id: 'the-veil',
    name: 'The Veil Proper',
    subtitle: 'The Edge of Reality Splintered',
    bgGradient: 'from-purple-950 via-fuchsia-950 to-cyan-950',
    boardTexture: 'radial-gradient(ellipse at center, rgba(88, 28, 135, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
    ambientParticles: ['#e879f9', '#22d3ee', '#f43f5e'],
    ambientParticleCount: 45,
    runesColor: 'rgba(236, 72, 153, 0.4)',
    soundAmbiance: 'cosmic_resonance'
  }
];

export function getBattlefieldById(id: string): BattlefieldTheme {
  return BATTLEFIELDS.find(b => b.id === id) || BATTLEFIELDS[0];
}
