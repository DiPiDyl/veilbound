import React, { useEffect, useState } from 'react';

export interface FloatingText {
  id: string;
  text: string;
  x: number; // percentage
  y: number; // percentage
  color: string;
}

interface BattlefieldVFXProps {
  screenShake: boolean;
  floatingTexts: FloatingText[];
}

export const BattlefieldVFX: React.FC<BattlefieldVFXProps> = ({
  screenShake,
  floatingTexts
}) => {
  return (
    <div className={`pointer-events-none absolute inset-0 z-40 overflow-hidden ${screenShake ? 'animate-shake' : ''}`}>
      {/* Floating combat numbers */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          style={{ left: `${ft.x}%`, top: `${ft.y}%` }}
          className={`absolute font-cinzel font-black text-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] animate-floatUp ${ft.color}`}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
};
