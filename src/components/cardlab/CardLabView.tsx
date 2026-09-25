import React, { useState } from 'react';
import { Card, CardType, FactionId, CardRarity, CreatureType, Keyword } from '../../types/card';
import { CustomCardDraft } from '../../types/lab';
import { CardView } from '../card/CardView';
import { draftToCard, createSandboxMatch } from '../../engine/sandboxEngine';
import { GameBoard } from '../battlefield/GameBoard';
import { audio } from '../../services/audioService';
import { 
  FlaskConical, Play, Plus, Trash2, Copy, Check, 
  Download, Upload, Save, Sparkles 
} from 'lucide-react';

interface CardLabViewProps {
  customCards: CustomCardDraft[];
  onSaveCustomCard: (card: CustomCardDraft) => void;
  onDeleteCustomCard: (cardId: string) => void;
}

export const CardLabView: React.FC<CardLabViewProps> = ({
  customCards,
  onSaveCustomCard,
  onDeleteCustomCard
}) => {
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
    description: 'Battlecry: Shift the Veil to Wild and gain 2 Echoes.',
    flavorText: 'An experimental lifeform synthesized in the Card Lab.',
    artworkPlaceholderTheme: 'aether_beast',
    effects: [{ type: 'Veilshift', targetVeilState: 'Wild' }, { type: 'EchoGain', value: 2 }],
    createdAt: Date.now()
  });

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

  // If in sandbox test arena
  if (sandboxMatch) {
    return (
      <GameBoard
        initialState={sandboxMatch}
        onMatchEnd={() => setSandboxMatch(null)}
        onExit={() => setSandboxMatch(null)}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-pink-400" />
            Card Lab & Playtest Sandbox
          </h1>
          <p className="text-xs text-slate-400">
            Forge original cards from scratch and test them immediately against an automated Target Dummy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchSandbox}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-cinzel font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Playtest in Sandbox</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-cinzel font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Card</span>
          </button>
        </div>
      </div>

      {/* Main Dual Workstation: Left (Editor Form) & Right (Live Preview & Library) */}
      <div className="flex-1 flex gap-8">
        {/* LEFT: Card Attributes Form */}
        <div className="flex-1 rounded-2xl glass-panel-glow border border-white/10 p-6 flex flex-col gap-4 overflow-y-auto">
          <h3 className="font-cinzel font-bold text-base text-slate-200 border-b border-white/10 pb-2">
            Card Specifications
          </h3>

          {/* Row 1: Name & Faction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Card Name</label>
              <input
                type="text"
                value={editingDraft.name}
                onChange={(e) => setEditingDraft({ ...editingDraft, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Faction</label>
              <select
                value={editingDraft.faction}
                onChange={(e) => setEditingDraft({ ...editingDraft, faction: e.target.value as FactionId })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white focus:outline-none"
              >
                {['Aetherbound', 'AshenCitadel', 'ViridianHive', 'UmbralRemnant', 'ChronocastArchive', 'AstralAscendancy', 'Neutral'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Type & Rarity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Card Type</label>
              <select
                value={editingDraft.type}
                onChange={(e) => setEditingDraft({ ...editingDraft, type: e.target.value as CardType })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white focus:outline-none"
              >
                {['Minion', 'Spell', 'Relic', 'Weapon', 'Ritual', 'Event', 'Champion'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Rarity</label>
              <select
                value={editingDraft.rarity}
                onChange={(e) => setEditingDraft({ ...editingDraft, rarity: e.target.value as CardRarity })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white focus:outline-none"
              >
                {['Common', 'Rare', 'Epic', 'Legendary', 'Mythic'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Numeric Stats (Cost, Attack, Health) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Mana Cost</label>
              <input
                type="number"
                min={0}
                max={10}
                value={editingDraft.cost}
                onChange={(e) => setEditingDraft({ ...editingDraft, cost: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white"
              />
            </div>

            {editingDraft.type !== 'Spell' && editingDraft.type !== 'Event' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Attack</label>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={editingDraft.attack}
                    onChange={(e) => setEditingDraft({ ...editingDraft, attack: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Health / Durability</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={editingDraft.health}
                    onChange={(e) => setEditingDraft({ ...editingDraft, health: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white"
                  />
                </div>
              </>
            )}
          </div>

          {/* Keywords Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Keywords</label>
            <div className="flex flex-wrap gap-1.5">
              {availableKeywords.map((kw) => {
                const isSelected = editingDraft.keywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleKeywordToggle(kw)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Description */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Card Effect Text</label>
            <textarea
              rows={2}
              value={editingDraft.description}
              onChange={(e) => setEditingDraft({ ...editingDraft, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Flavor Text */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Flavor Text</label>
            <input
              type="text"
              value={editingDraft.flavorText}
              onChange={(e) => setEditingDraft({ ...editingDraft, flavorText: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/15 text-xs text-slate-300 italic"
            />
          </div>

          {/* Export / Import Share Codes */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-lg glass-panel text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
              >
                {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <ShareCodeIcon />}
                <span>{copySuccess ? 'Code Copied!' : 'Copy Share Code'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-end">
              <input
                type="text"
                placeholder="Paste code to import..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white w-48"
              />
              <button
                onClick={handleImport}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold"
              >
                Import
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Visual Card Preview */}
        <div className="w-80 flex flex-col items-center justify-between rounded-2xl glass-panel-glow border border-white/10 p-6">
          <div className="text-center mb-2">
            <span className="font-cinzel font-bold text-sm text-slate-200">Live Card Hologram</span>
            <div className="text-[11px] text-slate-400">Interactive live render</div>
          </div>

          <div className="my-auto">
            <CardView card={previewCard} size="lg" />
          </div>

          <div className="w-full text-center text-xs text-slate-400 pt-4 border-t border-white/10">
            Click <strong className="text-emerald-400">Playtest in Sandbox</strong> at the top to drop this card directly into a live duel!
          </div>
        </div>
      </div>
    </div>
  );
};

const ShareCodeIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);
