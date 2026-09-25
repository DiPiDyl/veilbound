import React, { useState } from 'react';
import { Sparkles, ChevronUp, History } from 'lucide-react';
import { EchoItem } from '../../types/gameState';
import { audio } from '../../services/audioService';

interface EchoPoolViewProps {
  echoCount: number;
  fragments: EchoItem[];
  isPlayer?: boolean;
}

export const EchoPoolView: React.FC<EchoPoolViewProps> = ({
  echoCount,
  fragments,
  isPlayer = true
}) => {
  const [showFragments, setShowFragments] = useState(false);

  const toggleFragments = () => {
    audio.playClick();
    setShowFragments(!showFragments);
  };

  return (
    <div className="relative">
      {/* Echo Counter Orb */}
      <div
        onClick={toggleFragments}
        className={`
          flex items-center gap-1.5 px-3 py-1 rounded-full glass-panel border border-cyan-500/40
          cursor-pointer hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]
          transition-all duration-200 select-none
        `}
      >
        <div className="relative">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div className="absolute inset-0 bg-cyan-400/20 blur-sm rounded-full" />
        </div>

        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-cyan-300/80 font-bold">Echo Pool</span>
          <span className="font-cinzel font-bold text-sm text-cyan-200 leading-none">{echoCount}</span>
        </div>

        {fragments.length > 0 && (
          <History className="w-3 h-3 text-slate-400 ml-1" />
        )}
      </div>

      {/* Floating Fragments Dropdown */}
      {showFragments && fragments.length > 0 && (
        <div className="absolute bottom-full mb-2 left-0 w-60 p-2.5 rounded-lg glass-panel-glow border border-cyan-500/40 z-50 text-xs shadow-2xl">
          <div className="font-cinzel font-bold text-cyan-300 text-xs mb-1.5 flex items-center justify-between border-b border-white/10 pb-1">
            <span>Stored Spell Echoes</span>
            <span className="text-[10px] text-slate-400 font-normal">{fragments.length} cached</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {fragments.map((frag) => (
              <div key={frag.id} className="p-1.5 rounded bg-slate-900/80 border border-cyan-900/40 flex flex-col gap-0.5">
                <div className="flex justify-between items-center text-cyan-200 font-semibold text-[11px]">
                  <span>{frag.sourceCardName}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Cost: {frag.costToReplay}</span>
                </div>
                <div className="text-[10px] text-slate-300 line-clamp-1 italic">
                  "{frag.spellEffectSnippet}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
