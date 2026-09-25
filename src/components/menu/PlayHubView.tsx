import React from 'react';
import { BINDERS } from '../../data/binders';
import { NavTab } from './TopNav';
import { audio } from '../../services/audioService';
import { Swords, Compass, Wrench, Shield, Sparkles, ChevronRight, Zap, Trophy, BookOpen } from 'lucide-react';

interface PlayHubViewProps {
  onOpenQuickBattle: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenCodex?: () => void;
}

export const PlayHubView: React.FC<PlayHubViewProps> = ({
  onOpenQuickBattle,
  onNavigateTab,
  onOpenCodex
}) => {
  return (
    <div className="w-full h-full p-6 md:p-8 flex flex-col gap-6 overflow-y-auto select-none">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl glass-panel-glow border border-amber-500/40 p-8 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
        {/* Background glow and decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" /> Welcome to the Shifting Veil
          </div>
          <h1 className="text-3xl lg:text-4xl font-cinzel font-extrabold text-slate-100 mb-2 drop-shadow">
            Command Reality. Slay Champions.
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-xl">
            At the edge of the universe, reality fractures. Manipulate the 5 Veil states, harvest action echoes, and climb the Free-for-All Gauntlet to claim legendary glory.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-4 mt-6">
          <button
            onClick={() => {
              audio.playClick();
              onNavigateTab('FREE FOR ALL');
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 active:scale-95"
          >
            <Trophy className="w-4 h-4" />
            <span>Enter Free-For-All Gauntlet</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onOpenQuickBattle();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-105"
          >
            <Swords className="w-4 h-4" />
            <span>Launch Quick Duel</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onNavigateTab('EXPEDITION');
            }}
            className="px-6 py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
          >
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Enter Expedition</span>
          </button>

          {onOpenCodex && (
            <button
              onClick={() => {
                audio.playClick();
                onOpenCodex();
              }}
              className="px-6 py-3 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Read Codex</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Game Modes Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free-for-all Gauntlet Card */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('FREE FOR ALL');
          }}
          className="rounded-2xl glass-panel-glow border border-amber-500/40 p-6 flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:scale-[1.02] transition-all duration-300 shadow-xl group bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-purple-950/20"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-amber-400 mb-4 group-hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-cinzel font-bold text-lg text-slate-100">Free-For-All Gauntlet</h3>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                10 Bosses
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Conquer 10 escalating champions in sequence from Rank 10 to Sovereign Grandmaster Ouroboros. Claim high-tier milestone rewards at matches 1, 3, 5, 7, and 10!
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
            <span>Enter Gauntlet</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Duel Mode */}
        <div
          onClick={() => {
            audio.playClick();
            onOpenQuickBattle();
          }}
          className="rounded-2xl glass-panel-glow border border-white/10 p-6 flex flex-col justify-between cursor-pointer hover:border-emerald-400/50 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:rotate-6 transition-transform">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel font-bold text-lg text-slate-100 mb-1">Quick Duel</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Engage in an instant match against AI Binders with customized decks, difficulty, and dynamic battlefields.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
            <span>Play Now</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Roguelite Expedition */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('EXPEDITION');
          }}
          className="rounded-2xl glass-panel-glow border border-white/10 p-6 flex flex-col justify-between cursor-pointer hover:border-sky-400/50 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-4 group-hover:rotate-6 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel font-bold text-lg text-slate-100 mb-1">The Veil Expedition</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Traverse branching procedural planar maps, claim run-defining treasures, face moral crossroads, and slay ancient archons.
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
