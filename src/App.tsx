import React, { useState, useEffect } from 'react';
import { StorageData, loadGameData, saveGameData } from './services/storageService';
import { TopNav, NavTab } from './components/menu/TopNav';
import { PlayHubView } from './components/menu/PlayHubView';
import { CollectionView } from './components/collection/CollectionView';
import { DeckBuilderView } from './components/deckbuilder/DeckBuilderView';
import { PackOpeningView } from './components/packs/PackOpeningView';
import { CardLabView } from './components/cardlab/CardLabView';
import { ExpeditionView } from './components/expedition/ExpeditionView';
import { FreeForAllView } from './components/freeforall/FreeForAllView';
import { ProfileView } from './components/profile/ProfileView';
import { GameBoard } from './components/battlefield/GameBoard';
import { QuickBattleModal } from './components/menu/QuickBattleModal';
import { SettingsModal } from './components/menu/SettingsModal';
import { TutorialModal } from './components/menu/TutorialModal';
import { CodexModal } from './components/codex/CodexModal';
import { createInitialMatch } from './engine/gameEngine';
import { getBinderById, BINDERS } from './data/binders';
import { getDeckCards } from './data/starterDecks';
import { getCardById } from './data/cards';
import { DeckDefinition } from './data/starterDecks';
import { CustomCardDraft } from './types/lab';
import { PackDefinition } from './data/packs';
import { Card } from './types/card';
import { FreeForAllOpponent } from './data/freeForAllEnemies';
import { audio } from './services/audioService';

