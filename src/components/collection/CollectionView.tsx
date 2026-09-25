import React, { useState } from 'react';
import { Card, CardRarity, FactionId, CardType } from '../../types/card';
import { ALL_CARDS, getCardById } from '../../data/cards';
import { FACTIONS } from '../../data/factions';
import { BINDERS, getBinderById } from '../../data/binders';
import { CardView } from '../card/CardView';
import { audio } from '../../services/audioService';
import { 
  Search, Filter, Sparkles, Gem, Layers, ChevronRight, 
  X, ArrowUpRight, Crown, Check, UserCheck, Lock 
} from 'lucide-react';

interface CollectionViewProps {
  collection: Record<string, number>;
  essence: number;
  activeBinderId: string;
  unlockedBinderIds: string[];
  discoveredCardIds: string[];
  onSetActiveBinder: (binderId: string) => void;
  onCraftCard: (cardId: string) => void;
  onDisenchantCard: (cardId: string) => void;
}

export const CollectionView: React.FC<CollectionViewProps> = ({
  collection,
  essence,
  activeBinderId,
  unlockedBinderIds,
  discoveredCardIds,
  onSetActiveBinder,
  onCraftCard,
  onDisenchantCard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaction, setSelectedFaction] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedOwnership, setSelectedOwnership] = useState<'All' | 'Owned' | 'Undiscovered'>('All');
  const [selectedCost, setSelectedCost] = useState<number | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [showBinderSelector, setShowBinderSelector] = useState(false);

  const activeBinder = getBinderById(activeBinderId) || BINDERS[0];

  // Filter cards
  const filteredCards = ALL_CARDS.filter((card) => {
    const count = collection[card.id] || 0;
    const isDiscovered = discoveredCardIds.includes(card.id);
    const isOwned = count > 0;

    // Ownership filter
    if (selectedOwnership === 'Owned' && !isOwned) return false;
    if (selectedOwnership === 'Undiscovered' && (isOwned || isDiscovered)) return false;

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

  const handleCardClick = (card: Card, isUndiscovered: boolean) => {
    audio.playClick();
    if (!isUndiscovered) {
      setInspectedCard(card);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* HEADER: Active Binder Banner & Currencies */}
      <div className="flex flex-col gap-4 mb-4">
        {/* Top bar */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          {/* Active Binder Display */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 px-4 rounded-2xl border border-amber-500/40 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-amber-300">
                {activeBinder.name[0]}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-amber-400 tracking-wider">
                Active Binder
              </div>
              <div className="text-sm font-cinzel font-black text-slate-100 flex items-center gap-1.5">
                {activeBinder.name}
                <span className="text-[10px] text-slate-400 font-sans font-normal">({activeBinder.title})</span>
              </div>
            </div>
            <button
              onClick={() => setShowBinderSelector(true)}
              className="ml-3 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all shadow"
            >
              Change Binder
            </button>
          </div>

          {/* Essence counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel-glow border border-purple-500/40">
            <Gem className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-purple-300 uppercase tracking-wider font-semibold">Essence:</span>
            <span className="font-cinzel font-bold text-sm text-purple-100">{essence}</span>
          </div>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
          {/* Search Input */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Ownership Filter */}
          <div className="flex items-center gap-1">
            {(['All', 'Owned', 'Undiscovered'] as const).map((own) => (
              <button
                key={own}
                onClick={() => setSelectedOwnership(own)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedOwnership === own
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {own}
              </button>
            ))}
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
                className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
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
          const isDiscovered = discoveredCardIds.includes(card.id);
          const isOwned = count > 0;
          const isUndiscovered = !isOwned && !isDiscovered;
          const isDiscoveredOnly = !isOwned && isDiscovered;

          return (
            <div key={card.id} className="flex justify-center relative">
              <CardView
                card={card}
                showCount={count}
                isUndiscovered={isUndiscovered}
                isDiscoveredOnly={isDiscoveredOnly}
                onClick={() => handleCardClick(card, isUndiscovered)}
              />
              {isDiscoveredOnly && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-purple-950/90 border border-purple-500 text-purple-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow">
                  Unowned
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* BINDER SELECTOR MODAL */}
      {showBinderSelector && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="w-[680px] bg-slate-900 border border-amber-500/50 rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative">
            <button
              onClick={() => setShowBinderSelector(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Crown className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-xl font-cinzel font-bold text-slate-100">Select Active Binder</h2>
                <p className="text-xs text-slate-400">Choose the champion to pilot your decks in 1V1 duels.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2">
              {BINDERS.map((binder) => {
                const isUnlocked = unlockedBinderIds.includes(binder.id);
                const isActive = activeBinderId === binder.id;

                return (
                  <div
                    key={binder.id}
                    onClick={() => {
                      if (isUnlocked) {
                        audio.playClick();
                        onSetActiveBinder(binder.id);
                        setShowBinderSelector(false);
                      }
                    }}
                    className={`
                      p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all relative
                      ${
                        isActive
                          ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-2 ring-amber-400/50'
                          : isUnlocked
                          ? 'border-slate-700 bg-slate-950/60 hover:border-slate-500 cursor-pointer'
                          : 'border-slate-800 bg-slate-950/30 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl font-bold">
                      {binder.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-cinzel font-bold text-slate-100">{binder.name}</div>
                      <div className="text-[10px] text-slate-400">{binder.title}</div>
                    </div>

                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                    {!isActive && isUnlocked && (
                      <span className="text-[10px] text-slate-400 hover:text-amber-300">Click to Select</span>
                    )}
                    {!isUnlocked && (
                      <span className="text-[10px] text-red-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
