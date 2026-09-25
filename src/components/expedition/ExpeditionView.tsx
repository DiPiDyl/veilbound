import React, { useState } from 'react';
import { ExpeditionRun, ExpeditionNode, PvETreasure, NarrativeEvent, NarrativeChoice } from '../../types/pve';
import { Binder } from '../../types/binder';
import { BINDERS } from '../../data/binders';
import { STARTER_DECKS, getDeckCards } from '../../data/starterDecks';
import { createNewExpedition } from '../../engine/expeditionEngine';
import { createInitialMatch } from '../../engine/gameEngine';
import { GameBoard } from '../battlefield/GameBoard';
import { audio } from '../../services/audioService';
import { 
  Compass, Swords, Skull, Shield, Sparkles, ShoppingBag, 
  Coins, Gem, Heart, ChevronRight, CheckCircle, Crown 
} from 'lucide-react';

interface ExpeditionViewProps {
  onRunCompleted: (won: boolean, score: { gold: number; essence: number }) => void;
}

export const ExpeditionView: React.FC<ExpeditionViewProps> = ({ onRunCompleted }) => {
  const [currentRun, setCurrentRun] = useState<ExpeditionRun | null>(null);
  const [activeCombatState, setActiveCombatState] = useState<any | null>(null);
  const [activeEventModal, setActiveEventModal] = useState<NarrativeEvent | null>(null);
  const [activeTreasureChoice, setActiveTreasureChoice] = useState<PvETreasure[] | null>(null);

  // Binder selection to start a new Expedition
  const handleStartRun = (binder: Binder) => {
    audio.playClick();
    const starterDeckDef = STARTER_DECKS.find((d) => d.binderId === binder.id) || STARTER_DECKS[0];
    const deck = getDeckCards(starterDeckDef);
    const run = createNewExpedition(binder, deck);
    setCurrentRun(run);
  };

  const handleNodeClick = (node: ExpeditionNode) => {
    if (!node.isAvailable || node.isCompleted) return;

    audio.playClick();

    if (node.type === 'Combat' || node.type === 'Elite' || node.type === 'Boss') {
      if (node.enemy) {
        const match = createInitialMatch(
          currentRun!.binder,
          currentRun!.deck,
          node.enemy.binder,
          node.enemy.deckCards,
          node.type === 'Boss' ? 'the-veil' : 'shattered-city'
        );
        // Apply enemy health
        match.opponent.health = node.enemy.health;
        match.opponent.maxHealth = node.enemy.health;
        setActiveCombatState(match);
      }
    } else if (node.type === 'Event' || node.type === 'Rift') {
      if (node.event) {
        setActiveEventModal(node.event);
      }
    } else if (node.type === 'Treasure' || node.type === 'Merchant') {
      if (node.treasuresOffered) {
        setActiveTreasureChoice(node.treasuresOffered);
      }
    }
  };

  // Complete Combat
  const handleCombatFinished = (won: boolean) => {
    if (!won) {
      // Run Defeat
      onRunCompleted(false, { gold: currentRun?.gold || 0, essence: currentRun?.essence || 0 });
      setCurrentRun(null);
      setActiveCombatState(null);
      return;
    }

    // Advance current node
    if (currentRun) {
      const nextNodes = currentRun.nodes.map((n) => {
        if (n.id === currentRun.currentNodeId) {
          return { ...n, isCompleted: true, isCurrent: false };
        }
        return n;
      });

      // Find next available nodes
      const currentNode = currentRun.nodes.find((n) => n.id === currentRun.currentNodeId);
      if (currentNode) {
        for (const connId of currentNode.connectedToIds) {
          const target = nextNodes.find((n) => n.id === connId);
          if (target) {
            target.isAvailable = true;
          }
        }
      }

      // Check if Boss was beaten
      if (currentNode?.type === 'Boss') {
        onRunCompleted(true, { gold: currentRun.gold + 100, essence: currentRun.essence + 50 });
        setCurrentRun(null);
        setActiveCombatState(null);
        return;
      }

      setCurrentRun({
        ...currentRun,
        gold: currentRun.gold + 35,
        essence: currentRun.essence + 15,
        battlesWon: currentRun.battlesWon + 1,
        nodes: nextNodes
      });
      setActiveCombatState(null);
    }
  };

  // Resolve Narrative choice
  const handleChoiceSelect = (choice: NarrativeChoice) => {
    audio.playClick();
    if (!currentRun) return;

    let nextHealth = currentRun.currentHealth + (choice.effect.healthChange || 0);
    let nextMaxHealth = currentRun.maxHealth + (choice.effect.maxHealthChange || 0);
    let nextGold = currentRun.gold + (choice.effect.goldChange || 0);

    // Advance current node
    const nextNodes = currentRun.nodes.map((n) => {
      if (n.id === currentRun.currentNodeId) {
        return { ...n, isCompleted: true, isCurrent: false };
      }
      return n;
    });

    const currentNode = currentRun.nodes.find((n) => n.id === currentRun.currentNodeId);
    if (currentNode) {
      for (const connId of currentNode.connectedToIds) {
        const target = nextNodes.find((n) => n.id === connId);
        if (target) target.isAvailable = true;
      }
    }

    setCurrentRun({
      ...currentRun,
      currentHealth: Math.max(1, nextHealth),
      maxHealth: nextMaxHealth,
      gold: Math.max(0, nextGold),
      nodes: nextNodes
    });
    setActiveEventModal(null);
  };

  // Choose Treasure
  const handlePickTreasure = (treasure: PvETreasure) => {
    audio.playClick();
    if (!currentRun) return;

    const nextNodes = currentRun.nodes.map((n) => {
      if (n.id === currentRun.currentNodeId) {
        return { ...n, isCompleted: true, isCurrent: false };
      }
      return n;
    });

    const currentNode = currentRun.nodes.find((n) => n.id === currentRun.currentNodeId);
    if (currentNode) {
      for (const connId of currentNode.connectedToIds) {
        const target = nextNodes.find((n) => n.id === connId);
        if (target) target.isAvailable = true;
      }
    }

    setCurrentRun({
      ...currentRun,
      treasures: [...currentRun.treasures, treasure],
      nodes: nextNodes
    });
    setActiveTreasureChoice(null);
  };

  // If in combat encounter
  if (activeCombatState) {
    return (
      <GameBoard
        initialState={activeCombatState}
        onMatchEnd={(won) => handleCombatFinished(won)}
        onExit={() => setActiveCombatState(null)}
      />
    );
  }

  // If No active run: Choose Binder screen
  if (!currentRun) {
    return (
      <div className="w-full h-full p-8 flex flex-col items-center justify-center overflow-y-auto">
        <div className="text-center max-w-xl mb-8">
          <div className="flex items-center justify-center gap-2 mb-2 text-indigo-400">
            <Compass className="w-8 h-8 animate-spin duration-[30s]" />
          </div>
          <h1 className="text-3xl font-cinzel font-extrabold text-slate-100 mb-2">
            The Veil Expedition
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Embark on a roguelite descent into the fractured boundaries of reality. Choose your Binder, traverse branching paths, claim game-changing treasures, and confront the ancient archons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
          {BINDERS.map((binder) => (
            <div
              key={binder.id}
              onClick={() => handleStartRun(binder)}
              className="rounded-2xl glass-panel-glow border p-5 flex flex-col justify-between hover:scale-105 transition-all duration-300 shadow-2xl cursor-pointer group"
              style={{ borderColor: binder.visualTheme.primaryColor }}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-cinzel font-bold text-lg text-slate-100">{binder.name}</h3>
                    <div className="text-xs font-semibold" style={{ color: binder.visualTheme.primaryColor }}>
                      {binder.title}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 font-mono text-slate-400">
                    {binder.faction}
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic mb-4 line-clamp-2">
                  {binder.quote}
                </p>

                <div className="text-xs text-slate-400 mb-2">
                  <strong className="text-slate-200">Hero Ability:</strong> {binder.heroPower.name} — {binder.heroPower.description}
                </div>
              </div>

              <button
                className="w-full mt-4 py-2 rounded-xl text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg"
                style={{ backgroundColor: binder.visualTheme.primaryColor }}
              >
                <span>Embark with {binder.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active Expedition Node Map
  return (
    <div className="w-full h-full flex flex-col p-6 overflow-hidden">
      {/* Top Expedition Status Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-900/80 border border-indigo-400 flex items-center justify-center font-cinzel font-bold text-sm text-indigo-200">
            {currentRun.binder.name[0]}
          </div>
          <div>
            <h2 className="font-cinzel font-bold text-base text-slate-100">{currentRun.binder.name}'s Journey</h2>
            <div className="text-xs text-indigo-300">Act 1: The Splintered Expanse</div>
          </div>
        </div>

        {/* Resources: Health, Gold, Essence, Treasures */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
            <Heart className="w-4 h-4 fill-red-400" />
            <span>{currentRun.currentHealth} / {currentRun.maxHealth} HP</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Coins className="w-4 h-4" />
            <span>{currentRun.gold} Gold</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
            <Gem className="w-4 h-4" />
            <span>{currentRun.essence} Essence</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{currentRun.treasures.length} Relics</span>
          </div>
        </div>
      </div>

      {/* Branching Procedural Node Map */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center gap-8 py-6">
        {[1, 2, 3, 4, 5, 6].map((step) => {
          const stepNodes = currentRun.nodes.filter((n) => n.step === step);

          return (
            <div key={step} className="flex items-center gap-8">
              {stepNodes.map((node) => {
                const getNodeIcon = () => {
                  switch (node.type) {
                    case 'Combat': return <Swords className="w-5 h-5 text-red-400" />;
                    case 'Elite': return <Skull className="w-5 h-5 text-purple-400" />;
                    case 'Event': return <Sparkles className="w-5 h-5 text-indigo-400" />;
                    case 'Treasure': return <Shield className="w-5 h-5 text-amber-400" />;
                    case 'Merchant': return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
                    case 'Boss': return <Crown className="w-6 h-6 text-amber-400 animate-pulse" />;
                    default: return <Compass className="w-5 h-5 text-slate-400" />;
                  }
                };

                return (
                  <div
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    className={`
                      relative p-4 rounded-2xl glass-panel-glow border-2 flex flex-col items-center gap-1 w-44 text-center
                      transition-all duration-300
                      ${
                        node.isCompleted
                          ? 'border-emerald-500/50 opacity-50 bg-emerald-950/20'
                          : node.isAvailable
                          ? 'border-indigo-400 hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                          : 'border-white/5 opacity-40 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center mb-1">
                      {getNodeIcon()}
                    </div>

                    <span className="font-cinzel font-bold text-xs text-slate-100 truncate w-full">
                      {node.title}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {node.type}
                    </span>

                    {node.isCompleted && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 absolute top-2 right-2" />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* NARRATIVE EVENT MODAL */}
      {activeEventModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-[520px] rounded-2xl glass-panel-glow border border-indigo-500/40 p-6 flex flex-col gap-4 shadow-2xl">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold mb-1">
                {activeEventModal.location}
              </div>
              <h2 className="text-xl font-cinzel font-bold text-slate-100">
                {activeEventModal.title}
              </h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeEventModal.narration}
            </p>

            {activeEventModal.flavorQuote && (
              <div className="text-xs text-slate-400 italic border-l-2 border-indigo-500 pl-2">
                {activeEventModal.flavorQuote}
              </div>
            )}

            <div className="space-y-2 mt-2 pt-3 border-t border-white/10">
              {activeEventModal.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice)}
                  className="w-full p-3 rounded-xl bg-slate-900/80 hover:bg-indigo-950/60 border border-white/10 hover:border-indigo-400 text-left transition-colors flex flex-col gap-1 group"
                >
                  <div className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300">
                    {choice.text}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {choice.outcomeDescription}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TREASURE / DRAFT MODAL */}
      {activeTreasureChoice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-[600px] rounded-2xl glass-panel-glow border border-amber-500/40 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="text-center">
              <h2 className="text-xl font-cinzel font-bold text-amber-400 mb-1">
                Choose a Planar Treasure
              </h2>
              <p className="text-xs text-slate-300">
                Treasures grant passive empowerments that last for the remainder of this Expedition.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 my-2">
              {activeTreasureChoice.map((tr) => (
                <div
                  key={tr.id}
                  onClick={() => handlePickTreasure(tr)}
                  className="p-4 rounded-xl glass-panel hover:border-amber-400 border border-white/10 flex flex-col justify-between cursor-pointer hover:scale-105 transition-all group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-2">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="font-cinzel font-bold text-sm text-slate-100 mb-1 group-hover:text-amber-300">
                      {tr.name}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {tr.description}
                    </p>
                  </div>

                  <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold mt-3">
                    {tr.rarity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
