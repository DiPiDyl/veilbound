import React, { useState, useEffect } from 'react';
import { PUZZLE_CHAPTERS } from '../../data/puzzlesData';
import { VeilboundPuzzle, PuzzleChapter } from '../../types/puzzle';
import { GameBoard } from '../battlefield/GameBoard';
import { createInitialMatch } from '../../engine/gameEngine';
import { getBinderById } from '../../data/binders';
import { audio } from '../../services/audioService';
import { 
  Puzzle, Star, ArrowLeft, RefreshCw, Lightbulb, CheckCircle2, 
  ChevronRight, Lock, Award, Sparkles, BookOpen 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleModeViewProps {
  onBackToMenu: () => void;
  onRewardClaimed?: (rewards: { gold: number; essence: number }) => void;
}

export const PuzzleModeView: React.FC<PuzzleModeViewProps> = ({
  onBackToMenu,
  onRewardClaimed
}) => {
  const [selectedChapter, setSelectedChapter] = useState<PuzzleChapter>(PUZZLE_CHAPTERS[0]);
  const [activePuzzle, setActivePuzzle] = useState<VeilboundPuzzle | null>(null);
  const [puzzleMatchState, setPuzzleMatchState] = useState<any | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('VEILBOUND_SOLVED_PUZZLES_V2');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('VEILBOUND_SOLVED_PUZZLES_V2', JSON.stringify(solvedPuzzles));
    } catch (e) {}
  }, [solvedPuzzles]);

  // Load a puzzle into live playable state
  const loadPuzzleState = (puzzle: VeilboundPuzzle) => {
    const playerBinder = getBinderById(puzzle.playerBinderId);
    const opponentBinder = getBinderById(puzzle.opponentBinderId);

    const match = createInitialMatch(
      playerBinder,
      [],
      opponentBinder,
      [],
      'void_sanctum'
    );

    // Apply exact puzzle situation
    match.player.health = puzzle.playerHealth;
    match.player.maxHealth = puzzle.playerMaxHealth;
    match.player.armor = puzzle.playerArmor;
    match.player.currentMana = puzzle.playerMana;
    match.player.maxMana = puzzle.playerMaxMana;
    match.player.echoPool = puzzle.playerEcho;
    match.player.hand = [...puzzle.playerHand];
    match.player.board = [...puzzle.playerBoard];

    match.opponent.health = puzzle.opponentHealth;
    match.opponent.maxHealth = 30;
    match.opponent.armor = puzzle.opponentArmor;
    match.opponent.board = [...puzzle.opponentBoard];

    match.veilState = puzzle.veilState;
    match.activePlayer = 'player';
    match.isSandboxMode = true; // Prevents timer auto-timeout during tactical think

    setPuzzleMatchState(match);
  };

  const handleStartPuzzle = (puzzle: VeilboundPuzzle) => {
    audio.playClick();
    setActivePuzzle(puzzle);
    setShowHint(false);
    setIsSuccessModalOpen(false);
    loadPuzzleState(puzzle);
  };

  const handleResetPuzzle = () => {
    if (!activePuzzle) return;
    audio.playClick();
    loadPuzzleState(activePuzzle);
  };

  // Check victory condition on match state updates
  const handlePuzzleMatchEnd = (won: boolean, finalState: any) => {
    if (activePuzzle && activePuzzle.solutionCheck(finalState)) {
      audio.playVictory();
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}

      setSolvedPuzzles(prev => ({
        ...prev,
        [activePuzzle.id]: 3 // 3 stars
      }));

      setIsSuccessModalOpen(true);
      if (onRewardClaimed) {
        onRewardClaimed(activePuzzle.reward);
      }
    } else {
      // Failed attempt
      audio.playDefeat();
      alert('Tactical sequence did not meet the objective. Resetting puzzle!');
      handleResetPuzzle();
    }
  };

  // Calculate total stars
  const totalStars = Object.values(solvedPuzzles).reduce((sum, s) => sum + s, 0);

  // If inside an active puzzle, show GameBoard with objective banner
  if (activePuzzle && puzzleMatchState) {
    return (
      <div className="relative w-full h-full">
        {/* Top Tactical Objective Header */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-slate-950/95 border-b border-amber-500/40 px-6 py-2 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                setActivePuzzle(null);
                setPuzzleMatchState(null);
              }}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Puzzle</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                  Puzzle #{activePuzzle.puzzleNumber} • {activePuzzle.title}
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/40 font-bold uppercase">
                  {activePuzzle.category}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-semibold">{activePuzzle.objective}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playClick();
                setShowHint(!showHint);
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-bold text-indigo-200 flex items-center gap-1.5"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            </button>

            <button
              onClick={handleResetPuzzle}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-bold text-amber-300 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Puzzle</span>
            </button>
          </div>
        </div>

        {/* Hint Dropdown */}
        {showHint && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-400/80 rounded-xl p-3 shadow-2xl max-w-md w-full text-center animate-fadeIn">
            <span className="text-[11px] font-bold text-amber-400 uppercase block mb-1">
              💡 Tactical Insight
            </span>
            <p className="text-xs text-slate-200">{activePuzzle.hint}</p>
          </div>
        )}

        {/* Interactive Board */}
        <GameBoard
          initialState={puzzleMatchState}
          onMatchEnd={handlePuzzleMatchEnd}
          onExit={() => {
            setActivePuzzle(null);
            setPuzzleMatchState(null);
          }}
        />

        {/* Success Modal */}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-[420px] p-6 rounded-2xl bg-slate-900 border-2 border-amber-400 text-center flex flex-col items-center gap-4 shadow-2xl">
              <div className="text-5xl animate-bounce">⭐</div>
              <h2 className="text-3xl font-cinzel font-black text-amber-300">
                PUZZLE SOLVED!
              </h2>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-xs text-slate-300">
                Flawless execution! You unraveled the sequence and mastered the tactical challenge.
              </p>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 w-full flex items-center justify-around text-xs font-bold">
                <span className="text-amber-400">+{activePuzzle.reward.gold} Gold</span>
                <span className="text-purple-400">+{activePuzzle.reward.essence} Essence</span>
              </div>

              <button
                onClick={() => {
                  audio.playClick();
                  setIsSuccessModalOpen(false);
                  setActivePuzzle(null);
                  setPuzzleMatchState(null);
                }}
                className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg transition-transform hover:scale-105"
              >
                Back to Chapters
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col p-4 md:p-8 select-none overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-amber-500/30 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              audio.playClick();
              onBackToMenu();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Hub</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧩</span>
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 bg-clip-text text-transparent">
                VEILBOUND TACTICAL PUZZLES
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                6 Chapters
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Solve handcrafted tactical scenarios. Master lethal calculations, veil alterations, and combo sequences!
            </p>
          </div>
        </div>

        {/* Stars counter */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-bold uppercase">Total Stars:</span>
          <span className="font-cinzel font-black text-lg text-amber-300">{totalStars}</span>
        </div>
      </div>

      {/* Chapter Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
        {PUZZLE_CHAPTERS.map((ch) => {
          const isSelected = selectedChapter.chapterNumber === ch.chapterNumber;
          return (
            <button
              key={ch.chapterNumber}
              onClick={() => {
                audio.playClick();
                setSelectedChapter(ch);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="text-2xl mb-1">{ch.icon}</span>
              <span className="font-bold text-xs truncate max-w-full">
                Ch. {ch.chapterNumber}: {ch.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Chapter Details & Puzzle Cards Grid */}
      <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-6 flex-1 flex flex-col justify-between">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{selectedChapter.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-amber-300">
                Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
              </h2>
              <div className="text-xs text-amber-400/80 font-semibold">{selectedChapter.subtitle}</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {selectedChapter.description}
          </p>
        </div>

        {/* Puzzle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedChapter.puzzles.map((puz) => {
            const starsEarned = solvedPuzzles[puz.id] || 0;
            const isCompleted = starsEarned > 0;

            return (
              <div
                key={puz.id}
                className="bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-amber-500/60 transition-all p-5 flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      Puzzle #{puz.puzzleNumber} • {puz.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= starsEarned ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-100 mb-1">{puz.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {puz.objective}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400">
                    Reward: <span className="font-bold text-amber-400">+{puz.reward.gold} Gold</span>
                  </div>

                  <button
                    onClick={() => handleStartPuzzle(puz)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-transform hover:scale-105 flex items-center gap-1"
                  >
                    <span>{isCompleted ? 'Replay' : 'Play Puzzle'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
