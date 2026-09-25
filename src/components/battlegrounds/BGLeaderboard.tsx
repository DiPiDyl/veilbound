import React from 'react';
import { BGParticipant } from '../../types/battlegrounds';
import { Shield, Heart, Skull, Flame, Trophy } from 'lucide-react';

interface BGLeaderboardProps {
  participants: BGParticipant[];
  currentOpponentId?: string;
}

export const BGLeaderboard: React.FC<BGLeaderboardProps> = ({
  participants,
  currentOpponentId
}) => {
  const aliveCount = participants.filter(p => p.isAlive).length;

  return (
    <div className="w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col p-3 select-none overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-200">
            Leaderboard
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
          {aliveCount} / 8 Alive
        </span>
      </div>

      {/* Participant List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
        {participants.map((p, idx) => {
          const isTarget = p.id === currentOpponentId;
          const isDead = !p.isAlive;

          return (
            <div
              key={p.id}
              className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                isTarget
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/80 shadow-md'
                  : p.isHuman
                  ? 'bg-indigo-950/40 border-indigo-500/60'
                  : isDead
                  ? 'bg-slate-950/40 border-slate-900 opacity-40 grayscale'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Placement Rank */}
                <span className={`w-5 text-center font-mono font-bold text-xs ${
                  idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  #{idx + 1}
                </span>

                {/* Avatar Icon */}
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: p.binder.visualTheme.primaryColor }}
                  >
                    {p.binder.name[0]}
                  </div>
                  {isDead && (
                    <div className="absolute inset-0 bg-red-950/80 rounded-full flex items-center justify-center text-red-400">
                      <Skull className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Name & Tier */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className={`font-bold text-xs truncate max-w-[85px] ${p.isHuman ? 'text-amber-300' : 'text-slate-200'}`}>
                      {p.name}
                    </span>
                    {isTarget && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">
                        VS
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Tier {p.tier} • {p.board.length} Units
                  </span>
                </div>
              </div>

              {/* Health Orb / Elimination */}
              <div>
                {isDead ? (
                  <span className="text-[10px] font-bold text-red-500 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900">
                    OUT
                  </span>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800/40">
                    <Heart className="w-3 h-3 fill-rose-400" />
                    <span>{p.health}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
