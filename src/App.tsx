import React, { useState, useEffect } from 'react';
import { StorageData, loadGameData, saveGameData } from './services/storageService';
import { TopNav, NavTab } from './components/menu/TopNav';
import { PlayHubView } from './components/menu/PlayHubView';
import { CollectionView } from './components/collection/CollectionView';
import { DeckBuilderView } from './components/deckbuilder/DeckBuilderView';
import { PackOpeningView } from './components/packs/PackOpeningView';
import { CardLabView } from './components/cardlab/CardLabView';
import { ExpeditionView } from './components/expedition/ExpeditionView';
import { ProfileView } from './components/profile/ProfileView';
import { GameBoard } from './components/battlefield/GameBoard';
import { QuickBattleModal } from './components/menu/QuickBattleModal';
import { SettingsModal } from './components/menu/SettingsModal';
import { TutorialModal } from './components/menu/TutorialModal';
import { createInitialMatch } from './engine/gameEngine';
import { getBinderById } from './data/binders';
import { getDeckCards } from './data/starterDecks';
import { getCardById } from './data/cards';
import { DeckDefinition } from './data/starterDecks';
import { CustomCardDraft } from './types/lab';
import { PackDefinition } from './data/packs';
import { Card } from './types/card';
import { audio } from './services/audioService';

export const App: React.FC = () => {
  const [data, setData] = useState<StorageData>(loadGameData);
  const [currentTab, setCurrentTab] = useState<NavTab>('PLAY');
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [isQuickBattleOpen, setIsQuickBattleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

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

  // Launch Duel
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

    // Opponent deck based on opponent binder starter
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

  // Match Finish
  const handleMatchEnd = (won: boolean, matchState: any) => {
    updateData((prev) => {
      const nextWins = prev.profile.wins + (won ? 1 : 0);
      const nextLosses = prev.profile.losses + (won ? 0 : 1);
      const goldReward = won ? 50 : 15;
      const essenceReward = won ? 25 : 5;
      const xpReward = won ? 120 : 40;

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
    <div className={`w-screen h-screen flex flex-col bg-veil-dark text-slate-100 overflow-hidden ${data.settings.highContrast ? 'contrast-125' : ''}`}>
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
      />

      {/* Main View Port */}
      <main className="flex-1 overflow-hidden relative">
        {currentTab === 'PLAY' && (
          <PlayHubView
            onOpenQuickBattle={() => setIsQuickBattleOpen(true)}
            onNavigateTab={setCurrentTab}
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
    </div>
  );
};

export default App;
