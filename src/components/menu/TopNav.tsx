import React from 'react';
import { 
  Sparkles, Swords, Compass, Layers, Wrench, 
  Package, User, Volume2, VolumeX, BookOpen, 
  Settings as SettingsIcon, Coins, Gem, Trophy, 
  Puzzle, Lock 
} from 'lucide-react';
import { audio } from '../../services/audioService';
import { PlayerProgressionState, UnlockableFeature, ProgressionService } from '../../services/progressionService';

export type NavTab = 
  | 'PLAY' 
  | 'BATTLEGROUNDS' 
  | 'PUZZLES' 
  | 'EXPEDITION' 
  | 'COLLECTION' 
  | 'DECKS' 
  | 'CARD LAB' 
  | 'PACKS' 
  | 'PROFILE';

interface TopNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  gold: number;
  essence: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenCodex: () => void;
  progression: PlayerProgressionState;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  gold,
  essence,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenTutorial,
  onOpenCodex,
  progression
}) => {
  const tabs: { 
    id: NavTab; 
    label: string; 
    icon: React.ReactNode; 
    requiredFeature?: UnlockableFeature; 
    minLevel?: number 
  }[] = [
    { id: 'PLAY', label: 'Play', icon: <Swords className="w-4 h-4" /> },
    { id: 'BATTLEGROUNDS', label: 'Battlegrounds', icon: <Trophy className="w-4 h-4 text-amber-400" />, requiredFeature: 'BATTLEGROUNDS', minLevel: 6 },
    { id: 'PUZZLES', label: 'Puzzles', icon: <Puzzle className="w-4 h-4 text-purple-400" />, requiredFeature: 'PUZZLES', minLevel: 5 },
    { id: 'EXPEDITION', label: 'Expedition', icon: <Compass className="w-4 h-4 text-sky-400" />, requiredFeature: 'EXPEDITION', minLevel: 7 },
    { id: 'COLLECTION', label: 'Collection', icon: <Layers className="w-4 h-4" />, requiredFeature: 'COLLECTION', minLevel: 2 },
    { id: 'DECKS', label: 'Decks', icon: <Layers className="w-4 h-4" />, requiredFeature: 'DECKS', minLevel: 2 },
    { id: 'CARD LAB', label: 'Card Lab', icon: <Wrench className="w-4 h-4" />, requiredFeature: 'CARD_LAB', minLevel: 3 },
    { id: 'PACKS', label: 'Packs', icon: <Package className="w-4 h-4" />, requiredFeature: 'PACKS', minLevel: 4 },
    { id: 'PROFILE', label: 'Profile', icon: <User className="w-4 h-4" /> }
  ];

  return (
    <header className="relative z-30 w-full h-16 bg-slate-950/90 border-b border-white/10 backdrop-blur-md px-6 flex items-center justify-between select-none">
      {/* Brand Title / Logo */}
      <div 
        onClick={() => {
          audio.playClick();
          onSelectTab('PLAY');
        }}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:rotate-12 transition-transform duration-300">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-cinzel font-extrabold text-lg text-slate-100 tracking-widest drop-shadow">
              VEILBOUND
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950">
              2
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold -mt-1">
            Collect • Shift • Ascend
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-1 overflow-x-auto max-w-2xl py-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const isUnlocked = !tab.requiredFeature || ProgressionService.isFeatureUnlocked(progression, tab.requiredFeature);

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isUnlocked) {
                  audio.playClick();
                  onSelectTab(tab.id);
                } else {
                  audio.playClick();
                  alert(`🔒 ${tab.label} unlocks at Player Level ${tab.minLevel}! Win 1v1 duels to earn XP and level up.`);
                }
              }}
              className={`
                px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider
                flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap
                ${
                  !isUnlocked
                    ? 'opacity-40 text-slate-500 cursor-not-allowed hover:opacity-60'
                    : isActive
                    ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {!isUnlocked && <Lock className="w-3 h-3 text-amber-400 ml-0.5" />}
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Currencies & Utility icons */}
      <div className="flex items-center gap-3">
        {/* Currencies & Level */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10 hidden sm:flex">
          {/* Level Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-xs font-bold text-indigo-300 font-mono">
            LV. {progression.playerLevel}
          </div>

          {/* Gold */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/50 border border-amber-500/30 text-xs font-bold text-amber-300">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{gold}</span>
          </div>

          {/* Essence */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/50 border border-purple-500/30 text-xs font-bold text-purple-300">
            <Gem className="w-3.5 h-3.5 text-purple-400" />
            <span>{essence}</span>
          </div>
        </div>

        {/* Codex Grimoire Button */}
        <button
          onClick={() => {
            audio.playClick();
            onOpenCodex();
          }}
          className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-xs text-indigo-200 font-bold flex items-center gap-1.5 transition-transform hover:scale-105"
          title="Open Veilbound Codex"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden md:inline">Codex</span>
        </button>

        {/* Mute Audio */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg glass-panel hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            audio.playClick();
            onOpenSettings();
          }}
          className="p-2 rounded-lg glass-panel hover:border-slate-500 text-slate-300 hover:text-white transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
