import React from 'react';
import { Card, CardRarity } from '../../types/card';
import { CardArt } from './CardArt';
import { FactionEmblem, CardTypeEmblem, RarityEmblem, KeywordBadge } from '../common/EmblemIcons';
import { Shield, Sword, Heart, Clock, Sparkles } from 'lucide-react';
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
  const getRarityBorder = (rarity: CardRarity) => {
    switch (rarity) {
      case 'Rare': return 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'Epic': return 'border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.6)]';
      case 'Legendary': return 'border-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.7)]';
      case 'Mythic': return 'border-pink-400 shadow-[0_0_30px_rgba(244,63,94,0.85)]';
      default: return 'border-slate-500 shadow-md';
    }
  };

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
        relative rounded-2xl border-[2.5px] overflow-hidden flex flex-col select-none cursor-pointer
        card-hover-tilt transition-all duration-200
        ${getRarityBorder(card.rarity)}
        ${isPlayable ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] scale-[1.02]' : ''}
        ${isSelected ? 'ring-4 ring-amber-400 scale-105 z-20' : ''}
        bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl
      `}
    >
      {/* Foil overlay for Legendary & Mythic */}
      {(card.rarity === 'Legendary' || card.rarity === 'Mythic') && (
        <div className="foil-overlay z-30" />
      )}

      {/* Top Header: Faction Emblem, Mana Gem, Name, Rarity */}
      <div className="relative z-20 flex items-center justify-between px-2 py-1 bg-slate-950/95 border-b border-white/10">
        {/* Left: Mana Crystal Orb */}
        <div className="relative -ml-1 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-600 via-cyan-400 to-sky-200 border-2 border-white font-extrabold text-slate-950 flex items-center justify-center shadow-[0_0_10px_rgba(14,165,233,0.9)] text-xs drop-shadow">
            {card.cost}
          </div>
        </div>

        {/* Center: Card Name */}
        <div className="flex-1 px-1.5 font-cinzel font-bold text-slate-100 truncate text-center drop-shadow text-[11px]">
          {card.name}
        </div>

        {/* Right: Rarity & Faction Emblems */}
        <div className="flex items-center gap-1">
          <FactionEmblem faction={card.faction} size="sm" />
          <RarityEmblem rarity={card.rarity} size="sm" />
        </div>
      </div>

      {/* Art Window */}
      <div className="relative z-10 w-full h-[40%] border-b border-white/10 overflow-hidden">
        <CardArt theme={card.artworkPlaceholderTheme} faction={card.faction} type={card.type} />
        
        {/* Type Emblem Tag */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-slate-950/85 text-[9px] font-bold text-slate-200 border border-white/15 flex items-center gap-1 shadow">
          <CardTypeEmblem type={card.type} size="sm" />
          <span>{card.type}</span>
        </div>
      </div>

      {/* Card Body & Description */}
      <div className="relative z-20 flex-1 p-2 bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-between">
        {/* Keyword Badges */}
        {card.keywords && card.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {card.keywords.map((kw, i) => (
              <KeywordBadge key={i} keyword={kw} />
            ))}
          </div>
        )}

        {/* Card Text */}
        <p className="text-slate-200 leading-tight flex-1 overflow-hidden font-normal text-[11px]">
          {card.description}
        </p>

        {/* Ritual countdown if applicable */}
        {card.type === 'Ritual' && card.ritualCountdown && (
          <div className="flex items-center gap-1 text-amber-400 text-[10px] mt-1 font-bold">
            <Clock className="w-3 h-3" /> Countdown: {card.ritualCountdown} turns
          </div>
        )}
      </div>

      {/* Bottom Footer: Stats (Attack / Health / Durability) */}
      {(card.attack !== undefined || card.health !== undefined || card.durability !== undefined) && (
        <div className="relative z-20 flex justify-between items-center px-2 py-1 bg-slate-950/95 border-t border-white/10 font-bold">
          {/* Attack Gem */}
          {card.attack !== undefined ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400 text-amber-300 drop-shadow">
              <Sword className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-extrabold">{card.attack}</span>
            </div>
          ) : <div />}

          {/* Creature Type Tag */}
          {card.creatureType && card.creatureType !== 'None' && (
            <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
              {card.creatureType}
            </div>
          )}

          {/* Health or Durability Gem */}
          {card.health !== undefined ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500/20 border border-red-400 text-red-300 drop-shadow">
              <Heart className="w-3.5 h-3.5 fill-red-400" />
              <span className="font-extrabold">{card.health}</span>
            </div>
          ) : card.durability !== undefined ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-500/20 border border-slate-400 text-slate-200 drop-shadow">
              <Shield className="w-3.5 h-3.5 fill-slate-300" />
              <span className="font-extrabold">{card.durability}</span>
            </div>
          ) : <div />}
        </div>
      )}

      {/* Show Count Badge in Collection */}
      {showCount !== undefined && showCount > 0 && (
        <div className="absolute top-1 left-1 z-30 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] shadow-lg border border-white/60">
          x{showCount}
        </div>
      )}
    </div>
  );
};
