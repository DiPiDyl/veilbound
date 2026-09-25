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

  // Reset timer on turn change
  useEffect(() => {
    setTimeLeft(durationSeconds);
    prevTurnRef.current = turnNumber;
  }, [turnNumber, activePlayer, durationSeconds]);

  // Countdown loop
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

        // Play audio cues
        if (nextVal <= 5 && nextVal > 0) {
          audio.playTimerTick(true);
        } else if (nextVal === 10 || nextVal === 15) {
          audio.playTimerTick(false);
        }

        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, onTimeout]);

  // Color and styling based on urgency
  const getTimerStyles = () => {
    if (timeLeft <= 5) {
      return {
        textColor: 'text-red-400 font-extrabold animate-bounce text-lg',
        ringColor: '#ef4444',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.9)] animate-pulse'
      };
    }
    if (timeLeft <= 15) {
      return {
        textColor: 'text-amber-400 font-bold animate-pulse text-base',
        ringColor: '#f59e0b',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.6)]'
      };
    }
    return {
      textColor: 'text-emerald-400 font-bold text-sm',
      ringColor: '#10b981',
      glow: 'shadow-[0_0_10px_rgba(16,185,129,0.4)]'
    };
  };

  const styles = getTimerStyles();
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / durationSeconds) * circumference;

  return (
    <div className={`relative flex items-center justify-center select-none ${styles.glow} rounded-full`}>
      <svg className="w-14 h-14 -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="rgba(15,23,42,0.9)"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke={styles.ringColor}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-linear"
        />
      </svg>

      {/* Countdown digit */}
      <div className={`absolute flex flex-col items-center justify-center ${styles.textColor}`}>
        <span className="leading-none">{timeLeft}s</span>
      </div>
    </div>
  );
};
