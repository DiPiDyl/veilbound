import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MatchState } from '../../types/gameState';
import { BoardMinionView } from './BoardMinionView';
import { CardHand } from './CardHand';
import { AttackTargetingArrow } from './AttackTargetingArrow';
import { CombatAnimationOverlay, CombatAnimationEvent } from './CombatAnimationOverlay';
import { VeilIndicator } from './VeilIndicator';
import { EchoPoolView } from './EchoPoolView';
import { DestinyTrackView } from './DestinyTrackView';
import { BattlefieldParticles } from './BattlefieldParticles';
import { LivingAvatar } from './LivingAvatar';
import { TurnTimer } from './TurnTimer';
import { BattleIntroSequence } from './BattleIntroSequence';
import { 
  playCardFromHand, 
  attackWithMinion, 
  activateHeroPower, 
  endCurrentTurn 
} from '../../engine/gameEngine';
import { 
  getNextAIAction, 
  executeSingleAIAction 
} from '../../engine/aiDecisionEngine';
import { aiDebugManager } from '../../engine/aiDebugInspector';
import { AIDebugModal } from './AIDebugModal';
import { shiftVeilTo } from '../../engine/veilEngine';
import { getBattlefieldById } from '../../data/battlefields';
import { audio } from '../../services/audioService';
import { 
  Shield, Sword, Heart, Sparkles, ChevronRight, RotateCcw, 
  Clock, Scroll, Award, ArrowRight, Zap, Bug, Minimize2, LogOut
} from 'lucide-react';

