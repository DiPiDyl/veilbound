import React, { useState } from 'react';
import { 
  BookOpen, Sparkles, Swords, Shield, Clock, Flame, 
  X, ChevronRight, Zap, Award, Layers, Compass, HelpCircle 
} from 'lucide-react';
import { audio } from '../../services/audioService';
import { FactionEmblem, CardTypeEmblem, RarityEmblem, KeywordBadge } from '../common/EmblemIcons';
import { BINDERS } from '../../data/binders';
import { CardType, CardRarity, Keyword } from '../../types/card';

interface CodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CodexChapter = 
  | 'rules'
  | 'cards'
  | 'keywords'
  | 'veil'
  | 'echo'
  | 'destiny'
  | 'binders'
  | 'modes';

const CHAPTERS: { id: CodexChapter; title: string; icon: string }[] = [
  { id: 'rules', title: 'Rules of Engagement', icon: '📜' },
  { id: 'cards', title: 'Card Anatomy & Types', icon: '🃏' },
  { id: 'keywords', title: 'Keyword Encyclopedia', icon: '⚡' },
  { id: 'veil', title: 'The 5 Veil States', icon: '🌀' },
  { id: 'echo', title: 'Echo Pool System', icon: '🔮' },
  { id: 'destiny', title: 'Destiny Tracks', icon: '🌟' },
  { id: 'binders', title: 'Planar Binders', icon: '🛡️' },
  { id: 'modes', title: 'Game Modes & Arena', icon: '🏆' }
];

const ALL_KEYWORDS_LIST: { name: Keyword; summary: string; detail: string }[] = [
  { name: 'Battlecry', summary: 'Triggers immediately when played from hand.', detail: 'Enters the battlefield or casts an instant trigger effect upon entering.' },
  { name: 'Deathrattle', summary: 'Triggers when destroyed on the battlefield.', detail: 'Activates immediately before sending the minion to the discard pile.' },
  { name: 'Taunt', summary: 'Enemies must attack this minion first.', detail: 'Enemy minions and weapons cannot target the Binder or other allies while Taunt is active.' },
  { name: 'Rush', summary: 'Can attack enemy minions on the turn it is summoned.', detail: 'Cannot attack the opposing Binder directly on turn 1.' },
  { name: 'Charge', summary: 'Can attack anything immediately on summon.', detail: 'Can strike minions or the enemy Binder without summoning sickness.' },
  { name: 'Lifesteal', summary: 'Damage dealt restores Health to your Binder.', detail: 'Whenever this card inflicts combat or effect damage, heal your Binder for the same amount.' },
  { name: 'DivineShield', summary: 'Ignores the next instance of damage taken.', detail: 'The protective golden shield pops upon taking any damage, taking 0 damage for that hit.' },
  { name: 'Stealth', summary: 'Cannot be targeted by attacks or spells until it attacks.', detail: 'Remains untargetable until it chooses to deal damage or use its attack.' },
  { name: 'Freeze', summary: 'Frozen targets miss their next attack action.', detail: 'Thaws automatically at the conclusion of their owner\'s next turn.' },
  { name: 'Poison', summary: 'Instantly destroys any minion damaged by this.', detail: 'Regardless of the enemy minion\'s remaining Health, any damage is lethal.' },
  { name: 'Echo', summary: 'Leaves behind residual Echo energy in your Echo Pool.', detail: 'Accumulates action fragments to fuel Consume cards and planar shift abilities.' },
  { name: 'Veilshift', summary: 'Forcibly alters the state of the Veil upon play.', detail: 'Shifts the dimensional environment to Calm, Wild, Corrupted, Celestial, or Fractured.' },
  { name: 'Ritual', summary: 'A ticking channel that resolves after countdown turns.', detail: 'Remains in the global event queue, providing ongoing or dramatic countdown payoffs.' },
  { name: 'Consume', summary: 'Spends stored Echoes from your pool for bonus power.', detail: 'If you have sufficient Echoes, consumes them to activate amplified battle effects.' },
  { name: 'Discover', summary: 'Choose 1 of 3 random cards to add to your hand.', detail: 'Drafts options dynamically tailored to your faction and battlefield situation.' },
  { name: 'Corrupt', summary: 'Upgrades in hand after you play a higher-cost card.', detail: 'Gains enhanced stats or additional effects while held in your hand.' },
  { name: 'Forecast', summary: 'Activates an effect at the start of your next turn.', detail: 'Sets up delayed tactical superiority that opponent must prepare to counter.' },
  { name: 'Sacrifice', summary: 'Requires destroying a friendly minion to activate.', detail: 'Converts ally sacrifices into massive board swings or soul fragments.' }
];

