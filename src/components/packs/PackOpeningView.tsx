import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardRarity } from '../../types/card';
import { PACK_TYPES, PackDefinition } from '../../data/packs';
import { ALL_CARDS } from '../../data/cards';
import { CardView } from '../card/CardView';
import { audio } from '../../services/audioService';
import { Package, Sparkles, Coins, ArrowRight, RotateCcw, CheckCircle2, ChevronRight } from 'lucide-react';

interface PackOpeningViewProps {
  gold: number;
  collection: Record<string, number>;
  onBuyPack: (pack: PackDefinition, pulledCards: Card[]) => void;
}

export const PackOpeningView: React.FC<PackOpeningViewProps> = ({
  gold,
  collection,
  onBuyPack
}) => {
  const [selectedPack, setSelectedPack] = useState<PackDefinition | null>(null);
  const [openingStage, setOpeningStage] = useState<'idle' | 'unsealing' | 'single_reveal' | 'summary'>('idle');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState<boolean>(false);

  const generateCardsForPack = (pack: PackDefinition): Card[] => {
    const cards: Card[] = [];

    for (let i = 0; i < pack.cardCount; i++) {
      const roll = Math.random();
      let rarity: CardRarity = 'Common';

      if (i === 0 && pack.guaranteedMinRarity) {
        rarity = pack.guaranteedMinRarity;
      } else {
        if (roll < pack.dropRates.Mythic) rarity = 'Mythic';
        else if (roll < pack.dropRates.Mythic + pack.dropRates.Legendary) rarity = 'Legendary';
        else if (roll < pack.dropRates.Mythic + pack.dropRates.Legendary + pack.dropRates.Epic) rarity = 'Epic';
        else if (roll < pack.dropRates.Mythic + pack.dropRates.Legendary + pack.dropRates.Epic + pack.dropRates.Rare) rarity = 'Rare';
      }

      let pool = ALL_CARDS.filter((c) => c.rarity === rarity);
      if (pack.factionWeight) {
        const factionPool = pool.filter((c) => c.faction === pack.factionWeight);
        if (factionPool.length > 0 && Math.random() < 0.6) {
          pool = factionPool;
        }
      }

      const picked = pool[Math.floor(Math.random() * pool.length)] || ALL_CARDS[0];
      cards.push(picked);
    }

    return cards;
  };

  const handleStartOpen = (pack: PackDefinition) => {
    if (gold < pack.costGold) return;

    audio.playClick();
    setSelectedPack(pack);
    const generated = generateCardsForPack(pack);
    setPulledCards(generated);
    setCurrentCardIndex(0);
    setIsCurrentCardFlipped(false);
    setOpeningStage('unsealing');

    setTimeout(() => {
      audio.playPackBurst();
      setOpeningStage('single_reveal');
    }, 900);
  };

  const handleFlipCurrentCard = () => {
    if (isCurrentCardFlipped) return;

    audio.playCardFlip();
    setIsCurrentCardFlipped(true);

    const card = pulledCards[currentCardIndex];
    if (card) {
      if (card.rarity === 'Legendary' || card.rarity === 'Mythic') {
        audio.playLegendaryReveal();
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch (e) {}
      } else if (card.rarity === 'Epic') {
        audio.playCardPlay();
      }
    }
  };

  const handleNextCard = () => {
    audio.playClick();
    if (currentCardIndex + 1 < pulledCards.length) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsCurrentCardFlipped(false);
    } else {
      // Completed all cards
      if (selectedPack) {
        onBuyPack(selectedPack, pulledCards);
      }
      setOpeningStage('summary');
    }
  };

  const currentCard = pulledCards[currentCardIndex];
  const isDuplicate = currentCard ? (collection[currentCard.id] || 0) > 0 : false;

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col p-6 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-amber-400" />
            Veilbound Relic Vault
          </h1>
          <p className="text-xs text-slate-400">
            Acquire booster packs from across the dimensional boundaries to expand your collection.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-300 uppercase tracking-wider font-semibold">Gold:</span>
          <span className="font-cinzel font-bold text-sm text-amber-100">{gold}</span>
        </div>
      </div>

      {/* STAGE: IDLE - Pack Selection */}
      {openingStage === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-2">
          {PACK_TYPES.map((pack) => {
            const canAfford = gold >= pack.costGold;

            return (
              <div
                key={pack.id}
                className="relative rounded-2xl bg-slate-900/70 border p-5 flex flex-col justify-between hover:scale-105 transition-all duration-300 shadow-2xl group cursor-pointer"
                style={{ borderColor: pack.themeColor }}
              >
                <div>
                  <div
                    className="w-full h-44 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-white/10"
                    style={{
                      background: `radial-gradient(ellipse at center, ${pack.themeColor}33 0%, rgba(15,23,42,0.95) 100%)`
                    }}
                  >
                    <Package
                      className="w-16 h-16 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:rotate-6 transition-transform duration-300"
                      style={{ color: pack.themeColor }}
                    />
                  </div>

                  <h3 className="font-cinzel font-bold text-base text-slate-100 mb-0.5">{pack.name}</h3>
                  <div className="text-[11px] font-semibold mb-2" style={{ color: pack.themeColor }}>
                    {pack.subtitle}
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    {pack.description}
                  </p>
                </div>

                <button
                  onClick={() => handleStartOpen(pack)}
                  disabled={!canAfford}
                  className={`
                    w-full py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider
                    flex items-center justify-center gap-2 transition-all duration-200
                    ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold shadow-lg active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Open for {pack.costGold} Gold</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* STAGE: UNSEALING ANIMATION */}
      {openingStage === 'unsealing' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-pulse">
          <div className="w-40 h-40 rounded-3xl bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]">
            <Package className="w-20 h-20 text-amber-300 animate-bounce" />
          </div>
          <h2 className="text-2xl font-cinzel font-bold text-amber-300 tracking-wider">
            Unsealing {selectedPack?.name}...
          </h2>
          <p className="text-xs text-slate-400">Tearing the dimensional seal...</p>
        </div>
      )}

      {/* STAGE: SINGLE REVEAL (ONE CARD AT A TIME) */}
      {openingStage === 'single_reveal' && currentCard && (
        <div className="flex-1 flex flex-col items-center justify-between py-2">
          {/* Progress Header */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
              Revealing Card {currentCardIndex + 1} of {pulledCards.length}
            </span>
            <div className="flex items-center gap-2 mt-1">
              {pulledCards.map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < currentCardIndex
                      ? 'bg-emerald-400 ring-2 ring-emerald-500/40'
                      : i === currentCardIndex
                      ? 'bg-amber-400 scale-125 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                      : 'bg-slate-800 border border-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Center: The Focused Card */}
          <div className="flex flex-col items-center my-auto py-4">
            {!isCurrentCardFlipped ? (
              /* Face-Down Card */
              <div
                onClick={handleFlipCurrentCard}
                className="group cursor-pointer flex flex-col items-center transition-transform hover:scale-105"
              >
                <div className="w-56 h-80 rounded-2xl border-4 border-amber-500/60 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden group-hover:border-amber-400 group-hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]">
                  {/* Subtle Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                  <Sparkles className="w-16 h-16 text-amber-400 animate-spin duration-[15s] mb-4" />
                  <span className="font-cinzel font-black text-sm text-amber-200 tracking-widest uppercase">
                    Veilbound
                  </span>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono">
                    CLICK TO REVEAL
                  </span>
                </div>
                <div className="mt-4 text-xs font-semibold text-amber-300 animate-pulse flex items-center gap-1.5">
                  <span>✨ Click card to flip and reveal</span>
                </div>
              </div>
            ) : (
              /* Revealed Card with Badge & FX */
              <div className="flex flex-col items-center animate-scaleUp">
                <div className="mb-3 flex items-center gap-2">
                  {!isDuplicate ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                      ✨ NEW TO COLLECTION
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/50">
                      DUPLICATE (+25 Essence)
                    </span>
                  )}
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {currentCard.rarity}
                  </span>
                </div>

                <div className="shadow-[0_0_35px_rgba(0,0,0,0.8)] rounded-xl">
                  <CardView card={currentCard} size="md" />
                </div>

                {/* Continue button */}
                <button
                  onClick={handleNextCard}
                  className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-105 flex items-center gap-2"
                >
                  <span>
                    {currentCardIndex + 1 < pulledCards.length
                      ? `Reveal Next Card (${currentCardIndex + 2} / ${pulledCards.length})`
                      : 'View Pack Summary'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Tray: Previously Revealed Cards in this pack */}
          <div className="w-full max-w-3xl bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-2">
              Revealed in Pack ({isCurrentCardFlipped ? currentCardIndex + 1 : currentCardIndex} / {pulledCards.length}):
            </span>
            <div className="flex items-center gap-2">
              {pulledCards.slice(0, isCurrentCardFlipped ? currentCardIndex + 1 : currentCardIndex).map((card, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-slate-200"
                >
                  <span className="font-semibold truncate max-w-[100px]">{card.name}</span>
                  <span className="text-[10px] text-amber-400">({card.rarity[0]})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STAGE: SUMMARY VIEW */}
      {openingStage === 'summary' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fadeIn my-auto">
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <h2 className="text-3xl font-cinzel font-black text-amber-400 mb-1">
              Pack Opening Complete!
            </h2>
            <p className="text-xs text-slate-300">
              All 5 cards have been added to your vault.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center max-w-5xl">
            {pulledCards.map((card, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <CardView card={card} size="sm" />
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/40">
                  Added to Collection
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => {
                audio.playButtonClick();
                setOpeningStage('idle');
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-cinzel font-bold text-xs tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Back to Vault</span>
            </button>
            {selectedPack && gold >= selectedPack.costGold && (
              <button
                onClick={() => handleStartOpen(selectedPack)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              >
                <Package className="w-4 h-4" />
                <span>Open Another ({selectedPack.costGold} Gold)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
