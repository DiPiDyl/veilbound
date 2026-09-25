import React, { useState, useEffect } from 'react';
import { StorageData, loadGameData, saveGameData } from './services/storageService';
import { TopNav, NavTab } from './components/menu/TopNav';
import { PlayHubView } from './components/menu/PlayHubView';
import { CollectionView } from './components/collection/CollectionView';
import { DeckBuilderView } from './components/deckbuilder/DeckBuilderView';
import { PackOpeningView } from './components/packs/PackOpeningView';
import { CardLabView } from './components/cardlab/CardLabView';
import { ExpeditionView } from './components/expedition/ExpeditionView';
import { VeilboundBattlegroundsView } from './components/battlegrounds/VeilboundBattlegroundsView';
import { PuzzleModeView } from './components/puzzles/PuzzleModeView';
import { UnlockNotificationModal } from './components/menu/UnlockNotificationModal';
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
import { ProgressionService, PlayerProgressionState } from './services/progressionService';
import { LevelMilestone } from './types/progression';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminPanelModal } from './components/admin/AdminPanelModal';
import { BATTLEFIELDS } from './data/battlefields';

export const App: React.FC = () => {
  const [data, setData] = useState<StorageData>(loadGameData);
  const [currentTab, setCurrentTab] = useState<NavTab>('PLAY');
  const [activeMatch, setActiveMatch] = useState<any | null>(null);
  const [isQuickBattleOpen, setIsQuickBattleOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchedOpponentName, setMatchedOpponentName] = useState<string | null>(null);

  // Progression & Milestones
  const [progression, setProgression] = useState<PlayerProgressionState>(() => ProgressionService.loadProgression());
  const [pendingMilestone, setPendingMilestone] = useState<LevelMilestone | null>(null);

  // Ctrl+Shift+A hotkey for admin console
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Launch Quick 1v1 with Active Binder & Active Deck against random appropriate opponent
  const handleLaunchQuick1v1 = () => {
    audio.playClick();
    const activeBinderId = data.profile.activeBinderId || 'lyra-voss';
    const activeDeckId = data.profile.activeDeckId || data.decks[0]?.id;
    const playerBinder = getBinderById(activeBinderId);
    const playerDeck = data.decks.find((d) => d.id === activeDeckId) || data.decks[0];
    const playerDeckCards = getDeckCards(playerDeck);

    // Pick random different opponent
    const possibleOpponents = BINDERS.filter((b) => b.id !== activeBinderId);
    const opponentBinder = possibleOpponents[Math.floor(Math.random() * possibleOpponents.length)] || BINDERS[1];
    const oppDeckDef = data.decks.find((d) => d.binderId === opponentBinder.id) || data.decks[0];
    const oppDeckCards = getDeckCards(oppDeckDef);

    const battlefield = BATTLEFIELDS[Math.floor(Math.random() * BATTLEFIELDS.length)].id;

    setMatchedOpponentName(`${opponentBinder.name} • ${opponentBinder.title}`);
    setIsMatchmaking(true);

    setTimeout(() => {
      const match = createInitialMatch(
        playerBinder,
        playerDeckCards,
        opponentBinder,
        oppDeckCards,
        battlefield
      );
      setIsMatchmaking(false);
      setMatchedOpponentName(null);
      setActiveMatch(match);
    }, 1100);
  };

  // Progression helper
  const addProgressionXp = (amount: number) => {
    const result = ProgressionService.addXp(progression, amount);
    setProgression(result.nextState);
    if (result.newMilestone) {
      setPendingMilestone(result.newMilestone);
      if (result.newMilestone.rewardGold > 0 || result.newMilestone.rewardEssence > 0) {
        updateData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            gold: prev.profile.gold + result.newMilestone!.rewardGold,
            essence: prev.profile.essence + result.newMilestone!.rewardEssence,
          }
        }));
      }
    }
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

    // Award XP to sequential Player Progression system
    const xpGained = won ? 120 : 40;
    addProgressionXp(xpGained);

    if (isFFA && won) {
      setFreeForAllStage((prev) => prev + 1);
    }

    setActiveMatch(null);
  };

  // Battlegrounds Finished
  const handleBattlegroundsFinished = (_placement: number, rewards: { gold: number; xp: number }) => {
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        gold: prev.profile.gold + rewards.gold,
      }
    }));
    addProgressionXp(rewards.xp);
  };

  // Puzzle Reward Claimed
  const handlePuzzleRewardClaimed = (rewards: { gold: number; essence: number }) => {
    updateData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        gold: prev.profile.gold + rewards.gold,
        essence: prev.profile.essence + rewards.essence,
      }
    }));
    addProgressionXp(50);
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
    addProgressionXp(120);
  };

  // Reset Data
  const handleResetData = () => {
    localStorage.removeItem('VEILBOUND_SAVE_DATA_V1');
    localStorage.removeItem('VEILBOUND_FFA_STAGE');
    localStorage.removeItem('VEILBOUND_PROGRESSION_V2');
    localStorage.removeItem('VEILBOUND_SOLVED_PUZZLES_V2');
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
      {/* Matchmaking Overlay Banner */}
      {isMatchmaking && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 select-none animate-fadeIn">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mb-2" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400">
              SEARCHING PLANAR REALM • MATCHMAKING
            </span>
            <h2 className="text-2xl font-cinzel font-black text-slate-100">
              Opponent Found!
            </h2>
            <p className="text-sm font-cinzel text-amber-300 font-bold">
              {matchedOpponentName}
            </p>
            <span className="text-[11px] text-slate-400 font-mono mt-2">
              Preparing Battlefield...
            </span>
          </div>
        </div>
      )}

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
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        progression={progression}
      />

      {/* Main View Port */}
      <main className="flex-1 overflow-hidden relative">
        {currentTab === 'PLAY' && (
          <PlayHubView
            onOpenQuickBattle={handleLaunchQuick1v1}
            onNavigateTab={setCurrentTab}
            onOpenCodex={() => setIsCodexOpen(true)}
            progression={progression}
          />
        )}

        {currentTab === 'BATTLEGROUNDS' && (
          <VeilboundBattlegroundsView
            onBackToMenu={() => setCurrentTab('PLAY')}
            onMatchFinished={handleBattlegroundsFinished}
          />
        )}

        {currentTab === 'PUZZLES' && (
          <PuzzleModeView
            onBackToMenu={() => setCurrentTab('PLAY')}
            onRewardClaimed={handlePuzzleRewardClaimed}
          />
        )}

        {currentTab === 'EXPEDITION' && (
          <ExpeditionView onRunCompleted={handleExpeditionCompleted} />
        )}

        {currentTab === 'COLLECTION' && (
          <CollectionView
            collection={data.collection}
            essence={data.profile.essence}
            activeBinderId={data.profile.activeBinderId || 'lyra-voss'}
            unlockedBinderIds={data.profile.unlockedBinderIds || ['lyra-voss']}
            discoveredCardIds={data.profile.discoveredCardIds || []}
            onSetActiveBinder={(bId) => {
              updateData((prev) => ({
                ...prev,
                profile: { ...prev.profile, activeBinderId: bId }
              }));
            }}
            onCraftCard={handleCraftCard}
            onDisenchantCard={handleDisenchantCard}
          />
        )}

        {currentTab === 'DECKS' && (
          <DeckBuilderView
            decks={data.decks}
            collection={data.collection}
            activeDeckId={data.profile.activeDeckId || data.decks[0]?.id}
            onSetActiveDeck={(dId) => {
              updateData((prev) => ({
                ...prev,
                profile: { ...prev.profile, activeDeckId: dId }
              }));
            }}
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

      {/* Quick Battle Configuration Modal (Available as optional dev fallback) */}
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

      {/* Level-Up Celebration Modal */}
      <UnlockNotificationModal
        milestone={pendingMilestone}
        onDismiss={() => setPendingMilestone(null)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoginOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Admin Management Console */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        storageData={data}
        progression={progression}
        onUpdateStorage={updateData}
        onUpdateProgression={(updater) => setProgression((prev) => updater(prev))}
      />
    </div>
  );
};

export default App;
