import React from 'react';
import { 
  Sparkles, Swords, Compass, Layers, Wrench, 
  Package, User, Volume2, VolumeX, BookOpen, 
  Settings as SettingsIcon, Coins, Gem, Trophy 
} from 'lucide-react';
import { audio } from '../../services/audioService';

export type NavTab = 'PLAY' | 'FREE FOR ALL' | 'EXPEDITION' | 'COLLECTION' | 'DECKS' | 'CARD LAB' | 'PACKS' | 'PROFILE';

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
  onOpenCodex
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'PLAY', label: 'Play', icon: <Swords className="w-4 h-4" /> },
    { id: 'FREE FOR ALL', label: 'Free For All', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: 'EXPEDITION', label: 'Expedition', icon: <Compass className="w-4 h-4" /> },
    { id: 'COLLECTION', label: 'Collection', icon: <Layers className="w-4 h-4" /> },
    { id: 'DECKS', label: 'Decks', icon: <Layers className="w-4 h-4" /> },
    { id: 'CARD LAB', label: 'Card Lab', icon: <Wrench className="w-4 h-4" /> },
    { id: 'PACKS', label: 'Packs', icon: <Package className="w-4 h-4" /> },
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
          <span className="font-cinzel font-extrabold text-lg text-slate-100 tracking-widest drop-shadow">
            VEILBOUND
          </span>
          <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold -mt-1">
            Collect • Shift • Ascend
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-1 overflow-x-auto max-w-2xl py-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                audio.playClick();
                onSelectTab(tab.id);
              }}
              className={`
                px-3 py-1.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider
                flex items-center gap-1.5 transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls: Currencies & Utility icons */}
      <div className="flex items-center gap-3">
        {/* Currencies */}
        <div className="flex items-center gap-2 pr-2 border-r border-white/10 hidden sm:flex">
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
