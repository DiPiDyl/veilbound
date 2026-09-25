import React, { useState } from 'react';
import { FREE_FOR_ALL_OPPONENTS, FreeForAllOpponent } from '../../data/freeForAllEnemies';
import { audioService } from '../../services/audioService';

interface FreeForAllViewProps {
  currentStage: number; // 1 to 10
  onStartMatch: (opponent: FreeForAllOpponent) => void;
  onBackToMenu: () => void;
  onClaimMilestone?: (milestone: FreeForAllOpponent['milestoneReward']) => void;
  onResetGauntlet: () => void;
}

export const FreeForAllView: React.FC<FreeForAllViewProps> = ({
  currentStage = 1,
  onStartMatch,
  onBackToMenu,
  onResetGauntlet,
}) => {
  const [selectedOpponent, setSelectedOpponent] = useState<FreeForAllOpponent>(
    FREE_FOR_ALL_OPPONENTS[Math.min(Math.max(currentStage - 1, 0), 9)]
  );
  const [showMatchTransition, setShowMatchTransition] = useState<boolean>(false);

  const activeOpponent = FREE_FOR_ALL_OPPONENTS[Math.min(Math.max(currentStage - 1, 0), 9)];
  const isGauntletComplete = currentStage > 10;

  const handleSelectOpponent = (opp: FreeForAllOpponent) => {
    audioService.playButtonClick();
    setSelectedOpponent(opp);
  };

  const handleLaunchFight = () => {
    audioService.playButtonClick();
    setShowMatchTransition(true);
    setTimeout(() => {
      onStartMatch(activeOpponent);
    }, 1200);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-purple-950/70 to-slate-950 text-slate-100 flex flex-col p-4 md:p-8 select-none overflow-y-auto">
      {/* Background ambient radial aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-purple-900/10 to-transparent pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex items-center justify-between border-b border-amber-500/30 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              audioService.playButtonClick();
              onBackToMenu();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 text-amber-300 font-semibold transition-all hover:scale-105 flex items-center gap-2"
          >
            ← Back to Hub
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 bg-clip-text text-transparent">
                FREE-FOR-ALL GAUNTLET
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                10-Match Ladder
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400">
              Conquer 10 escalating champions in sequence. Claim high-tier rewards at matches 1, 3, 5, 7, and 10!
            </p>
          </div>
        </div>

        {/* Status / Reset */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-lg px-4 py-2 text-right">
            <div className="text-xs text-slate-400 font-medium">Current Progress</div>
            <div className="text-lg font-bold text-amber-400">
              {isGauntletComplete ? '🏆 CHAMPION' : `Match ${currentStage} / 10`}
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your Free-For-All Gauntlet run?')) {
                audioService.playButtonClick();
                onResetGauntlet();
              }
            }}
            className="px-3 py-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-xs text-red-300 transition-all"
            title="Reset Gauntlet to Match 1"
          >
            Reset Run
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {isGauntletComplete ? (
        /* Grand Victory Screen */
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
          <div className="animate-bounce text-6xl md:text-8xl mb-4">👑</div>
          <h2 className="text-4xl md:text-5xl font-black text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] mb-2">
            SOVEREIGN GRAND CHAMPION!
          </h2>
          <p className="text-lg text-amber-100 max-w-xl mx-auto mb-6">
            You have toppled all 10 masters of the Arena, including Grandmaster Ouroboros. Your name is etched forever into the Astral Constellation of Champions!
          </p>
          <div className="bg-slate-900/90 border-2 border-amber-400 rounded-2xl p-6 max-w-md w-full shadow-2xl mb-6">
            <h3 className="text-sm font-bold tracking-wider text-amber-300 uppercase mb-3">Rewards Unlocked</h3>
            <div className="space-y-2 text-left text-sm text-slate-200">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>💰 Gold Bounty</span>
                <span className="font-bold text-amber-400">+1,200 Gold</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>📦 Sovereign Legendary Boxes</span>
                <span className="font-bold text-amber-400">3 Deluxe Packs</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>🛡️ Exclusive Title</span>
                <span className="font-bold text-purple-300">Lord of the Infinite Arena</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.playButtonClick();
              onResetGauntlet();
            }}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all hover:scale-105"
          >
            Start New Gauntlet
          </button>
        </div>
      ) : (
        <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center: The 10-tier Gauntlet Ladder */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-2 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
              <span>ARENA ROSTER</span>
              <span>CLICK OPPONENT FOR INTEL</span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
              {FREE_FOR_ALL_OPPONENTS.map((opp) => {
                const isCleared = opp.matchNumber < currentStage;
                const isCurrent = opp.matchNumber === currentStage;
                const isLocked = opp.matchNumber > currentStage;
                const isSelected = selectedOpponent.id === opp.id;

                return (
                  <div
                    key={opp.id}
                    onClick={() => handleSelectOpponent(opp)}
                    className={`cursor-pointer group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-amber-400 bg-amber-500/10 border-amber-400/80 scale-[1.01]'
                        : isCurrent
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : isCleared
                        ? 'bg-slate-900/40 border-emerald-600/30 opacity-70 hover:opacity-100'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-40 hover:opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Match Badge */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border ${
                          isCleared
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                            : isCurrent
                            ? 'bg-amber-500 border-amber-300 text-slate-950 animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isCleared ? '✓' : opp.matchNumber}
                      </div>

                      {/* Opponent Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${opp.portraitTheme} border border-slate-700 shadow-md`}>
                        {opp.avatarIcon}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${isCurrent ? 'text-amber-200' : 'text-slate-200'}`}>
                            {opp.name}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {opp.rankTitle}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[200px] md:max-w-xs">
                          {opp.deckTheme}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Health & Milestone Icon */}
                    <div className="flex items-center gap-3">
                      {opp.milestoneReward && (
                        <div
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                            isCleared
                              ? 'bg-emerald-900/50 border-emerald-500/40 text-emerald-300'
                              : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                          }`}
                          title={`Milestone Reward: ${opp.milestoneReward.packs} Pack(s) + ${opp.milestoneReward.gold} Gold`}
                        >
                          🎁 <span className="hidden sm:inline">Milestone</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40">
                        <span>❤️</span>
                        <span>{opp.health}</span>
                      </div>

                      <div className="text-xs font-bold w-16 text-right">
                        {isCleared && <span className="text-emerald-400">CLEARED</span>}
                        {isCurrent && <span className="text-amber-400 animate-pulse">UP NEXT</span>}
                        {isLocked && <span className="text-slate-600">LOCKED</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Opponent Dossier & Fight Launcher */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl border border-amber-500/40 p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient corner light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Opponent Big Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br ${selectedOpponent.portraitTheme} border-2 border-amber-400/80 shadow-lg`}>
                  {selectedOpponent.avatarIcon}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Match #{selectedOpponent.matchNumber} • {selectedOpponent.rankTitle}
                  </div>
                  <h2 className="text-2xl font-black text-slate-100">{selectedOpponent.name}</h2>
                  <div className="text-sm font-medium text-slate-400 italic">"{selectedOpponent.title}"</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-rose-900/60 border border-rose-500/60 text-rose-200 px-2 py-0.5 rounded-full font-bold">
                      ❤️ {selectedOpponent.health} HP
                    </span>
                    <span className="text-xs bg-indigo-900/60 border border-indigo-500/60 text-indigo-200 px-2 py-0.5 rounded-full font-bold">
                      🃏 {selectedOpponent.deckCards.length} Cards
                    </span>
                  </div>
                </div>
              </div>

              {/* Opponent Dialogue Quote */}
              <div className="bg-slate-950/80 rounded-xl p-3 border-l-4 border-amber-400 mb-4 text-xs text-amber-200/90 italic">
                {selectedOpponent.quoteIntro}
              </div>

              {/* Passive Trait */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>⚡</span>
                  <span>Arena Passive Trait</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedOpponent.passiveTrait}</p>
              </div>

              {/* Deck Theme */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 mb-4">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5 mb-1">
                  <span>🔮</span>
                  <span>Battle Style & Deck Focus</span>
                </div>
                <p className="text-xs text-slate-300">{selectedOpponent.deckTheme}</p>
              </div>

              {/* Milestone Box if applicable */}
              {selectedOpponent.milestoneReward && (
                <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950/60 rounded-xl p-3.5 border border-amber-500/40 mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                    <span>🎁</span>
                    <span>Milestone Victory Bounty</span>
                  </div>
                  <div className="text-xs text-slate-200 flex items-center justify-between">
                    <span>Gold Reward:</span>
                    <span className="font-bold text-amber-400">+{selectedOpponent.milestoneReward.gold} Gold</span>
                  </div>
                  <div className="text-xs text-slate-200 flex items-center justify-between mt-1">
                    <span>Card Packs:</span>
                    <span className="font-bold text-amber-400">{selectedOpponent.milestoneReward.packs}x {selectedOpponent.milestoneReward.packType}</span>
                  </div>
                  {selectedOpponent.milestoneReward.specialReward && (
                    <div className="text-xs text-purple-300 flex items-center justify-between mt-1">
                      <span>Special Trophy:</span>
                      <span className="font-bold">{selectedOpponent.milestoneReward.specialReward}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Launch Action */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              {selectedOpponent.matchNumber === currentStage ? (
                <button
                  onClick={handleLaunchFight}
                  className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <span>⚔️</span>
                  <span>ENTER ARENA VS {selectedOpponent.name.toUpperCase()}</span>
                </button>
              ) : selectedOpponent.matchNumber < currentStage ? (
                <div className="text-center py-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-sm">
                  ✓ Opponent Defeated in this Run
                </div>
              ) : (
                <div className="text-center py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 font-bold text-sm">
                  🔒 Defeat Match #{currentStage} to unlock
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Transition Modal */}
      {showMatchTransition && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-fadeIn">
          <div className="text-amber-400 font-black tracking-widest text-sm uppercase mb-2 animate-pulse">
            Free-for-All Arena • Match {activeOpponent.matchNumber} of 10
          </div>
          <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl bg-gradient-to-br ${activeOpponent.portraitTheme} border-4 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.6)] mb-6 animate-scaleUp`}>
            {activeOpponent.avatarIcon}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-2">
            VS. {activeOpponent.name}
          </h2>
          <div className="text-lg text-amber-300 font-medium italic mb-6">
            "{activeOpponent.title}"
          </div>
          <div className="text-sm text-slate-400 max-w-md text-center italic border-t border-b border-slate-800 py-3 mb-8">
            {activeOpponent.quoteIntro}
          </div>
          <div className="flex items-center gap-3 text-amber-400 font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Binding Deck and Entering Arena...</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        </div>
      )}
    </div>
  );
};
