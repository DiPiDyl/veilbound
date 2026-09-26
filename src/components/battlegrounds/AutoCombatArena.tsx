import React, { useState, useEffect, useRef } from 'react';
import { BGParticipant, BGUnit, BGTier } from '../../types/battlegrounds';
import { BGCombatSimulationResult, BGCombatStep, simulateAutoCombat } from '../../engine/battlegroundsEngine';
import { audio } from '../../services/audioService';
import { Swords, Shield, Heart, FastForward, Play, Pause, StepForward, ChevronRight, Award, Sparkles, Skull } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutoCombatArenaProps {
  roundNumber: number;
  player: BGParticipant;
  opponent: BGParticipant;
  onCombatComplete: (result: BGCombatSimulationResult) => void;
}

interface DamagePopup {
  id: string;
  side: 'player' | 'opponent';
  unitInstanceId: string;
  damage: number;
}

export const AutoCombatArena: React.FC<AutoCombatArenaProps> = ({
  roundNumber,
  player,
  opponent,
  onCombatComplete
}) => {
  // Pre-calculate full combat outcome
  const [simResult] = useState<BGCombatSimulationResult>(() =>
    simulateAutoCombat(player.board, opponent.board, Math.max(player.tier, opponent.tier) as BGTier)
  );

  // Live boards that evolve step-by-step
  const [livePlayerBoard, setLivePlayerBoard] = useState<BGUnit[]>(() =>
    player.board.map(u => ({ ...u }))
  );
  const [liveOpponentBoard, setLiveOpponentBoard] = useState<BGUnit[]>(() =>
    opponent.board.map(u => ({ ...u }))
  );

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [combatPhase, setCombatPhase] = useState<'idle' | 'targeting' | 'lunge' | 'impact'>('idle');
  const [activeAttacker, setActiveAttacker] = useState<{ side: 'player' | 'opponent'; index: number } | null>(null);
  const [activeDefender, setActiveDefender] = useState<{ side: 'player' | 'opponent'; index: number } | null>(null);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Step runner effect
  useEffect(() => {
    if (isFinished || isPaused) return;

    if (stepIndex >= simResult.steps.length) {
      setIsFinished(true);
      if (simResult.winner === 'player') {
        audio.playVictory();
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      } else if (simResult.winner === 'opponent') {
        audio.playDefeat();
      }
      return;
    }

    const currentStep = simResult.steps[stepIndex];
    if (!currentStep) return;

    // Phase 1: Targeting / Highlighting
    setCombatPhase('targeting');
    setActiveAttacker({ side: currentStep.attackerSide, index: currentStep.attackerIndex });
    setActiveDefender({ side: currentStep.defenderSide, index: currentStep.defenderIndex });

    // Phase 2: Lunge
    const lungeTimer = setTimeout(() => {
      setCombatPhase('lunge');
      audio.playAttack();

      // Phase 3: Impact & Damage Resolution
      const impactTimer = setTimeout(() => {
        setCombatPhase('impact');

        // Apply health updates to live boards
        if (currentStep.attackerSide === 'player') {
          // Player attacks Opponent
          setLiveOpponentBoard(prev => {
            const next = prev.map(u => ({ ...u }));
            const target = next[currentStep.defenderIndex];
            if (target) {
              target.health -= currentStep.damage;
            }
            return next;
          });

          // Retaliation to player unit
          setLivePlayerBoard(prev => {
            const next = prev.map(u => ({ ...u }));
            const att = next[currentStep.attackerIndex];
            const def = liveOpponentBoard[currentStep.defenderIndex];
            if (att && def) {
              att.health -= def.attack;
            }
            return next;
          });

          // Popups
          const popId = `pop-${Date.now()}`;
          const targetUnit = liveOpponentBoard[currentStep.defenderIndex];
          if (targetUnit) {
            setDamagePopups(p => [...p, {
              id: popId,
              side: 'opponent',
              unitInstanceId: targetUnit.instanceId,
              damage: currentStep.damage
            }]);
          }
        } else {
          // Opponent attacks Player
          setLivePlayerBoard(prev => {
            const next = prev.map(u => ({ ...u }));
            const target = next[currentStep.defenderIndex];
            if (target) {
              target.health -= currentStep.damage;
            }
            return next;
          });

          // Retaliation to opponent unit
          setLiveOpponentBoard(prev => {
            const next = prev.map(u => ({ ...u }));
            const att = next[currentStep.attackerIndex];
            const def = livePlayerBoard[currentStep.defenderIndex];
            if (att && def) {
              att.health -= def.attack;
            }
            return next;
          });

          // Popups
          const popId = `pop-${Date.now()}`;
          const targetUnit = livePlayerBoard[currentStep.defenderIndex];
          if (targetUnit) {
            setDamagePopups(p => [...p, {
              id: popId,
              side: 'player',
              unitInstanceId: targetUnit.instanceId,
              damage: currentStep.damage
            }]);
          }
        }

        // Clean up popups after 600ms & filter out dead units
        const cleanupTimer = setTimeout(() => {
          setDamagePopups([]);
          setLivePlayerBoard(prev => prev.filter(u => u.health > 0));
          setLiveOpponentBoard(prev => prev.filter(u => u.health > 0));
          setCombatPhase('idle');
          setActiveAttacker(null);
          setActiveDefender(null);
          setStepIndex(idx => idx + 1);
        }, playbackSpeed * 0.4);

        return () => clearTimeout(cleanupTimer);
      }, playbackSpeed * 0.35);

      return () => clearTimeout(impactTimer);
    }, playbackSpeed * 0.25);

    return () => clearTimeout(lungeTimer);
  }, [stepIndex, isFinished, isPaused, playbackSpeed, simResult]);

  const handleSkipToEnd = () => {
    audio.playClick();
    setLivePlayerBoard(simResult.playerBoardEnd);
    setLiveOpponentBoard(simResult.opponentBoardEnd);
    setStepIndex(simResult.steps.length);
    setIsFinished(true);
    if (simResult.winner === 'player') {
      audio.playVictory();
    } else if (simResult.winner === 'opponent') {
      audio.playDefeat();
    }
  };

  const handleNextStep = () => {
    audio.playClick();
    setIsPaused(true);
    if (stepIndex < simResult.steps.length) {
      setStepIndex(idx => idx + 1);
    }
  };

  const currentStep = simResult.steps[stepIndex];

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 text-slate-100 relative">
      {/* Ambient combat glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-red-950/20 to-transparent pointer-events-none" />

      {/* Top Header: Opponent Status & Battle Controls */}
      <div className="relative z-10 flex items-center justify-between p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        {/* Opponent Info */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            style={{ backgroundColor: opponent.binder.visualTheme.primaryColor }}
          >
            {opponent.binder.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-black text-sm text-slate-100">{opponent.name}</span>
              <span className="text-[10px] font-bold uppercase bg-red-950 text-red-300 px-2 py-0.5 rounded-full border border-red-800/40">
                Tier {opponent.tier}
              </span>
            </div>
            <div className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>{opponent.health} HP</span>
              <span className="text-slate-500 text-[11px] ml-1">({liveOpponentBoard.length} units remaining)</span>
            </div>
          </div>
        </div>

        {/* Center: Live Action Banner */}
        <div className="flex flex-col items-center max-w-md text-center">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <Swords className="w-4 h-4 animate-bounce" />
            <span>Round {roundNumber} Clash — Step {Math.min(stepIndex + 1, simResult.steps.length)} / {simResult.steps.length}</span>
          </div>
          <p className="text-xs font-mono text-slate-200 truncate mt-0.5 max-w-sm">
            {currentStep ? currentStep.message : isFinished ? 'Combat clash resolved!' : 'Armies marching into arena...'}
          </p>
        </div>

        {/* Playback & Speed Controls */}
        <div className="flex items-center gap-2">
          {/* Pause / Resume */}
          <button
            onClick={() => {
              audio.playClick();
              setIsPaused(p => !p);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all shadow"
            title={isPaused ? 'Resume Combat' : 'Pause Combat'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Step Forward */}
          <button
            onClick={handleNextStep}
            disabled={isFinished}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-all shadow"
            title="Step Forward"
          >
            <StepForward className="w-4 h-4 text-sky-400" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => {
              audio.playClick();
              setPlaybackSpeed(p => p === 1000 ? 450 : 1000);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 transition-all shadow"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>{playbackSpeed === 450 ? '2x Speed' : '1x Speed'}</span>
          </button>

          {/* Skip Combat */}
          {!isFinished && (
            <button
              onClick={handleSkipToEnd}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 border border-indigo-400/40 text-xs font-black text-white shadow-md transition-all hover:scale-105 active:scale-95"
            >
              Skip Combat
            </button>
          )}
        </div>
      </div>

      {/* CENTER CLASH FIELD */}
      <div className="relative z-10 flex-1 flex flex-col justify-around py-2">
        {/* OPPONENT WARBAND ROW (TOP) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-1.5 text-[11px] font-black uppercase tracking-widest text-red-400/80">
            <span>Enemy Warband</span>
            <span className="text-slate-500 font-mono">({liveOpponentBoard.length}/7)</span>
          </div>

          <div className="flex items-center justify-center gap-3 min-h-[140px] w-full max-w-5xl px-4">
            {liveOpponentBoard.length === 0 ? (
              <div className="text-xs text-slate-500 italic flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-rose-500" />
                <span>All enemy units defeated!</span>
              </div>
            ) : (
              liveOpponentBoard.map((unit, idx) => {
                const isAttacker = activeAttacker?.side === 'opponent' && activeAttacker?.index === idx;
                const isTarget = activeDefender?.side === 'opponent' && activeDefender?.index === idx;

                return (
                  <div
                    key={unit.instanceId}
                    className={`
                      relative w-32 bg-slate-900/95 rounded-2xl border-2 p-2.5 flex flex-col justify-between shadow-2xl
                      transition-all duration-300 transform select-none
                      ${isAttacker && combatPhase === 'lunge' ? 'translate-y-6 scale-110 z-20 shadow-[0_0_25px_rgba(239,68,68,0.8)] border-red-400' : ''}
                      ${isAttacker && combatPhase === 'targeting' ? 'ring-4 ring-amber-400 scale-105 z-10 border-amber-400' : ''}
                      ${isTarget && combatPhase === 'impact' ? 'animate-bounce border-red-500 bg-red-950/40 scale-95' : ''}
                      ${isTarget && combatPhase !== 'impact' ? 'ring-4 ring-red-500 border-red-400 animate-pulse' : ''}
                      ${!isAttacker && !isTarget ? 'border-red-900/50 hover:border-red-500/60' : ''}
                    `}
                  >
                    {/* Position Slot Marker */}
                    <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-950 border border-red-500/60 text-[10px] font-black text-red-300 flex items-center justify-center">
                      {idx + 1}
                    </div>

                    {/* Unit Header */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                      <span className="text-base">{unit.icon}</span>
                      <span className="truncate max-w-[70px] text-slate-400">{unit.faction}</span>
                    </div>

                    {/* Unit Name */}
                    <div className="font-cinzel font-black text-xs text-slate-100 truncate my-1">
                      {unit.name}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-1 mb-1">
                      {unit.hasTaunt && (
                        <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40">
                          Taunt
                        </span>
                      )}
                      {unit.hasDivineShield && (
                        <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded border border-sky-500/40">
                          Shield
                        </span>
                      )}
                      {unit.hasReborn && (
                        <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/40">
                          Reborn
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-black">
                      <span className="text-amber-400 flex items-center gap-0.5">
                        ⚔️ {unit.attack}
                      </span>
                      <span className="text-rose-400 flex items-center gap-0.5">
                        ❤️ {unit.health}
                      </span>
                    </div>

                    {/* Floating Damage Popup */}
                    {damagePopups.filter(p => p.unitInstanceId === unit.instanceId).map(p => (
                      <div
                        key={p.id}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-xl text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-bounce z-30 pointer-events-none"
                      >
                        -{p.damage}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER CLASH DIVIDER WITH ANIMATED ARROW */}
        <div className="relative flex items-center justify-center my-2">
          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent w-full max-w-2xl" />

          {/* Clash Badge */}
          <div className="relative px-5 py-1.5 rounded-full bg-slate-900 border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] text-amber-300 text-xs font-black tracking-widest mx-4 flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" />
            <span>VS</span>
            <Swords className="w-4 h-4 text-amber-400 rotate-180" />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent w-full max-w-2xl" />
        </div>

        {/* PLAYER WARBAND ROW (BOTTOM) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 min-h-[140px] w-full max-w-5xl px-4">
            {livePlayerBoard.length === 0 ? (
              <div className="text-xs text-slate-500 italic flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-rose-500" />
                <span>Your warband has fallen!</span>
              </div>
            ) : (
              livePlayerBoard.map((unit, idx) => {
                const isAttacker = activeAttacker?.side === 'player' && activeAttacker?.index === idx;
                const isTarget = activeDefender?.side === 'player' && activeDefender?.index === idx;

                return (
                  <div
                    key={unit.instanceId}
                    className={`
                      relative w-32 bg-slate-900/95 rounded-2xl border-2 p-2.5 flex flex-col justify-between shadow-2xl
                      transition-all duration-300 transform select-none
                      ${isAttacker && combatPhase === 'lunge' ? '-translate-y-6 scale-110 z-20 shadow-[0_0_25px_rgba(99,102,241,0.8)] border-indigo-400' : ''}
                      ${isAttacker && combatPhase === 'targeting' ? 'ring-4 ring-amber-400 scale-105 z-10 border-amber-400' : ''}
                      ${isTarget && combatPhase === 'impact' ? 'animate-bounce border-red-500 bg-red-950/40 scale-95' : ''}
                      ${isTarget && combatPhase !== 'impact' ? 'ring-4 ring-red-500 border-red-400 animate-pulse' : ''}
                      ${!isAttacker && !isTarget ? 'border-indigo-900/60 hover:border-indigo-500/80' : ''}
                    `}
                  >
                    {/* Position Slot Marker */}
                    <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-slate-950 border border-indigo-500 text-[10px] font-black text-indigo-300 flex items-center justify-center">
                      {idx + 1}
                    </div>

                    {/* Unit Header */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                      <span className="text-base">{unit.icon}</span>
                      <span className="truncate max-w-[70px] text-slate-400">{unit.faction}</span>
                    </div>

                    {/* Unit Name */}
                    <div className="font-cinzel font-black text-xs text-slate-100 truncate my-1">
                      {unit.name}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-1 mb-1">
                      {unit.hasTaunt && (
                        <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40">
                          Taunt
                        </span>
                      )}
                      {unit.hasDivineShield && (
                        <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 px-1 py-0.2 rounded border border-sky-500/40">
                          Shield
                        </span>
                      )}
                      {unit.hasReborn && (
                        <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded border border-emerald-500/40">
                          Reborn
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between py-1 px-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-black">
                      <span className="text-amber-400 flex items-center gap-0.5">
                        ⚔️ {unit.attack}
                      </span>
                      <span className="text-rose-400 flex items-center gap-0.5">
                        ❤️ {unit.health}
                      </span>
                    </div>

                    {/* Floating Damage Popup */}
                    {damagePopups.filter(p => p.unitInstanceId === unit.instanceId).map(p => (
                      <div
                        key={p.id}
                        className="absolute -top-6 left-1/2 -translate-x-1/2 font-black text-xl text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.9)] animate-bounce z-30 pointer-events-none"
                      >
                        -{p.damage}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] font-black uppercase tracking-widest text-indigo-400/80">
            <span>Your Warband</span>
            <span className="text-slate-500 font-mono">({livePlayerBoard.length}/7)</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Player Health & Details */}
      <div className="relative z-10 flex items-center justify-between p-3 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-indigo-400 flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ backgroundColor: player.binder.visualTheme.primaryColor }}
          >
            {player.binder.name[0]}
          </div>
          <div>
            <div className="font-cinzel font-black text-xs text-slate-100">{player.name}</div>
            <div className="text-xs text-rose-400 font-bold flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>{player.health} HP</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
          <span>Tavern Tier {player.tier}</span>
          <span>•</span>
          <span className="text-amber-400">{player.shards} Shards</span>
        </div>
      </div>

      {/* ROUND FINISHED MODAL OVERLAY */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center animate-fadeIn">
          <div className="w-[440px] p-8 rounded-3xl bg-slate-900 border-2 border-amber-500/60 text-center flex flex-col items-center gap-5 shadow-2xl">
            <div className={`text-4xl font-cinzel font-black tracking-wider ${
              simResult.winner === 'player' ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]' : simResult.winner === 'opponent' ? 'text-red-500' : 'text-slate-300'
            }`}>
              {simResult.winner === 'player' ? 'ROUND VICTORY!' : simResult.winner === 'opponent' ? 'ROUND DEFEAT!' : 'ROUND DRAW!'}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
              {simResult.winner === 'player'
                ? `Your forces shattered ${opponent.name}'s warband! Inflicted ${simResult.damageDealt} damage to their Binder!`
                : simResult.winner === 'opponent'
                ? `${opponent.name}'s warband breached your defenses! You suffered ${simResult.damageDealt} damage!`
                : 'Both warbands annihilated each other in a fierce mutual draw.'}
            </p>

            <button
              onClick={() => {
                audio.playClick();
                onCombatComplete(simResult);
              }}
              className="mt-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
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
