import { FactionId, Card } from './card';

export type BinderId = 
  | 'lyra-voss'
  | 'kael-drake'
  | 'mira-thorn'
  | 'nox-revenant'
  | 'orin-vale'
  | 'seraphine-starforged';

export interface HeroPower {
  id: string;
  name: string;
  cost: number;
  description: string;
  effectType: 'VeilShift' | 'ArmorAndBuff' | 'SummonSpore' | 'SoulHarvest' | 'ForecastIndex' | 'RadiantBeacon';
  soundTrigger: string;
}

export type DestinyType = 
  | 'TheConqueror'   // Aggressive damage dealt to hero & high attacks
  | 'TheArchivist'   // Cards drawn, spells cast, discoveries
  | 'TheWarden'      // Armor accumulated, damage mitigated, taunts survived
  | 'TheVoidwalker'  // Veil manipulated, fractured reality shifts
  | 'TheRevenant';   // Sacrifices, deaths, graveyard reanimations

export interface DestinyMilestone {
  tier: 1 | 2 | 3;
  pointsRequired: number;
  unlocked: boolean;
  name: string;
  description: string;
  passiveBonusType: string;
}

export interface DestinyTrack {
  activeDestiny: DestinyType;
  points: { [key in DestinyType]: number };
  tiersUnlocked: { [key in DestinyType]: number };
}

export interface Binder {
  id: BinderId;
  name: string;
  title: string;
  faction: FactionId;
  maxHealth: number;
  startingHealth: number;
  heroPower: HeroPower;
  quote: string;
  lore: string;
  personality: string;
  visualTheme: {
    primaryColor: string;
    secondaryColor: string;
    accentGlow: string;
    avatarSymbol: string;
  };
  strengths: string[];
  weaknesses: string[];
  recommendedArchetypes: string[];
}
