import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Card, CardRarity } from '../../types/card';
import { PACK_TYPES, PackDefinition } from '../../data/packs';
import { ALL_CARDS } from '../../data/cards';
import { CardView } from '../card/CardView';
import { audio } from '../../services/audioService';
import { Package, Sparkles, Crown, ArrowRight, RotateCcw, Coins } from 'lucide-react';

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
  const [openingStage, setOpeningStage] = useState<'idle' | 'tearing' | 'revealing' | 'summary'>('idle');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<boolean[]>([false, false, false, false, false]);

  const generateCardsForPack = (pack: PackDefinition): Card[] => {
    const cards: Card[] = [];

    for (let i = 0; i < pack.cardCount; i++) {
      // Determine rarity based on drop rates
      const roll = Math.random();
      let rarity: CardRarity = 'Common';

      // Guaranteed min rarity for slot 0
      if (i === 0 && pack.guaranteedMinRarity) {
        rarity = pack.guaranteedMinRarity;
      } else {
        if (roll < pack.dropRates.Mythic) rarity = 'Mythic';
        else if (roll < pack.dropRates.Mythic + pack.dropRates.Legendary) rarity = 'Legendary';
        else if (roll < pack.dropRates.Mythic + pack.dropRates.Legendary + pack.dropRates.Epic) rarity = 'Epic';
        else if (roll < pack.dropRates.Mythic + pack.dropRates.Legendary + pack.dropRates.Epic + pack.dropRates.Rare) rarity = 'Rare';
      }

      // Filter card pool
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
    setFlippedIndices([false, false, false, false, false]);
    setOpeningStage('tearing');

    setTimeout(() => {
      audio.playPackBurst();
      setOpeningStage('revealing');
    }, 800);
  };

  const handleFlipCard = (index: number) => {
    if (flippedIndices[index]) return;

    const nextFlipped = [...flippedIndices];
    nextFlipped[index] = true;
    setFlippedIndices(nextFlipped);

    const card = pulledCards[index];
    if (card.rarity === 'Legendary' || card.rarity === 'Mythic') {
      audio.playLegendaryReveal();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } else {
      audio.playCardPlay();
    }

    // Check if all cards flipped
    if (nextFlipped.every((f) => f)) {
      setTimeout(() => {
        setOpeningStage('summary');
        if (selectedPack) {
          onBuyPack(selectedPack, pulledCards);
        }
      }, 1000);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-400" />
            Veilbound Relic Vault
          </h1>
          <p className="text-xs text-slate-400">
            Acquire booster packs from across the dimensional boundaries to expand your collection.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel-glow border border-amber-500/40">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-amber-300 uppercase tracking-wider font-semibold">Gold:</span>
          <span className="font-cinzel font-bold text-sm text-amber-100">{gold}</span>
        </div>
      </div>

      {/* STAGE: IDLE - Pack Selection */}
      {openingStage === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-4">
          {PACK_TYPES.map((pack) => {
            const canAfford = gold >= pack.costGold;

            return (
              <div
                key={pack.id}
                className="relative rounded-2xl glass-panel-glow border p-5 flex flex-col justify-between hover:scale-105 transition-all duration-300 shadow-2xl group cursor-pointer"
                style={{ borderColor: pack.themeColor }}
              >
                <div>
                  {/* Pack Art Visual Box */}
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

      {/* STAGE: TEARING & REVEALING */}
      {(openingStage === 'tearing' || openingStage === 'revealing') && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-xl font-cinzel font-bold text-slate-100 mb-1">
              {openingStage === 'tearing' ? 'Unsealing Planar Pack...' : 'Click each card to reveal its identity!'}
            </h2>
            <p className="text-xs text-slate-400">
              Rarities and celestial cards will reveal dynamic foils and flares.
            </p>
          </div>

          {/* Cards in hand reveal row */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {pulledCards.map((card, idx) => (
              <div key={idx} className="cursor-pointer" onClick={() => handleFlipCard(idx)}>
                {flippedIndices[idx] ? (
                  <CardView card={card} size="md" />
                ) : (
                  /* Mysterious Card Back */
                  <div className="w-48 h-68 rounded-xl border-2 border-indigo-400/50 bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center shadow-2xl hover:scale-105 transition-transform hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    <Sparkles className="w-12 h-12 text-indigo-400 animate-spin duration-[20s]" />
                    <span className="font-cinzel font-bold text-xs text-indigo-200 mt-2 tracking-widest uppercase">
                      Veilbound
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE: SUMMARY VIEW */}
      {openingStage === 'summary' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fadeIn">
          <div className="text-center">
            <h2 className="text-2xl font-cinzel font-bold text-amber-400 mb-1">Pack Opening Complete!</h2>
            <p className="text-xs text-slate-300">
              All 5 cards have been added to your collection.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {pulledCards.map((card, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <CardView card={card} size="sm" />
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700/40">
                  Added to Collection
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpeningStage('idle')}
            className="mt-4 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-cinzel font-bold text-xs tracking-wider shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Open More Packs</span>
          </button>
        </div>
      )}
    </div>
  );
};