interface GameBoardProps {
  initialState: MatchState;
  onMatchEnd: (won: boolean, matchState: MatchState) => void;
  onExit: () => void;
  onMinimize?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ 
  initialState, 
  onMatchEnd, 
  onExit,
  onMinimize 
}) => {
  const [matchState, setMatchState] = useState<MatchState>(initialState);
  const [isIntroActive, setIsIntroActive] = useState<boolean>(!initialState.isSandboxMode);
  const [selectedMinionId, setSelectedMinionId] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showCombatLogs, setShowCombatLogs] = useState(false);
  const [showAIDebug, setShowAIDebug] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null);
  const [damageFlashTarget, setDamageFlashTarget] = useState<'player' | 'opponent' | null>(null);

  // Active combat animation event
  const [combatAnimation, setCombatAnimation] = useState<CombatAnimationEvent | null>(null);

  // Aiming state for attacking with minions
  const [aimingState, setAimingState] = useState<{
    attackerId: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    hoveredTarget: { type: 'minion' | 'hero'; id?: string } | null;
  } | null>(null);

  const bfTheme = getBattlefieldById(matchState.battlefieldTheme);

  // Match state ref for asynchronous loops without stale closures
  const matchStateRef = useRef<MatchState>(matchState);
  matchStateRef.current = matchState;

  const isAIRunningRef = useRef<boolean>(false);
  const aiTimeoutRef = useRef<any>(null);

  // Trigger Victory confetti
  useEffect(() => {
    if (matchState.phase === 'game_over' && matchState.winner === 'player') {
      audio.playVictory();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else if (matchState.phase === 'game_over' && matchState.winner === 'opponent') {
      audio.playDefeat();
    }
  }, [matchState.phase, matchState.winner]);

  // Dedicated, resilient AI decision and execution loop
  useEffect(() => {
    // If not opponent's turn or game over, abort AI runner
    if (matchState.phase !== 'playing' || matchState.activePlayer !== 'opponent') {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
      isAIRunningRef.current = false;
      setIsAIProcessing(false);
      setAiActionMessage(null);
      return;
    }

    // Wait until intro is done before AI starts taking actions
    if (isIntroActive) return;

    if (isAIRunningRef.current) return;
    isAIRunningRef.current = true;
    setIsAIProcessing(true);

    const executeAIStep = () => {
      const current = matchStateRef.current;
      if (current.phase === 'game_over' || current.activePlayer !== 'opponent') {
        isAIRunningRef.current = false;
        setIsAIProcessing(false);
        setAiActionMessage(null);
        return;
      }

      // Re-evaluate game state dynamically
      const { action, candidates } = getNextAIAction(current, 'Tactician');
      aiDebugManager.recordDecision(current.turnNumber, action, candidates);
      setAiActionMessage(action.actionSummary);

      // Audio & visual cues per action
      if (action.type === 'PLAY_CARD') {
        audio.playCardPlay();
      } else if (action.type === 'ATTACK_HERO') {
        audio.playAttack();
        setDamageFlashTarget('player');
        setTimeout(() => setDamageFlashTarget(null), 500);

        // Find attacker minion for visual animation
        const attackerMinion = current.opponent.board.find(m => m.instanceId === action.attackerInstanceId);
        if (attackerMinion) {
          setCombatAnimation({
            id: `anim-${Date.now()}`,
            sourceX: window.innerWidth / 2,
            sourceY: 180,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight - 100,
            damage: attackerMinion.currentAttack,
            archetype: 'Melee'
          });
        }
      } else if (action.type === 'ATTACK_MINION') {
        audio.playAttack();
      }

      const nextState = executeSingleAIAction(current, action);
      setMatchState(nextState);

      if (action.type === 'END_TURN' || nextState.activePlayer !== 'opponent' || nextState.phase === 'game_over') {
        isAIRunningRef.current = false;
        setIsAIProcessing(false);
        setAiActionMessage(null);
      } else {
        // Schedule next atomic action after 750ms so player can easily follow the sequence
        aiTimeoutRef.current = setTimeout(executeAIStep, 750);
      }
    };

    aiTimeoutRef.current = setTimeout(executeAIStep, 650);

    return () => {
      // Do not clear on simple re-renders while AI turn is running
    };
  }, [matchState.activePlayer, matchState.phase, isIntroActive]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, []);

  // End Turn handler
  const handleEndTurn = useCallback(() => {
    if (matchStateRef.current.activePlayer !== 'player' || matchStateRef.current.phase !== 'playing') return;
    audio.playClick();
    setSelectedMinionId(null);
    setSelectedCardIndex(null);
    setAimingState(null);
    const updated = endCurrentTurn(matchStateRef.current);
    setMatchState(updated);
  }, []);

  // Turn Timeout auto-handler
  const handleTimeout = useCallback(() => {
    if (matchStateRef.current.phase !== 'playing') return;
    if (matchStateRef.current.activePlayer === 'player') {
      handleEndTurn();
    } else if (matchStateRef.current.activePlayer === 'opponent') {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      isAIRunningRef.current = false;
      setIsAIProcessing(false);
      setAiActionMessage(null);
      setMatchState((current) => endCurrentTurn(current));
    }
  }, [handleEndTurn]);

  // Play card from hand (Supports drag-to-play & click-to-play)
  const handlePlayCard = (index: number, targetMinionId?: string) => {
    if (matchState.activePlayer !== 'player' || matchState.phase !== 'playing') return;

    const card = matchState.player.hand[index];
    if (!card) return;

    if (card.cost > matchState.player.currentMana) {
      audio.playClick();
      return;
    }

    audio.playCardPlay();
    const updated = playCardFromHand(matchState, index, targetMinionId);
    setMatchState(updated);
    setSelectedCardIndex(null);
  };

  // Minion Attack selection & aiming arrow handlers
  const handleMinionMouseDown = (minionId: string, e: React.MouseEvent) => {
    if (matchState.activePlayer !== 'player' || matchState.phase !== 'playing') return;

    const minion = matchState.player.board.find((m) => m.instanceId === minionId);
    if (minion && minion.canAttack && minion.currentAttack > 0) {
      setSelectedMinionId(minionId);
      setAimingState({
        attackerId: minionId,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        hoveredTarget: null
      });
    }
  };

  // Global mousemove while aiming an attack
  useEffect(() => {
    if (!aimingState) return;

    const handleMouseMove = (e: MouseEvent) => {
      setAimingState(prev => prev ? {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY
      } : null);
    };

    const handleMouseUp = () => {
      if (!aimingState) return;

      const target = aimingState.hoveredTarget;
      if (target) {
        if (target.type === 'hero') {
          handleExecuteAttack(aimingState.attackerId, 'hero');
        } else if (target.type === 'minion' && target.id) {
          handleExecuteAttack(aimingState.attackerId, 'minion', target.id);
        }
      }

      setAimingState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [aimingState]);

  // Execute minion attack with animation
  const handleExecuteAttack = (attackerId: string, targetType: 'hero' | 'minion', targetMinionId?: string) => {
    const attacker = matchState.player.board.find(m => m.instanceId === attackerId);
    if (!attacker) return;

    audio.playAttack();

    // Spawn combat animation
    setCombatAnimation({
      id: `anim-${Date.now()}`,
      sourceX: window.innerWidth / 2,
      sourceY: window.innerHeight - 240,
      targetX: window.innerWidth / 2,
      targetY: targetType === 'hero' ? 100 : 250,
      damage: attacker.currentAttack,
      archetype: 'Melee'
    });

    if (targetType === 'hero') {
      setDamageFlashTarget('opponent');
      setTimeout(() => setDamageFlashTarget(null), 500);
      const updated = attackWithMinion(matchState, attackerId, 'hero');
      setMatchState(updated);
    } else if (targetMinionId) {
      const updated = attackWithMinion(matchState, attackerId, 'minion', targetMinionId);
      setMatchState(updated);
    }

    setSelectedMinionId(null);
  };

  // Player Hero Power
  const handleHeroPower = () => {
    if (matchState.activePlayer !== 'player' || matchState.phase !== 'playing') return;
    if (matchState.player.currentMana >= matchState.player.binder.heroPower.cost && !matchState.player.heroPowerUsedThisTurn) {
      audio.playClick();
      const updated = activateHeroPower(matchState);
      setMatchState(updated);
    }
  };

  // Manual Veil Shift in Sandbox mode
  const handleVeilShiftClick = () => {
    if (matchState.isSandboxMode) {
      setMatchState((prev) => ({
        ...prev,
        veilState: shiftVeilTo(prev.veilState)
      }));
    }
  };

  const enemyTaunts = matchState.opponent.board.filter(m => m.card.keywords?.includes('Taunt'));
  const hasEnemyTaunt = enemyTaunts.length > 0;

  return (
    <div className={`relative w-full h-screen bg-gradient-to-b ${bfTheme.bgGradient} flex flex-col justify-between overflow-hidden select-none`}>
      {/* Cinematic Battle Intro Sequence */}
      {isIntroActive && (
        <BattleIntroSequence
          playerBinder={matchState.player.binder}
          opponentBinder={matchState.opponent.binder}
          battlefieldTheme={matchState.battlefieldTheme}
          onIntroComplete={() => setIsIntroActive(false)}
        />
      )}

      {/* Dynamic Background Particle System */}
      <BattlefieldParticles veilState={matchState.veilState} />

      {/* Combat Animation Overlay (Strikes, Spells, Damage numbers) */}
      <CombatAnimationOverlay
        activeAnimation={combatAnimation}
        onAnimationComplete={() => setCombatAnimation(null)}
      />

      {/* Attack Targeting Arrow */}
      {aimingState && (
        <AttackTargetingArrow
          startX={aimingState.startX}
          startY={aimingState.startY}
          currentX={aimingState.currentX}
          currentY={aimingState.currentY}
          isOverValidTarget={aimingState.hoveredTarget !== null}
        />
      )}

      {/* TOP BAR: Opponent Info, Active Events, Minimize & Settings */}
      <div className="relative z-10 flex items-center justify-between px-6 py-2 bg-slate-950/80 border-b border-white/10 backdrop-blur-md">
        {/* Opponent Living Avatar */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onMouseEnter={() => {
            if (aimingState && !hasEnemyTaunt) {
              setAimingState(prev => prev ? { ...prev, hoveredTarget: { type: 'hero' } } : null);
            }
          }}
          onMouseLeave={() => {
            if (aimingState?.hoveredTarget?.type === 'hero') {
              setAimingState(prev => prev ? { ...prev, hoveredTarget: null } : null);
            }
          }}
          onClick={() => {
            if (selectedMinionId && !hasEnemyTaunt) {
              handleExecuteAttack(selectedMinionId, 'hero');
            }
          }}
        >
          <LivingAvatar
            binder={matchState.opponent.binder}
            health={matchState.opponent.health}
            maxHealth={matchState.opponent.maxHealth}
            armor={matchState.opponent.armor}
            isEnemy={true}
            isActiveTurn={matchState.activePlayer === 'opponent'}
            isTakingDamage={damageFlashTarget === 'opponent'}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-sm text-slate-100">{matchState.opponent.binder.name}</span>
              <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                Opponent (AI)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{matchState.opponent.hand.length} Cards in Hand • {matchState.opponent.deck.length} in Deck</span>
          </div>
        </div>

        {/* Center: Live 45-Second Turn Timer */}
        <div className="flex flex-col items-center">
          <TurnTimer
            turnNumber={matchState.turnNumber}
            activePlayer={matchState.activePlayer}
            durationSeconds={45}
            onTimeout={handleTimeout}
            isPaused={matchState.phase === 'game_over' || isIntroActive}
          />
          {isAIProcessing && aiActionMessage && (
            <span className="text-[11px] font-mono text-purple-300 animate-pulse mt-0.5">
              🤖 {aiActionMessage}
            </span>
          )}
        </div>

        {/* Right: Controls & Navigation */}
        <div className="flex items-center gap-2">
          {onMinimize && (
            <button
              onClick={() => {
                audio.playClick();
                onMinimize();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105 border border-amber-500/30"
              title="Pause and view menu without forfeiting"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          )}

          <button
            onClick={() => {
              audio.playClick();
              setShowCombatLogs(!showCombatLogs);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300"
            title="Toggle Battle Logs"
          >
            <Scroll className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              audio.playClick();
              setShowAIDebug(true);
            }}
            className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/40 hover:bg-purple-900/60 text-purple-300 text-xs font-mono font-bold flex items-center gap-1"
            title="Inspect AI Decision Weights"
          >
            <Bug className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Inspector</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Forfeit and exit this match?')) {
                audio.playClick();
                onExit();
              }
            }}
            className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 text-red-300"
            title="Forfeit Match"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BATTLEFIELD MIDGROUND (The Boards & Veil Core) */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-4 max-w-6xl mx-auto w-full">
        {/* ENEMY BOARD ROW */}
        <div className="flex justify-center items-center gap-3 min-h-[135px] border-b border-white/5 py-1">
          {matchState.opponent.board.length === 0 ? (
            <div className="text-xs text-slate-500 italic">Enemy battlefield is empty.</div>
          ) : (
            matchState.opponent.board.map((minion) => {
              const isTaunt = minion.card.keywords?.includes('Taunt');
              const isValidTarget = !hasEnemyTaunt || isTaunt;

              return (
                <div
                  key={minion.instanceId}
                  onMouseEnter={() => {
                    if (aimingState && isValidTarget) {
                      setAimingState(prev => prev ? { ...prev, hoveredTarget: { type: 'minion', id: minion.instanceId } } : null);
                    }
                  }}
                  onMouseLeave={() => {
                    if (aimingState?.hoveredTarget?.id === minion.instanceId) {
                      setAimingState(prev => prev ? { ...prev, hoveredTarget: null } : null);
                    }
                  }}
                  onClick={() => {
                    if (selectedMinionId && isValidTarget) {
                      handleExecuteAttack(selectedMinionId, 'minion', minion.instanceId);
                    }
                  }}
                  className={`transition-transform ${isTaunt ? 'ring-2 ring-amber-400 rounded-xl' : ''}`}
                >
                  <BoardMinionView
                    minion={minion}
                    isFriendly={false}
                    isSelected={false}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* CENTER DIVIDER: Veil Core Indicator & Turn Button */}
        <div className="flex items-center justify-between px-8 py-2 relative">
          {/* Active Global Event Badge */}
          <div className="flex items-center gap-2">
            {matchState.activeEvents.map((ev) => (
              <div
                key={ev.instanceId}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/50 text-xs text-pink-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span className="font-semibold">{ev.card.name}</span>
                <span className="text-[10px] font-mono text-pink-300">({ev.remainingTurns} turns)</span>
              </div>
            ))}
          </div>

          {/* Central Veil Dial */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            <VeilIndicator
              currentState={matchState.veilState}
              onShiftRequest={matchState.isSandboxMode ? handleVeilShiftClick : undefined}
            />
          </div>

          {/* End Turn Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleEndTurn}
              disabled={matchState.activePlayer !== 'player' || matchState.phase !== 'playing'}
              className={`
                px-6 py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-widest
                flex items-center gap-2 transition-all duration-200 shadow-xl
                ${
                  matchState.activePlayer === 'player'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105 active:scale-95'
                    : 'bg-slate-900 border border-slate-700 text-slate-500 cursor-not-allowed opacity-60'
                }
              `}
            >
              <span>{matchState.activePlayer === 'player' ? 'End Turn' : 'Enemy Turn...'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PLAYER BOARD ROW */}
        <div className="flex justify-center items-center gap-3 min-h-[135px] border-t border-white/5 py-1">
          {matchState.player.board.length === 0 ? (
            <div className="text-xs text-slate-500 italic">Your battlefield is empty. Drag minions from hand onto the board!</div>
          ) : (
            matchState.player.board.map((minion) => (
              <div
                key={minion.instanceId}
                onMouseDown={(e) => handleMinionMouseDown(minion.instanceId, e)}
                onClick={() => {
                  if (matchState.activePlayer === 'player' && minion.canAttack && minion.currentAttack > 0) {
                    setSelectedMinionId(selectedMinionId === minion.instanceId ? null : minion.instanceId);
                  }
                }}
                className="cursor-pointer"
              >
                <BoardMinionView
                  minion={minion}
                  isFriendly={true}
                  isSelected={selectedMinionId === minion.instanceId}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* BOTTOM AREA: Player Hand (Fanned Arc), Hero, Mana, Echo, Destiny */}
      <div className="relative z-20 flex flex-col bg-slate-950/95 border-t border-white/10 backdrop-blur-md pt-2 pb-2 px-6">
        {/* Resource Bar: Player Avatar, Echo, Mana Crystals, Destiny */}
        <div className="flex items-center justify-between mb-1">
          {/* Left: Player Avatar & Echo */}
          <div className="flex items-center gap-4">
            <LivingAvatar
              binder={matchState.player.binder}
              health={matchState.player.health}
              maxHealth={matchState.player.maxHealth}
              armor={matchState.player.armor}
              isEnemy={false}
              isActiveTurn={matchState.activePlayer === 'player'}
              isTakingDamage={damageFlashTarget === 'player'}
              heroPowerUsed={matchState.player.heroPowerUsedThisTurn}
              currentMana={matchState.player.currentMana}
              onHeroPowerClick={handleHeroPower}
            />

            <EchoPoolView
              echoCount={matchState.player.echoPool}
              fragments={matchState.player.echoFragments}
            />

            {/* Weapon slot */}
            {matchState.player.weapon && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-600/50 text-xs text-amber-200">
                <Sword className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">{matchState.player.weapon.card.name}</span>
                <span className="font-mono text-[10px]">({matchState.player.weapon.attack}/{matchState.player.weapon.durability})</span>
              </div>
            )}
          </div>

          {/* Center: Mana Crystals */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-5 rounded-sm border transition-all duration-300 ${
                    i < matchState.player.currentMana
                      ? 'bg-sky-400 border-sky-200 shadow-[0_0_8px_rgba(56,189,248,0.8)]'
                      : i < matchState.player.maxMana
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-black/50 border-white/5 opacity-30'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono font-bold text-sky-400 text-xs ml-1">
              {matchState.player.currentMana} / {matchState.player.maxMana}
            </span>
          </div>

          {/* Right: Destiny Track & Hero Power Button */}
          <div className="flex items-center gap-3">
            <DestinyTrackView track={matchState.player.destinyTrack} />

            {/* Hero Power Button */}
            <button
              onClick={handleHeroPower}
              disabled={
                matchState.player.heroPowerUsedThisTurn ||
                matchState.player.currentMana < matchState.player.binder.heroPower.cost ||
                matchState.activePlayer !== 'player'
              }
              className={`
                px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-semibold
                transition-all duration-200
                ${
                  !matchState.player.heroPowerUsedThisTurn &&
                  matchState.player.currentMana >= matchState.player.binder.heroPower.cost &&
                  matchState.activePlayer === 'player'
                    ? 'bg-indigo-900 border-indigo-400 text-indigo-100 hover:scale-105 shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{matchState.player.binder.heroPower.name} (2)</span>
            </button>
          </div>
        </div>

        {/* Physical Fanned Player Hand with Drag-to-Play */}
        <CardHand
          cards={matchState.player.hand}
          currentMana={matchState.player.currentMana}
          isPlayerTurn={matchState.activePlayer === 'player' && matchState.phase === 'playing'}
          selectedCardIndex={selectedCardIndex}
          onSelectCard={(idx) => {
            if (selectedCardIndex === idx) {
              handlePlayCard(idx);
            } else {
              setSelectedCardIndex(idx);
            }
          }}
          onPlayCard={(idx) => handlePlayCard(idx)}
        />
      </div>

      {/* COMBAT LOGS SLIDE-OUT DRAWER */}
      {showCombatLogs && (
        <div className="absolute top-14 right-4 w-80 max-h-[70vh] rounded-xl glass-panel-glow border border-indigo-500/40 p-4 z-50 flex flex-col text-xs shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
            <span className="font-cinzel font-bold text-sm text-indigo-300">Battle Action Logs</span>
            <button onClick={() => setShowCombatLogs(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {matchState.combatLogs.slice().reverse().map((log) => (
              <div key={log.id} className="p-1.5 rounded bg-slate-900/60 border border-white/5 text-slate-300">
                <span className="text-[10px] text-slate-500 font-mono mr-1">[T{log.turn}]</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAME OVER OVERLAY (Victory / Defeat) */}
      {matchState.phase === 'game_over' && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div className="w-[450px] p-8 rounded-2xl glass-panel-glow border-2 text-center flex flex-col items-center gap-4">
            <div className={`text-4xl font-cinzel font-extrabold tracking-wider ${
              matchState.winner === 'player' ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]' : 'text-red-500'
            }`}>
              {matchState.winner === 'player' ? 'VICTORY' : 'DEFEAT'}
            </div>

            <p className="text-sm text-slate-300 max-w-sm">
              {matchState.winner === 'player'
                ? `You have mastered the Veil and triumphed over ${matchState.opponent.binder.name}!`
                : `Your connection to the Veil severed before ${matchState.opponent.binder.name}.`}
            </p>

            {/* Post Match Rewards */}
            {matchState.winner === 'player' && (
              <div className="flex items-center gap-6 my-2 p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Gold</span>
                  <span className="text-lg font-bold text-amber-400">+50</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Essence</span>
                  <span className="text-lg font-bold text-purple-400">+25</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">XP</span>
                  <span className="text-lg font-bold text-sky-400">+120</span>
                </div>
              </div>
            )}

            <button
              onClick={() => onMatchEnd(matchState.winner === 'player', matchState)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cinzel font-bold text-sm tracking-wide shadow-xl transition-all duration-200 hover:scale-105"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* AI Inspector Dev Modal */}
      <AIDebugModal
        isOpen={showAIDebug}
        onClose={() => setShowAIDebug(false)}
      />
    </div>
  );
};
