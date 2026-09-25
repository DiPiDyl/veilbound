import { CardRarity, FactionId } from '../types/card';

export interface PackDefinition {
  id: string;
  name: string;
  subtitle: string;
  costGold: number;
  description: string;
  themeColor: string;
  accentGlow: string;
  icon: string;
  cardCount: number;
  factionWeight?: FactionId;
  guaranteedMinRarity?: CardRarity;
  dropRates: {
    Common: number;
    Rare: number;
    Epic: number;
    Legendary: number;
    Mythic: number;
  };
}

export const PACK_TYPES: PackDefinition[] = [
  {
    id: 'pack-standard',
    name: 'Planar Echoes Pack',
    subtitle: 'Standard Core Pool',
    costGold: 100,
    description: 'Contains 5 cards from any faction. Guaranteed at least one Rare or higher card.',
    themeColor: '#6366f1',
    accentGlow: 'rgba(99, 102, 241, 0.5)',
    icon: 'Package',
    cardCount: 5,
    guaranteedMinRarity: 'Rare',
    dropRates: {
      Common: 0.68,
      Rare: 0.22,
      Epic: 0.07,
      Legendary: 0.025,
      Mythic: 0.005
    }
  },
  {
    id: 'pack-faction',
    name: 'Faction Citadel Pack',
    subtitle: 'Faction Specialized',
    costGold: 150,
    description: 'Contains 5 cards heavily weighted towards your chosen faction with increased chance for Champions.',
    themeColor: '#ef4444',
    accentGlow: 'rgba(239, 68, 68, 0.5)',
    icon: 'Shield',
    cardCount: 5,
    guaranteedMinRarity: 'Rare',
    dropRates: {
      Common: 0.60,
      Rare: 0.26,
      Epic: 0.10,
      Legendary: 0.035,
      Mythic: 0.005
    }
  },
  {
    id: 'pack-veil',
    name: 'Veil Shifter Cache',
    subtitle: 'Veil & Echo Focused',
    costGold: 175,
    description: 'High concentration of cards with Veilshift, Echo, and Ritual mechanics.',
    themeColor: '#a855f7',
    accentGlow: 'rgba(168, 85, 247, 0.5)',
    icon: 'Sparkles',
    cardCount: 5,
    guaranteedMinRarity: 'Rare',
    dropRates: {
      Common: 0.55,
      Rare: 0.28,
      Epic: 0.12,
      Legendary: 0.045,
      Mythic: 0.005
    }
  },
  {
    id: 'pack-relic',
    name: 'Ancient Reliquary Cache',
    subtitle: 'Relics, Weapons & Events',
    costGold: 200,
    description: 'Contains persistent Relics, forged Weapons, and game-altering Event cards.',
    themeColor: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.5)',
    icon: 'Box',
    cardCount: 5,
    guaranteedMinRarity: 'Rare',
    dropRates: {
      Common: 0.50,
      Rare: 0.30,
      Epic: 0.14,
      Legendary: 0.05,
      Mythic: 0.01
    }
  },
  {
    id: 'pack-mythic',
    name: 'Celestial Nova Mythic Vault',
    subtitle: 'Exalted Rarities',
    costGold: 500,
    description: 'The highest tier pack in the realm. Contains 5 cards with at least one guaranteed Legendary or Mythic card.',
    themeColor: '#eab308',
    accentGlow: 'rgba(234, 179, 8, 0.7)',
    icon: 'Crown',
    cardCount: 5,
    guaranteedMinRarity: 'Legendary',
    dropRates: {
      Common: 0.20,
      Rare: 0.40,
      Epic: 0.25,
      Legendary: 0.12,
      Mythic: 0.03
    }
  }
];
