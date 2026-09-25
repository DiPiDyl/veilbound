import React from 'react';
import { VeilState } from '../../types/card';
import { VEIL_DETAILS, VEIL_STATES } from '../../engine/veilEngine';
import { Sparkles, Eye, Flame, Moon, Sun, Shuffle } from 'lucide-react';
import { audio } from '../../services/audioService';

interface VeilIndicatorProps {
  currentState: VeilState;
  onShiftRequest?: () => void;
  isInteractive?: boolean;
}

export const VeilIndicator: React.FC<VeilIndicatorProps> = ({
  currentState,
  onShiftRequest,
  isInteractive = true
}) => {
  const currentInfo = VEIL_DETAILS[currentState];

  const getIcon = (state: VeilState) => {
    switch (state) {
      case 'Calm': return <Sparkles className="w-4 h-4 text-sky-400" />;
      case 'Wild': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'Corrupted': return <Moon className="w-4 h-4 text-purple-400" />;
      case 'Celestial': return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'Fractured': return <Shuffle className="w-4 h-4 text-pink-400" />;
    }
  };

  const handleClick = () => {
    if (isInteractive && onShiftRequest) {
      audio.playVeilShift();
      onShiftRequest();
    }
  };

  return (
    <div className="relative group">
      {/* Outer ambient glow ring */}
      <div 
        className="absolute -inset-2 rounded-full blur-md opacity-70 transition-all duration-700 animate-pulse-slow"
        style={{ backgroundColor: currentInfo.themeColor }}
      />

      {/* Main Dial container */}
      <div
        onClick={handleClick}
        className={`
          relative px-4 py-2 rounded-full glass-panel border flex items-center gap-3 cursor-pointer
          transition-transform duration-300 hover:scale-105 active:scale-95
        `}
        style={{ borderColor: currentInfo.themeColor }}
      >
        {/* State Icon with rotating ring */}
        <div className="relative w-7 h-7 rounded-full bg-slate-950 flex items-center justify-center border border-white/20">
          <div 
            className="absolute inset-0 rounded-full border border-dashed animate-spin duration-[15s]"
            style={{ borderColor: currentInfo.themeColor }}
          />
          {getIcon(currentState)}
        </div>

        {/* Text Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">The Veil:</span>
            <span className="font-cinzel font-bold text-sm drop-shadow" style={{ color: currentInfo.themeColor }}>
              {currentInfo.name}
            </span>
          </div>
          <span className="text-[10px] text-slate-300 truncate max-w-[200px]">
            {currentInfo.passiveRules[0]}
          </span>
        </div>

        {/* State nodes pips */}
        <div className="flex gap-1 ml-2 pl-2 border-l border-white/10">
          {VEIL_STATES.map((st) => (
            <div
              key={st}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                st === currentState ? 'scale-125' : 'opacity-30'
              }`}
              style={{ backgroundColor: VEIL_DETAILS[st].themeColor }}
              title={st}
            />
          ))}
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 p-3 rounded-lg glass-panel-glow text-xs z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="font-cinzel font-bold text-sm mb-1" style={{ color: currentInfo.themeColor }}>
          Veil State: {currentInfo.name}
        </div>
        <p className="text-slate-300 mb-2 leading-relaxed">
          {currentInfo.description}
        </p>
        <div className="text-[10px] text-slate-400 border-t border-white/10 pt-1.5">
          <div className="font-semibold text-slate-200 mb-0.5">Active Realities:</div>
          {currentInfo.passiveRules.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-1 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
