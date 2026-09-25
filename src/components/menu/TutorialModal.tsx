import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Swords, Shield, Clock, Flame, 
  Moon, Sun, Shuffle, ChevronRight, ChevronLeft, X 
} from 'lucide-react';
import { audio } from '../../services/audioService';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: 'Welcome to Veilbound',
      subtitle: 'The edge of reality awaits',
      icon: <Sparkles className="w-8 h-8 text-indigo-400" />,
      content: (
        <p className="text-xs text-slate-300 leading-relaxed">
          In <strong>VEILBOUND</strong>, you play as a <strong>Binder</strong> — a reality-weaving commander who manipulates planar fragments known as Echoes. Your goal is to reduce the opposing Binder's health to 0, using minions, spells, relics, weapons, rituals, and global events.
        </p>
      )
    },
    {
      title: 'System A — The Veil',
      subtitle: 'The battlefield itself changes',
      icon: <Shuffle className="w-8 h-8 text-pink-400" />,
      content: (
        <div className="space-y-2 text-xs text-slate-300">
          <p>The global reality state shifts between 5 states throughout each duel:</p>
          <ul className="space-y-1 pl-2">
            <li><strong className="text-sky-400">Calm:</strong> Standard planar balance.</li>
            <li><strong className="text-orange-400">Wild:</strong> Damage spells deal +1 bonus damage.</li>
            <li><strong className="text-purple-400">Corrupted:</strong> Dying minions yield Echoes to their owner.</li>
            <li><strong className="text-yellow-400">Celestial:</strong> Healing effects are amplified by +2; 5+ cost cards cost 1 less.</li>
            <li><strong className="text-pink-400">Fractured:</strong> At the start of turn, a random card in hand costs 1 less.</li>
          </ul>
        </div>
      )
    },
    {
      title: 'System B — The Echo Pool',
      subtitle: 'Memories of actions past',
      icon: <Flame className="w-8 h-8 text-cyan-400" />,
      content: (
        <p className="text-xs text-slate-300 leading-relaxed">
          Cards with the <strong>Echo</strong> keyword leave behind residual energy in your <strong>Echo Pool</strong>. Spells store re-playable memory fragments, and powerful cards have <strong>Consume</strong> costs that spend Echoes for devastating bonus strikes or planar alterations.
        </p>
      )
    },
    {
      title: 'System C — The Destiny Track',
      subtitle: 'How you fight defines who you become',
      icon: <Shield className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
          <p>Your actions advance affinity points in one of 5 Destinies:</p>
          <ul className="space-y-1 pl-2">
            <li><strong className="text-red-400">The Conqueror:</strong> Gained through aggressive attacks against heroes.</li>
            <li><strong className="text-blue-400">The Archivist:</strong> Gained through card draw, discovery, and spell chains.</li>
            <li><strong className="text-emerald-400">The Warden:</strong> Gained through armor, taunt defense, and heals.</li>
            <li><strong className="text-purple-400">The Voidwalker:</strong> Gained through shifting the Veil.</li>
            <li><strong className="text-slate-400">The Revenant:</strong> Gained through minion deaths and sacrifices.</li>
          </ul>
          <p className="pt-1 text-[11px] text-amber-300">
            Reaching Tier 1, 2, and 3 unlocks permanent passive powers in the match!
          </p>
        </div>
      )
    },
    {
      title: 'Rituals & Global Events',
      subtitle: 'Delayed climaxes and shifting rules',
      icon: <Clock className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
          <p>
            <strong>Rituals:</strong> Do not activate immediately. Instead, they enter play with a countdown (e.g. 3 turns) charging each turn until an apocalyptic climax is unleashed.
          </p>
          <p>
            <strong>Events:</strong> Alter global battlefield rules for both players for 2 turns (e.g., doubling card draw, reducing costs, or locking attacks).
          </p>
        </div>
      )
    }
  ];

  const currentSlide = slides[step];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="w-[500px] rounded-2xl glass-panel-glow border border-indigo-500/40 p-6 flex flex-col justify-between min-h-[380px] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shadow">
              {currentSlide.icon}
            </div>
            <div>
              <h2 className="text-lg font-cinzel font-bold text-slate-100">{currentSlide.title}</h2>
              <div className="text-xs text-indigo-300 font-semibold">{currentSlide.subtitle}</div>
            </div>
          </div>

          {/* Slide Content */}
          <div className="min-h-[160px] flex items-center">
            {currentSlide.content}
          </div>
        </div>

        {/* Footer controls & pips */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={() => {
              audio.playClick();
              setStep(Math.max(0, step - 1));
            }}
            disabled={step === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              step === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:text-white glass-panel'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Step Pips */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === step ? 'bg-indigo-400 scale-125' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {step < slides.length - 1 ? (
            <button
              onClick={() => {
                audio.playClick();
                setStep(step + 1);
              }}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-cinzel font-bold text-xs flex items-center gap-1 shadow"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-cinzel font-bold text-xs flex items-center gap-1 shadow"
            >
              Ready to Play!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
