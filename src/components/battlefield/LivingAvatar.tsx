import React, { useState } from 'react';
import { Binder } from '../../types/binder';
import { FactionEmblem } from '../common/EmblemIcons';
import { Shield, Sword, Heart, Zap, Sparkles, AlertCircle, Info } from 'lucide-react';
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
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showPassiveTooltip, setShowPassiveTooltip] = useState<boolean>(false);

  const canUseHeroPower = !heroPowerUsed && currentMana >= binder.heroPower.cost;
  const isLowHealth = health <= 10 && health > 0;

  // Determine explanation if hero power cannot be used
  let powerReason = '';
  if (!isActiveTurn) {
    powerReason = 'Waiting for your turn to act';
  } else if (heroPowerUsed) {
    powerReason = 'Ability already activated this turn';
  } else if (currentMana < binder.heroPower.cost) {
    powerReason = `Requires ${binder.heroPower.cost} Mana (You have ${currentMana})`;
  } else {
    powerReason = `${binder.heroPower.description} (Click to activate)`;
  }

  return (
    <div className="flex items-center gap-3 select-none relative">
      {/* Avatar Portrait Disc */}
      <div className="relative group">
        {/* Active Turn Glow */}
        {isActiveTurn && (
          <div
            className="absolute -inset-2.5 rounded-full blur-lg opacity-80 animate-pulse pointer-events-none"
            style={{ backgroundColor: binder.visualTheme.primaryColor }}
          />
        )}

        {/* Low Health Heartbeat Alarm Aura */}
        {isLowHealth && (
          <div className="absolute -inset-2 rounded-full bg-red-600/60 blur-md animate-ping pointer-events-none" />
        )}

        {/* Avatar Disc */}
        <div
          onClick={() => {
            audio.playClick();
            if (onAvatarClick) onAvatarClick();
          }}
          className={`
            relative w-16 h-16 rounded-full border-4 overflow-hidden flex items-center justify-center
            bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 shadow-2xl cursor-pointer
            transition-all duration-300 transform
            ${isTakingDamage ? 'animate-bounce border-red-500 scale-110' : 'hover:scale-105 active:scale-95'}
            ${isTargetable ? 'ring-4 ring-red-400 animate-pulse' : ''}
            ${isActiveTurn ? 'border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]' : 'border-slate-700'}
            ${isLowHealth ? 'ring-2 ring-red-500/80 animate-pulse' : ''}
          `}
          style={{
            boxShadow: isActiveTurn ? `0 0 25px ${binder.visualTheme.accentGlow}` : undefined
          }}
        >
          {/* Subtle Breathing overlay animation */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none transition-opacity duration-1000 animate-pulse"
            style={{ backgroundColor: binder.visualTheme.primaryColor }}
          />

          {/* Faction Emblem & Character Initials */}
          <div className="flex flex-col items-center justify-center text-center z-10">
            <FactionEmblem faction={binder.faction} size="md" />
            <span className="font-cinzel font-extrabold text-[12px] text-white drop-shadow tracking-wider leading-none mt-0.5">
              {binder.name.split(' ')[0]}
            </span>
          </div>

          {/* Emotion reaction indicators */}
          {isLowHealth && (
            <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          )}
        </div>

        {/* Health Orb (Bottom Right) */}
        <div 
          className={`
            absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center font-extrabold text-white text-xs shadow-lg drop-shadow
            transition-transform duration-200
            ${isLowHealth ? 'bg-gradient-to-tr from-red-700 to-rose-600 animate-pulse scale-110 ring-2 ring-red-400' : 'bg-gradient-to-tr from-red-600 to-rose-400'}
          `}
        >
          {health}
        </div>

        {/* Armor Badge (Top Left if armor > 0) */}
        {armor > 0 && (
          <div className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-full bg-slate-900 border border-amber-400/80 flex items-center gap-0.5 text-[10px] font-extrabold text-amber-300 shadow-md animate-scaleIn">
            <Shield className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{armor}</span>
          </div>
        )}
      </div>

      {/* Info, Passive & Hero Power */}
      <div className="flex flex-col min-w-[140px]">
        {/* Binder Name & Title */}
        <div className="flex items-center gap-2">
          <span className="font-cinzel font-black text-sm text-slate-100 drop-shadow flex items-center gap-1">
            {binder.name}
          </span>
          <span
            className="text-[9px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full border border-white/10"
            style={{ 
              backgroundColor: `${binder.visualTheme.primaryColor}22`, 
              color: binder.visualTheme.secondaryColor || binder.visualTheme.primaryColor 
            }}
          >
            {binder.title}
          </span>
        </div>

        {/* Passive Trait Chip with Tooltip */}
        {binder.passive && (
          <div 
            className="relative mt-0.5"
            onMouseEnter={() => setShowPassiveTooltip(true)}
            onMouseLeave={() => setShowPassiveTooltip(false)}
          >
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300/90 hover:text-amber-200 cursor-help bg-slate-950/70 px-2 py-0.5 rounded-md border border-amber-500/30 transition-colors">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span className="truncate max-w-[120px]">{binder.passive.name}</span>
            </div>

            {/* Passive Tooltip */}
            {showPassiveTooltip && (
              <div className="absolute left-0 top-full mt-1 z-50 w-56 p-2 rounded-xl bg-slate-900/95 border border-amber-500/50 shadow-2xl text-slate-100 text-xs backdrop-blur-md animate-fadeIn">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Passive: {binder.passive.name}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {binder.passive.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Hero Power Button (Player) */}
        {!isEnemy && onHeroPowerClick && (
          <div 
            className="relative mt-1"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              onClick={() => {
                if (canUseHeroPower && isActiveTurn) {
                  audio.playClick();
                  onHeroPowerClick();
                }
              }}
              disabled={!canUseHeroPower || !isActiveTurn}
              className={`
                px-3 py-1 rounded-xl border flex items-center gap-1.5 text-xs font-black
                transition-all duration-300 shadow-md group
                ${
                  canUseHeroPower && isActiveTurn
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 hover:from-indigo-500 hover:to-amber-400 border-amber-300 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] active:scale-95 hover:scale-105'
                    : 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed opacity-75'
                }
              `}
            >
              <Zap className={`w-3.5 h-3.5 ${canUseHeroPower && isActiveTurn ? 'text-amber-300 fill-amber-300 animate-pulse' : 'text-slate-600'}`} />
              <span className="truncate max-w-[95px]">{binder.heroPower.name}</span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                canUseHeroPower && isActiveTurn ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
              }`}>
                {binder.heroPower.cost}
              </span>
            </button>

            {/* Hero Power Tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-full mt-1.5 z-50 w-60 p-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl text-slate-100 text-xs backdrop-blur-md animate-fadeIn">
                <div className="flex items-center justify-between font-bold text-amber-300 mb-1">
                  <span>{binder.heroPower.name}</span>
                  <span className="text-[10px] text-sky-400 font-mono">Cost: {binder.heroPower.cost} Mana</span>
                </div>
                <p className="text-[11px] text-slate-300 mb-1.5 leading-snug">
                  {binder.heroPower.description}
                </p>
                <div className={`text-[10px] font-bold flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  canUseHeroPower && isActiveTurn ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'
                }`}>
                  <Info className="w-3 h-3 flex-shrink-0" />
                  <span>{powerReason}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enemy Hero Power Display */}
        {isEnemy && (
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800 w-fit">
            <Zap className={`w-3 h-3 ${heroPowerUsed ? 'text-slate-600' : 'text-rose-400 fill-rose-400'}`} />
            <span className="font-bold truncate max-w-[100px]">{binder.heroPower.name}</span>
            <span className="text-[9px] text-slate-500">({binder.heroPower.cost})</span>
          </div>
        )}
      </div>
    </div>
  );
};
