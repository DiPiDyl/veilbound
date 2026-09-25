import React from 'react';
import { NavTab } from './TopNav';
import { audio } from '../../services/audioService';
import { PlayerProgressionState, ProgressionService } from '../../services/progressionService';
import { 
  Swords, Compass, Wrench, Shield, Sparkles, 
  ChevronRight, Zap, Trophy, BookOpen, Puzzle, Lock, Star 
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
  const isBGUnlocked = ProgressionService.isFeatureUnlocked(progression, 'BATTLEGROUNDS');
  const isPuzzlesUnlocked = ProgressionService.isFeatureUnlocked(progression, 'PUZZLES');
  const isExpeditionUnlocked = ProgressionService.isFeatureUnlocked(progression, 'EXPEDITION');

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
            <Sparkles className="w-4 h-4" /> VEILBOUND 2 • The Edge of Reality
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
            <span>Launch 1v1 Duel</span>
          </button>

          <button
            onClick={() => {
              if (isBGUnlocked) {
                audio.playClick();
                onNavigateTab('BATTLEGROUNDS');
              } else {
                audio.playClick();
                alert('🔒 Battlegrounds unlocks at Player Level 6!');
              }
            }}
            className={`px-6 py-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isBGUnlocked
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] hover:scale-105'
                : 'bg-slate-900 border border-slate-800 text-slate-500'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Battlegrounds {isBGUnlocked ? '' : '(Lv. 6)'}</span>
            {!isBGUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
          </button>

          <button
            onClick={() => {
              if (isPuzzlesUnlocked) {
                audio.playClick();
                onNavigateTab('PUZZLES');
              } else {
                audio.playClick();
                alert('🔒 Puzzles Mode unlocks at Player Level 5!');
              }
            }}
            className={`px-6 py-3 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all ${
              isPuzzlesUnlocked
                ? 'bg-purple-900/80 border border-purple-500/60 text-purple-200 hover:bg-purple-800 hover:scale-105 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-500'
            }`}
          >
            <Puzzle className="w-4 h-4 text-purple-400" />
            <span>Puzzles {isPuzzlesUnlocked ? '' : '(Lv. 5)'}</span>
            {!isPuzzlesUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
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

      {/* Featured 4 Game Modes Grid */}
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
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:rotate-6 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">1v1 Classic Duel</h3>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Traditional card battle against intelligent AI Binders with step-by-step decision loops, lethal detection, and real tactics.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Play Duel</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Veilbound Battlegrounds (10-Player Auto-Battler) */}
        <div
          onClick={() => {
            if (isBGUnlocked) {
              audio.playClick();
              onNavigateTab('BATTLEGROUNDS');
            } else {
              audio.playClick();
              alert('🔒 Battlegrounds unlocks at Player Level 6!');
            }
          }}
          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer ${
            isBGUnlocked
              ? 'bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-purple-950/20 border-amber-500/40 hover:border-amber-400 hover:scale-[1.02]'
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">Battlegrounds</h3>
              <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                {isBGUnlocked ? '10 Players' : 'Unlocks Lv. 6'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Original auto-battler mode! Recruit from The Rift Market, deploy units, activate 6 faction synergies, and survive to the Final Duel.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>{isBGUnlocked ? 'Enter Market' : 'Locked (Level 6)'}</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Tactical Puzzles */}
        <div
          onClick={() => {
            if (isPuzzlesUnlocked) {
              audio.playClick();
              onNavigateTab('PUZZLES');
            } else {
              audio.playClick();
              alert('🔒 Puzzles Mode unlocks at Player Level 5!');
            }
          }}
          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer ${
            isPuzzlesUnlocked
              ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400 hover:scale-[1.02]'
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400 mb-3 group-hover:rotate-6 transition-transform">
              <Puzzle className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">Tactical Puzzles</h3>
              <span className="text-[9px] font-bold text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded">
                {isPuzzlesUnlocked ? '6 Chapters' : 'Unlocks Lv. 5'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Handcrafted tactical scenarios! Master exact lethal sequences, Veil state shifts, ritual accelerations, and earn 3-star ratings.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>{isPuzzlesUnlocked ? 'Solve Puzzles' : 'Locked (Level 5)'}</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. Roguelite Expedition */}
        <div
          onClick={() => {
            if (isExpeditionUnlocked) {
              audio.playClick();
              onNavigateTab('EXPEDITION');
            } else {
              audio.playClick();
              alert('🔒 Expedition unlocks at Player Level 7!');
            }
          }}
          className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer ${
            isExpeditionUnlocked
              ? 'bg-sky-950/20 border-sky-500/40 hover:border-sky-400 hover:scale-[1.02]'
              : 'bg-slate-950/40 border-slate-800 opacity-60'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-3 group-hover:rotate-6 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-bold text-base text-slate-100">The Expedition</h3>
              <span className="text-[9px] font-bold text-sky-300 bg-sky-950 px-1.5 py-0.5 rounded">
                {isExpeditionUnlocked ? 'Roguelite' : 'Unlocks Lv. 7'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Traverse branching procedural planar maps, claim run-defining treasures, face moral narrative crossroads, and slay ancient archons.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>{isExpeditionUnlocked ? 'Explore Map' : 'Locked (Level 7)'}</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
