import React, { useEffect, useState, useRef } from 'react';
import { audio } from '../../services/audioService';
import { Clock, AlertTriangle } from 'lucide-react';

interface TurnTimerProps {
  turnNumber: number;
  activePlayer: 'player' | 'opponent';
  durationSeconds?: number;
  onTimeout: () => void;
  isPaused?: boolean;
}

export const TurnTimer: React.FC<TurnTimerProps> = ({
  turnNumber,
  activePlayer,
  durationSeconds = 45,
  onTimeout,
  isPaused = false
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
  const prevTurnRef = useRef<number>(turnNumber);
  const prevActiveRef = useRef<'player' | 'opponent'>(activePlayer);

  // Reset timer on turn change or active player switch
  useEffect(() => {
    setTimeLeft(durationSeconds);
    prevTurnRef.current = turnNumber;
    prevActiveRef.current = activePlayer;
  }, [turnNumber, activePlayer, durationSeconds]);

  // Real-time countdown loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }

        const nextVal = prev - 1;

        // Audio cues
        if (nextVal <= 5 && nextVal > 0) {
          audio.playTimerTick(true);
        } else if (nextVal === 10) {
          audio.playTimerTick(false);
        }

        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onTimeout, turnNumber, activePlayer]);

  const isPlayer = activePlayer === 'player';
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / durationSeconds) * circumference;

  // Urgency styling
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  let borderColor = isPlayer ? 'border-amber-500/50' : 'border-purple-500/50';
  let badgeBg = isPlayer ? 'bg-amber-950/80 text-amber-300' : 'bg-purple-950/80 text-purple-300';
  let ringColor = isPlayer ? '#f59e0b' : '#a855f7';

  if (isCritical) {
    borderColor = 'border-red-500 animate-pulse';
    badgeBg = 'bg-red-950/90 text-red-200 animate-bounce';
    ringColor = '#ef4444';
  } else if (isUrgent) {
    borderColor = 'border-amber-400';
    badgeBg = 'bg-yellow-950/90 text-amber-200 animate-pulse';
    ringColor = '#eab308';
  }

  const turnLabel = isPlayer ? `YOUR TURN — ${timeLeft}` : `ENEMY TURN — ${timeLeft}`;

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Prominent Banner Badge */}
      <div className={`px-3 py-1 rounded-full border text-xs font-mono font-black tracking-wider uppercase shadow-lg flex items-center gap-1.5 transition-all duration-300 ${badgeBg} ${borderColor}`}>
        {isCritical && <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-spin" />}
        {!isCritical && <Clock className="w-3.5 h-3.5 opacity-80" />}
        <span>{turnLabel}</span>
      </div>

      {/* Circular dial */}
      <div className={`relative flex items-center justify-center rounded-full shadow-lg ${isCritical ? 'shadow-red-500/40' : ''}`}>
        <svg className="w-11 h-11 -rotate-90">
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3.5"
            fill="rgba(15,23,42,0.85)"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            stroke={ringColor}
            strokeWidth="3.5"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <span className={`absolute text-[11px] font-mono font-bold ${isCritical ? 'text-red-400 font-black' : isPlayer ? 'text-amber-300' : 'text-purple-300'}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};
