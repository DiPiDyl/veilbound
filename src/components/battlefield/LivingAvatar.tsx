import React from 'react';
import { Binder } from '../../types/binder';
import { FactionEmblem } from '../common/EmblemIcons';
import { Shield, Sword, Heart, Zap } from 'lucide-react';
import { audio } from '../../services/audioService';

interface LivingAvatarProps {
  binder: Binder;
  health: number;
  maxHealth: number;
  armor: number;
  isEnemy?: boolean;
  isActiveTurn?: boolean;
  isTakingDamage?: boolean;
  isTargetable?: boolean;
  heroPowerUsed?: boolean;
  currentMana?: number;
  onHeroPowerClick?: () => void;
  onAvatarClick?: () => void;
}

export const LivingAvatar: React.FC<LivingAvatarProps> = ({
  binder,
  health,
  maxHealth,
  armor,
  isEnemy = false,
  isActiveTurn = false,
  isTakingDamage = false,
  isTargetable = false,
  heroPowerUsed = false,
  currentMana = 0,
  onHeroPowerClick,
  onAvatarClick
}) => {
  const canUseHeroPower = !heroPowerUsed && currentMana >= binder.heroPower.cost;

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Avatar Portrait Bubble */}
      <div className="relative">
        {/* Active Turn Glow */}
        {isActiveTurn && (
          <div
            className="absolute -inset-2 rounded-full blur-md opacity-80 animate-pulse pointer-events-none"
            style={{ backgroundColor: binder.visualTheme.primaryColor }}
          />
        )}

        {/* Avatar Disc */}
        <div
          onClick={onAvatarClick}
          className={`
            relative w-16 h-16 rounded-full border-4 overflow-hidden flex items-center justify-center
            bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 shadow-2xl cursor-pointer
            transition-transform duration-300
            ${isTakingDamage ? 'animate-bounce border-red-500 scale-110' : 'hover:scale-105'}
            ${isTargetable ? 'ring-4 ring-red-400 animate-pulse' : ''}
            ${isActiveTurn ? 'border-white animate-float' : 'border-slate-600'}
          `}
        >
          {/* Faction Emblem & Character Initials */}
          <div className="flex flex-col items-center justify-center text-center">
            <FactionEmblem faction={binder.faction} size="md" />
            <span className="font-cinzel font-extrabold text-sm text-white drop-shadow">
              {binder.name.split(' ')[0]}
            </span>
          </div>

          {/* Subdued Faction overlay background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundColor: binder.visualTheme.primaryColor }}
          />
        </div>

        {/* Health Orb (Bottom Right) */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 border-2 border-white flex items-center justify-center font-extrabold text-white text-xs shadow-lg drop-shadow">
          {health}
        </div>

        {/* Armor Badge (Top Left if armor > 0) */}
        {armor > 0 && (
          <div className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-slate-800 border border-slate-300 flex items-center gap-0.5 text-[10px] font-extrabold text-white shadow-md">
            <Shield className="w-3 h-3 fill-slate-300 text-slate-300" />
            <span>{armor}</span>
          </div>
        )}
      </div>

      {/* Info & Hero Power */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-cinzel font-bold text-sm text-slate-100 drop-shadow">
            {binder.name}
          </span>
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded"
            style={{ backgroundColor: `${binder.visualTheme.primaryColor}33`, color: binder.visualTheme.primaryColor }}
          >
            {binder.title}
          </span>
        </div>

        {/* Hero Power Button (Player only) */}
        {!isEnemy && onHeroPowerClick && (
          <button
            onClick={onHeroPowerClick}
            disabled={!canUseHeroPower || !isActiveTurn}
            className={`
              mt-1.5 px-3 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-bold
              transition-all duration-200 shadow-md
              ${
                canUseHeroPower && isActiveTurn
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-300 text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] active:scale-95'
                  : 'bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed'
              }
            `}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>{binder.heroPower.name}</span>
            <span className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
              {binder.heroPower.cost}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
