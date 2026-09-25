import React from 'react';
import { BoardMinion } from '../../types/card';
import { CardArt } from '../card/CardArt';
import { Shield, Sword, Heart, Snowflake, EyeOff } from 'lucide-react';
import { audio } from '../../services/audioService';

interface BoardMinionViewProps {
  minion: BoardMinion;
  isFriendly?: boolean;
  isSelected?: boolean;
  isValidTarget?: boolean;
  onClick?: () => void;
}

export const BoardMinionView: React.FC<BoardMinionViewProps> = ({
  minion,
  isFriendly = true,
  isSelected = false,
  isValidTarget = false,
  onClick
}) => {
  const hasTaunt = !!minion.card.keywords?.includes('Taunt');
  const isDamaged = minion.currentHealth < minion.maxHealth;

  const handleClick = () => {
    if (onClick) {
      audio.playClick();
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative w-24 h-32 rounded-xl flex flex-col justify-between overflow-hidden cursor-pointer
        select-none transition-all duration-200
        ${hasTaunt ? 'ring-4 ring-slate-400 rounded-none shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'ring-2 ring-white/20'}
        ${minion.canAttack && isFriendly ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse-slow' : ''}
        ${isSelected ? 'ring-4 ring-amber-400 scale-105 z-20' : ''}
        ${isValidTarget ? 'ring-4 ring-red-500 scale-105 animate-bounce z-20' : ''}
        bg-slate-900 shadow-xl hover:scale-105
      `}
    >
      {/* Divine Shield Bubble Overlay */}
      {minion.hasDivineShield && (
        <div className="absolute inset-0 bg-yellow-400/20 border-2 border-yellow-300 rounded-xl z-20 pointer-events-none animate-pulse" />
      )}

      {/* Freeze Frost Overlay */}
      {minion.isFrozen && (
        <div className="absolute inset-0 bg-sky-500/30 flex items-center justify-center z-20 pointer-events-none">
          <Snowflake className="w-8 h-8 text-sky-200 animate-spin duration-[10s]" />
        </div>
      )}

      {/* Stealth Overlay */}
      {minion.isStealthed && (
        <div className="absolute top-1 right-1 z-20 px-1 py-0.5 rounded bg-black/75 text-[9px] text-purple-300 flex items-center gap-0.5">
          <EyeOff className="w-2.5 h-2.5" /> Stealth
        </div>
      )}

      {/* Top Header: Minion Name */}
      <div className="relative z-10 px-1 py-0.5 bg-slate-950/90 text-center font-cinzel font-bold text-[10px] text-slate-200 truncate border-b border-white/10">
        {minion.card.name}
      </div>

      {/* Center Artwork */}
      <div className="relative z-0 flex-1 w-full overflow-hidden">
        <CardArt
          theme={minion.card.artworkPlaceholderTheme}
          faction={minion.card.faction}
          type={minion.card.type}
        />
      </div>

      {/* Bottom Stat Orbs: Attack (Left) & Health (Right) */}
      <div className="relative z-10 flex justify-between items-center p-1 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
        {/* Attack Orb */}
        <div className="w-6 h-6 rounded-full bg-amber-500 border border-amber-200 text-black font-extrabold flex items-center justify-center text-xs shadow-md">
          {minion.currentAttack}
        </div>

        {/* Taunt Shield icon indicator */}
        {hasTaunt && (
          <Shield className="w-4 h-4 text-slate-300 fill-slate-300 drop-shadow" />
        )}

        {/* Health Orb */}
        <div
          className={`w-6 h-6 rounded-full border text-white font-extrabold flex items-center justify-center text-xs shadow-md ${
            isDamaged
              ? 'bg-red-600 border-red-300 text-red-100'
              : 'bg-emerald-600 border-emerald-300'
          }`}
        >
          {minion.currentHealth}
        </div>
      </div>
    </div>
  );
};
