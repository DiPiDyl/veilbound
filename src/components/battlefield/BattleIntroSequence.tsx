import React, { useEffect, useState } from 'react';
import { Binder } from '../../types/binder';
import { audio } from '../../services/audioService';
import { Sparkles, Swords, Zap, Shield, Flame, BookOpen, Skull, Compass, FastForward } from 'lucide-react';

interface BattleIntroSequenceProps {
  playerBinder: Binder;
  opponentBinder: Binder;
  battlefieldTheme: string;
  onIntroComplete: () => void;
}

export const BattleIntroSequence: React.FC<BattleIntroSequenceProps> = ({
  playerBinder,
  opponentBinder,
  battlefieldTheme,
  onIntroComplete
}) => {
  const [step, setStep] = useState<number>(1); // 1: Environment & Veil, 2: Binders entering, 3: Clash, 4: Done

  useEffect(() => {
    audio.playVeilShift();

    const t1 = setTimeout(() => {
      setStep(2);
      audio.playCardPlay();
    }, 1200);

    const t2 = setTimeout(() => {
      setStep(3);
      audio.playAttack();
    }, 2800);

    const t3 = setTimeout(() => {
      onIntroComplete();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onIntroComplete]);

  const getBinderThemeVisuals = (binderId: string) => {
    switch (binderId) {
      case 'kael-drake':
        return {
          icon: <Flame className="w-8 h-8 text-amber-500 animate-bounce" />,
          color: 'from-amber-600/40 via-red-900/30 to-slate-950',
          borderColor: 'border-amber-500',
          element: 'Molten Citadel Ember'
        };
      case 'mira-thorn':
        return {
          icon: <Sparkles className="w-8 h-8 text-emerald-400 animate-spin" />,
          color: 'from-emerald-600/40 via-teal-900/30 to-slate-950',
          borderColor: 'border-emerald-500',
          element: 'Viridian Spore Bloom'
        };
      case 'nox-revenant':
        return {
          icon: <Skull className="w-8 h-8 text-indigo-400 animate-pulse" />,
          color: 'from-purple-900/40 via-slate-900/30 to-slate-950',
          borderColor: 'border-purple-500',
          element: 'Umbral Spectral Mist'
        };
      case 'orin-vale':
        return {
          icon: <BookOpen className="w-8 h-8 text-amber-300 animate-spin" />,
          color: 'from-amber-700/40 via-yellow-950/30 to-slate-950',
          borderColor: 'border-amber-400',
          element: 'Chronocast Hourglass'
        };
      case 'seraphine-starforged':
        return {
          icon: <Zap className="w-8 h-8 text-sky-300 animate-bounce" />,
          color: 'from-sky-500/40 via-blue-950/30 to-slate-950',
          borderColor: 'border-sky-400',
          element: 'Celestial Starburst'
        };
      case 'lyra-voss':
      default:
        return {
          icon: <Compass className="w-8 h-8 text-cyan-400 animate-spin" />,
          color: 'from-cyan-600/40 via-indigo-950/30 to-slate-950',
          borderColor: 'border-cyan-400',
          element: 'Cosmic Veil Portal'
        };
    }
  };

  const playerVis = getBinderThemeVisuals(playerBinder.id);
  const oppVis = getBinderThemeVisuals(opponentBinder.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center overflow-hidden select-none animate-fadeIn">
      {/* Background ambient motion and energy ripples */}
      <div className="absolute inset-0 bg-radial from-slate-900/40 to-slate-950 pointer-events-none" />
      <div className="absolute -top-32 left-1/4 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 right-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Skip Button */}
      <button
        onClick={onIntroComplete}
        className="absolute top-6 right-6 z-50 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white hover:border-amber-400 transition-all shadow-lg"
      >
        <FastForward className="w-3.5 h-3.5 text-amber-400" /> Skip Intro
      </button>

      {/* Step 1: Veil Alignment Header */}
      {step === 1 && (
        <div className="flex flex-col items-center text-center gap-3 animate-scaleUp">
          <div className="px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Planar Threshold Opening
          </div>
          <h1 className="text-3xl lg:text-5xl font-cinzel font-black text-slate-100 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
            The Veil Converges
          </h1>
          <p className="text-slate-400 text-xs tracking-wider font-mono uppercase">
            Battlefield: {battlefieldTheme.replace('_', ' ').toUpperCase()}
          </p>
        </div>
      )}

      {/* Step 2: Binders Confrontation */}
      {step >= 2 && step < 4 && (
        <div className="w-full max-w-5xl px-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* Player Binder Card */}
          <div className={`flex-1 flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b ${playerVis.color} border-2 ${playerVis.borderColor} shadow-[0_0_35px_rgba(6,182,212,0.3)] animate-slideInLeft`}>
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-white/20 p-2 flex items-center justify-center shadow-xl relative overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent pointer-events-none" />
              {playerVis.icon}
            </div>
            <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest mb-1">
              Your Champion • {playerVis.element}
            </span>
            <h2 className="text-2xl font-cinzel font-black text-slate-100 mb-1">
              {playerBinder.name}
            </h2>
            <p className="text-xs text-slate-300 font-serif italic max-w-xs">
              "{playerBinder.quote || playerBinder.title}"
            </p>
          </div>

          {/* Central Clash / Versus Ring */}
          <div className="flex flex-col items-center justify-center my-4 animate-scaleUp">
            <div className={`w-16 h-16 rounded-full bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] ${step === 3 ? 'scale-125 transition-transform duration-300' : ''}`}>
              <Swords className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-black text-amber-300 tracking-widest mt-2">
              VERSUS
            </span>
          </div>

          {/* Opponent Binder Card */}
          <div className={`flex-1 flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b ${oppVis.color} border-2 ${oppVis.borderColor} shadow-[0_0_35px_rgba(168,85,247,0.3)] animate-slideInRight`}>
            <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-white/20 p-2 flex items-center justify-center shadow-xl relative overflow-hidden mb-4">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent pointer-events-none" />
              {oppVis.icon}
            </div>
            <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest mb-1">
              Opponent • {oppVis.element}
            </span>
            <h2 className="text-2xl font-cinzel font-black text-slate-100 mb-1">
              {opponentBinder.name}
            </h2>
            <p className="text-xs text-slate-300 font-serif italic max-w-xs">
              "{opponentBinder.quote || opponentBinder.title}"
            </p>
          </div>
        </div>
      )}

      {/* Energy Clash Ripple on Step 3 */}
      {step === 3 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full border-4 border-amber-400/80 animate-ping" />
        </div>
      )}
    </div>
  );
};
