import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MatchState } from '../../types/gameState';
import { BoardMinionView } from './BoardMinionView';
import { CardView } from '../card/CardView';
import { VeilIndicator } from './VeilIndicator';
import { EchoPoolView } from './EchoPoolView';
import { DestinyTrackView } from './DestinyTrackView';
import { BattlefieldParticles } from './BattlefieldParticles';
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

  const bfTheme = getBattlefieldById(matchState.battlefieldTheme);

  // Trigger Victory confetti
  useEffect(() => {
    if (matchState.phase === 'game_over' && matchState.winner === 'player') {
      audio.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else if (matchState.phase === 'game_over' && matchState.winner === 'opponent') {
      audio.playDefeat();
    }
  }, [matchState.phase, matchState.winner]);

  // Handle AI Turns
  useEffect(() => {
    if (
      matchState.phase === 'playing' &&
      matchState.activePlayer === 'opponent' &&
      !isAIProcessing
    ) {
      setIsAIProcessing(true);
      const timer = setTimeout(() => {
        setMatchState((current) => {
          const nextState = executeAITurn(current, 'Tactician');
          setIsAIProcessing(false);
          return nextState;
        });
      }, 1200);

      return () => clearTimeout(timer);
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
        {/* Opponent Identity */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleEnemyHeroClick}
            className={`
              relative w-12 h-12 rounded-full border-2 border-red-500 overflow-hidden cursor-pointer
              hover:scale-105 transition-transform flex items-center justify-center bg-slate-900 shadow-lg
              ${selectedMinionId ? 'ring-4 ring-red-400 animate-pulse' : ''}
            `}
          >
            <span className="font-cinzel font-bold text-red-300 text-lg">
              {matchState.opponent.binder.name[0]}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-cinzel font-bold text-slate-100 text-sm">{matchState.opponent.binder.name}</span>
              <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">{matchState.opponent.binder.title}</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-red-400 font-bold">
                <Heart className="w-3.5 h-3.5 fill-red-400" />
                <span>{matchState.opponent.health} / {matchState.opponent.maxHealth}</span>
              </div>
              {matchState.opponent.armor > 0 && (
                <div className="flex items-center gap-1 text-slate-300 font-bold">
                  <Shield className="w-3.5 h-3.5 fill-slate-300" />
                  <span>{matchState.opponent.armor}</span>
                </div>
              )}
              <div className="text-slate-400 text-[11px]">
                Cards in Hand: {matchState.opponent.hand.length}
              </div>
            </div>
          </div>
        </div>

        {/* Global Events Banner */}
        <div className="flex items-center gap-2">
          {matchState.activeEvents.map((ev) => (
            <div key={ev.instanceId} className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500 text-purple-200 text-xs flex items-center gap-1.5 shadow-lg animate-pulse-slow">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold">{ev.card.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({ev.remainingTurns} turns)</span>
            </div>
          ))}
        </div>

        {/* Combat Logs toggle & Exit */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCombatLogs(!showCombatLogs)}
            className="px-3 py-1 rounded-lg glass-panel hover:border-indigo-400 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>Battle Log</span>
          </button>
          <button
            onClick={onExit}
            className="px-3 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs text-red-200 transition-colors"
          >
            Surrender / Exit
          </button>
        </div>
      </div>

      {/* BATTLEFIELD BOARD CENTER */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-8 py-3">
        {/* OPPONENT BOARD ROW */}
        <div className="flex justify-center items-center gap-3 min-h-[140px] border-b border-white/5 py-2">
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

        {/* CENTER DIVIDER: Veil Indicator & End Turn Button */}
        <div className="flex items-center justify-between py-1 relative">
          <div className="w-40" />

          {/* Center Veil Dial */}
          <div className="flex items-center justify-center">
            <VeilIndicator
              currentState={matchState.veilState}
              onShiftRequest={handleVeilShiftClick}
              isInteractive={matchState.isSandboxMode}
            />
          </div>

          {/* End Turn Button & Status */}
          <div className="w-40 flex justify-end">
            <button
              onClick={handleEndTurn}
              disabled={matchState.activePlayer !== 'player' || matchState.phase !== 'playing'}
              className={`
                px-5 py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider
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
        <div className="flex justify-center items-center gap-3 min-h-[140px] border-t border-white/5 py-2">
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

      {/* BOTTOM AREA: Player Hand, Hero Power, Mana, Echo, Destiny */}
      <div className="relative z-10 flex flex-col bg-slate-950/90 border-t border-white/10 backdrop-blur-md pt-2 pb-3 px-6">
        {/* Resource Bar: Echo, Mana Crystals, Destiny */}
        <div className="flex items-center justify-between mb-2">
          {/* Left: Echo Pool & Weapon */}
          <div className="flex items-center gap-3">
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

          {/* Right: Destiny Track & Hero Power */}
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
