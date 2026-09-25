import React from 'react';
import { BGParticipant, BGUnit, BGTier, BGSynergyCount } from '../../types/battlegrounds';
import { audio } from '../../services/audioService';
import { 
  RefreshCw, Lock, ArrowUpCircle, Shield, Sword, Heart, 
  Sparkles, Trash2, ArrowDown, ChevronRight, Zap, Coins 
} from 'lucide-react';

interface RiftMarketViewProps {
  roundNumber: number;
  player: BGParticipant;
  marketUnits: BGUnit[];
  isLocked: boolean;
  synergies: BGSynergyCount[];
  onRecruitUnit: (unit: BGUnit) => void;
  onDeployUnit: (benchIndex: number) => void;
  onBenchUnit: (boardIndex: number) => void;
  onSellUnit: (unit: BGUnit, from: 'board' | 'bench', index: number) => void;
  onRefreshMarket: () => void;
  onToggleLock: () => void;
  onUpgradeTier: () => void;
  onReadyForCombat: () => void;
}

export const RiftMarketView: React.FC<RiftMarketViewProps> = ({
  roundNumber,
  player,
  marketUnits,
  isLocked,
  synergies,
  onRecruitUnit,
  onDeployUnit,
  onBenchUnit,
  onSellUnit,
  onRefreshMarket,
  onToggleLock,
  onUpgradeTier,
  onReadyForCombat
}) => {
  const canAffordUpgrade = player.shards >= player.tierUpgradeCost && player.tier < 6;
  const canAffordRefresh = player.shards >= 1;

  return (
    <div className="flex-1 flex flex-col justify-between p-4 md:p-6 overflow-y-auto select-none bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top Bar: Market Status, Shards, Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Left: Round & Tier Info */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs">
            Round {roundNumber} • Recruitment
          </div>
          <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
            <span>Market Tier:</span>
            <span className="text-amber-400 font-extrabold text-sm">Tier {player.tier}</span>
          </div>
        </div>

        {/* Center: Shards Currency */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-sky-950/80 border border-sky-500/50 shadow-md">
          <span className="text-base">💎</span>
          <span className="font-mono font-extrabold text-sky-300 text-sm">
            {player.shards} Shards Available
          </span>
        </div>

        {/* Right: Market Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Upgrade Tier Button */}
          {player.tier < 6 && (
            <button
              onClick={() => {
                if (canAffordUpgrade) {
                  audio.playClick();
                  onUpgradeTier();
                }
              }}
              disabled={!canAffordUpgrade}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                canAffordUpgrade
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md hover:scale-105'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Upgrade Tier ({player.tierUpgradeCost} 💎)</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => {
              if (canAffordRefresh) {
                audio.playClick();
                onRefreshMarket();
              }
            }}
            disabled={!canAffordRefresh}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              canAffordRefresh
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh (1 💎)</span>
          </button>

          {/* Lock / Freeze Button */}
          <button
            onClick={() => {
              audio.playClick();
              onToggleLock();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isLocked
                ? 'bg-sky-500/20 border border-sky-400 text-sky-300 ring-2 ring-sky-400/40'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isLocked ? 'Frozen ❄️' : 'Freeze'}</span>
          </button>
        </div>
      </div>

      {/* RIFT MARKET AREA (Recruitable Units) */}
      <div className="my-2 p-3 bg-slate-950/60 rounded-2xl border border-amber-500/20">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
            <span>🛒</span> THE RIFT MARKET (RECRUIT FOR 3 SHARDS)
          </span>
          <span className="text-[11px] text-slate-400">
            Available: {marketUnits.length} Units
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {marketUnits.map((u) => {
            const canAfford = player.shards >= 3;
            const hasBenchSpace = player.bench.length < 7;

            return (
              <div
                key={u.instanceId}
                className="bg-slate-900/90 rounded-xl border border-slate-700/80 p-3 flex flex-col justify-between hover:border-amber-400 transition-all hover:scale-105 shadow-lg group relative"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[10px] text-amber-400 uppercase font-mono">
                      Tier {u.tier} • {u.faction}
                    </span>
                    <span className="text-xs">{u.icon}</span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-100 mb-1 truncate">{u.name}</h4>
                  
                  {/* Stats Jewels */}
                  <div className="flex items-center justify-between py-1 mb-2 border-y border-slate-800">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Sword className="w-3.5 h-3.5" />
                      <span>{u.attack}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-400">
                      <Heart className="w-3.5 h-3.5 fill-rose-400" />
                      <span>{u.health}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-300 leading-tight line-clamp-2">
                    {u.abilityDescription}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (canAfford && hasBenchSpace) {
                      audio.playCardPlay();
                      onRecruitUnit(u);
                    }
                  }}
                  disabled={!canAfford || !hasBenchSpace}
                  className={`w-full mt-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    canAfford && hasBenchSpace
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Recruit</span>
                  <span className="font-mono text-[10px]">(3 💎)</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLAYER BATTLEFIELD (Combat Army, Max 7) */}
      <div className="my-2 p-3 bg-slate-900/60 rounded-2xl border border-indigo-500/30">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase flex items-center gap-1.5">
              <span>⚔️</span> YOUR COMBAT BOARD ({player.board.length} / 7)
            </span>
            <span className="text-[10px] text-slate-400">
              (Attacks from Left to Right: #1 to #{player.board.length})
            </span>
          </div>

          {/* Active Synergies summary */}
          <div className="flex items-center gap-2">
            {synergies.map((syn) => (
              <span
                key={syn.faction}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950 border border-purple-500/50 text-purple-200"
                title={syn.description}
              >
                {syn.description.split(' ')[0]} {syn.faction} ({syn.count})
              </span>
            ))}
          </div>
        </div>

        {/* Board Slots */}
        <div className="flex items-center justify-center gap-2 min-h-[140px] bg-slate-950/70 rounded-xl p-2 border border-slate-800">
          {player.board.length === 0 ? (
            <div className="text-xs text-slate-500 italic">
              Your board is empty! Click "Deploy" on reserve units from your bench below.
            </div>
          ) : (
            player.board.map((u, idx) => (
              <div
                key={u.instanceId}
                className="w-32 bg-slate-900 rounded-xl border border-indigo-500/60 p-2.5 flex flex-col justify-between shadow-xl relative group"
              >
                {/* Attack Order Badge */}
                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-amber-500 border border-amber-300 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                  #{idx + 1}
                </div>

                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase truncate">
                    {u.faction}
                  </div>
                  <div className="font-bold text-xs text-slate-100 truncate mb-1">{u.name}</div>

                  {/* Stats */}
                  <div className="flex items-center justify-between py-0.5 border-y border-slate-800 text-xs font-bold">
                    <span className="text-amber-400">⚔️ {u.attack}</span>
                    <span className="text-rose-400">❤️ {u.health}</span>
                  </div>

                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">
                    {u.abilityDescription}
                  </div>
                </div>

                {/* Actions: Send to Bench or Sell */}
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => {
                      audio.playClick();
                      onBenchUnit(idx);
                    }}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-slate-300"
                    title="Move back to bench"
                  >
                    Bench
                  </button>
                  <button
                    onClick={() => {
                      audio.playClick();
                      onSellUnit(u, 'board', idx);
                    }}
                    className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-300 text-[9px]"
                    title="Sell for 1 Shard"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PLAYER BENCH & READY BUTTON */}
      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        {/* Bench Tray */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 whitespace-nowrap">
            Bench ({player.bench.length} / 7):
          </span>
          {player.bench.map((u, idx) => (
            <div
              key={u.instanceId}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs"
            >
              <span className="text-sm">{u.icon}</span>
              <div className="flex flex-col">
                <span className="font-bold text-xs text-slate-200 truncate max-w-[90px]">{u.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {u.attack}/{u.health}
                </span>
              </div>
              <button
                onClick={() => {
                  if (player.board.length < 7) {
                    audio.playClick();
                    onDeployUnit(idx);
                  }
                }}
                disabled={player.board.length >= 7}
                className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px]"
              >
                Deploy
              </button>
              <button
                onClick={() => {
                  audio.playClick();
                  onSellUnit(u, 'bench', idx);
                }}
                className="text-red-400 hover:text-red-300 text-xs p-0.5"
                title="Sell for 1 Shard"
              >
                ✕
              </button>
            </div>
          ))}
          {player.bench.length === 0 && (
            <span className="text-xs text-slate-600 italic">Bench is empty.</span>
          )}
        </div>

        {/* Ready to Fight button */}
        <button
          onClick={() => {
            audio.playTurnStart(true);
            onReadyForCombat();
          }}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0"
        >
          <span>⚔️</span>
          <span>ENTER COMBAT</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