export const CodexModal: React.FC<CodexModalProps> = ({ isOpen, onClose }) => {
  const [activeChapter, setActiveChapter] = useState<CodexChapter>('rules');

  if (!isOpen) return null;

  const handleSelectChapter = (ch: CodexChapter) => {
    audio.playPageTurn();
    setActiveChapter(ch);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn select-none">
      <div className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
        {/* Grimoire Top Title Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/30 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <h2 className="text-xl md:text-2xl font-cinzel font-black tracking-wide bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              THE VEILBOUND CODEX
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/80 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              Dimensional Grimoire
            </span>
          </div>

          <button
            onClick={() => {
              audio.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grimoire Body Layout: Sidebar Bookmarks + Chapter Reader */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chapter Bookmark Navigation */}
          <div className="w-60 md:w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col p-3 space-y-1.5 overflow-y-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1">
              Table of Contents
            </span>
            {CHAPTERS.map((c) => {
              const isSelected = activeChapter === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectChapter(c.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs transition-all text-left ${
                    isSelected
                      ? 'bg-amber-500/20 border border-amber-400/80 text-amber-200 shadow-md translate-x-1'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <span className="text-base">{c.icon}</span>
                  <span className="truncate">{c.title}</span>
                </button>
              );
            })}
          </div>

          {/* Chapter Content Reading Pane */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-900/40 text-slate-200">
            {/* CHAPTER: RULES */}
            {activeChapter === 'rules' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">Rules of Engagement</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    VEILBOUND duels are fought between two planar Binders. Each starts with 30 Health (or more in Boss / Gauntlet matches). Reduce the opposing Binder to 0 Health to win.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>💎</span> Mana Crystal Growth
                    </span>
                    <p className="text-xs text-slate-300">
                      Players begin with 1 Mana crystal on Turn 1. At the start of each turn, you gain 1 additional maximum crystal up to 10, and your Mana refills completely.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⏳</span> 45-Second Turn Timer
                    </span>
                    <p className="text-xs text-slate-300">
                      Combat moves swiftly! You have 45 seconds per turn. Audio warnings tick at 15s and 5s. If time expires, your turn automatically ends.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡</span> Binder Hero Powers
                    </span>
                    <p className="text-xs text-slate-300">
                      Each Binder possesses a signature Hero Power costing 2 Mana that can be activated once per turn to advance board control or cycle cards.
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚔️</span> Combat & Summoning Sickness
                    </span>
                    <p className="text-xs text-slate-300">
                      Minions cannot attack on the turn they enter the battlefield unless they have <strong>Rush</strong> (attacks minions) or <strong>Charge</strong> (attacks anything).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER: CARDS */}
            {activeChapter === 'cards' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">Card Anatomy & Types</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    VEILBOUND cards possess distinct silhouettes and role gems so you can instantly recognize threats at a glance.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { type: 'Minion' as CardType, desc: 'Creatures summoned to fight on the board. Possess Attack (sword) and Health (heart).' },
                    { type: 'Spell' as CardType, desc: 'Instant magical effects that resolve immediately and move to the discard pile.' },
                    { type: 'Relic' as CardType, desc: 'Permanent artifacts placed into your reserve, providing continuous passive advantages.' },
                    { type: 'Weapon' as CardType, desc: 'Equipped directly to your Binder. Grants direct attack capability and loses 1 durability per strike.' },
                    { type: 'Ritual' as CardType, desc: 'Multi-turn planetary incantations that count down each round before unleashing cataclysms.' },
                    { type: 'Event' as CardType, desc: 'Global reality disruptions that alter rules for both players.' },
                    { type: 'Champion' as CardType, desc: 'Legendary heroes with game-altering aura powers.' }
                  ].map((ct) => (
                    <div key={ct.type} className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        <CardTypeEmblem type={ct.type} size="md" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">{ct.type}</div>
                        <div className="text-xs text-slate-400">{ct.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHAPTER: KEYWORDS */}
            {activeChapter === 'keywords' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">Keyword Encyclopedia</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Complete index of all 18 tactical keywords found on cards throughout the planar dimensions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ALL_KEYWORDS_LIST.map((kw) => (
                    <div key={kw.name} className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-colors">
                      <div className="flex items-center gap-2 mb-1.5">
                        <KeywordBadge keyword={kw.name} />
                        <span className="text-[11px] text-amber-400 font-semibold">{kw.summary}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{kw.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHAPTER: THE VEIL */}
            {activeChapter === 'veil' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">The 5 Veil States</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The Veil is the living atmospheric fabric that divides realities. It shifts between 5 distinct harmonic states, modifying all cards and combat rules.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/40">
                    <div className="font-bold text-sm text-sky-300 flex items-center gap-2 mb-1">
                      <span>🕊️</span> Calm State (Standard Harmony)
                    </div>
                    <p className="text-xs text-slate-300">Default planar stability. Cards cost standard mana with no global modifiers.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40">
                    <div className="font-bold text-sm text-amber-300 flex items-center gap-2 mb-1">
                      <span>🔥</span> Wild State (Volatile Surge)
                    </div>
                    <p className="text-xs text-slate-300">Spells deal +1 bonus damage. Aggressive burn cards ignite with fury.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40">
                    <div className="font-bold text-sm text-purple-300 flex items-center gap-2 mb-1">
                      <span>☠️</span> Corrupted State (Soul Feast)
                    </div>
                    <p className="text-xs text-slate-300">Whenever any minion dies, its owner receives 1 Echo in their Echo Pool.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-yellow-950/40 border border-yellow-500/40">
                    <div className="font-bold text-sm text-yellow-300 flex items-center gap-2 mb-1">
                      <span>✨</span> Celestial State (Divine Radiance)
                    </div>
                    <p className="text-xs text-slate-300">All healing effects restore +2 extra Health. Cards that cost 5 or more cost 1 less Mana.</p>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40">
                    <div className="font-bold text-sm text-rose-300 flex items-center gap-2 mb-1">
                      <span>🌀</span> Fractured State (Reality Collapse)
                    </div>
                    <p className="text-xs text-slate-300">At start of turn, a random card in your hand has its Mana cost reduced by 1.</p>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER: ECHO POOL */}
            {activeChapter === 'echo' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">The Echo Pool System</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Echoes are crystallized remnants of actions taken earlier in the match. They don't disappear at the end of turns — they accumulate into your personal reservoir!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">How to Gain Echoes</span>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                      <li>Playing cards featuring the <strong>Echo</strong> keyword.</li>
                      <li>Minion deaths while the Veil is in the <strong>Corrupted</strong> state.</li>
                      <li>Binder Hero Powers and specific tactical treasures.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">How to Spend Echoes</span>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                      <li>Fueling <strong>Consume</strong> costs for devastating damage or bonus summons.</li>
                      <li>Replaying stored spell memory fragments.</li>
                      <li>Unlocking high-tier Destiny milestones.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER: DESTINY */}
            {activeChapter === 'destiny' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">The Destiny Tracks</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    How you fight defines who you become. Every attack, spell, or summon feeds one of 5 distinct Destiny Tracks. Reaching milestones unlocks permanent match blessings!
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Conqueror', icon: '⚔️', desc: 'Advanced by dealing direct Binder damage. Milestones grant bonus attack buffs and charge.' },
                    { name: 'Archivist', icon: '📜', desc: 'Advanced by casting spells and cycling cards. Milestones discount future spells.' },
                    { name: 'Warden', icon: '🛡️', desc: 'Advanced by gaining Armor and absorbing hits. Milestones provide free armor regeneration.' },
                    { name: 'Voidwalker', icon: '🌌', desc: 'Advanced by shifting the Veil. Milestones allow free manual veil alterations.' },
                    { name: 'Revenant', icon: '💀', desc: 'Advanced by friendly minion sacrifices and deathrattles. Milestones summon spectral shades.' }
                  ].map((d) => (
                    <div key={d.name} className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-200">{d.name} Track</div>
                        <div className="text-xs text-slate-400">{d.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHAPTER: BINDERS */}
            {activeChapter === 'binders' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">Planar Binders</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The legendary champions who command the factions of the Veil.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BINDERS.map((b) => (
                    <div key={b.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-3">
                        <FactionEmblem faction={b.faction} size="md" />
                        <div>
                          <div className="font-bold text-sm text-slate-100">{b.name}</div>
                          <div className="text-[10px] text-amber-400 font-semibold">{b.title}</div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 italic">"{b.lore}"</div>
                      <div className="text-xs text-purple-300 bg-purple-950/50 p-2 rounded-lg border border-purple-800/40">
                        <span className="font-bold text-white">Power: {b.heroPower.name} (2)</span> — {b.heroPower.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CHAPTER: MODES */}
            {activeChapter === 'modes' && (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <h3 className="text-2xl font-cinzel font-black text-amber-300 mb-2">Game Modes & Free-for-All</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    VEILBOUND offers diverse ways to play, whether testing rogue decks or conquering the grand arena ladder.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40">
                    <div className="font-bold text-sm text-amber-300 flex items-center gap-2 mb-1">
                      <span>⚔️</span> Free-for-All Gauntlet (10 Matches)
                    </div>
                    <p className="text-xs text-slate-300">
                      Battle your way through 10 increasingly difficult champions, starting at Rank 10 and culminating with Grandmaster Ouroboros. Milestone rewards unlock at matches 1, 3, 5, 7, and 10!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40">
                    <div className="font-bold text-sm text-purple-300 flex items-center gap-2 mb-1">
                      <span>🗺️</span> Expeditions (Roguelike Map)
                    </div>
                    <p className="text-xs text-slate-300">
                      Navigate branching procedural nodes through Elite battles, planar merchants, narrative events, and ancient treasures.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40">
                    <div className="font-bold text-sm text-indigo-300 flex items-center gap-2 mb-1">
                      <span>🧪</span> Card Workshop & Sandbox
                    </div>
                    <p className="text-xs text-slate-300">
                      Synthesize cards using the 4-step wizard and modular effect blocks. Test your wild creations immediately in the interactive test arena against the Training Dummy!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
