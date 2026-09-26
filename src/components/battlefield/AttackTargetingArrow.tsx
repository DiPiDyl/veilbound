import React from 'react';

interface AttackTargetingArrowProps {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isOverValidTarget?: boolean;
}

export const AttackTargetingArrow: React.FC<AttackTargetingArrowProps> = ({
  startX,
  startY,
  currentX,
  currentY,
  isOverValidTarget = false
}) => {
  // Calculate control points for quadratic/cubic Bezier curve
  const dx = currentX - startX;
  const dy = currentY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 20) return null;

  // Arc curvature: curve upward slightly
  const midX = (startX + currentX) / 2 - dy * 0.15;
  const midY = (startY + currentY) / 2 + dx * 0.15;

  const strokeColor = isOverValidTarget ? '#ef4444' : '#f59e0b';
  const glowColor = isOverValidTarget ? 'rgba(239, 68, 68, 0.6)' : 'rgba(245, 158, 11, 0.6)';

  return (
    <svg 
      className="fixed inset-0 w-full h-full pointer-events-none z-50 overflow-visible"
      style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="12"
          markerHeight="12"
          refX="9"
          refY="6"
          orient="auto"
        >
          <path
            d="M 0 0 L 12 6 L 0 12 L 3 6 Z"
            fill={strokeColor}
          />
        </marker>
        <radialGradient id="target-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Curved Energy Arc */}
      <path
        d={`M ${startX} ${startY} Q ${midX} ${midY} ${currentX} ${currentY}`}
        fill="none"
        stroke={strokeColor}
        strokeWidth="5"
        strokeDasharray="8 6"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
        className="animate-[dash_1s_linear_infinite]"
      />

      {/* Target Reticle at cursor */}
      <circle
        cx={currentX}
        cy={currentY}
        r={isOverValidTarget ? 24 : 16}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.5"
        className="animate-ping opacity-60"
      />
      <circle
        cx={currentX}
        cy={currentY}
        r={isOverValidTarget ? 18 : 12}
        fill="url(#target-glow)"
        stroke={strokeColor}
        strokeWidth="2"
      />
      {isOverValidTarget && (
        <text
          x={currentX}
          y={currentY - 30}
          textAnchor="middle"
          fill="#fecaca"
          fontSize="12"
          fontWeight="bold"
          fontFamily="monospace"
          className="tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
        >
          RELEASE TO ATTACK
        </text>
      )}
    </svg>
  );
};
