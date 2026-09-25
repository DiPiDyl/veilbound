import { Card, BoardMinion, BoardRelic, ActiveEventAura, VeilState } from './card';
import { Binder, DestinyTrack } from './binder';

export interface WeaponState {
  card: Card;
  attack: number;
  durability: number;
}

export interface EchoItem {
  id: string;
  sourceCardName: string;
  spellEffectSnippet: string;
  costToReplay: number;
  effect: any;
}

export interface PlayerState {
  binder: Binder;
  health: number;
  maxHealth: number;
  armor: number;
  currentMana: number;
  maxMana: number;
  manaCrystalsLocked: number;
  deck: Card[];
  hand: Card[];
  graveyard: Card[];
  board: BoardMinion[];
  relics: BoardRelic[];
  weapon: WeaponState | null;
  echoPool: number;
  echoFragments: EchoItem[];
  destinyTrack: DestinyTrack;
  heroPowerUsedThisTurn: boolean;
  forecastModifiers: {
    targetCardType?: string;
    manaDiscount?: number;
    statBuff?: { attack: number; health: number };
  }[];
  stats: {
    cardsPlayed: number;
    minionsLost: number;
    damageDealt: number;
    veilShiftsTriggered: number;
    echoesConsumed: number;
  };
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  actor: 'player' | 'opponent' | 'the_veil';
  message: string;
  tag: 'play' | 'attack' | 'veil' | 'echo' | 'destiny' | 'ritual' | 'event' | 'death';
}

export interface MatchState {
  matchId: string;
  turnNumber: number;
  activePlayer: 'player' | 'opponent';
  veilState: VeilState;
  veilIntensity: number; // 1 to 3
  activeEvents: ActiveEventAura[];
  battlefieldTheme: string;
  player: PlayerState;
  opponent: PlayerState;
  combatLogs: CombatLogEntry[];
  phase: 'starting' | 'playing' | 'game_over';
  winner: 'player' | 'opponent' | null;
  isSandboxMode?: boolean;
}
