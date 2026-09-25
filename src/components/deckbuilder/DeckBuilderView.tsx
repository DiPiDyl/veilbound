import React, { useState } from 'react';
import { Card } from '../../types/card';
import { DeckDefinition } from '../../data/starterDecks';
import { BINDERS, getBinderById } from '../../data/binders';
import { ALL_CARDS, getCardById } from '../../data/cards';
import { validateAndAnalyzeDeck } from '../../services/deckValidator';
import { CardView } from '../card/CardView';
import { audio } from '../../services/audioService';
import { 
  Plus, Trash2, Copy, Check, AlertCircle, BarChart2, 
  Layers, ChevronLeft, Shield, Sword, Sparkles 
} from 'lucide-react';

interface DeckBuilderViewProps {
  decks: DeckDefinition[];
  collection: Record<string, number>;
  onSaveDeck: (deck: DeckDefinition) => void;
  onDeleteDeck: (deckId: string) => void;
}

export const DeckBuilderView: React.FC<DeckBuilderViewProps> = ({
  decks,
  collection,
  onSaveDeck,
  onDeleteDeck
}) => {
  const [activeDeck, setActiveDeck] = useState<DeckDefinition | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Deck list overview
  if (!activeDeck) {
    return (
      <div className="w-full h-full p-6 flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              Deck Builder
            </h1>
            <p className="text-xs text-slate-400">
              Construct strategic 30-card decks for your chosen Binders.
            </p>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              const newDeck: DeckDefinition = {
                id: `deck-${Date.now()}`,
                name: 'New Custom Deck',
                binderId: BINDERS[0].id,
                faction: BINDERS[0].faction,
                description: 'Custom player created deck.',
                archetype: 'Midrange',
                cardIds: []
              };
              setActiveDeck(newDeck);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-cinzel font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Deck</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const binder = getBinderById(deck.binderId);
            const validation = validateAndAnalyzeDeck(deck.cardIds, binder.faction);

            return (
              <div
                key={deck.id}
                className="rounded-2xl glass-panel-glow border border-white/10 p-5 flex flex-col justify-between hover:border-indigo-400/50 transition-all duration-200 shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-cinzel font-bold text-lg text-slate-100">{deck.name}</h3>
                      <div className="text-xs text-indigo-300 font-semibold">{binder.name} • {deck.archetype}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      validation.isValid ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50' : 'bg-red-950 text-red-300 border border-red-700/50'
                    }`}>
                      {deck.cardIds.length} / 30 Cards
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                    {deck.description}
                  </p>

                  {/* Mini Mana Curve */}
                  <div className="flex items-end gap-1 h-12 bg-slate-950/60 p-2 rounded-lg mb-4">
                    {Object.entries(validation.manaCurve).map(([cost, count]) => (
                      <div key={cost} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-indigo-500 rounded-t transition-all"
                          style={{ height: `${Math.min(100, count * 15)}%` }}
                        />
                        <span className="text-[9px] text-slate-500">{cost === '7' ? '7+' : cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <button
                    onClick={() => {
                      audio.playClick();
                      onDeleteDeck(deck.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                    title="Delete Deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      audio.playClick();
                      setActiveDeck(deck);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-cinzel font-bold text-xs tracking-wider transition-colors shadow"
                  >
                    Edit Deck
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Deck Editing Mode
  const currentBinder = getBinderById(activeDeck.binderId);
  const validation = validateAndAnalyzeDeck(activeDeck.cardIds, currentBinder.faction);

  // Available cards for this faction + neutral
  const availablePool = ALL_CARDS.filter(
    (c) => c.faction === currentBinder.faction || c.faction === 'Neutral'
  ).filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const addCardToDeck = (card: Card) => {
    if (activeDeck.cardIds.length >= 30) return;
    const countInDeck = activeDeck.cardIds.filter((id) => id === card.id).length;
    const maxAllowed = card.rarity === 'Legendary' || card.rarity === 'Mythic' ? 1 : 2;
    if (countInDeck >= maxAllowed) return;

    audio.playClick();
    const updatedIds = [...activeDeck.cardIds, card.id];
    setActiveDeck({ ...activeDeck, cardIds: updatedIds });
  };

  const removeCardFromDeck = (cardId: string) => {
    audio.playClick();
    const index = activeDeck.cardIds.lastIndexOf(cardId);
    if (index !== -1) {
      const updated = [...activeDeck.cardIds];
      updated.splice(index, 1);
      setActiveDeck({ ...activeDeck, cardIds: updated });
    }
  };

  const handleExportDeck = () => {
    const code = btoa(JSON.stringify({ name: activeDeck.name, binder: activeDeck.binderId, cards: activeDeck.cardIds }));
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              audio.playClick();
              setActiveDeck(null);
            }}
            className="p-2 rounded-lg glass-panel hover:bg-slate-800 text-slate-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <input
              type="text"
              value={activeDeck.name}
              onChange={(e) => setActiveDeck({ ...activeDeck, name: e.target.value })}
              className="text-xl font-cinzel font-bold text-slate-100 bg-transparent border-b border-white/20 focus:outline-none focus:border-indigo-400"
            />
            <div className="text-xs text-indigo-300">
              Binder: {currentBinder.name} ({currentBinder.faction})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDeck}
            className="px-3 py-1.5 rounded-lg glass-panel text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Deck Code Copied!' : 'Export Deck'}</span>
          </button>

          <button
            onClick={() => {
              audio.playClick();
              onSaveDeck(activeDeck);
              setActiveDeck(null);
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            Save Deck
          </button>
        </div>
      </div>

      {/* Main Dual Panels: Left (Card Pool) & Right (Current Deck) */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* LEFT: Card Pool Browser */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60 rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              placeholder="Search pool cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none w-60"
            />
            <span className="text-xs text-slate-400">
              Click a card to add it to your deck
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {availablePool.map((card) => {
              const inDeck = activeDeck.cardIds.filter((id) => id === card.id).length;
              const maxAllowed = card.rarity === 'Legendary' || card.rarity === 'Mythic' ? 1 : 2;

              return (
                <div key={card.id} className="relative group flex justify-center">
                  <CardView card={card} size="sm" onClick={() => addCardToDeck(card)} />
                  {inDeck > 0 && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-lg">
                      {inDeck}/{maxAllowed}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Current Deck List & Stats */}
        <div className="w-80 flex flex-col bg-slate-950/80 rounded-2xl border border-white/10 p-4 shadow-xl">
          {/* Deck Count & Validation */}
          <div className="flex justify-between items-center pb-3 border-b border-white/10 mb-3">
            <span className="font-cinzel font-bold text-sm text-slate-200">Deck Cards</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              validation.isValid ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
            }`}>
              {activeDeck.cardIds.length} / 30
            </span>
          </div>

          {/* Mana Curve Graph */}
          <div className="flex items-end gap-1 h-14 bg-slate-900/60 p-2 rounded-lg mb-3">
            {Object.entries(validation.manaCurve).map(([cost, count]) => (
              <div key={cost} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className="w-full bg-indigo-500 rounded-t transition-all"
                  style={{ height: `${Math.min(100, count * 15)}%` }}
                />
                <span className="text-[9px] text-slate-400">{cost === '7' ? '7+' : cost}</span>
              </div>
            ))}
          </div>

          {/* Cards in Deck scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {Array.from(new Set(activeDeck.cardIds)).map((id) => {
              const card = getCardById(id);
              if (!card) return null;
              const count = activeDeck.cardIds.filter((cid) => cid === id).length;

              return (
                <div
                  key={id}
                  onClick={() => removeCardFromDeck(id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-red-950/40 border border-white/5 flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-600 font-bold text-white text-[10px] flex items-center justify-center">
                      {card.cost}
                    </span>
                    <span className="font-medium text-xs text-slate-200 group-hover:text-red-300">
                      {card.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-400">x{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
