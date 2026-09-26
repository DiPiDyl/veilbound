import React, { useEffect, useState } from 'react';

export interface CombatAnimationEvent {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  damage: number;
  archetype: 'Melee' | 'Magic' | 'Ranged' | 'Cosmic' | 'Nature' | 'Spectral';
}

interface CombatAnimationOverlayProps {
  activeAnimation: CombatAnimationEvent | null;
  onAnimationComplete: () => void;
}

export const CombatAnimationOverlay: React.FC<CombatAnimationOverlayProps> = ({
  activeAnimation,
  onAnimationComplete
}) => {
  const [phase, setPhase] = useState<'anticipation' | 'flight' | 'impact' | 'reaction' | 'done'>('anticipation');

  useEffect(() => {
    if (!activeAnimation) {
      setPhase('done');
      return;
    }

    setPhase('anticipation');

    // 1. Anticipation (100ms)
    const t1 = setTimeout(() => {
      setPhase('flight');
    }, 120);

    // 2. Flight to target (180ms)
    const t2 = setTimeout(() => {
      setPhase('impact');
    }, 300);

    // 3. Impact & hit-stop (140ms)
    const t3 = setTimeout(() => {
      setPhase('reaction');
    }, 450);

    // 4. Complete
    const t4 = setTimeout(() => {
      setPhase('done');
      onAnimationComplete();
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [activeAnimation, onAnimationComplete]);

  if (!activeAnimation || phase === 'done') return null;

  const { sourceX, sourceY, targetX, targetY, damage, archetype } = activeAnimation;

  // Colors & styles per archetype
  const archetypeStyles = {
    Melee: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', symbol: '⚔️', particles: ['💥', '⚡', '✨'] },
    Magic: { color: '#818cf8', glow: 'rgba(129, 140, 248, 0.8)', symbol: '🔮', particles: ['✨', '💫', '🟣'] },
    Ranged: { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.8)', symbol: '🏹', particles: ['🔷', '💨', '⚡'] },
    Cosmic: { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.9)', symbol: '🌌', particles: ['🪐', '✨', '🟣'] },
    Nature: { color: '#4ade80', glow: 'rgba(74, 222, 128, 0.8)', symbol: '🌿', particles: ['🍃', '🌱', '💚'] },
    Spectral: { color: '#67e8f9', glow: 'rgba(103, 232, 249, 0.85)', symbol: '👻', particles: ['💀', '🌫️', '❄️'] }
  }[archetype] || { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', symbol: '⚔️', particles: ['💥', '⚡'] };

  // Current position of the flying strike projectile
  const currentX = phase === 'flight' || phase === 'impact' || phase === 'reaction' ? targetX : sourceX;
  const currentY = phase === 'flight' || phase === 'impact' || phase === 'reaction' ? targetY : sourceY;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Screen Shake during impact */}
      {phase === 'impact' && (
        <div className="fixed inset-0 bg-red-500/10 backdrop-blur-[1px] animate-ping" />
      )}

      {/* Anticipation Flash at Attacker */}
      {phase === 'anticipation' && (
        <div
          style={{ left: `${sourceX}px`, top: `${sourceY}px`, backgroundColor: archetypeStyles.glow }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full animate-ping opacity-75"
        />
      )}

      {/* Flying Strike / Projectile */}
      {(phase === 'flight' || phase === 'anticipation') && (
        <div
          style={{
            left: `${currentX}px`,
            top: `${currentY}px`,
            transition: phase === 'flight' ? 'all 0.18s cubic-bezier(0.2, 0, 0, 1)' : 'none',
            filter: `drop-shadow(0 0 16px ${archetypeStyles.glow})`
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 text-3xl font-black scale-125"
        >
          {archetypeStyles.symbol}
        </div>
      )}

      {/* Impact Explosion */}
      {(phase === 'impact' || phase === 'reaction') && (
        <div
          style={{ left: `${targetX}px`, top: `${targetY}px` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        >
          {/* Shockwave ring */}
          <div
            style={{ borderColor: archetypeStyles.color, boxShadow: `0 0 35px ${archetypeStyles.glow}` }}
            className="w-28 h-28 rounded-full border-4 animate-ping opacity-90"
          />

          {/* Impact Particles Burst */}
          <div className="absolute flex gap-2 text-xl animate-bounce">
            {archetypeStyles.particles.map((p, i) => (
              <span key={i} className="animate-spin">{p}</span>
            ))}
          </div>

          {/* Floating Damage Number */}
          <div
            className="absolute -top-12 text-4xl font-cinzel font-black text-rose-400 drop-shadow-[0_4px_10px_rgba(239,68,68,0.9)] animate-[bounce_0.6s_ease-out]"
            style={{ textShadow: '0 0 12px rgba(225, 29, 72, 0.9)' }}
          >
            -{damage}
          </div>
        </div>
      )}
    </div>
  );
};
