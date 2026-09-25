import React from 'react';
import { FactionId, CardType } from '../../types/card';
import { 
  Sparkles, Shield, Flame, Sprout, Skull, Clock, Sun, 
  Sword, Feather, Eye, Zap, Compass, Box, Crown, Anchor, 
  Wind, Moon, AlertTriangle, Atom, Layers
} from 'lucide-react';

interface CardArtProps {
  theme: string;
  faction: FactionId;
  type: CardType;
}

export const CardArt: React.FC<CardArtProps> = ({ theme, faction, type }) => {
  const getGradient = () => {
    switch (faction) {
      case 'Aetherbound':
        return 'from-indigo-900 via-purple-900 to-slate-950';
      case 'AshenCitadel':
        return 'from-red-950 via-orange-950 to-stone-950';
      case 'ViridianHive':
        return 'from-emerald-950 via-teal-950 to-slate-950';
      case 'UmbralRemnant':
        return 'from-purple-950 via-gray-950 to-violet-950';
      case 'ChronocastArchive':
        return 'from-amber-950 via-stone-900 to-yellow-950';
      case 'AstralAscendancy':
        return 'from-cyan-950 via-sky-950 to-indigo-950';
      default:
        return 'from-slate-900 via-zinc-900 to-slate-950';
    }
  };

  const getIcon = () => {
    if (theme.includes('shield') || theme.includes('armor')) return <Shield className="w-10 h-10 opacity-75" />;
    if (theme.includes('sword') || theme.includes('blade') || theme.includes('axe')) return <Sword className="w-10 h-10 opacity-75" />;
    if (theme.includes('spore') || theme.includes('tree') || theme.includes('bloom')) return <Sprout className="w-10 h-10 opacity-75" />;
    if (theme.includes('skull') || theme.includes('mask') || theme.includes('death')) return <Skull className="w-10 h-10 opacity-75" />;
    if (theme.includes('clock') || theme.includes('chrono') || theme.includes('time')) return <Clock className="w-10 h-10 opacity-75" />;
    if (theme.includes('sun') || theme.includes('radiant') || theme.includes('dawn')) return <Sun className="w-10 h-10 opacity-75" />;
    if (theme.includes('fire') || theme.includes('flame') || theme.includes('pyre')) return <Flame className="w-10 h-10 opacity-75" />;
    if (theme.includes('dragon') || theme.includes('beast') || theme.includes('titan')) return <Eye className="w-10 h-10 opacity-75" />;
    if (theme.includes('portal') || theme.includes('rift') || theme.includes('veil')) return <Compass className="w-10 h-10 opacity-75" />;
    if (type === 'Weapon') return <Sword className="w-10 h-10 opacity-75" />;
    if (type === 'Ritual') return <Moon className="w-10 h-10 opacity-75" />;
    if (type === 'Event') return <Layers className="w-10 h-10 opacity-75" />;
    if (type === 'Relic') return <Box className="w-10 h-10 opacity-75" />;
    return <Sparkles className="w-10 h-10 opacity-75" />;
  };

  return (
    <div className={`w-full h-full bg-gradient-to-b ${getGradient()} flex items-center justify-center relative overflow-hidden`}>
      {/* Background geometric runes */}
      <div className="absolute inset-0 opacity-15 flex items-center justify-center">
        <div className="w-24 h-24 border border-white/30 rounded-full animate-spin duration-[40s]" />
        <div className="w-16 h-16 border border-white/20 rotate-45 absolute" />
      </div>

      {/* Main thematic icon */}
      <div className="relative z-10 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
        {getIcon()}
      </div>

      {/* Atmospheric vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] pointer-events-none" />
    </div>
  );
};
