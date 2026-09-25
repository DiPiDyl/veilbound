import React from 'react';
import { FactionId, CardType, CardRarity, Keyword } from '../../types/card';
import { 
  Shield, Sword, Flame, Sprout, Skull, Clock, Sun, 
  Sparkles, Layers, Crown, Zap, Eye, Box, Compass, 
  Snowflake, Feather, Activity, Moon, Droplets
} from 'lucide-react';

interface EmblemProps {
  className?: string;
  size?: number;
}

// 1. Faction Emblems
export const FactionEmblem: React.FC<{ faction: FactionId; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  faction,
  size = 'md'
}) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-9 h-9',
    xl: 'w-14 h-14'
  }[size];

  switch (faction) {
    case 'Aetherbound':
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]`}>
          <Compass className="w-full h-full animate-spin duration-[30s]" />
          <div className="absolute inset-0 bg-indigo-500/20 blur-sm rounded-full pointer-events-none" />
        </div>
      );
    case 'AshenCitadel':
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]`}>
          <Shield className="w-full h-full fill-red-950/80 stroke-red-400" />
          <Flame className="w-1/2 h-1/2 text-amber-400 absolute" />
        </div>
      );
    case 'ViridianHive':
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]`}>
          <Sprout className="w-full h-full fill-emerald-950/80" />
        </div>
      );
    case 'UmbralRemnant':
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]`}>
          <Skull className="w-full h-full fill-purple-950/80 stroke-purple-300" />
        </div>
      );
    case 'ChronocastArchive':
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]`}>
          <Clock className="w-full h-full fill-amber-950/80" />
        </div>
      );
    case 'AstralAscendancy':
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]`}>
          <Sun className="w-full h-full fill-cyan-950/80 stroke-cyan-300 animate-pulse-slow" />
        </div>
      );
    default:
      return (
        <div className={`${sizeClass} relative flex items-center justify-center text-slate-400`}>
          <Feather className="w-full h-full" />
        </div>
      );
  }
};

// 2. Card Type Emblems
export const CardTypeEmblem: React.FC<{ type: CardType; size?: 'sm' | 'md' }> = ({
  type,
  size = 'sm'
}) => {
  const iconClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  switch (type) {
    case 'Minion':
      return <Shield className={`${iconClass} text-sky-400`} />;
    case 'Spell':
      return <Sparkles className={`${iconClass} text-purple-400`} />;
    case 'Relic':
      return <Box className={`${iconClass} text-amber-400`} />;
    case 'Weapon':
      return <Sword className={`${iconClass} text-red-400`} />;
    case 'Ritual':
      return <Moon className={`${iconClass} text-indigo-400`} />;
    case 'Event':
      return <Layers className={`${iconClass} text-pink-400`} />;
    case 'Champion':
      return <Crown className={`${iconClass} text-yellow-300`} />;
  }
};

// 3. Rarity Emblems
export const RarityEmblem: React.FC<{ rarity: CardRarity; size?: 'sm' | 'md' }> = ({
  rarity,
  size = 'sm'
}) => {
  const sizeClass = size === 'sm' ? 'w-2.5 h-2.5' : 'w-4 h-4';

  switch (rarity) {
    case 'Rare':
      return <div className={`${sizeClass} rotate-45 bg-blue-500 border border-white/60 shadow-[0_0_6px_rgba(59,130,246,0.8)] rounded-xs`} />;
    case 'Epic':
      return <div className={`${sizeClass} rotate-45 bg-purple-500 border border-white/60 shadow-[0_0_8px_rgba(168,85,247,0.9)] rounded-xs`} />;
    case 'Legendary':
      return <div className={`${sizeClass} rotate-45 bg-amber-400 border border-white/80 shadow-[0_0_10px_rgba(251,191,36,1)] rounded-xs animate-pulse`} />;
    case 'Mythic':
      return <div className={`${sizeClass} rotate-45 bg-gradient-to-tr from-pink-500 via-rose-400 to-amber-300 border-2 border-white shadow-[0_0_14px_rgba(244,63,94,1)] rounded-xs animate-spin duration-[8s]`} />;
    default:
      return <div className={`${sizeClass} rounded-full bg-slate-400 border border-white/40 shadow-xs`} />;
  }
};

// 4. Keyword Badges
export const KeywordBadge: React.FC<{ keyword: Keyword }> = ({ keyword }) => {
  const getIcon = () => {
    switch (keyword) {
      case 'Taunt': return <Shield className="w-2.5 h-2.5" />;
      case 'Rush': return <Zap className="w-2.5 h-2.5" />;
      case 'Charge': return <Sword className="w-2.5 h-2.5" />;
      case 'Lifesteal': return <Droplets className="w-2.5 h-2.5" />;
      case 'DivineShield': return <Sun className="w-2.5 h-2.5" />;
      case 'Deathrattle': return <Skull className="w-2.5 h-2.5" />;
      case 'Battlecry': return <Sparkles className="w-2.5 h-2.5" />;
      case 'Freeze': return <Snowflake className="w-2.5 h-2.5" />;
      case 'Poison': return <Droplets className="w-2.5 h-2.5" />;
      case 'Echo': return <Activity className="w-2.5 h-2.5" />;
      case 'Veilshift': return <Compass className="w-2.5 h-2.5" />;
      case 'Ritual': return <Clock className="w-2.5 h-2.5" />;
      case 'Forecast': return <Eye className="w-2.5 h-2.5" />;
      case 'Consume': return <Flame className="w-2.5 h-2.5" />;
      default: return <Sparkles className="w-2.5 h-2.5" />;
    }
  };

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900/90 text-indigo-300 border border-indigo-500/40 text-[9px] font-bold shadow-xs">
      {getIcon()}
      <span>{keyword}</span>
    </span>
  );
};
