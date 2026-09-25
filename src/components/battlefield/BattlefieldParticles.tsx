import React, { useEffect, useRef } from 'react';
import { VeilState } from '../../types/card';
import { VEIL_DETAILS } from '../../engine/veilEngine';

interface BattlefieldParticlesProps {
  veilState: VeilState;
}

export const BattlefieldParticles: React.FC<BattlefieldParticlesProps> = ({ veilState }) => {
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

    const particleCount = 40;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: -Math.random() * 0.6 - 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      fadeSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1)
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const particleColor = VEIL_DETAILS[veilState].ambientParticle;

      ctx.fillStyle = particleColor;

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += p.fadeSpeed;

        if (p.alpha <= 0.1 || p.alpha >= 0.8) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [veilState]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 opacity-60"
    />
  );
};
