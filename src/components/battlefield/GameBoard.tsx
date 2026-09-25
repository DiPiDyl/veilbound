import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchState } from '../../types/gameState';
import { BoardMinionView } from './BoardMinionView';
import { CardView } from '../card/CardView';
import { VeilIndicator } from './VeilIndicator';
import { EchoPoolView } from './EchoPoolView';
import { DestinyTrackView } from './DestinyTrackView';
import { BattlefieldParticles } from './BattlefieldParticles';
import { LivingAvatar } from './LivingAvatar';
import { TurnTimer } from './TurnTimer';
import { 
  playCardFromHand, 
  attackWithMinion, 
  activateHeroPower, 
  endCurrentTurn 
} from '../../engine/gameEngine';
import { executeAITurn } from '../../engine/aiEngine';
import { shiftVeilTo } from '../../engine/veilEngine';
import { getBattlefieldById } from '../../data/battlefields';
import { audio } from '../../services/audioService';
import { 
  Shield, Sword, Heart, Sparkles, ChevronRight, RotateCcw, 
  Clock, Scroll, Award, ArrowRight, Zap 
} from 'lucide-react';

interface GameBoardProps {
  initialState: MatchState;
  onMatchEnd: (won: boolean, matchState: MatchState) => void;
  onExit: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ initialState, onMatchEnd, onExit }) => {
  const [matchState, setMatchState] = useState<MatchState>(initialState);
  const [selectedMinionId, setSelectedMinionId] = useState<string | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [showCombatLogs, setShowCombatLogs] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null);
  const [damageFlashTarget, setDamageFlashTarget] = useState<'player' | 'opponent' | null>(null);

  const bfTheme = getBattlefieldById(matchState.battlefieldTheme);

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

  // Handle AI Turns with sequential visual pacing
  useEffect(() => {
    if (
      matchState.phase === 'playing' &&
      matchState.activePlayer === 'opponent' &&
      !isAIProcessing
    ) {
      setIsAIProcessing(true);
      setAiActionMessage('Evaluating battlefield & calculating moves...');

      const step1 = setTimeout(() => {
        setAiActionMessage('Channeling the Veil & playing cards...');
      }, 700);

      const step2 = setTimeout(() => {
        setMatchState((current) => {
          const nextState = executeAITurn(current, 'Tactician');
          setDamageFlashTarget('player');
          setTimeout(() => setDamageFlashTarget(null), 600);
          return nextState;
        });
        setAiActionMessage('Executing attacks and concluding turn...');
      }, 1400);

      const step3 = setTimeout(() => {
        setIsAIProcessing(false);
        setAiActionMessage(null);
      }, 2000);

      return () => {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
      };
    }
  }, [matchState.activePlayer, matchState.phase, isAIProcessing]);

  // Player Hand click
  const handleCardClick = (index: number) => {
    if (matchState.activePlayer !== 'player' || matchState.phase !== 'playing') return;

    const card = matchState.player.hand[index];
    if (!card) return;

    if (card.cost > matchState.player.currentMana) {
      audio.playClick();
      return; // Cannot afford
    }

    audio.playCardPlay();
    const updated = playCardFromHand(matchState, index);
    setMatchState(updated);
    setSelectedCardIndex(null);
  };

  // Minion Attack selection
  const handleMinionClick = (minionId: string, isFriendly: boolean) => {
    if (matchState.activePlayer !== 'player' || matchState.phase !== 'playing') return;

    if (isFriendly) {
      const minion = matchState.player.board.find((m) => m.instanceId === minionId);
      if (minion && minion.canAttack && minion.currentAttack > 0) {
        setSelectedMinionId(selectedMinionId === minionId ? null : minionId);
      }
    } else {
      // Enemy minion clicked as target
      if (selectedMinionId) {
        audio.playAttack();
        const updated = attackWithMinion(matchState, selectedMinionId, 'minion', minionId);
        setMatchState(updated);
        setSelectedMinionId(null);
      }
    }
  };

  // Enemy Hero clicked as target
  const handleEnemyHeroClick = () => {
    if (selectedMinionId && matchState.activePlayer === 'player') {
      audio.playAttack();
      const updated = attackWithMinion(matchState, selectedMinionId, 'hero');
      setDamageFlashTarget('opponent');
      setTimeout(() => setDamageFlashTarget(null), 500);
      setMatchState(updated);
      setSelectedMinionId(null);
    }
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

  // End Turn
  const handleEndTurn = () => {
    if (matchState.activePlayer !== 'player' || matchState.phase !== 'playing') return;
    audio.playClick();
    setSelectedMinionId(null);
    setSelectedCardIndex(null);
    const updated = endCurrentTurn(matchState);
    setMatchState(updated);
  };

  // Turn Timeout auto-handler
  const handleTimeout = () => {
    if (matchState.activePlayer === 'player' && matchState.phase === 'playing') {
      handleEndTurn();
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

  return (
    <div className={`relative w-full h-screen bg-gradient-to-b ${bfTheme.bgGradient} flex flex-col justify-between overflow-hidden select-none`}>
      {/* Dynamic Background Particle System */}
      <BattlefieldParticles veilState={matchState.veilState} />

      {/* TOP BAR: Opponent Info, Active Events, Menu button */}
      <div className="relative z-10 flex items-center justify-between px-6 py-2 bg-slate-950/80 border-b border-white/10 backdrop-blur-md">
        {/* Opponent Living Avatar */}
        <div className="flex items-center gap-3">
          <LivingAvatar
            binder={matchState.opponent.binder}
            health={matchState.opponent.health}
            maxHealth={matchState.opponent.maxHealth}
            armor={matchState.opponent.armor}
            isEnemy={true}
            isActiveTurn={matchState.activePlayer === 'opponent'}
            isTakingDamage={damageFlashTarget === 'opponent'}
            isTargetable={!!selectedMinionId}
            heroPowerUsed={matchState.opponent.heroPowerUsedThisTurn}
            currentMana={matchState.opponent.currentMana}
            onAvatarClick={handleEnemyHeroClick}
          />
          <div className="text-slate-400 text-xs hidden md:block pl-2 border-l border-slate-700/60">
            Hand: <span className="font-bold text-slate-200">{matchState.opponent.hand.length}</span> cards
          </div>
        </div>

        {/* Center: Enemy Action Banner or Global Events */}
        <div className="flex items-center gap-3">
          {aiActionMessage ? (
            <div className="px-4 py-1.5 rounded-full bg-red-950/90 border border-red-500 text-red-200 text-xs font-bold flex items-center gap-2 animate-pulse shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <span>OPPONENT: {aiActionMessage}</span>
            </div>
          ) : (
            matchState.activeEvents.map((ev) => (
              <div key={ev.instanceId} className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500 text-purple-200 text-xs flex items-center gap-1.5 shadow-lg animate-pulse-slow">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold">{ev.card.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({ev.remainingTurns} turns)</span>
              </div>
            ))
          )}
        </div>

        {/* Combat Logs toggle & Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCombatLogs(!showCombatLogs)}
            className="px-3 py-1.5 rounded-lg glass-panel hover:border-indigo-400 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Battle Log</span>
          </button>
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs text-red-200 transition-colors"
          >
            Surrender / Exit
          </button>
        </div>
      </div>

      {/* BATTLEFIELD BOARD CENTER */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-8 py-2">
        {/* OPPONENT BOARD ROW */}
        <div className="flex justify-center items-center gap-3 min-h-[135px] border-b border-white/5 py-1">
          {matchState.opponent.board.length === 0 ? (
            <div className="text-xs text-slate-500 italic">Opponent battlefield is empty</div>
          ) : (
            matchState.opponent.board.map((minion) => (
              <BoardMinionView
                key={minion.instanceId}
                minion={minion}
                isFriendly={false}
                isValidTarget={!!selectedMinionId}
                onClick={() => handleMinionClick(minion.instanceId, false)}
              />
            ))
          )}
        </div>

        {/* CENTER DIVIDER: Turn Timer, Veil Indicator & End Turn Button */}
        <div className="flex items-center justify-between py-1 relative">
          {/* Left: Turn Timer */}
          <div className="w-48 flex items-center gap-2">
            <TurnTimer
              turnNumber={matchState.turnNumber}
              activePlayer={matchState.activePlayer}
              durationSeconds={45}
              onTimeout={handleTimeout}
              isPaused={matchState.phase !== 'playing'}
            />
          </div>

          {/* Center: Veil Dial */}
          <div className="flex items-center justify-center">
            <VeilIndicator
              currentState={matchState.veilState}
              onShiftRequest={handleVeilShiftClick}
              isInteractive={matchState.isSandboxMode}
            />
          </div>

          {/* Right: End Turn Button */}
          <div className="w-48 flex justify-end">
            <button
              onClick={handleEndTurn}
              disabled={matchState.activePlayer !== 'player' || matchState.phase !== 'playing'}
              className={`
                px-6 py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider
                transition-all duration-300 shadow-xl flex items-center gap-2
                ${
                  matchState.activePlayer === 'player'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white ring-2 ring-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
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
            <div className="text-xs text-slate-500 italic">Your battlefield is empty. Play minions from your hand!</div>
          ) : (
            matchState.player.board.map((minion) => (
              <BoardMinionView
                key={minion.instanceId}
                minion={minion}
                isFriendly={true}
                isSelected={selectedMinionId === minion.instanceId}
                onClick={() => handleMinionClick(minion.instanceId, true)}
              />
            ))
          )}
        </div>
      </div>

      {/* BOTTOM AREA: Player Hand, Hero, Mana, Echo, Destiny */}
      <div className="relative z-10 flex flex-col bg-slate-950/90 border-t border-white/10 backdrop-blur-md pt-2 pb-3 px-6">
        {/* Resource Bar: Player Avatar, Echo, Mana Crystals, Destiny */}
        <div className="flex items-center justify-between mb-2">
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

        {/* Player Hand Cards */}
        <div className="flex justify-center items-end gap-2 overflow-x-auto py-1 min-h-[170px]">
          {matchState.player.hand.map((card, idx) => (
            <CardView
              key={`${card.id}-${idx}`}
              card={card}
              size="sm"
              isPlayable={
                matchState.activePlayer === 'player' &&
                card.cost <= matchState.player.currentMana &&
                matchState.phase === 'playing'
              }
              isSelected={selectedCardIndex === idx}
              onClick={() => handleCardClick(idx)}
            />
          ))}
        </div>
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
    </div>
  );
};
