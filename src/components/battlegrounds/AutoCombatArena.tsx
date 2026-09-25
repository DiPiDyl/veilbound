import React, { useState, useEffect } from 'react';
import { BGParticipant, BGUnit, BGTier } from '../../types/battlegrounds';
import { BGCombatSimulationResult, simulateAutoCombat } from '../../engine/battlegroundsEngine';
import { audio } from '../../services/audioService';
import { Swords, Shield, Heart, FastForward, Play, ChevronRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutoCombatArenaProps {
  roundNumber: number;
  player: BGParticipant;
  opponent: BGParticipant;
  onCombatComplete: (result: BGCombatSimulationResult) => void;
}

export const AutoCombatArena: React.FC<AutoCombatArenaProps> = ({
  roundNumber,
  player,
  opponent,
  onCombatComplete
}) => {
  const [simResult, setSimResult] = useState<BGCombatSimulationResult>(() => 
    simulateAutoCombat(player.board, opponent.board, Math.max(player.tier, opponent.tier) as BGTier)
  );

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(850); // ms per step

  // Auto-step through the combat simulation
  useEffect(() => {
    if (isFinished) return;

    if (currentStepIndex < simResult.steps.length) {
      const timer = setTimeout(() => {
        const step = simResult.steps[currentStepIndex];
        audio.playAttack();
        setCurrentStepIndex(prev => prev + 1);
      }, playbackSpeed);

      return () => clearTimeout(timer);
    } else {
      // Completed all steps
      setIsFinished(true);
      if (simResult.winner === 'player') {
        audio.playVictory();
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      } else if (simResult.winner === 'opponent') {
        audio.playDefeat();
      }
    }
  }, [currentStepIndex, isFinished, simResult, playbackSpeed]);

  const handleSkipToEnd = () => {
    audio.playClick();
    setCurrentStepIndex(simResult.steps.length);
    setIsFinished(true);
    if (simResult.winner === 'player') {
      audio.playVictory();
    } else if (simResult.winner === 'opponent') {
      audio.playDefeat();
    }
  };

  const currentStep = simResult.steps[currentStepIndex - 1];

  return (
    <div className="flex-1 flex flex-col justify-between p-6 overflow-hidden select-none bg-gradient-to-b from-slate-950 via-purple-950/60 to-slate-950 text-slate-100 relative">
      {/* Ambient combat glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-red-900/10 to-transparent pointer-events-none" />

      {/* Top Bar: Opponent Info & Controls */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center font-bold text-white shadow-lg"
            style={{ backgroundColor: opponent.binder.visualTheme.primaryColor }}
          >
            {opponent.binder.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">{opponent.name}</span>
              <span className="text-[10px] font-bold uppercase bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800/40">
                Tier {opponent.tier}
              </span>
            </div>
            <div className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>{opponent.health} HP</span>
            </div>
          </div>
        </div>

        {/* Center: Clash Step Banner */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Round {roundNumber} Auto-Clash
          </span>
          <span className="text-[11px] font-mono text-slate-300">
            {currentStep ? currentStep.message : 'Armies advancing into battle...'}
          </span>
        </div>

        {/* Speed & Skip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaybackSpeed(prev => prev === 850 ? 350 : 850)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>{playbackSpeed === 350 ? '2x Speed' : '1x Speed'}</span>
          </button>

          {!isFinished && (
            <button
              onClick={handleSkipToEnd}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-xs font-bold text-indigo-200"
            >
              Skip Combat
            </button>
          )}
        </div>
      </div>

      {/* CENTER BATTLEFIELD: OPPONENT BOARD ON TOP */}
      <div className="relative z-10 flex-1 flex flex-col justify-around py-4">
        {/* Opponent Units Row */}
        <div className="flex items-center justify-center gap-3 min-h-[130px]">
          {opponent.board.length === 0 ? (
            <div className="text-xs text-slate-500 italic">Opponent has no combat units.</div>
          ) : (
            opponent.board.map((u, idx) => (
              <div
                key={u.instanceId}
                className="w-32 bg-slate-900/90 rounded-xl border-2 border-red-500/60 p-2.5 flex flex-col justify-between shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>{u.icon}</span>
                  <span className="truncate max-w-[70px]">{u.faction}</span>
                </div>
                <div className="font-bold text-xs text-slate-100 truncate mb-1">{u.name}</div>
                <div className="flex items-center justify-between py-0.5 border-y border-slate-800 text-xs font-bold">
                  <span className="text-amber-400">⚔️ {u.attack}</span>
                  <span className="text-rose-400">❤️ {u.health}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Center Clash Line Indicator */}
        <div className="flex items-center justify-center my-2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent w-full max-w-xl" />
          <div className="px-4 py-1 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-black mx-2">
            VS
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent w-full max-w-xl" />
        </div>

        {/* Player Units Row */}
        <div className="flex items-center justify-center gap-3 min-h-[130px]">
          {player.board.length === 0 ? (
            <div className="text-xs text-slate-500 italic">Your battlefield is empty.</div>
          ) : (
            player.board.map((u, idx) => (
              <div
                key={u.instanceId}
                className="w-32 bg-slate-900/90 rounded-xl border-2 border-indigo-500/80 p-2.5 flex flex-col justify-between shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                  <span>{u.icon}</span>
                  <span className="truncate max-w-[70px]">{u.faction}</span>
                </div>
                <div className="font-bold text-xs text-slate-100 truncate mb-1">{u.name}</div>
                <div className="flex items-center justify-between py-0.5 border-y border-slate-800 text-xs font-bold">
                  <span className="text-amber-400">⚔️ {u.attack}</span>
                  <span className="text-rose-400">❤️ {u.health}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ROUND FINISHED MODAL OVERLAY */}
      {isFinished && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fadeIn">
          <div className="w-[420px] p-6 rounded-2xl bg-slate-900 border-2 border-amber-500/50 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className={`text-4xl font-cinzel font-black tracking-wider ${
              simResult.winner === 'player' ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]' : simResult.winner === 'opponent' ? 'text-red-500' : 'text-slate-300'
            }`}>
              {simResult.winner === 'player' ? 'ROUND VICTORY!' : simResult.winner === 'opponent' ? 'ROUND DEFEAT!' : 'ROUND DRAW!'}
            </div>

            <p className="text-xs text-slate-300 max-w-xs">
              {simResult.winner === 'player'
                ? `Your forces shattered ${opponent.name}'s army! Dealing ${simResult.damageDealt} damage to their Binder!`
                : simResult.winner === 'opponent'
                ? `${opponent.name}'s army overpowered your defenses. You took ${simResult.damageDealt} damage!`
                : 'Both armies obliterated each other in a mutual draw.'}
            </p>

            <button
              onClick={() => {
                audio.playButtonClick();
                onCombatComplete(simResult);
              }}
              className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Continue to Next Round</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
