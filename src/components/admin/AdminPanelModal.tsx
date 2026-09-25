import React, { useState } from 'react';
import { StorageData } from '../../services/storageService';
import { PlayerProgressionState } from '../../services/progressionService';
import { ALL_CARDS, getCardById } from '../../data/cards';
import { BINDERS } from '../../data/binders';
import { PUZZLE_CHAPTERS } from '../../data/puzzlesData';
import { runAIVsAISimulation } from '../../engine/aiCombatTests';
import { audio } from '../../services/audioService';
import { 
  Shield, X, Terminal, Users, Database, Sparkles, 
  Play, RefreshCw, AlertTriangle, Check, Search, Plus, 
  Trash2, Gem, Coins, Trophy, Award, Bug 
} from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  storageData: StorageData;
  progression: PlayerProgressionState;
  onUpdateStorage: (updater: (prev: StorageData) => StorageData) => void;
  onUpdateProgression: (updater: (prev: PlayerProgressionState) => PlayerProgressionState) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  storageData,
  progression,
  onUpdateStorage,
  onUpdateProgression
}) => {
  const [activeTab, setActiveTab] = useState<'PLAYER' | 'COLLECTION' | 'BINDERS' | 'MODES' | 'DEBUG'>('PLAYER');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [cardSearch, setCardSearch] = useState('');
  const [simResult, setSimResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  if (!isOpen) return null;

  const notify = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Currencies & Progression Actions
  const handleAddGold = (amount: number) => {
    audio.playClick();
    onUpdateStorage(prev => ({
      ...prev,
      profile: { ...prev.profile, gold: prev.profile.gold + amount }
    }));
    notify(`Added +${amount} Gold.`);
  };

  const handleAddEssence = (amount: number) => {
    audio.playClick();
    onUpdateStorage(prev => ({
      ...prev,
      profile: { ...prev.profile, essence: prev.profile.essence + amount }
    }));
    notify(`Added +${amount} Essence.`);
  };

  const handleSetLevel = (lvl: number) => {
    audio.playClick();
    onUpdateProgression(prev => ({
      ...prev,
      playerLevel: lvl,
      currentXp: 0
    }));
    onUpdateStorage(prev => ({
      ...prev,
      profile: { ...prev.profile, level: lvl }
    }));
    notify(`Set Player Level to ${lvl}.`);
  };

  // Collection Actions
  const handleGrantCard = (cardId: string) => {
    audio.playClick();
    onUpdateStorage(prev => {
      const current = prev.collection[cardId] || 0;
      const discovered = [...(prev.profile.discoveredCardIds || [])];
      if (!discovered.includes(cardId)) discovered.push(cardId);

      return {
        ...prev,
        profile: { ...prev.profile, discoveredCardIds: discovered },
        collection: { ...prev.collection, [cardId]: current + 1 }
      };
    });
    notify(`Granted 1 copy of ${cardId}.`);
  };

  const handleUnlockAllCards = () => {
    audio.playClick();
    onUpdateStorage(prev => {
      const fullCol: Record<string, number> = {};
      const allIds: string[] = [];
      ALL_CARDS.forEach(c => {
        fullCol[c.id] = 2;
        allIds.push(c.id);
      });
      return {
        ...prev,
        profile: { ...prev.profile, discoveredCardIds: allIds },
        collection: fullCol
      };
    });
    notify('Unlocked 2 copies of ALL 130+ cards!');
  };

  // Binders Actions
  const handleUnlockAllBinders = () => {
    audio.playClick();
    const allBinderIds = BINDERS.map(b => b.id);
    onUpdateStorage(prev => ({
      ...prev,
      profile: { ...prev.profile, unlockedBinderIds: allBinderIds }
    }));
    onUpdateProgression(prev => ({
      ...prev,
      unlockedBinderIds: allBinderIds
    }));
    notify('Unlocked all 6 Binders!');
  };

  const handleSetActiveBinder = (bId: string) => {
    audio.playClick();
    onUpdateStorage(prev => ({
      ...prev,
      profile: { ...prev.profile, activeBinderId: bId }
    }));
    notify(`Set active Binder to ${bId}.`);
  };

  // Run AI vs AI Simulation
  const handleRunSim = () => {
    audio.playClick();
    setIsSimulating(true);
    setSimResult('Simulating 30-turn AI vs AI match...');

    setTimeout(() => {
      try {
        const result = runAIVsAISimulation();
        setSimResult(
          `Completed in ${result.turnsTaken} turns. Winner: ${result.winner} (${result.totalCardsPlayed} cards played, ${result.totalDamageDealt} damage dealt). Final player health: ${result.finalPlayerHealth}, opponent: ${result.finalOpponentHealth}.`
        );
      } catch (e: any) {
        setSimResult(`Simulation error: ${e.message}`);
      } finally {
        setIsSimulating(false);
      }
    }, 200);
  };

  // Reset Account
  const handleResetAccount = () => {
    if (confirm('Are you sure you want to completely wipe player storage and reset to a fresh account?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const filteredCards = ALL_CARDS.filter(c => 
    c.name.toLowerCase().includes(cardSearch.toLowerCase()) || 
    c.faction.toLowerCase().includes(cardSearch.toLowerCase())
  ).slice(0, 24);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none animate-fadeIn font-mono">
      <div className="w-[900px] max-h-[85vh] bg-slate-950 border-2 border-red-500/80 rounded-2xl flex flex-col shadow-[0_0_60px_rgba(239,68,68,0.4)] overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-red-950/80 border-b border-red-500/40 p-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-300 font-bold text-sm tracking-wider">
            <Terminal className="w-5 h-5 text-red-400" />
            <span>VEILBOUND 2.1 — INTERNAL ADMIN CONSOLE</span>
          </div>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <span className="text-xs bg-emerald-950 border border-emerald-500 text-emerald-300 px-3 py-1 rounded-full animate-pulse">
                ✓ {statusMessage}
              </span>
            )}
            <button onClick={onClose} className="text-red-300 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900 border-b border-slate-800 text-xs font-bold">
          {(['PLAYER', 'COLLECTION', 'BINDERS', 'MODES', 'DEBUG'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-red-500 text-red-400 bg-red-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          {/* TAB 1: PLAYER & CURRENCY */}
          {activeTab === 'PLAYER' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Level</div>
                  <div className="text-xl font-bold text-amber-400">{progression.playerLevel}</div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 3, 5, 7].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => handleSetLevel(lvl)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300"
                      >
                        Lv.{lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Gold</div>
                  <div className="text-xl font-bold text-amber-300">{storageData.profile.gold}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleAddGold(500)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px]"
                    >
                      +500
                    </button>
                    <button
                      onClick={() => handleAddGold(5000)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px]"
                    >
                      +5000
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Essence</div>
                  <div className="text-xl font-bold text-purple-400">{storageData.profile.essence}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => handleAddEssence(400)}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px]"
                    >
                      +400
                    </button>
                    <button
                      onClick={() => handleAddEssence(3200)}
                      className="px-2 py-0.5 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px]"
                    >
                      +3200
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px] uppercase">Active Binder</div>
                  <div className="text-base font-bold text-slate-100 truncate">{storageData.profile.activeBinderId}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Deck: {storageData.profile.activeDeckId}</div>
                </div>
              </div>

              {/* Dangerous Reset Area */}
              <div className="p-4 bg-red-950/20 border border-red-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Reset Account / Wipe Local Storage
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Restores curated starting collection, Level 1, and default state.
                  </div>
                </div>
                <button
                  onClick={handleResetAccount}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Wipe & Reset
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: COLLECTION */}
          {activeTab === 'COLLECTION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={cardSearch}
                    onChange={e => setCardSearch(e.target.value)}
                    placeholder="Search cards to grant..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <button
                  onClick={handleUnlockAllCards}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Unlock All Cards (x2)
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredCards.map(c => {
                  const owned = storageData.collection[c.id] || 0;
                  return (
                    <div key={c.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-slate-200 truncate">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.faction} • {c.rarity}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-amber-300">Owned: {owned}</span>
                        <button
                          onClick={() => handleGrantCard(c.id)}
                          className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold"
                        >
                          +1 Copy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: BINDERS */}
          {activeTab === 'BINDERS' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-300">Manage Binders:</span>
                <button
                  onClick={handleUnlockAllBinders}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Unlock All Binders
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {BINDERS.map(b => {
                  const isUnlocked = (storageData.profile.unlockedBinderIds || []).includes(b.id);
                  const isActive = storageData.profile.activeBinderId === b.id;

                  return (
                    <div key={b.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-100">{b.name}</div>
                        <div className="text-[10px] text-slate-400">{b.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <span className="text-[10px] text-emerald-400">Unlocked</span>
                        ) : (
                          <button
                            onClick={() => {
                              onUpdateStorage(prev => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  unlockedBinderIds: [...prev.profile.unlockedBinderIds, b.id]
                                }
                              }));
                              notify(`Unlocked Binder: ${b.name}`);
                            }}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-300"
                          >
                            Unlock
                          </button>
                        )}

                        <button
                          onClick={() => handleSetActiveBinder(b.id)}
                          disabled={isActive}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                            isActive ? 'bg-amber-500 text-slate-950' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                          }`}
                        >
                          {isActive ? 'Active' : 'Set Active'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MODES */}
          {activeTab === 'MODES' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-purple-400">Tactical Puzzles</div>
                <div className="text-[11px] text-slate-400">Unlock all 6 chapters or mark puzzles solved.</div>
                <button
                  onClick={() => {
                    const solved: Record<string, number> = {};
                    PUZZLE_CHAPTERS.forEach(ch => {
                      ch.puzzles.forEach(p => {
                        solved[p.id] = 3;
                      });
                    });
                    localStorage.setItem('VEILBOUND_SOLVED_PUZZLES_V2', JSON.stringify(solved));
                    notify('All puzzles marked 3-Star Solved!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  Solve All Puzzles (⭐⭐⭐)
                </button>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-amber-400">Battlegrounds (8 Players)</div>
                <div className="text-[11px] text-slate-400">Verify 8-player lobby configuration and unit pool.</div>
                <div className="text-[10px] text-slate-500">Lobby: 1 Human + 7 AI Opponents with distinct strategies.</div>
              </div>
            </div>
          )}

          {/* TAB 5: DEBUG & SIMULATION */}
          {activeTab === 'DEBUG' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <Bug className="w-4 h-4" /> AI vs AI Match Simulation Engine
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Executes a full 30-turn battle between two autonomous AI decision loops, testing lethal calculation, trading, face damage, and turn closure.
                </p>

                <button
                  onClick={handleRunSim}
                  disabled={isSimulating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{isSimulating ? 'Simulating...' : 'Run Autonomous AI vs AI Battle'}</span>
                </button>

                {simResult && (
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 text-[11px] leading-relaxed">
                    {simResult}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
