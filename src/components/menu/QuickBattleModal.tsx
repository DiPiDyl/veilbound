import React, { useState } from 'react';
import { BINDERS } from '../../data/binders';
import { DeckDefinition } from '../../data/starterDecks';
import { BATTLEFIELDS } from '../../data/battlefields';
import { audio } from '../../services/audioService';
import { Swords, X, Play, Shield, MapPin, Zap } from 'lucide-react';

interface QuickBattleModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerDecks: DeckDefinition[];
  onStartDuel: (
    playerBinderId: string,
    playerDeckId: string,
    opponentBinderId: string,
    battlefieldId: string,
    difficulty: 'Easy' | 'Normal' | 'Hard'
  ) => void;
}

export const QuickBattleModal: React.FC<QuickBattleModalProps> = ({
  isOpen,
  onClose,
  playerDecks,
  onStartDuel
}) => {
  const [selectedPlayerBinder, setSelectedPlayerBinder] = useState<string>(BINDERS[0].id);
  const [selectedPlayerDeck, setSelectedPlayerDeck] = useState<string>(playerDecks[0]?.id || 'deck-lyra-starter');
  const [selectedOpponentBinder, setSelectedOpponentBinder] = useState<string>(BINDERS[1].id);
  const [selectedBattlefield, setSelectedBattlefield] = useState<string>(BATTLEFIELDS[0].id);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Normal' | 'Hard'>('Normal');

  if (!isOpen) return null;

  const handleLaunch = () => {
    audio.playClick();
    onStartDuel(
      selectedPlayerBinder,
      selectedPlayerDeck,
      selectedOpponentBinder,
      selectedBattlefield,
      difficulty
    );
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="w-[620px] rounded-2xl glass-panel-glow border border-indigo-500/40 p-6 flex flex-col gap-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Swords className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-cinzel font-bold text-slate-100">
            Configure Battle Match
          </h2>
        </div>

        {/* Dual Column Selection: Player & Opponent */}
        <div className="grid grid-cols-2 gap-5">
          {/* Player Configuration */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-indigo-500/30">
            <span className="text-xs font-cinzel font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" /> Your Champion
            </span>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Binder</label>
              <select
                value={selectedPlayerBinder}
                onChange={(e) => setSelectedPlayerBinder(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-xs text-white"
              >
                {BINDERS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.faction})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Select Deck</label>
              <select
                value={selectedPlayerDeck}
                onChange={(e) => setSelectedPlayerDeck(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-xs text-white"
              >
                {playerDecks.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.cardIds.length} cards)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opponent Configuration */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-red-500/30">
            <span className="text-xs font-cinzel font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-red-400" /> AI Opponent
            </span>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Opponent Binder</label>
              <select
                value={selectedOpponentBinder}
                onChange={(e) => setSelectedOpponentBinder(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-white/15 text-xs text-white"
              >
                {BINDERS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.faction})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">AI Difficulty</label>
              <div className="flex gap-2">
                {(['Easy', 'Normal', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      difficulty === diff
                        ? 'bg-red-600 border-red-400 text-white shadow'
                        : 'bg-slate-950 border-white/10 text-slate-400'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Battlefield Selection */}
        <div>
          <label className="text-xs font-cinzel font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" /> Select Battlefield Environment
          </label>
          <div className="grid grid-cols-5 gap-2">
            {BATTLEFIELDS.map((bf) => (
              <button
                key={bf.id}
                onClick={() => setSelectedBattlefield(bf.id)}
                className={`p-2 rounded-xl text-center border text-xs flex flex-col items-center gap-1 transition-all ${
                  selectedBattlefield === bf.id
                    ? 'border-indigo-400 bg-indigo-950/80 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)] scale-105'
                    : 'border-white/10 bg-slate-950/80 text-slate-400 hover:text-white'
                }`}
              >
                <span className="font-semibold truncate w-full text-[11px]">{bf.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleLaunch}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-cinzel font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-transform hover:scale-[1.02]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Enter the Battlefield</span>
        </button>
      </div>
    </div>
  );
};
