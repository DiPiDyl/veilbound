import React from 'react';
import { BINDERS } from '../../data/binders';
import { NavTab } from './TopNav';
import { audio } from '../../services/audioService';
import { Swords, Compass, Wrench, Shield, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface PlayHubViewProps {
  onOpenQuickBattle: () => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const PlayHubView: React.FC<PlayHubViewProps> = ({
  onOpenQuickBattle,
  onNavigateTab
}) => {
  return (
    <div className="w-full h-full p-8 flex flex-col gap-8 overflow-y-auto">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl glass-panel-glow border border-indigo-500/40 p-8 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
        {/* Background glow and decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4" /> Welcome to the Rift
          </div>
          <h1 className="text-3xl lg:text-4xl font-cinzel font-extrabold text-slate-100 mb-3 drop-shadow">
            Master the Shifting Veil
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed max-w-xl">
            At the edge of reality, physical law dissolves. Manipulate the 5 Veil states, harvest spell echoes, and forge your destiny in battles of planar supremacy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex items-center gap-4 mt-6">
          <button
            onClick={() => {
              audio.playClick();
              onOpenQuickBattle();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95"
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
        </div>
      </div>

      {/* Featured Game Modes Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <span>Start Expedition</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Card Lab */}
        <div
          onClick={() => {
            audio.playClick();
            onNavigateTab('CARD LAB');
          }}
          className="rounded-2xl glass-panel-glow border border-white/10 p-6 flex flex-col justify-between cursor-pointer hover:border-pink-400/50 hover:scale-[1.02] transition-all duration-300 shadow-xl group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-pink-950/80 border border-pink-500/40 flex items-center justify-center text-pink-400 mb-4 group-hover:rotate-6 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-cinzel font-bold text-lg text-slate-100 mb-1">Card Lab Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Design completely custom cards with original keywords and test them immediately in an isolated combat sandbox against target dummies.
            </p>
          </div>
          <div className="flex items-center text-xs font-bold text-pink-400 group-hover:translate-x-1 transition-transform">
            <span>Open Workshop</span> <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Playable Binders Showcase */}
      <div>
        <h2 className="text-xl font-cinzel font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          Playable Binders & Realities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {BINDERS.map((binder) => (
            <div
              key={binder.id}
              className="p-4 rounded-xl glass-panel border flex flex-col justify-between hover:scale-105 transition-all shadow-lg"
              style={{ borderColor: binder.visualTheme.primaryColor }}
            >
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mb-1">
                  {binder.faction}
                </div>
                <h4 className="font-cinzel font-bold text-sm text-slate-100">{binder.name}</h4>
                <div className="text-[11px] font-semibold mb-2" style={{ color: binder.visualTheme.primaryColor }}>
                  {binder.title}
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-3 italic mb-3">
                  {binder.quote}
                </p>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-white/10 pt-2">
                <strong className="text-slate-200">Power:</strong> {binder.heroPower.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
