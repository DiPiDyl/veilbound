import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../types/card';
import { CardView } from '../card/CardView';
import { audio } from '../../services/audioService';

interface CardHandProps {
  cards: Card[];
  currentMana: number;
  isPlayerTurn: boolean;
  selectedCardIndex: number | null;
  onSelectCard: (index: number) => void;
  onPlayCard: (index: number, targetMinionId?: string) => void;
  isDraggingOverBattlefield?: boolean;
}

export const CardHand: React.FC<CardHandProps> = ({
  cards,
  currentMana,
  isPlayerTurn,
  selectedCardIndex,
  onSelectCard,
  onPlayCard
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [dragState, setDragState] = useState<{
    index: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    isOverBoard: boolean;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Global mousemove & mouseup for drag-and-drop
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const isOver = e.clientY < window.innerHeight - 200;
      setDragState(prev => prev ? {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
        isOverBoard: isOver
      } : null);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!dragState) return;

      const isOver = e.clientY < window.innerHeight - 200;
      const card = cards[dragState.index];

      if (isOver && card && card.cost <= currentMana && isPlayerTurn) {
        audio.playCardPlay();
        onPlayCard(dragState.index);
      } else {
        audio.playClick();
      }

      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, cards, currentMana, isPlayerTurn, onPlayCard]);

  const totalCards = cards.length;

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto h-[180px] flex justify-center items-end select-none pointer-events-auto"
    >
      {/* Visual Dropzone Indicator when dragging card towards battlefield */}
      {dragState?.isOverBoard && (
        <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-6 py-2 rounded-2xl bg-amber-500/20 border-2 border-amber-400/80 backdrop-blur-md text-amber-300 font-cinzel font-bold text-sm tracking-widest animate-pulse pointer-events-none shadow-[0_0_30px_rgba(245,158,11,0.4)]">
          ✦ RELEASE TO PLAY CARD ✦
        </div>
      )}

      {/* Hand Cards in Fanned Layout */}
      <div className="relative flex justify-center items-end w-full h-full pb-2">
        {cards.map((card, idx) => {
          const isPlayable = isPlayerTurn && card.cost <= currentMana;
          const isHovered = hoveredIndex === idx;
          const isSelected = selectedCardIndex === idx;
          const isBeingDragged = dragState?.index === idx;

          // Parabolic fanning calculation
          const norm = totalCards > 1 ? (idx - (totalCards - 1) / 2) / ((totalCards - 1) / 2) : 0;
          const baseRotation = norm * 10; // -10 deg to +10 deg
          const baseTranslateY = Math.pow(norm, 2) * 16; // Curves downward on wings
          const baseTranslateX = norm * (totalCards > 6 ? 12 : 8);

          // Neighbor spread when another card is hovered
          let neighborShift = 0;
          if (hoveredIndex !== null && hoveredIndex !== idx) {
            neighborShift = idx < hoveredIndex ? -18 : 18;
          }

          // Transform values
          const finalRotation = isHovered || isSelected ? 0 : baseRotation;
          const finalTranslateY = isHovered || isSelected ? -45 : baseTranslateY;
          const finalTranslateX = baseTranslateX + neighborShift;
          const finalScale = isHovered || isSelected ? 1.15 : 1.0;
          const zIndex = isHovered || isSelected ? 50 : 10 + idx;

          return (
            <div
              key={`${card.id}-${idx}`}
              onMouseEnter={() => {
                if (!dragState) {
                  setHoveredIndex(idx);
                  audio.playCardHover();
                }
              }}
              onMouseLeave={() => {
                if (!dragState) setHoveredIndex(null);
              }}
              onMouseDown={(e) => {
                if (e.button !== 0) return; // Left click only
                if (isPlayable) {
                  setDragState({
                    index: idx,
                    startX: e.clientX,
                    startY: e.clientY,
                    currentX: e.clientX,
                    currentY: e.clientY,
                    isOverBoard: false
                  });
                }
              }}
              onClick={() => {
                onSelectCard(idx);
              }}
              style={{
                transform: `translateX(${finalTranslateX}px) translateY(${finalTranslateY}px) rotate(${finalRotation}deg) scale(${finalScale})`,
                zIndex,
                opacity: isBeingDragged ? 0.3 : 1,
                transition: isBeingDragged 
                  ? 'none' 
                  : 'transform 0.22s cubic-bezier(0.2, 0, 0, 1), opacity 0.15s ease'
              }}
              className={`relative -mx-4 md:-mx-3 cursor-grab active:cursor-grabbing origin-bottom transition-shadow ${
                isHovered ? 'drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]' : 'drop-shadow-md'
              }`}
            >
              <CardView
                card={card}
                size="sm"
                isPlayable={isPlayable}
                isSelected={isSelected}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Ghost Card while Dragging */}
      {dragState && cards[dragState.index] && (
        <div
          style={{
            position: 'fixed',
            left: `${dragState.currentX - 70}px`,
            top: `${dragState.currentY - 100}px`,
            zIndex: 100,
            pointerEvents: 'none',
            transform: `rotate(${Math.max(-15, Math.min(15, (dragState.currentX - dragState.startX) * 0.12))}deg) scale(1.18)`,
            transition: 'transform 0.05s ease-out'
          }}
          className="drop-shadow-[0_20px_40px_rgba(245,158,11,0.6)] animate-pulse"
        >
          <CardView
            card={cards[dragState.index]}
            size="sm"
            isPlayable={true}
            isSelected={true}
          />
        </div>
      )}
    </div>
  );
};
