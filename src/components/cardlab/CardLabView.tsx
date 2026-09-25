import React, { useState } from 'react';
import { Card, CardType, FactionId, CardRarity, CreatureType, Keyword } from '../../types/card';
import { CustomCardDraft } from '../../types/lab';
import { CardView } from '../card/CardView';
import { draftToCard, createSandboxMatch } from '../../engine/sandboxEngine';
import { GameBoard } from '../battlefield/GameBoard';
import { audio } from '../../services/audioService';
import { FactionEmblem, CardTypeEmblem, RarityEmblem, KeywordBadge } from '../common/EmblemIcons';
import { 
  FlaskConical, Play, Plus, Trash2, Copy, Check, 
  Download, Upload, Save, Sparkles, Shuffle, Wand2, ArrowRight, ArrowLeft 
} from 'lucide-react';

interface CardLabViewProps {
  customCards: CustomCardDraft[];
  onSaveCustomCard: (card: CustomCardDraft) => void;
  onDeleteCustomCard: (cardId: string) => void;
}

const FACTIONS: { id: FactionId; name: string; desc: string }[] = [
  { id: 'Aetherbound', name: 'Aetherbound', desc: 'Spell combos, cantrips, raw magic' },
  { id: 'AshenCitadel', name: 'Ashen Citadel', desc: 'Direct damage, aggressive fury, forge weapons' },
  { id: 'ViridianHive', name: 'Viridian Hive', desc: 'Swarm creatures, canopy buffs, regeneration' },
  { id: 'UmbralRemnant', name: 'Umbral Remnant', desc: 'Soul harvest, deathrattles, sacrifice' },
  { id: 'ChronocastArchive', name: 'Chronocast Archive', desc: 'Time rituals, delayed power, mana loops' },
  { id: 'AstralAscendancy', name: 'Astral Ascendancy', desc: 'Celestial blessings, radiant armor, big divines' },
  { id: 'Neutral', name: 'Planar Neutral', desc: 'Versatile mercs, universal tools' }
];

const CARD_TYPES: CardType[] = ['Minion', 'Spell', 'Relic', 'Weapon', 'Ritual', 'Event', 'Champion'];
const RARITIES: CardRarity[] = ['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'];

// Modular Effect options
const WHEN_TRIGGERS = ['Battlecry', 'Deathrattle', 'At start of turn', 'At end of turn', 'Whenever Veil shifts', 'Whenever you cast a spell', 'Whenever this takes damage'];
const DO_ACTIONS = ['Deal', 'Restore', 'Draw', 'Gain', 'Shift Veil to', 'Grant +2/+2 to', 'Summon'];
const TARGETS = ['Target Enemy', 'All Enemies', 'Target Ally', 'All Allies', 'Your Binder', 'Opponent Binder', 'Wild'];
const VALUES = [1, 2, 3, 4, 5, 6, 8];

const RANDOM_NAMES = [
  'Solstice Phoenix', 'Rift Wyrm', 'Nullstone Warden', 'Clockwork Oracle', 'Sporeborn Stalker',
  'Gilded Archmage', 'Nether Hydra', 'Celestial Arbiter', 'Abyssal Colossus', 'Chrono Weaver'
];