export const App: React.FC = () => {
  const [data, setData] = useState<StorageData>(loadGameData);
  const [currentTab, setCurrentTab] = useState<NavTab>('PLAY');
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [isQuickBattleOpen, setIsQuickBattleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);

  // Free-For-All Gauntlet persistent stage
  const [freeForAllStage, setFreeForAllStage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('VEILBOUND_FFA_STAGE');
      return saved ? parseInt(saved, 10) : 1;
    } catch (e) {
      return 1;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('VEILBOUND_FFA_STAGE', freeForAllStage.toString());
    } catch (e) {}
  }, [freeForAllStage]);

  // Synchronize audio settings on mount
  useEffect(() => {
    audio.setVolume(data.settings.volume);
    audio.setMuted(data.settings.isMuted);
  }, []);

  // Save changes to localStorage
  const updateData = (updater: (prev: StorageData) => StorageData) => {
    setData((prev) => {
      const next = updater(prev);
      saveGameData(next);
      return next;
    });
  };

  // Launch Duel (Quick Battle)
  const handleStartDuel = (
    playerBinderId: string,
    playerDeckId: string,
    opponentBinderId: string,
    battlefieldId: string,
    difficulty: 'Easy' | 'Normal' | 'Hard'
  ) => {
    const playerBinder = getBinderById(playerBinderId);
    const opponentBinder = getBinderById(opponentBinderId);

    const deckDef = data.decks.find((d) => d.id === playerDeckId) || data.decks[0];
    const playerDeckCards = getDeckCards(deckDef);

    const oppDeckDef = data.decks.find((d) => d.binderId === opponentBinderId) || data.decks[0];
    const oppDeckCards = getDeckCards(oppDeckDef);

    const match = createInitialMatch(
      playerBinder,
      playerDeckCards,
      opponentBinder,
      oppDeckCards,
      battlefieldId
    );

    setActiveMatch(match);
    setIsQuickBattleOpen(false);
  };

  // Launch Free-For-All Gauntlet match
  const handleStartFreeForAllFight = (opponent: FreeForAllOpponent) => {
    const playerDeckDef = data.decks[0];
    const playerBinder = getBinderById(playerDeckDef?.binderId || BINDERS[0].id);
    const playerDeckCards = getDeckCards(playerDeckDef);

    const match = createInitialMatch(
      playerBinder,
      playerDeckCards,
      opponent.binder,
      opponent.deckCards,
      'astral_sanctum'
    );

    // Set opponent specific health
    match.opponent.health = opponent.health;
    match.opponent.maxHealth = opponent.health;

    (match as any).isFreeForAll = true;
    (match as any).ffaOpponent = opponent;

    setActiveMatch(match);
  };

  // Match Finish
  const handleMatchEnd = (won: boolean, matchState: any) => {
    const isFFA = (matchState as any)?.isFreeForAll;
    const ffaOpponent = (matchState as any)?.ffaOpponent as FreeForAllOpponent | undefined;

    updateData((prev) => {
      const nextWins = prev.profile.wins + (won ? 1 : 0);
      const nextLosses = prev.profile.losses + (won ? 0 : 1);
      let goldReward = won ? 50 : 15;
      let essenceReward = won ? 25 : 5;
      let xpReward = won ? 120 : 40;

      // Bonus if Free-for-all victory
      if (isFFA && won && ffaOpponent?.milestoneReward) {
        goldReward += ffaOpponent.milestoneReward.gold;
      }

      let nextXp = prev.profile.xp + xpReward;
      let nextLevel = prev.profile.level;
      let nextXpToLevel = prev.profile.xpToNextLevel;

      if (nextXp >= nextXpToLevel) {
        nextXp -= nextXpToLevel;
        nextLevel += 1;
        nextXpToLevel = Math.round(nextXpToLevel * 1.3);
      }

      // Check achievements
      const updatedAchievements = prev.achievements.map((ach) => {
        if (ach.id === 'ach-first-win' && won) {
          return { ...ach, isUnlocked: true, progress: 1 };
        }
        return ach;
      });

      return {
        ...prev,
        profile: {
          ...prev.profile,
          wins: nextWins,
          losses: nextLosses,
          gold: prev.profile.gold + goldReward,
          essence: prev.profile.essence + essenceReward,
          xp: nextXp,
          level: nextLevel,
          xpToNextLevel: nextXpToLevel
        },
        achievements: updatedAchievements
      };
    });

    if (isFFA && won) {
      setFreeForAllStage((prev) => prev + 1);
    }

    setActiveMatch(null);
  };

  // Crafting
  const handleCraftCard = (cardId: string) => {
    const card = getCardById(cardId);
    if (!card) return;

    const costs = { Common: 40, Rare: 100, Epic: 400, Legendary: 1600, Mythic: 3200 };
    const cost = costs[card.rarity] || 40;

    if (data.profile.essence < cost) return;

    audio.playClick();
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        essence: prev.profile.essence - cost
      },
      collection: {
        ...prev.collection,
        [cardId]: (prev.collection[cardId] || 0) + 1
      }
    }));
  };

  // Disenchanting
  const handleDisenchantCard = (cardId: string) => {
    const card = getCardById(cardId);
    if (!card || (data.collection[cardId] || 0) <= 0) return;

    const values = { Common: 10, Rare: 25, Epic: 100, Legendary: 400, Mythic: 800 };
    const val = values[card.rarity] || 10;

    audio.playClick();
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        essence: prev.profile.essence + val
      },
      collection: {
        ...prev.collection,
        [cardId]: Math.max(0, (prev.collection[cardId] || 0) - 1)
      }
    }));
  };

  // Buy & Open Pack
  const handleBuyPack = (pack: PackDefinition, pulledCards: Card[]) => {
    updateData((prev) => {
      const nextCollection = { ...prev.collection };
      for (const card of pulledCards) {
        nextCollection[card.id] = (nextCollection[card.id] || 0) + 1;
      }

      return {
        ...prev,
        profile: {
          ...prev.profile,
          gold: Math.max(0, prev.profile.gold - pack.costGold)
        },
        collection: nextCollection
      };
    });
  };

  // Save Deck
  const handleSaveDeck = (deck: DeckDefinition) => {
    updateData((prev) => {
      const existingIdx = prev.decks.findIndex((d) => d.id === deck.id);
      const nextDecks = [...prev.decks];
      if (existingIdx !== -1) {
        nextDecks[existingIdx] = deck;
      } else {
        nextDecks.push(deck);
      }
      return { ...prev, decks: nextDecks };
    });
  };

  // Delete Deck
  const handleDeleteDeck = (deckId: string) => {
    updateData((prev) => ({
      ...prev,
      decks: prev.decks.filter((d) => d.id !== deckId)
    }));
  };

  // Save Custom Card in Card Lab
  const handleSaveCustomCard = (card: CustomCardDraft) => {
    updateData((prev) => {
      const existingIdx = prev.customCards.findIndex((c) => c.id === card.id);
      const nextCustom = [...prev.customCards];
      if (existingIdx !== -1) {
        nextCustom[existingIdx] = card;
      } else {
        nextCustom.push(card);
      }
      return { ...prev, customCards: nextCustom };
    });
  };

  // Delete Custom Card
  const handleDeleteCustomCard = (cardId: string) => {
    updateData((prev) => ({
      ...prev,
      customCards: prev.customCards.filter((c) => c.id !== cardId)
    }));
  };

  // Expedition Run Completed
  const handleExpeditionCompleted = (won: boolean, score: { gold: number; essence: number }) => {
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        gold: prev.profile.gold + score.gold,
        essence: prev.profile.essence + score.essence,
        completedExpeditions: prev.profile.completedExpeditions + (won ? 1 : 0)
      }
    }));
  };

  // Reset Data
  const handleResetData = () => {
    localStorage.removeItem('VEILBOUND_SAVE_DATA_V1');
    localStorage.removeItem('VEILBOUND_FFA_STAGE');
    window.location.reload();
  };

  // If a duel match is actively underway, render GameBoard
  if (activeMatch) {
    return (
      <GameBoard
        initialState={activeMatch}
        onMatchEnd={(won) => handleMatchEnd(won, activeMatch)}
        onExit={() => setActiveMatch(null)}
      />
    );
  }

  return (
    <div className={`w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden ${data.settings.highContrast ? 'contrast-125' : ''}`}>
      {/* Global Navigation Header */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        gold={data.profile.gold}
        essence={data.profile.essence}
        isMuted={data.settings.isMuted}
        onToggleMute={() => {
          const next = !data.settings.isMuted;
          audio.setMuted(next);
          updateData((d) => ({
            ...d,
            settings: { ...d.settings, isMuted: next }
          }));
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenCodex={() => setIsCodexOpen(true)}
      />

      {/* Main View Port */}
      <main className="flex-1 overflow-hidden relative">
        {currentTab === 'PLAY' && (
          <PlayHubView
            onOpenQuickBattle={() => setIsQuickBattleOpen(false || true)}
            onNavigateTab={setCurrentTab}
            onOpenCodex={() => setIsCodexOpen(true)}
          />
        )}

        {currentTab === 'FREE FOR ALL' && (
          <FreeForAllView
            currentStage={freeForAllStage}
            onStartMatch={handleStartFreeForAllFight}
            onBackToMenu={() => setCurrentTab('PLAY')}
            onResetGauntlet={() => setFreeForAllStage(1)}
          />
        )}

        {currentTab === 'EXPEDITION' && (
          <ExpeditionView onRunCompleted={handleExpeditionCompleted} />
        )}

        {currentTab === 'COLLECTION' && (
          <CollectionView
            collection={data.collection}
            essence={data.profile.essence}
            onCraftCard={handleCraftCard}
            onDisenchantCard={handleDisenchantCard}
          />
        )}

        {currentTab === 'DECKS' && (
          <DeckBuilderView
            decks={data.decks}
            collection={data.collection}
            onSaveDeck={handleSaveDeck}
            onDeleteDeck={handleDeleteDeck}
          />
        )}

        {currentTab === 'CARD LAB' && (
          <CardLabView
            customCards={data.customCards}
            onSaveCustomCard={handleSaveCustomCard}
            onDeleteCustomCard={handleDeleteCustomCard}
          />
        )}

        {currentTab === 'PACKS' && (
          <PackOpeningView
            gold={data.profile.gold}
            collection={data.collection}
            onBuyPack={handleBuyPack}
          />
        )}

        {currentTab === 'PROFILE' && (
          <ProfileView
            profile={data.profile}
            achievements={data.achievements}
            quests={data.quests}
            onSelectBattlefield={(theme) =>
              updateData((d) => ({
                ...d,
                profile: { ...d.profile, battlefieldTheme: theme }
              }))
            }
            onSelectCardBack={(cb) =>
              updateData((d) => ({
                ...d,
                profile: { ...d.profile, cardBackTheme: cb }
              }))
            }
          />
        )}
      </main>

      {/* Quick Battle Configuration Modal */}
      <QuickBattleModal
        isOpen={isQuickBattleOpen}
        onClose={() => setIsQuickBattleOpen(false)}
        playerDecks={data.decks}
        onStartDuel={handleStartDuel}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={data.settings}
        onUpdateSettings={(newSettings) =>
          updateData((d) => ({ ...d, settings: newSettings }))
        }
        onResetData={handleResetData}
      />

      {/* Tutorial Walkthrough Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* The Veilbound Codex Grimoire Modal */}
      <CodexModal
        isOpen={isCodexOpen}
        onClose={() => setIsCodexOpen(false)}
      />
    </div>
  );
};

export default App;
