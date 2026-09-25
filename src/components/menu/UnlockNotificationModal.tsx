import React from 'react';
import { LevelMilestone } from '../../types/progression';
import { audio } from '../../services/audioService';
import { Trophy, Star, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnlockNotificationModalProps {
  milestone: LevelMilestone | null;
  onDismiss: () => void;
}

export const UnlockNotificationModal: React.FC<UnlockNotificationModalProps> = ({
  milestone,
  onDismiss
}) => {
  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="w-[450px] bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(245,158,11,0.6)] animate-scaleUp">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl animate-bounce">
          🏆
        </div>

        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 block mb-1">
            LEVEL UP! • LEVEL {milestone.level} REACHED
          </span>
          <h2 className="text-2xl font-cinzel font-black text-slate-100 mb-1">
            {milestone.title}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {milestone.celebrationMessage}
          </p>
        </div>

        {/* Rewards Box */}
        {(milestone.rewardGold > 0 || milestone.rewardEssence > 0) && (
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 w-full flex items-center justify-around text-xs font-bold">
            {milestone.rewardGold > 0 && (
              <span className="text-amber-400">+{milestone.rewardGold} Gold 💰</span>
            )}
            {milestone.rewardEssence > 0 && (
              <span className="text-purple-400">+{milestone.rewardEssence} Essence 💎</span>
            )}
          </div>
        )}

        <button
          onClick={() => {
            audio.playButtonClick();
            onDismiss();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          <span>Claim & Continue</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
