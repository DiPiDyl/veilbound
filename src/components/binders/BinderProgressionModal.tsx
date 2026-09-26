import React, { useState } from 'react';
import { BINDERS, getBinderById } from '../../data/binders';
import { Binder } from '../../types/binder';
import { FactionEmblem } from '../common/EmblemIcons';
import { audio } from '../../services/audioService';
import { 
  X, Check, Lock, Sparkles, Zap, Award, 
  ChevronRight, Shield, Swords, Star, Flame, BookOpen, Skull, Sun 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BinderProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedBinderIds: string[];
  activeBinderId: string;
  onSelectActiveBinder: (binderId: string) => void;
  onUnlockBinder: (binderId: string) => void;
  playerLevel: number;
  playerWins: number;
  puzzlesCompleted?: number;
  cardsPlayedTotal?: number;
}

export const BinderProgressionModal: React.FC<BinderProgressionModalProps> = ({
  isOpen,
  onClose,
  unlockedBinderIds,
  activeBinderId,
  onSelectActiveBinder,
  onUnlockBinder,
  playerLevel,
  playerWins,
  puzzlesCompleted = 0,
  cardsPlayedTotal = 0
}) => {
  const [selectedBinderId, setSelectedBinderId] = useState<string>(activeBinderId);
  const [justUnlockedId, setJustUnlockedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBinder = getBinderById(selectedBinderId);

  // Calculate progress for a specific binder
  const getBinderProgress = (binder: Binder): { current: number; target: number; isReady: boolean } => {
    const req = binder.unlockRequirement;
    if (req.type === 'starter') {
      return { current: 1, target: 1, isReady: true };
    }
    if (req.type === 'level') {
      return { current: playerLevel, target: req.target, isReady: playerLevel >= req.target };
    }
    if (req.type === 'wins') {
      return { current: playerWins, target: req.target, isReady: playerWins >= req.target };
    }
    if (req.type === 'puzzles') {
      return { current: puzzlesCompleted, target: req.target, isReady: puzzlesCompleted >= req.target };
    }
    if (req.type === 'cards_played') {
      return { current: cardsPlayedTotal, target: req.target, isReady: cardsPlayedTotal >= req.target };
    }
    return { current: 0, target: 1, isReady: false };
  };

  const handleUnlockClick = (binderId: string) => {
    audio.playVictory();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setJustUnlockedId(binderId);
    onUnlockBinder(binderId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl h-[88vh] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl border-2 border-amber-500/40 shadow-2xl flex flex-col overflow-hidden">
        {/* Ornate Background Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 px-8 py-5 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg border border-amber-400">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-cinzel font-black text-2xl text-slate-100 tracking-wide flex items-center gap-2">
                <span>The Planar Binders</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {unlockedBinderIds.length} / 6 Unlocked
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every Binder commands unique active powers and passive planar traits. Unlock them through genuine combat mastery!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Binder Selection Cards (Grid/List) */}
          <div className="w-full md:w-5/12 p-6 overflow-y-auto border-r border-white/10 flex flex-col gap-3">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest px-1">
              Select a Binder to Inspect
            </div>

            {BINDERS.map((binder) => {
              const isUnlocked = unlockedBinderIds.includes(binder.id);
              const isActive = activeBinderId === binder.id;
              const isSelected = selectedBinderId === binder.id;
              const { current, target, isReady } = getBinderProgress(binder);

              return (
                <div
                  key={binder.id}
                  onClick={() => {
                    audio.playClick();
                    setSelectedBinderId(binder.id);
                  }}
                  className={`
                    p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between
                    ${isSelected 
                      ? 'bg-gradient-to-r from-slate-900 to-indigo-950/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02]' 
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Portrait Icon */}
                    <div 
                      className={`
                        w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-bold text-white shadow-md relative
                        ${isUnlocked ? 'border-amber-400/80' : 'border-slate-700 opacity-60'}
                      `}
                      style={{ backgroundColor: binder.visualTheme.primaryColor }}
                    >
                      <FactionEmblem faction={binder.faction} size="sm" />
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-cinzel font-black text-sm text-slate-100">{binder.name}</span>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">{binder.title}</div>
                      
                      {/* Unlock Status / Progress */}
                      {!isUnlocked && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-amber-400/90 font-mono font-bold">
                            Progress: {Math.min(current, target)} / {target}
                          </span>
                          {isReady && (
                            <span className="text-[9px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded animate-pulse">
                              Ready to Unlock!
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Binder Showcase & Powers */}
          <div className="w-full md:w-7/12 p-8 overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Binder Top Identity */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-black tracking-widest text-amber-400">
                      {currentBinder.faction} Faction
                    </span>
                    {unlockedBinderIds.includes(currentBinder.id) ? (
                      <span className="text-[10px] font-black uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase bg-red-950 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                  <h3 className="font-cinzel font-black text-3xl text-slate-100 mt-1">
                    {currentBinder.name}
                  </h3>
                  <div className="text-sm font-bold text-amber-300/80 -mt-0.5">
                    {currentBinder.title}
                  </div>
                </div>

                <div 
                  className="w-16 h-16 rounded-3xl border-2 border-amber-400/80 flex items-center justify-center font-bold text-white shadow-xl"
                  style={{ backgroundColor: currentBinder.visualTheme.primaryColor }}
                >
                  <FactionEmblem faction={currentBinder.faction} size="lg" />
                </div>
              </div>

              {/* Personality / Quote */}
              <blockquote className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs italic text-slate-300">
                {currentBinder.quote}
              </blockquote>

              <p className="mt-3 text-xs text-slate-300 leading-relaxed">
                {currentBinder.lore}
              </p>

              {/* Passive & Active Powers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Passive Trait */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>PASSIVE: {currentBinder.passive.name}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {currentBinder.passive.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-3 uppercase tracking-wider">
                    Always Active • Trigger: {currentBinder.passive.trigger}
                  </span>
                </div>

                {/* Hero Power */}
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 text-xs font-black text-indigo-300">
                        <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span>POWER: {currentBinder.heroPower.name}</span>
                      </div>
                      <span className="w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-xs font-black">
                        {currentBinder.heroPower.cost}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-snug">
                      {currentBinder.heroPower.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 mt-3 uppercase tracking-wider">
                    Activated in combat for {currentBinder.heroPower.cost} Mana
                  </span>
                </div>
              </div>

              {/* Unlock Requirement Card if Locked */}
              {!unlockedBinderIds.includes(currentBinder.id) && (
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-red-950/30 to-amber-950/30 border border-amber-500/40 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>Unlock Goal: {currentBinder.unlockRequirement.description}</span>
                    </span>
                    <span className="text-slate-300 font-mono">
                      {Math.min(getBinderProgress(currentBinder).current, currentBinder.unlockRequirement.target)} / {currentBinder.unlockRequirement.target}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round((getBinderProgress(currentBinder).current / currentBinder.unlockRequirement.target) * 100))}%`
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-400">
                    <span className="font-bold text-slate-300">Reward:</span> {currentBinder.unlockRequirement.reward}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              {unlockedBinderIds.includes(currentBinder.id) ? (
                <button
                  onClick={() => {
                    audio.playClick();
                    onSelectActiveBinder(currentBinder.id);
                  }}
                  disabled={activeBinderId === currentBinder.id}
                  className={`
                    px-6 py-3 rounded-2xl font-cinzel font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg
                    ${activeBinderId === currentBinder.id
                      ? 'bg-slate-800 text-slate-500 cursor-default border border-slate-700'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95'
                    }
                  `}
                >
                  <Check className="w-4 h-4" />
                  <span>{activeBinderId === currentBinder.id ? 'Currently Active Binder' : 'Set as Active Binder'}</span>
                </button>
              ) : getBinderProgress(currentBinder).isReady ? (
                <button
                  onClick={() => handleUnlockClick(currentBinder.id)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-cinzel font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-bounce"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claim & Unlock {currentBinder.name}!</span>
                </button>
              ) : (
                <div className="text-xs font-bold text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Complete the milestone above to recruit this Binder!</span>
                </div>
              )}

              <button
                onClick={() => {
                  audio.playClick();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
