import { Card, BoardMinion } from './card';
import { Binder } from './binder';
import { VeilState } from './card';

export type PuzzleCategory = 'Lethal' | 'Survive' | 'Combo' | 'Veil' | 'Echo' | 'Destiny';

export interface VeilboundPuzzle {
  id: string;
  chapterNumber: number;
  puzzleNumber: number;
  title: string;
  category: PuzzleCategory;
  objective: string;
  hint: string;
  playerBinderId: string;
  opponentBinderId: string;
  playerHealth: number;
  playerMaxHealth: number;
  playerArmor: number;
  playerMana: number;
  playerMaxMana: number;
  playerEcho: number;
  veilState: VeilState;
  playerHand: Card[];
  playerBoard: BoardMinion[];
  opponentHealth: number;
  opponentArmor: number;
  opponentBoard: BoardMinion[];
  solutionCheck: (finalState: any) => boolean;
  reward: {
    gold: number;
    essence: number;
    unlockedCardId?: string;
  };
}

export interface PuzzleChapter {
  chapterNumber: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  puzzles: VeilboundPuzzle[];
}
