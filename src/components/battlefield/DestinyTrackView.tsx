import React, { useState } from 'react';
import { DestinyTrack, DestinyType } from '../../types/binder';
import { DESTINY_INFO } from '../../engine/destinyEngine';
import { Sword, BookOpen, Shield, Sparkles, Skull, Crown } from 'lucide-react';
import { audio } from '../../services/audioService';

interface DestinyTrackViewProps {
  track: DestinyTrack;
  isPlayer?: boolean;
}

export const DestinyTrackView: React.FC<DestinyTrackViewProps> = ({ track, isPlayer = true }) => {
  const [showDetails, setShowDetails] = useState(false);
  const activeInfo = DESTINY_INFO[track.activeDestiny];
  const activePts = track.points[track.activeDestiny] || 0;
  const currentTier = track.tiersUnlocked[track.activeDestiny] || 0;

  const getIcon = (type: DestinyType) => {
    switch (type) {
      case 'TheConqueror': return <Sword className="w-3.5 h-3.5" />;
      case 'TheArchivist': return <BookOpen className="w-3.5 h-3.5" />;
      case 'TheWarden': return <Shield className="w-3.5 h-3.5" />;
      case 'TheVoidwalker': return <Sparkles className="w-3.5 h-3.5" />;
      case 'TheRevenant': return <Skull className="w-3.5 h-3.5" />;
    }
  };

  const toggleModal = () => {
    audio.playClick();
    setShowDetails(!showDetails);
  };

  return (
    <div className="relative">
      {/* Compact Destiny Tracker Button */}
      <div
        onClick={toggleModal}
        className={`
          flex items-center gap-2 px-3 py-1 rounded-full glass-panel border
          cursor-pointer hover:scale-105 transition-all duration-200 select-none
        `}
        style={{ borderColor: activeInfo.accentColor }}
      >
        <div className="flex items-center gap-1" style={{ color: activeInfo.accentColor }}>
          {getIcon(track.activeDestiny)}
          <span className="font-cinzel font-bold text-xs">{activeInfo.name}</span>
        </div>

        {/* Tier Pips */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          {[1, 2, 3].map((tier) => (
            <div
              key={tier}
              className={`w-2 h-2 rounded-full border border-white/20 transition-all ${
                tier <= currentTier
                  ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] scale-110'
                  : 'bg-slate-700 opacity-40'
              }`}
              title={`Tier ${tier}`}
            />
          ))}
          <span className="text-[10px] text-slate-300 font-mono ml-1">{activePts}pts</span>
        </div>
      </div>

      {/* Full Modal Breakdown on Click */}
      {showDetails && (
        <div className="absolute bottom-full mb-2 right-0 w-72 p-3 rounded-xl glass-panel-glow border border-indigo-500/40 z-50 text-xs shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <span className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-400" /> Destiny Paths
            </span>
            <button 
              onClick={toggleModal} 
              className="text-slate-400 hover:text-white px-1 font-bold"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {(Object.keys(DESTINY_INFO) as DestinyType[]).map((type) => {
              const info = DESTINY_INFO[type];
              const pts = track.points[type] || 0;
              const tier = track.tiersUnlocked[type] || 0;
              const isDominant = track.activeDestiny === type;

              return (
                <div 
                  key={type} 
                  className={`p-2 rounded-lg border ${
                    isDominant ? 'bg-slate-900/90 border-amber-400/50' : 'bg-slate-950/60 border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 font-bold" style={{ color: info.accentColor }}>
                      {getIcon(type)}
                      <span>{info.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {pts} / 15 pts (Tier {tier})
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1.5">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${Math.min(100, (pts / 15) * 100)}%`,
                        backgroundColor: info.accentColor 
                      }} 
                    />
                  </div>

                  {/* Active benefit */}
                  <div className="text-[10px] text-slate-300">
                    {tier === 0 && <span className="text-slate-500 italic">Tier 1 unlocks at 5 pts: {info.tier1Benefit}</span>}
                    {tier === 1 && <span className="text-emerald-400">Active (T1): {info.tier1Benefit}</span>}
                    {tier === 2 && <span className="text-emerald-400">Active (T2): {info.tier2Benefit}</span>}
                    {tier === 3 && <span className="text-amber-400 font-semibold">Ascended (T3): {info.tier3Benefit}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
