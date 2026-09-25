import React, { useState } from 'react';
import { 
  BGParticipant, 
  BGUnit, 
  BGTier, 
  BGPhase, 
  BGSynergyCount 
} from '../../types/battlegrounds';
import { 
  initializeBGParticipants, 
  rollRiftMarket, 
  calculateSynergies, 
  advanceAIParticipants, 
  resolveBackgroundDuels, 
  BGCombatSimulationResult 
} from '../../engine/battlegroundsEngine';
import { BGLeaderboard } from './BGLeaderboard';
import { RiftMarketView } from './RiftMarketView';
import { AutoCombatArena } from './AutoCombatArena';
import { BINDERS } from '../../data/binders';
import { Binder } from '../../types/binder';
import { audio } from '../../services/audioService';
import { Trophy, Swords, Shield, Heart, RotateCcw, ArrowLeft, Sparkles, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VeilboundBattlegroundsViewProps {
  onBackToMenu: () => void;
  onMatchFinished?: (placement: number, rewards: { gold: number; xp: number }) => void;
}

export const VeilboundBattlegroundsView: React.FC<VeilboundBattlegroundsViewProps> = ({
  onBackToMenu,
  onMatchFinished
}) => {
  const [phase, setPhase] = useState<BGPhase>('HERO_SELECT');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [participants, setParticipants] = useState<BGParticipant[]>(() => initializeBGParticipants());
  const [heroChoices] = useState<Binder[]>(() => BINDERS.slice(0, 3));
  const [marketUnits, setMarketUnits] = useState<BGUnit[]>(() => rollRiftMarket(1));
  const [isMarketLocked, setIsMarketLocked] = useState<boolean>(false);
  const [currentCombatOpponent, setCurrentCombatOpponent] = useState<BGParticipant | null>(null);
  const [showFinalDuelIntro, setShowFinalDuelIntro] = useState<boolean>(false);

  const player = participants.find(p => p.isHuman) || participants[0];
  const aliveParticipants = participants.filter(p => p.isAlive);
  const isFinalDuel = aliveParticipants.length === 2 && player.isAlive;
  const playerSynergies = calculateSynergies(player.board);

  // Hero select
  const handleSelectHero = (b: Binder) => {
    audio.playClick();
    setParticipants(prev => {
      const next = [...prev];
      next[0] = { ...next[0], binder: b, name: `You (${b.name})` };
      return next;
    });
    setPhase('PREPARATION');
  };

  // Recruit unit from Rift Market to Bench
  const handleRecruitUnit = (unit: BGUnit) => {
    if (player.shards < 3 || player.bench.length >= 7) return;

    setParticipants(prev => {
      const next = [...prev];
      const p = { ...next[0] };
      p.shards -= 3;
      p.bench = [...p.bench, unit];
      next[0] = p;
      return next;
    });

    setMarketUnits(prev => prev.filter(u => u.instanceId !== unit.instanceId));
  };

  // Deploy unit from Bench to Board
  const handleDeployUnit = (benchIdx: number) => {
    if (player.board.length >= 7) return;

    setParticipants(prev => {
      const next = [...prev];
      const p = { ...next[0] };
      const [deployed] = p.bench.splice(benchIdx, 1);
      if (deployed) p.board.push(deployed);
      next[0] = p;
      return next;
    });
  };

  // Send unit from Board to Bench
  const handleBenchUnit = (boardIdx: number) => {
    if (player.bench.length >= 7) return;

    setParticipants(prev => {
      const next = [...prev];
      const p = { ...next[0] };
      const [benched] = p.board.splice(boardIdx, 1);
      if (benched) p.bench.push(benched);
      next[0] = p;
      return next;
    });
  };

  // Sell unit for 1 Shard
  const handleSellUnit = (unit: BGUnit, from: 'board' | 'bench', idx: number) => {
    setParticipants(prev => {
      const next = [...prev];
      const p = { ...next[0] };
      p.shards = Math.min(10, p.shards + 1);
      if (from === 'board') p.board.splice(idx, 1);
      else p.bench.splice(idx, 1);
      next[0] = p;
      return next;
    });
  };

  // Refresh Market
  const handleRefreshMarket = () => {
    if (player.shards < 1) return;

    setParticipants(prev => {
      const next = [...prev];
      next[0] = { ...next[0], shards: next[0].shards - 1 };
      return next;
    });

    setMarketUnits(rollRiftMarket(player.tier));
    setIsMarketLocked(false);
  };

  // Upgrade Tier
  const handleUpgradeTier = () => {
    if (player.shards < player.tierUpgradeCost || player.tier >= 6) return;

    setParticipants(prev => {
      const next = [...prev];
      const p = { ...next[0] };
      p.shards -= p.tierUpgradeCost;
      p.tier = (p.tier + 1) as BGTier;
      p.tierUpgradeCost = p.tier * 2 + 3;
      next[0] = p;
      return next;
    });
  };

  // Start Combat
  const handleReadyForCombat = () => {
    // Pick living AI opponent
    const aliveAIs = participants.filter(p => !p.isHuman && p.isAlive);
    const chosenOpponent = aliveAIs[Math.floor(Math.random() * aliveAIs.length)] || aliveAIs[0];

    // Simulate AI building their army for the round
    advanceAIParticipants(participants, roundNumber);

    setCurrentCombatOpponent(chosenOpponent);

    if (isFinalDuel) {
      setShowFinalDuelIntro(true);
      setTimeout(() => {
        setShowFinalDuelIntro(false);
        setPhase('COMBAT');
      }, 1500);
    } else {
      setPhase('COMBAT');
    }
  };

  // Combat Completed
  const handleCombatComplete = (result: BGCombatSimulationResult) => {
    const updatedParticipants = [...participants];
    const p = updatedParticipants.find(x => x.isHuman)!;
    const opp = updatedParticipants.find(x => x.id === currentCombatOpponent?.id)!;

    if (result.winner === 'player') {
      opp.health = Math.max(0, opp.health - result.damageDealt);
      p.winStreak += 1;
      opp.winStreak = 0;
      if (opp.health <= 0) {
        opp.isAlive = false;
        opp.eliminatedRound = roundNumber;
      }
    } else if (result.winner === 'opponent') {
      p.health = Math.max(0, p.health - result.damageDealt);
      opp.winStreak += 1;
      p.winStreak = 0;
      if (p.health <= 0) {
        p.isAlive = false;
        p.eliminatedRound = roundNumber;
      }
    }

    // Resolve non-player duels
    resolveBackgroundDuels(updatedParticipants, roundNumber);
    setParticipants(updatedParticipants);

    // Check game over
    const remainingAlive = updatedParticipants.filter(x => x.isAlive);
    if (!p.isAlive || remainingAlive.length <= 1) {
      setPhase('FINAL_VICTORY');
      if (p.isAlive) {
        audio.playVictory();
        try {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
        } catch (e) {}
      }
    } else {
      // Advance to next round preparation
      const nextRound = roundNumber + 1;
      setRoundNumber(nextRound);

      // Refresh shards & market for player
      const maxShards = Math.min(10, 2 + nextRound);
      p.shards = maxShards;
      p.tierUpgradeCost = Math.max(1, p.tierUpgradeCost - 1);

      if (!isMarketLocked) {
        setMarketUnits(rollRiftMarket(p.tier));
      }

      setPhase('PREPARATION');
    }
  };

  // Reset Run
  const handleRestart = () => {
    audio.playClick();
    setPhase('HERO_SELECT');
    setRoundNumber(1);
    setParticipants(initializeBGParticipants());
    setMarketUnits(rollRiftMarket(1));
    setIsMarketLocked(false);
    setCurrentCombatOpponent(null);
  };

  return (
    <div className="w-full h-full min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden select-none">
      {/* Persistent Left Leaderboard */}
      <BGLeaderboard
        participants={participants}
        currentOpponentId={currentCombatOpponent?.id}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Hub Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audio.playClick();
                onBackToMenu();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-transform hover:scale-105"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Hub</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <h1 className="text-lg font-cinzel font-black tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                VEILBOUND BATTLEGROUNDS
              </h1>
              <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                10-Player Auto-Battler
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-mono">
              Placement: <span className="font-bold text-amber-400 font-sans">#{player.placement}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-800/40">
              <Heart className="w-3.5 h-3.5 fill-rose-400" />
              <span>{player.health} / 35 HP</span>
            </div>
          </div>
        </div>

        {/* HERO SELECT PHASE */}
        {phase === 'HERO_SELECT' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            <h2 className="text-3xl font-cinzel font-black text-amber-300 mb-2">
              Choose Your Planar Commander
            </h2>
            <p className="text-xs text-slate-400 mb-8 max-w-md">
              Each Binder commands a unique signature ability and tactical synergy to lead your Battlegrounds army to victory!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
              {heroChoices.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectHero(b)}
                  className="cursor-pointer bg-slate-900/90 rounded-2xl border-2 border-slate-700 hover:border-amber-400 hover:scale-105 transition-all p-6 flex flex-col items-center text-center shadow-2xl group"
                >
                  <div
                    className="w-24 h-24 rounded-full border-4 border-amber-400 mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:rotate-6 transition-transform"
                    style={{ backgroundColor: b.visualTheme.primaryColor }}
                  >
                    {b.name[0]}
                  </div>
                  <h3 className="font-cinzel font-black text-xl text-slate-100 mb-1">{b.name}</h3>
                  <div className="text-xs text-amber-400 font-semibold mb-3">{b.title}</div>
                  <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">"{b.lore}"</p>
                  <div className="w-full bg-purple-950/60 p-2.5 rounded-xl border border-purple-800/50 text-xs text-purple-200 font-medium">
                    <span className="font-bold text-white block mb-0.5">Hero Power: {b.heroPower.name}</span>
                    <span>{b.heroPower.description}</span>
                  </div>
                  <button className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 group-hover:from-amber-400 group-hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                    Select Commander
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREPARATION PHASE (The Rift Market) */}
        {phase === 'PREPARATION' && (
          <RiftMarketView
            roundNumber={roundNumber}
            player={player}
            marketUnits={marketUnits}
            isLocked={isMarketLocked}
            synergies={playerSynergies}
            onRecruitUnit={handleRecruitUnit}
            onDeployUnit={handleDeployUnit}
            onBenchUnit={handleBenchUnit}
            onSellUnit={handleSellUnit}
            onRefreshMarket={handleRefreshMarket}
            onToggleLock={() => setIsMarketLocked(!isMarketLocked)}
            onUpgradeTier={handleUpgradeTier}
            onReadyForCombat={handleReadyForCombat}
          />
        )}

        {/* COMBAT PHASE (Auto Combat Arena) */}
        {phase === 'COMBAT' && currentCombatOpponent && (
          <AutoCombatArena
            roundNumber={roundNumber}
            player={player}
            opponent={currentCombatOpponent}
            onCombatComplete={handleCombatComplete}
          />
        )}

        {/* FINAL VICTORY / ELIMINATION SCREEN */}
        {phase === 'FINAL_VICTORY' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fadeIn my-auto">
            <div className="text-6xl md:text-8xl mb-4 animate-bounce">
              {player.isAlive ? '👑' : '💀'}
            </div>
            <h2 className={`text-4xl md:text-5xl font-cinzel font-black mb-2 ${
              player.isAlive ? 'text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]' : 'text-red-500'
            }`}>
              {player.isAlive ? 'FIRST PLACE — LOBBY CHAMPION!' : `ELIMINATED — PLACEMENT #${player.placement}`}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto mb-6">
              {player.isAlive
                ? 'You toppled all 9 rival Binders in the Rift Market! Your legendary army stands supreme across the dimensional arena.'
                : `You fought valiantly until Round ${roundNumber}. Return to the Rift Market and refine your synergies!`}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRestart}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Another Lobby</span>
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  onBackToMenu();
                }}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
              >
                Back to Hub
              </button>
            </div>
          </div>
        )}

        {/* FINAL DUEL CINEMATIC OVERLAY */}
        {showFinalDuelIntro && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-fadeIn">
            <div className="text-amber-400 font-mono font-black tracking-widest text-sm uppercase mb-3 animate-pulse">
              ⚔️ 2 PLAYERS REMAINING ⚔️
            </div>
            <h2 className="text-5xl md:text-6xl font-cinzel font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-300 to-yellow-400 mb-4 animate-scaleUp">
              THE FINAL DUEL
            </h2>
            <p className="text-sm text-slate-300 italic max-w-md text-center">
              The grand climax of the Rift Market. Winner claims the Sovereign Crown!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
