import React, { useState } from 'react';
import { Card, CardRarity, FactionId, CardType } from '../../types/card';
import { ALL_CARDS, getCardById } from '../../data/cards';
import { FACTIONS } from '../../data/factions';
import { CardView } from '../card/CardView';
import { audio } from '../../services/audioService';
import { Search, Filter, Sparkles, Gem, Layers, ChevronRight, X, ArrowUpRight } from 'lucide-react';

interface CollectionViewProps {
  collection: Record<string, number>;
  essence: number;
  onCraftCard: (cardId: string) => void;
  onDisenchantCard: (cardId: string) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  collection,
  essence,
  onCraftCard,
  onDisenchantCard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCost, setSelectedCost] = useState<number | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  // Filter cards
  const filteredCards = ALL_CARDS.filter((card) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        card.name.toLowerCase().includes(q) ||
        card.description.toLowerCase().includes(q) ||
        (card.creatureType && card.creatureType.toLowerCase().includes(q)) ||
        (card.keywords && card.keywords.some((k) => k.toLowerCase().includes(q)));
      if (!match) return false;
    }

    // Faction
    if (selectedFaction !== 'All' && card.faction !== selectedFaction) return false;

    // Rarity
    if (selectedRarity !== 'All' && card.rarity !== selectedRarity) return false;

    // Type
    if (selectedType !== 'All' && card.type !== selectedType) return false;

    // Cost
    if (selectedCost !== null) {
      if (selectedCost === 7 ? card.cost < 7 : card.cost !== selectedCost) return false;
    }

    return true;
  });

  const getCraftCost = (rarity: CardRarity) => {
    switch (rarity) {
      case 'Rare': return 100;
      case 'Epic': return 400;
      case 'Legendary': return 1600;
      case 'Mythic': return 3200;
      default: return 40;
    }
  };

  const getDisenchantValue = (rarity: CardRarity) => {
    switch (rarity) {
      case 'Rare': return 25;
      case 'Epic': return 100;
      case 'Legendary': return 400;
      case 'Mythic': return 800;
      default: return 10;
    }
  };

  const handleCardClick = (card: Card) => {
    audio.playClick();
    setInspectedCard(card);
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Title & Essence */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              Card Collection
            </h1>
            <p className="text-xs text-slate-400">
              Browse, craft, and disenchant the cards of Veilbound ({ALL_CARDS.length} unique cards).
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel-glow border border-purple-500/40">
            <Gem className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold">Essence:</span>
            <span className="font-cinzel font-bold text-sm text-purple-100">{essence}</span>
          </div>
        </div>

        {/* Search Bar & Mana Cost filter pips */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
          {/* Search Input */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, keyword, or text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Mana Filter Gems */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-semibold mr-1">Cost:</span>
            {[0, 1, 2, 3, 4, 5, 6, 7].map((cost) => (
              <button
                key={cost}
                onClick={() => setSelectedCost(selectedCost === cost ? null : cost)}
                className={`w-7 h-7 rounded-full text-xs font-bold border transition-all ${
                  selectedCost === cost
                    ? 'bg-sky-500 border-white text-white shadow-[0_0_10px_rgba(14,165,233,0.8)] scale-110'
                    : 'bg-slate-950 border-white/15 text-slate-300 hover:border-sky-400'
                }`}
              >
                {cost === 7 ? '7+' : cost}
              </button>
            ))}
          </div>

          {/* Faction Pills */}
          <div className="flex items-center gap-1">
            {['All', 'Aetherbound', 'AshenCitadel', 'ViridianHive', 'UmbralRemnant', 'ChronocastArchive', 'AstralAscendancy', 'Neutral'].map((fac) => (
              <button
                key={fac}
                onClick={() => setSelectedFaction(fac)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedFaction === fac
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {fac === 'All' ? 'All Factions' : fac}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-6">
        {filteredCards.map((card) => {
          const count = collection[card.id] || 0;
          return (
            <div key={card.id} className="flex justify-center">
              <CardView
                card={card}
                showCount={count}
                onClick={() => handleCardClick(card)}
              />
            </div>
          );
        })}
      </div>

      {/* INSPECTED CARD MODAL (Crafting / Disenchanting) */}
      {inspectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="w-[580px] rounded-2xl glass-panel-glow border border-indigo-500/40 p-6 flex gap-6 relative shadow-2xl">
            <button
              onClick={() => setInspectedCard(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Card display */}
            <div className="flex-shrink-0">
              <CardView card={inspectedCard} size="lg" />
            </div>

            {/* Right: Card Info & Crafting Controls */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xl font-cinzel font-bold text-slate-100 mb-1">
                  {inspectedCard.name}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-semibold border border-indigo-700/50">
                    {inspectedCard.faction}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                    {inspectedCard.rarity}
                  </span>
                  <span className="text-xs text-slate-400">
                    Owned: <strong className="text-slate-100">{collection[inspectedCard.id] || 0}</strong>
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic mb-4 leading-relaxed border-l-2 border-indigo-500 pl-2">
                  "{inspectedCard.flavorText}"
                </p>
              </div>

              {/* Crafting / Disenchanting Buttons */}
              <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                {/* Craft */}
                <button
                  onClick={() => onCraftCard(inspectedCard.id)}
                  disabled={essence < getCraftCost(inspectedCard.rarity)}
                  className={`
                    w-full py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider
                    flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      essence >= getCraftCost(inspectedCard.rarity)
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <span>Craft ({getCraftCost(inspectedCard.rarity)} Essence)</span>
                </button>

                {/* Disenchant */}
                <button
                  onClick={() => onDisenchantCard(inspectedCard.id)}
                  disabled={(collection[inspectedCard.id] || 0) <= 0}
                  className={`
                    w-full py-2 rounded-xl font-cinzel font-semibold text-xs uppercase tracking-wider
                    border border-white/10 flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      (collection[inspectedCard.id] || 0) > 0
                        ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
                        : 'bg-slate-950 text-slate-600 cursor-not-allowed border-transparent'
                    }
                  `}
                >
                  <Gem className="w-3.5 h-3.5 text-purple-400" />
                  <span>Disenchant (+{getDisenchantValue(inspectedCard.rarity)} Essence)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
