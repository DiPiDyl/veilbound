import React from 'react';
import { NavTab } from './TopNav';
import { audio } from '../../services/audioService';
import { PlayerProgressionState } from '../../services/progressionService';
import { Binder } from '../../types/binder';
import { FactionEmblem } from '../common/EmblemIcons';
import { 
  Swords, Compass, Wrench, Shield, Sparkles, 
  ChevronRight, Zap, Trophy, BookOpen, Puzzle, Star, Award 
} from 'lucide-react';

interface PlayHubViewProps {
  onOpenQuickBattle: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenCodex?: () => void;
  onOpenBindersModal?: () => void;
  activeBinder?: Binder;
  unlockedBinderIds?: string[];
  progression: PlayerProgressionState;
}

export const PlayHubView: React.FC<PlayHubViewProps> = ({
  onOpenQuickBattle,
  onNavigateTab,
  onOpenCodex,
  onOpenBindersModal,
  activeBinder,
  unlockedBinderIds = ['lyra-voss'],
  progression
}) => {
  const xpProgressPercent = Math.min(100, Math.round((progression.currentXp / progression.xpToNextLevel) * 100));

  return (
    <div className="w-full h-full p-4 md:p-8 flex flex-col gap-6 overflow-y-auto select-none text-slate-100">
      {/* Top Section: Active Binder Showcase & Welcome Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Binder Character Showcase (1 Col) */}
        {activeBinder && (
          <div className="rounded-3xl fantasy-panel p-6 flex flex-col justify-between relative overflow-hidden shadow-2xl group border-2 border-amber-500/40">
            {/* Ambient Character Glow */}
            <div 
              className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ backgroundColor: activeBinder.visualTheme.primaryColor }}
            />

            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Active Binder</span>
                </div>

                {onOpenBindersModal && (
                  <button
                    onClick={() => {
                      audio.playClick();
                      onOpenBindersModal();
                    }}
                    className="text-[11px] font-bold text-amber-300 hover:text-white bg-slate-900/80 px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400 transition-all flex items-center gap-1"
                  >
                    <span>Change</span>
                    <span className="text-[10px] text-slate-400">({unlockedBinderIds.length}/6)</span>
                  </button>
                )}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl border-2 border-amber-400 flex items-center justify-center font-bold text-white shadow-xl animate-float-slow"
                  style={{ backgroundColor: activeBinder.visualTheme.primaryColor }}
                >
                  <FactionEmblem faction={activeBinder.faction} size="md" />
                </div>
                <div>
                  <h3 className="font-cinzel font-black text-xl text-slate-100">{activeBinder.name}</h3>
                  <div className="text-xs font-bold text-amber-300/80">{activeBinder.title}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">{activeBinder.faction}</div>
                </div>
              </div>

              {/* Binder Quote */}
              <blockquote className="mt-3 text-xs italic text-slate-300 border-l-2 border-amber-500/50 pl-2.5 line-clamp-2">
                {activeBinder.quote}
              </blockquote>

              {/* Passive & Active Powers Preview */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/25 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-black text-amber-300 block">
                      Passive: {activeBinder.passive?.name}
                    </span>
                    <span className="text-[10px] text-slate-300 leading-tight block">
                      {activeBinder.passive?.description}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 flex items-start gap-2">
                  <Zap className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[11px] font-black text-indigo-300 block">
                      Power: {activeBinder.heroPower?.name} ({activeBinder.heroPower?.cost} Mana)
                    </span>
                    <span className="text-[10px] text-slate-300 leading-tight block">
                      {activeBinder.heroPower?.description}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {onOpenBindersModal && (
              <button
                onClick={() => {
                  audio.playClick();
                  onOpenBindersModal();
                }}
                className="mt-4 w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Inspect All 6 Binders</span>
              </button>
            )}
          </div>
        )}

        {/* Hero Welcome Banner (2 Cols) */}
        <div className={`rounded-3xl fantasy-panel-glow p-6 md:p-8 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[260px] ${activeBinder ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>VEILBOUND • The Planar Card Game</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-cinzel font-black text-slate-100 mb-2 drop-shadow">
              Command Reality. Slay Champions.
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">
              Step into the supernatural Veil! Play cards, execute tactical attacks, shift reality phases, and unlock legendary Binders as you conquer opponents in competitive duels and tournaments.
            </p>

            {/* XP Progress Bar */}
            <div className="mt-5 max-w-md bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 flex flex-col gap-1.5 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-amber-300 font-mono">Planar Rank: Level {progression.playerLevel}</span>
                <span className="text-slate-400 font-mono text-[11px]">{progression.currentXp} / {progression.xpToNextLevel} XP</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 transition-all duration-500"
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
              className="px-6 py-3 rounded-2xl fantasy-btn-emerald font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Swords className="w-4 h-4" />
              <span>Launch 1v1 Duel</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onNavigateTab('BATTLEGROUNDS');
              }}
              className="px-6 py-3 rounded-2xl fantasy-btn-amber font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Trophy className="w-4 h-4" />
              <span>Battlegrounds (8 Players)</span>
            </button>

            <button
              onClick={() => {
                audio.playClick();
                onNavigateTab('PUZZLES');
              }}
              className="px-6 py-3 rounded-2xl fantasy-btn-indigo font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
            >
              <Puzzle className="w-4 h-4 text-purple-200" />
              <span>Tactical Puzzles</span>
            </button>

            {onOpenCodex && (
              <button
                onClick={() => {
                  audio.playClick();
                  onOpenCodex();
                }}
                className="px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Codex & Lore</span>
              </button>
            )}
          </div>
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
          className="rounded-3xl fantasy-panel border-2 border-emerald-500/40 p-5 flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Swords className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-black text-base text-slate-100">1v1 Classic Duel</h3>
              <span className="text-[9px] font-black text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/40">
                Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Tactical card battles against smart AI Binders with step-by-step decision loops, lethal calculation, targeting arrows, and epic combat animations.
            </p>
          </div>
          <div className="flex items-center text-xs font-black text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Play Duel</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Veilbound Battlegrounds (8-Player Auto-Battler) */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('BATTLEGROUNDS');
          }}
          className="rounded-3xl fantasy-panel border-2 border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer hover:border-amber-400 hover:scale-[1.02]"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-black text-base text-slate-100">Battlegrounds</h3>
              <span className="text-[9px] font-black text-amber-300 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-500/40">
                8 Players
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Step-by-step animated combat arena! Recruit from The Rift Market, position units, trigger faction synergies, and watch readable clash lunges.
            </p>
          </div>
          <div className="flex items-center text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Enter Market</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Tactical Puzzles */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('PUZZLES');
          }}
          className="rounded-3xl fantasy-panel border-2 border-purple-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer hover:border-purple-400 hover:scale-[1.02]"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/60 flex items-center justify-center text-purple-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Puzzle className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-black text-base text-slate-100">Tactical Puzzles</h3>
              <span className="text-[9px] font-black text-purple-300 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-500/40">
                6 Chapters
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Handcrafted tactical scenarios! Master exact lethal sequences, Veil shifts, and ritual countdowns to unlock stars and Binder Orin Vale.
            </p>
          </div>
          <div className="flex items-center text-xs font-black text-purple-400 group-hover:translate-x-1 transition-transform">
            <span>Solve Puzzles</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* 4. Roguelite Expedition */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('EXPEDITION');
          }}
          className="rounded-3xl fantasy-panel border-2 border-sky-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-xl group cursor-pointer hover:border-sky-400 hover:scale-[1.02]"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-3 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Compass className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="font-cinzel font-black text-base text-slate-100">The Expedition</h3>
              <span className="text-[9px] font-black text-sky-300 bg-sky-950 px-2 py-0.5 rounded-full border border-sky-500/40">
                Roguelite
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Branching planar map runs. Draft run-defining relics, face narrative crossroads, fight guardian elites, and slay ancient archons.
            </p>
          </div>
          <div className="flex items-center text-xs font-black text-sky-400 group-hover:translate-x-1 transition-transform">
            <span>Explore Map</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
