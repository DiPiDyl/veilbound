import React, { useEffect, useRef } from 'react';
import { VeilState } from '../../types/card';
import { VEIL_DETAILS } from '../../engine/veilEngine';

interface BattlefieldParticlesProps {
  veilState: VeilState;
  battlefieldTheme?: string;
}

export const BattlefieldParticles: React.FC<BattlefieldParticlesProps> = ({ 
  veilState,
  battlefieldTheme = 'shattered-city' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Floating Environmental Elements
    const elements = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 8 + 3,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: -Math.random() * 0.8 - 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      alpha: Math.random() * 0.6 + 0.2,
      type: Math.random() > 0.6 ? 'shape' : 'orb'
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      const particleColor = VEIL_DETAILS[veilState].ambientParticle;

      for (const el of elements) {
        el.x += el.speedX;
        el.y += el.speedY;
        el.rotation += el.rotSpeed;

        if (el.y < -20) {
          el.y = height + 20;
          el.x = Math.random() * width;
        }
        if (el.x < -20) el.x = width + 20;
        if (el.x > width + 20) el.x = -20;

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(0.8, el.alpha));

        if (battlefieldTheme === 'ashen-citadel') {
          // Embers
          ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#ef4444';
          ctx.beginPath();
          ctx.arc(0, 0, el.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (battlefieldTheme === 'rootsea') {
          // Glowing Spores & leaves
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.ellipse(0, 0, el.size, el.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (battlefieldTheme === 'astral-library') {
          // Floating parchment fragments & gears
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-el.size / 2, -el.size / 2, el.size, el.size * 0.7);
        } else if (battlefieldTheme === 'the-veil') {
          // Cosmic prismatic rifts
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(0, -el.size);
          ctx.lineTo(el.size * 0.7, el.size * 0.7);
          ctx.lineTo(-el.size * 0.7, el.size * 0.7);
          ctx.closePath();
          ctx.fill();
        } else {
          // Shattered city debris
          ctx.fillStyle = particleColor;
          ctx.beginPath();
          ctx.arc(0, 0, el.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [veilState, battlefieldTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-70"
    />
  );
};
