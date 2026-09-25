import React from 'react';
import { UserProfile } from '../../services/storageService';
import { Achievement, Quest } from '../../data/achievements';
import { BATTLEFIELDS } from '../../data/battlefields';
import { audio } from '../../services/audioService';
import { 
  Trophy, User, Award, CheckCircle, Clock, 
  Coins, Gem, Sparkles, Palette, Shield 
} from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile;
  achievements: Achievement[];
  quests: Quest[];
  onSelectBattlefield: (themeId: string) => void;
  onSelectCardBack: (cardBack: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  achievements,
  quests,
  onSelectBattlefield,
  onSelectCardBack
}) => {
  const winRate =
    profile.wins + profile.losses > 0
      ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
      : 0;

  const cardBacks = [
    { id: 'cosmic', name: 'Cosmic Singularity', border: 'border-indigo-500', color: 'from-indigo-950 to-purple-950' },
    { id: 'ashen', name: 'Molten Core', border: 'border-red-500', color: 'from-red-950 to-orange-950' },
    { id: 'viridian', name: 'Canopy Moss', border: 'border-emerald-500', color: 'from-emerald-950 to-teal-950' },
    { id: 'celestial', name: 'Solar Constellation', border: 'border-amber-400', color: 'from-amber-950 to-yellow-950' }
  ];

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-y-auto">
      {/* Top Banner: Avatar, Level, XP, Wins/Losses */}
      <div className="rounded-2xl glass-panel-glow border border-indigo-500/30 p-6 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-300 flex items-center justify-center font-cinzel font-bold text-2xl text-white shadow-[0_0_15px_rgba(99,102,241,0.6)]">
            {profile.username[0]}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-cinzel font-bold text-slate-100">{profile.username}</h2>
              <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-bold border border-indigo-700/50">
                {profile.title}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs">
              <span className="text-slate-400">Level <strong className="text-white">{profile.level}</strong></span>
              <span className="text-slate-500">•</span>
              <div className="flex items-center gap-2 w-48 bg-slate-900 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(profile.xp / profile.xpToNextLevel) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                {profile.xp} / {profile.xpToNextLevel} XP
              </span>
            </div>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Wins</span>
            <span className="text-xl font-cinzel font-bold text-emerald-400">{profile.wins}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Losses</span>
            <span className="text-xl font-cinzel font-bold text-red-400">{profile.losses}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Win Rate</span>
            <span className="text-xl font-cinzel font-bold text-sky-400">{winRate}%</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400">Expeditions</span>
            <span className="text-xl font-cinzel font-bold text-amber-400">{profile.completedExpeditions}</span>
          </div>
        </div>
      </div>

      {/* Quests & Cosmetics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Quests */}
        <div className="rounded-2xl glass-panel-glow border border-white/10 p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <h3 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Active Daily Quests
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Resets Daily</span>
          </div>

          <div className="space-y-2.5">
            {quests.map((q) => (
              <div key={q.id} className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-200">{q.title}</div>
                  <div className="text-[11px] text-slate-400">{q.description}</div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-600/40">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{q.rewardGold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cosmetics Selector */}
        <div className="rounded-2xl glass-panel-glow border border-white/10 p-5 flex flex-col shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
            <h3 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-400" />
              Cosmetics & Battlefields
            </h3>
            <span className="text-[10px] text-slate-400">Custom Visual Themes</span>
          </div>

          {/* Card Backs */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Card Back Theme</span>
            <div className="flex items-center gap-3">
              {cardBacks.map((cb) => (
                <div
                  key={cb.id}
                  onClick={() => {
                    audio.playClick();
                    onSelectCardBack(cb.id);
                  }}
                  className={`
                    w-16 h-22 rounded-lg border-2 p-1 cursor-pointer transition-all bg-gradient-to-b ${cb.color}
                    flex items-center justify-center text-center
                    ${profile.cardBackTheme === cb.id ? `${cb.border} scale-105 shadow-lg` : 'border-white/10 opacity-70'}
                  `}
                >
                  <Sparkles className="w-5 h-5 text-white/80" />
                </div>
              ))}
            </div>
          </div>

          {/* Battlefield skins */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-2">Battlefield Environment</span>
            <div className="flex flex-wrap gap-2">
              {BATTLEFIELDS.map((bf) => (
                <button
                  key={bf.id}
                  onClick={() => {
                    audio.playClick();
                    onSelectBattlefield(bf.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    profile.battlefieldTheme === bf.id
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                      : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {bf.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="rounded-2xl glass-panel-glow border border-white/10 p-5 flex flex-col shadow-xl">
        <h3 className="font-cinzel font-bold text-sm text-slate-100 flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          Achievements & Feats of Mastery
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                ach.isUnlocked
                  ? 'bg-amber-950/20 border-amber-500/50 shadow-md'
                  : 'bg-slate-900/60 border-white/5 opacity-75'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-cinzel font-bold text-xs text-slate-200">{ach.title}</h4>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">{ach.category}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight mb-2">
                  {ach.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">+{ach.rewardGold} Gold</span>
                  <span className="text-purple-400 font-bold">+{ach.rewardEssence} Ess</span>
                </div>
                {ach.isUnlocked && (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
