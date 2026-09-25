export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type FactionId = 
  | 'Aetherbound'        // Lyra Voss (Veil manipulation, portals, cosmic blue/violet)
  | 'AshenCitadel'       // Kael Drake (Armor, fire, molten retaliation)
  | 'ViridianHive'       // Mira Thorn (Nature, swarm, growth, giant flora)
  | 'UmbralRemnant'      // Nox (Sacrifice, deathrattle, ghosts, graveyard)
  | 'ChronocastArchive'  // Orin Vale (Clockwork, card draw, delay, discovery)
  | 'AstralAscendancy'   // Seraphine (Celestial, protection, late game power)
  | 'Neutral';           // Mercenaries, rift wanderers, ancient relics

export type CardType = 
  | 'Minion' 
  | 'Spell' 
  | 'Relic' 
  | 'Weapon' 
  | 'Ritual' 
  | 'Event' 
  | 'Champion';

export type CreatureType = 
  | 'Wraith'
  | 'Thornling'
  | 'AshKnight'
  | 'Starborn'
  | 'VeilBeast'
  | 'ClockworkConstruct'
  | 'AncientSpirit'
  | 'Riftborn'
  | 'Celestial'
  | 'ForgottenGod'
  | 'Beast'
  | 'Humanoid'
  | 'None';

export type Keyword = 
  | 'Taunt'
  | 'Rush'
  | 'Charge'
  | 'Lifesteal'
  | 'DivineShield'
  | 'Deathrattle'
  | 'Battlecry'
  | 'Stealth'
  | 'Freeze'
  | 'Poison'
  | 'Discover'
  | 'Echo'
  | 'Veilshift'
  | 'Ritual'
  | 'Corrupt'
  | 'Awaken'
  | 'Rebirth'
  | 'Forecast'
  | 'Consume'
  | 'Sacrifice';

export type VeilState = 'Calm' | 'Wild' | 'Corrupted' | 'Celestial' | 'Fractured';

export interface CardEffect {
  type: 
    | 'Damage'
    | 'Heal'
    | 'Buff'
    | 'Draw'
    | 'Summon'
    | 'Veilshift'
    | 'EchoGain'
    | 'EchoConsume'
    | 'Armor'
    | 'RitualCountdown'
    | 'EventAura'
    | 'Transform'
    | 'Destroy';
  targetType?: 'EnemyHero' | 'FriendlyHero' | 'AnyHero' | 'EnemyMinion' | 'FriendlyMinion' | 'AnyMinion' | 'AllEnemies' | 'AllAllies' | 'AllMinions' | 'RandomEnemy' | 'None';
  value?: number;
  secondaryValue?: number;
  targetVeilState?: VeilState;
  summonCardId?: string;
  condition?: {
    veilState?: VeilState;
    echoThreshold?: number;
    destinyThreshold?: number;
    hasSacrificedThisTurn?: boolean;
    friendlyMinionCountMin?: number;
  };
  forecastEffect?: {
    cardTypeTarget?: CardType;
    manaCostDiscount?: number;
    statBuff?: { attack: number; health: number };
  };
  eventDurationTurns?: number;
}

export interface Card {
  id: string;
  name: string;
  faction: FactionId;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  attack?: number;
  health?: number;
  maxHealth?: number;
  durability?: number;        // For weapons or relics
  creatureType?: CreatureType;
  keywords?: Keyword[];
  description: string;
  flavorText: string;
  artworkPlaceholderTheme: string; // Used for stylized procedural/svg rendering
  effects?: CardEffect[];
  ritualCountdown?: number;    // Turns required to trigger ritual climax
  echoCost?: number;           // Echo points to consume
  isCustom?: boolean;          // Created in Card Lab
}

export interface BoardMinion {
  instanceId: string;
  cardId: string;
  card: Card;
  currentAttack: number;
  currentHealth: number;
  maxHealth: number;
  canAttack: boolean;
  attacksThisTurn: number;
  maxAttacksPerTurn: number;
  hasDivineShield: boolean;
  isStealthed: boolean;
  isFrozen: boolean;
  isSilenced: boolean;
  dormantTurns?: number;       // For rituals or charging minions
}

export interface BoardRelic {
  instanceId: string;
  card: Card;
  durability: number;
  countdown?: number;          // For rituals
}

export interface ActiveEventAura {
  instanceId: string;
  card: Card;
  remainingTurns: number;
  effectDescription: string;
}
