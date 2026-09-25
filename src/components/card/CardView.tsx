import React from 'react';
import { Card, CardRarity } from '../../types/card';
import { CardArt } from './CardArt';
import { Shield, Sword, Heart, Sparkles, Clock } from 'lucide-react';
import { audio } from '../../services/audioService';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: number;
  isSelected?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  isPlayable = false,
  size = 'md',
  showCount,
  isSelected = false
}) => {
  const getRarityClass = (rarity: CardRarity) => {
    switch (rarity) {
      case 'Rare': return 'rarity-rare';
      case 'Epic': return 'rarity-epic';
      case 'Legendary': return 'rarity-legendary';
      case 'Mythic': return 'rarity-mythic';
      default: return 'rarity-common';
    }
  };

  const getRarityGemColor = (rarity: CardRarity) => {
    switch (rarity) {
      case 'Rare': return 'bg-blue-500 shadow-blue-500/50';
      case 'Epic': return 'bg-purple-500 shadow-purple-500/50';
      case 'Legendary': return 'bg-amber-400 shadow-amber-500/50';
      case 'Mythic': return 'bg-pink-500 shadow-pink-500/50 animate-pulse';
      default: return 'bg-slate-400';
    }
  };

  // Dimensions based on size
  const dimensions = {
    sm: 'w-36 h-52 text-[10px]',
    md: 'w-48 h-68 text-xs',
    lg: 'w-64 h-92 text-sm'
  }[size];

  const handleMouseEnter = () => {
    audio.playCardHover();
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`
        ${dimensions}
        relative rounded-xl border-2 overflow-hidden flex flex-col select-none cursor-pointer
        card-hover-tilt transition-all duration-200
        ${getRarityClass(card.rarity)}
        ${isPlayable ? 'ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : ''}
        ${isSelected ? 'ring-2 ring-amber-400 scale-105' : ''}
        bg-slate-900 shadow-2xl
      `}
    >
      {/* Foil overlay for Legendary & Mythic */}
      {(card.rarity === 'Legendary' || card.rarity === 'Mythic') && (
        <div className="foil-overlay z-30" />
      )}

      {/* Top Header: Cost, Name, Faction */}
      <div className="relative z-20 flex items-center justify-between p-1.5 bg-gradient-to-b from-slate-950 to-slate-900/90 border-b border-white/10">
        {/* Mana Cost Gem */}
        <div className="w-6 h-6 rounded-full bg-sky-600 border border-sky-300 font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(14,165,233,0.8)] text-xs">
          {card.cost}
        </div>

        {/* Card Name */}
        <div className="flex-1 px-1 font-cinzel font-bold text-slate-100 truncate text-center drop-shadow">
          {card.name}
        </div>

        {/* Rarity Gem */}
        <div className={`w-2.5 h-2.5 rounded-full ${getRarityGemColor(card.rarity)} border border-white/30 shadow`} />
      </div>

      {/* Art Window */}
      <div className="relative z-10 w-full h-[38%] border-b border-white/10">
        <CardArt theme={card.artworkPlaceholderTheme} faction={card.faction} type={card.type} />
        {/* Card Type Tag */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-medium text-slate-300 border border-white/15">
          {card.type}
        </div>
      </div>

      {/* Card Body & Description */}
      <div className="relative z-20 flex-1 p-2 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-between">
        {/* Keywords */}
        {card.keywords && card.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {card.keywords.map((kw, i) => (
              <span key={i} className="px-1 py-0.2 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 text-[9px] font-semibold">
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Text */}
        <p className="text-slate-200 leading-tight flex-1 overflow-hidden font-normal text-[11px]">
          {card.description}
        </p>

        {/* Ritual countdown indicator if applicable */}
        {card.type === 'Ritual' && card.ritualCountdown && (
          <div className="flex items-center gap-1 text-amber-400 text-[10px] mt-1 font-semibold">
            <Clock className="w-3 h-3" /> Countdown: {card.ritualCountdown} turns
          </div>
        )}
      </div>

      {/* Bottom Footer: Stats (Attack / Health / Durability) */}
      {(card.attack !== undefined || card.health !== undefined || card.durability !== undefined) && (
        <div className="relative z-20 flex justify-between items-center px-2 py-1 bg-slate-950/90 border-t border-white/10 font-bold">
          {/* Attack */}
          {card.attack !== undefined ? (
            <div className="flex items-center gap-1 text-amber-400 drop-shadow">
              <Sword className="w-3.5 h-3.5 fill-amber-400" />
              <span>{card.attack}</span>
            </div>
          ) : <div />}

          {/* Creature Type / Subtype */}
          {card.creatureType && card.creatureType !== 'None' && (
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
              {card.creatureType}
            </div>
          )}

          {/* Health or Durability */}
          {card.health !== undefined ? (
            <div className="flex items-center gap-1 text-red-400 drop-shadow">
              <Heart className="w-3.5 h-3.5 fill-red-400" />
              <span>{card.health}</span>
            </div>
          ) : card.durability !== undefined ? (
            <div className="flex items-center gap-1 text-slate-300 drop-shadow">
              <Shield className="w-3.5 h-3.5 fill-slate-300" />
              <span>{card.durability}</span>
            </div>
          ) : <div />}
        </div>
      )}

      {/* Show Count Badge in Collection */}
      {showCount !== undefined && showCount > 0 && (
        <div className="absolute top-1 left-1 z-30 px-1.5 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[10px] shadow-lg border border-white/40">
          x{showCount}
        </div>
      )}
    </div>
  );
};
