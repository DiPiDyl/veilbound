import React from 'react';
import { NavTab } from './TopNav';
import { audio } from '../../services/audioService';
import { PlayerProgressionState } from '../../services/progressionService';
import { 
  Swords, Compass, Wrench, Shield, Sparkles, 
  ChevronRight, Zap, Trophy, BookOpen, Puzzle, Star 
} from 'lucide-react';

interface PlayHubViewProps {
  onOpenQuickBattle: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenCodex?: () => void;
  progression: PlayerProgressionState;
}

export const PlayHubView: React.FC<PlayHubViewProps> = ({
  onOpenQuickBattle,
  onNavigateTab,
  onOpenCodex,
  progression
}) => {
  const xpProgressPercent = Math.min(100, Math.round((progression.currentXp / progression.xpToNextLevel) * 100));

  return (
    <div className="w-full h-full p-6 md:p-8 flex flex-col gap-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl glass-panel-glow border border-amber-500/40 p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
        {/* Background glow and decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" /> VEILBOUND • The Edge of Reality
          </div>
          <h1 className="text-3xl lg:text-4xl font-cinzel font-black text-slate-100 mb-2 drop-shadow">
            Command Reality. Slay Champions.
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-xl">
            Manipulate the 5 Veil states, harvest action echoes, and unlock new Binders and game modes as you level up your planar rank.
          </p>

          {/* XP Progress Bar */}
          <div className="mt-4 max-w-md bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 font-mono">Player Level {progression.playerLevel}</span>
              <span className="text-slate-400 font-mono text-[11px]">{progression.currentXp} / {progression.xpToNextLevel} XP</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 mt-6">
          <button
            onClick={() => {
              audio.playClick();
              onOpenQuickBattle();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Swords className="w-4 h-4" />
            <span>Launch 1v1 Quick Duel</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onNavigateTab('BATTLEGROUNDS');
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <Trophy className="w-4 h-4" />
            <span>Battlegrounds (8 Players)</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onNavigateTab('PUZZLES');
            }}
            className="px-6 py-3 rounded-xl bg-purple-900/80 border border-purple-500/60 text-purple-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-purple-800 transition-all hover:scale-105 shadow-md"
          >
            <Puzzle className="w-4 h-4 text-purple-400" />
            <span>Tactical Puzzles</span>
          </button>

          {onOpenCodex && (
            <button
              onClick={() => {
                audio.playClick();
                onOpenCodex();
              }}
              className="px-5 py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Read Codex</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured 4 Game Modes Grid - All Unlocked Immediately */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. 1v1 Classic Duel */}
        <div
          onClick={() => {
            audio.playClick();
            onOpenQuickBattle();
          }}
          className="rounded-2xl bg-slate-900/70 border border-emerald-500/40 p-5 flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Swords className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">1v1 Classic Duel</h3>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Fast 8–15 minute competitive card battle against autonomous AI Binders with step-by-step decision loops, lethal detection, and real tactics.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Play Duel</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Veilbound Battlegrounds (8-Player Auto-Battler) */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('BATTLEGROUNDS');
          }}
          className="rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-purple-950/20 border border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer hover:border-amber-400 hover:scale-[1.02]"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">Battlegrounds</h3>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                8 Players
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Original 8-player auto-battler! Recruit from The Rift Market, deploy units, activate 6 faction synergies, and survive to the cinematic Final Duel.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Enter Market</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Tactical Puzzles */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('PUZZLES');
          }}
          className="rounded-2xl bg-purple-950/20 border border-purple-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer hover:border-purple-400 hover:scale-[1.02]"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Puzzle className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">Tactical Puzzles</h3>
              <span className="text-[9px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded">
                6 Chapters
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Handcrafted 1–5 minute tactical scenarios! Master exact lethal sequences, Veil state shifts, ritual accelerations, and earn 3-star ratings.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Solve Puzzles</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. Roguelite Expedition */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('EXPEDITION');
          }}
          className="rounded-2xl bg-sky-950/20 border border-sky-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer hover:border-sky-400 hover:scale-[1.02]"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Compass className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">The Expedition</h3>
              <span className="text-[9px] font-bold text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded">
                Roguelite
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Compact 15–25 minute planar map runs. Draft run-defining artifacts, face moral narrative crossroads, and slay ancient archons.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Explore Map</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