export const CardLabView: React.FC<CardLabViewProps> = ({
  customCards,
  onSaveCustomCard,
  onDeleteCustomCard
}) => {
  const [activeStep, setActiveStep] = useState<number>(1); // 1: Faction, 2: Type & Stats, 3: Rarity & Name, 4: Modular Effects
  const [editingDraft, setEditingDraft] = useState<CustomCardDraft>({
    id: `custom-${Date.now()}`,
    name: 'Aether Chimera',
    faction: 'Aetherbound',
    type: 'Minion',
    rarity: 'Epic',
    cost: 4,
    attack: 4,
    health: 4,
    durability: 0,
    creatureType: 'VeilBeast',
    keywords: ['Battlecry', 'Veilshift'],
    description: 'Battlecry: Shift the Veil to Wild and deal 3 damage to Target Enemy.',
    flavorText: 'Crafted with distilled echoes inside the Planar Workshop.',
    artworkPlaceholderTheme: 'aether_beast',
    effects: [{ type: 'Veilshift', targetVeilState: 'Wild' }],
    createdAt: Date.now()
  });

  // Modular builder state
  const [whenTrigger, setWhenTrigger] = useState<string>('Battlecry');
  const [doAction, setDoAction] = useState<string>('Deal');
  const [targetType, setTargetType] = useState<string>('Target Enemy');
  const [effectValue, setEffectValue] = useState<number>(3);

  const [sandboxMatch, setSandboxMatch] = useState<any | null>(null);
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const previewCard = draftToCard(editingDraft);

  const availableKeywords: Keyword[] = [
    'Taunt', 'Rush', 'Charge', 'Lifesteal', 'DivineShield', 'Deathrattle',
    'Battlecry', 'Stealth', 'Freeze', 'Poison', 'Discover', 'Echo',
    'Veilshift', 'Ritual', 'Corrupt', 'Forecast', 'Consume', 'Sacrifice'
  ];

  const handleKeywordToggle = (kw: Keyword) => {
    audio.playClick();
    const current = [...editingDraft.keywords];
    const idx = current.indexOf(kw);
    if (idx !== -1) current.splice(idx, 1);
    else current.push(kw);
    setEditingDraft({ ...editingDraft, keywords: current });
  };

  const applyModularEffect = () => {
    audio.playClick();
    const generatedDesc = `${whenTrigger}: ${doAction} ${effectValue} to ${targetType}.`;
    const newKeywords = [...editingDraft.keywords];
    if (whenTrigger === 'Battlecry' && !newKeywords.includes('Battlecry')) newKeywords.push('Battlecry');
    if (whenTrigger === 'Deathrattle' && !newKeywords.includes('Deathrattle')) newKeywords.push('Deathrattle');

    setEditingDraft({
      ...editingDraft,
      keywords: newKeywords,
      description: generatedDesc
    });
  };

  const handleSurpriseMe = () => {
    audio.playCardFlip();
    const randFaction = FACTIONS[Math.floor(Math.random() * FACTIONS.length)].id;
    const randType = CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
    const randRarity = RARITIES[Math.floor(Math.random() * RARITIES.length)];
    const randCost = Math.floor(Math.random() * 8) + 1;
    const randAtk = Math.max(1, randCost - 1 + Math.floor(Math.random() * 3));
    const randHp = Math.max(1, randCost + Math.floor(Math.random() * 3));
    const randName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const randWhen = WHEN_TRIGGERS[Math.floor(Math.random() * WHEN_TRIGGERS.length)];
    const randDo = DO_ACTIONS[Math.floor(Math.random() * DO_ACTIONS.length)];
    const randTarget = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const randVal = VALUES[Math.floor(Math.random() * VALUES.length)];

    setWhenTrigger(randWhen);
    setDoAction(randDo);
    setTargetType(randTarget);
    setEffectValue(randVal);

    setEditingDraft({
      id: `custom-${Date.now()}`,
      name: randName,
      faction: randFaction,
      type: randType,
      rarity: randRarity,
      cost: randCost,
      attack: randAtk,
      health: randHp,
      durability: randType === 'Weapon' ? 3 : 0,
      creatureType: 'VeilBeast',
      keywords: randWhen === 'Battlecry' ? ['Battlecry'] : randWhen === 'Deathrattle' ? ['Deathrattle'] : [],
      description: `${randWhen}: ${randDo} ${randVal} to ${randTarget}.`,
      flavorText: `A mythical entity synthesized by random dimensional fluctuations.`,
      artworkPlaceholderTheme: 'aether_beast',
      effects: [],
      createdAt: Date.now()
    });
  };

  const handleLaunchSandbox = () => {
    audio.playClick();
    const match = createSandboxMatch(previewCard, 10);
    setSandboxMatch(match);
  };

  const handleSave = () => {
    audio.playClick();
    onSaveCustomCard(editingDraft);
  };

  const handleExport = () => {
    const json = JSON.stringify(editingDraft);
    const code = btoa(json);
    setShareCode(code);
    navigator.clipboard?.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleImport = () => {
    try {
      const decoded = atob(importCode.trim());
      const parsed = JSON.parse(decoded);
      if (parsed.name && parsed.cost !== undefined) {
        setEditingDraft({ ...parsed, id: `custom-${Date.now()}` });
        setImportCode('');
        audio.playClick();
      }
    } catch (e) {
      alert('Invalid Card Share Code');
    }
  };

  if (sandboxMatch) {
    return (
      <GameBoard
        initialState={sandboxMatch}
        onMatchEnd={() => setSandboxMatch(null)}
        onExit={() => setSandboxMatch(null)}
      />
    );
  }

  const handleRemix = () => {
    audio.playCardFlip();
    const randWhen = WHEN_TRIGGERS[Math.floor(Math.random() * WHEN_TRIGGERS.length)];
    const randDo = DO_ACTIONS[Math.floor(Math.random() * DO_ACTIONS.length)];
    const randTarget = TARGETS[Math.floor(Math.random() * TARGETS.length)];
    const randVal = VALUES[Math.floor(Math.random() * VALUES.length)];
    setWhenTrigger(randWhen);
    setDoAction(randDo);
    setTargetType(randTarget);
    setEffectValue(randVal);
    setEditingDraft(prev => ({
      ...prev,
      description: `${randWhen}: ${randDo} ${randVal} to ${randTarget}.`,
      keywords: randWhen === 'Battlecry' ? ['Battlecry'] : randWhen === 'Deathrattle' ? ['Deathrattle'] : prev.keywords
    }));
  };

  const handleDuplicate = () => {
    audio.playClick();
    const copyDraft: CustomCardDraft = {
      ...editingDraft,
      id: `custom-${Date.now()}`,
      name: `${editingDraft.name} (Copy)`
    };
    onSaveCustomCard(copyDraft);
    setEditingDraft(copyDraft);
  };

  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col p-4 md:p-8 select-none overflow-y-auto">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-amber-500/30 pb-4 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FlaskConical className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 bg-clip-text text-transparent">
              CARD WORKSHOP
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Guided 4-Step Builder
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Synthesize unique cards with modular effect blocks, test them instantly in the sandbox, and add them to your collection!
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSurpriseMe}
            className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40 font-bold text-xs shadow transition-all hover:scale-105 flex items-center gap-1.5"
            title="Generate completely random card"
          >
            <Shuffle className="w-4 h-4" />
            <span>Randomize</span>
          </button>
          <button
            onClick={handleRemix}
            className="px-3.5 py-2 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 font-bold text-xs shadow transition-all hover:scale-105 flex items-center gap-1.5"
            title="Randomize effects while preserving stats"
          >
            <Wand2 className="w-4 h-4" />
            <span>Remix</span>
          </button>
          <button
            onClick={handleDuplicate}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs shadow transition-all hover:scale-105 flex items-center gap-1.5"
            title="Duplicate draft"
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleLaunchSandbox}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Playtest in Sandbox</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Card</span>
          </button>
        </div>
      </div>

      {/* Step Tabs */}
      <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800 mb-6">
        {[
          { step: 1, label: '1. Faction & Identity' },
          { step: 2, label: '2. Type & Stats' },
          { step: 3, label: '3. Rarity & Flavor' },
          { step: 4, label: '4. Modular Effects & Keywords' }
        ].map((s) => (
          <button
            key={s.step}
            onClick={() => {
              audio.playClick();
              setActiveStep(s.step);
            }}
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
              activeStep === s.step
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Form on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Step Form */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between">
          <div>
            {/* STEP 1: FACTION */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-300">Choose Card Faction</h3>
                <p className="text-xs text-slate-400">Select which planar affinity will command this card.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FACTIONS.map((f) => {
                    const isSelected = editingDraft.faction === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => {
                          audio.playClick();
                          setEditingDraft({ ...editingDraft, faction: f.id });
                        }}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <FactionEmblem faction={f.id} size="md" />
                        <div>
                          <div className={`font-bold text-sm ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                            {f.name}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">{f.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: TYPE & STATS */}
            {activeStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-amber-300">Choose Card Type & Combat Numbers</h3>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Card Type</label>
                  <div className="flex flex-wrap gap-2">
                    {CARD_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          audio.playClick();
                          setEditingDraft({ ...editingDraft, type: t });
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          editingDraft.type === t
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <CardTypeEmblem type={t} size="sm" />
                        <span>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-sky-300 block mb-1">Mana Cost (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={editingDraft.cost}
                      onChange={(e) => setEditingDraft({ ...editingDraft, cost: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center font-bold text-sky-400 text-lg"
                    />
                  </div>

                  {(editingDraft.type === 'Minion' || editingDraft.type === 'Weapon') && (
                    <div>
                      <label className="text-xs font-semibold text-amber-300 block mb-1">Attack (0-15)</label>
                      <input
                        type="number"
                        min={0}
                        max={15}
                        value={editingDraft.attack}
                        onChange={(e) => setEditingDraft({ ...editingDraft, attack: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center font-bold text-amber-400 text-lg"
                      />
                    </div>
                  )}

                  {editingDraft.type === 'Minion' && (
                    <div>
                      <label className="text-xs font-semibold text-rose-300 block mb-1">Health (1-20)</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={editingDraft.health}
                        onChange={(e) => setEditingDraft({ ...editingDraft, health: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center font-bold text-rose-400 text-lg"
                      />
                    </div>
                  )}

                  {editingDraft.type === 'Weapon' && (
                    <div>
                      <label className="text-xs font-semibold text-emerald-300 block mb-1">Durability (1-10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editingDraft.durability}
                        onChange={(e) => setEditingDraft({ ...editingDraft, durability: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center font-bold text-emerald-400 text-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: RARITY & FLAVOR */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-amber-300">Name, Rarity & Lore</h3>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Card Name</label>
                  <input
                    type="text"
                    value={editingDraft.name}
                    onChange={(e) => setEditingDraft({ ...editingDraft, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 font-bold text-slate-100"
                    placeholder="Enter card name..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Rarity</label>
                  <div className="flex flex-wrap gap-2">
                    {RARITIES.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          audio.playClick();
                          setEditingDraft({ ...editingDraft, rarity: r });
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          editingDraft.rarity === r
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <RarityEmblem rarity={r} size="sm" />
                        <span>{r}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Flavor Text / Lore</label>
                  <textarea
                    rows={2}
                    value={editingDraft.flavorText}
                    onChange={(e) => setEditingDraft({ ...editingDraft, flavorText: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-300 italic"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: MODULAR EFFECTS & KEYWORDS */}
            {activeStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-amber-300">Modular Effect Blocks (WHEN → DO → VALUE → TO)</h3>

                {/* The 4-piece Modular block */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {/* WHEN */}
                    <div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">1. WHEN</span>
                      <select
                        value={whenTrigger}
                        onChange={(e) => setWhenTrigger(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                      >
                        {WHEN_TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* DO */}
                    <div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">2. DO</span>
                      <select
                        value={doAction}
                        onChange={(e) => setDoAction(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                      >
                        {DO_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>

                    {/* VALUE */}
                    <div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">3. VALUE</span>
                      <select
                        value={effectValue}
                        onChange={(e) => setEffectValue(parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 text-center font-bold"
                      >
                        {VALUES.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    {/* TO */}
                    <div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">4. TO</span>
                      <select
                        value={targetType}
                        onChange={(e) => setTargetType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                      >
                        {TARGETS.map((tg) => <option key={tg} value={tg}>{tg}</option>)}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={applyModularEffect}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-lg shadow-md transition-transform hover:scale-[1.01]"
                  >
                    Assemble & Apply Effect Sentence
                  </button>
                </div>

                {/* Card Description */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Card Rules Description</label>
                  <textarea
                    rows={2}
                    value={editingDraft.description}
                    onChange={(e) => setEditingDraft({ ...editingDraft, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 font-medium"
                  />
                </div>

                {/* Keywords checklist */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Additional Keywords</label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableKeywords.map((kw) => {
                      const isSelected = editingDraft.keywords.includes(kw);
                      return (
                        <button
                          key={kw}
                          onClick={() => handleKeywordToggle(kw)}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                              : 'bg-slate-950/80 border-slate-700 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {kw}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls between Steps */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
            <button
              onClick={() => {
                audio.playClick();
                setActiveStep((prev) => Math.max(1, prev - 1));
              }}
              disabled={activeStep === 1}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                activeStep === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs text-slate-500 font-mono">Step {activeStep} of 4</span>

            <button
              onClick={() => {
                audio.playClick();
                setActiveStep((prev) => Math.min(4, prev + 1));
              }}
              disabled={activeStep === 4}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                activeStep === 4 ? 'opacity-30 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Live Interactive Card Preview & Deck Share */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase mb-3">
              LIVE CARD PREVIEW
            </span>
            <div className="shadow-2xl hover:scale-105 transition-transform duration-300">
              <CardView card={previewCard} size="md" />
            </div>
          </div>

          {/* Share & Import bar */}
          <div className="w-full mt-6 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Share Code</span>
              <button
                onClick={handleExport}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copySuccess ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste code to import..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
              <button
                onClick={handleImport}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
