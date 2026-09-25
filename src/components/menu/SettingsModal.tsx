import React from 'react';
import { Volume2, VolumeX, Eye, Sparkles, X, RotateCcw } from 'lucide-react';
import { audio } from '../../services/audioService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    volume: number;
    isMuted: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
  onUpdateSettings: (newSettings: any) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="w-[450px] rounded-2xl glass-panel-glow border border-indigo-500/40 p-6 flex flex-col gap-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-cinzel font-bold text-slate-100 border-b border-white/10 pb-2">
          Game Settings
        </h2>

        {/* Audio Volume & Mute */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-2">
              {settings.isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
              Sound Synthesizer Volume
            </span>
            <span className="font-mono">{Math.round(settings.volume * 100)}%</span>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              audio.setVolume(val);
              onUpdateSettings({ ...settings, volume: val });
            }}
            className="w-full accent-indigo-500"
          />

          <div className="flex justify-between items-center pt-1">
            <span className="text-xs text-slate-300">Mute Audio</span>
            <button
              onClick={() => {
                const nextMuted = !settings.isMuted;
                audio.setMuted(nextMuted);
                onUpdateSettings({ ...settings, isMuted: nextMuted });
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                settings.isMuted ? 'bg-red-950 border-red-500 text-red-200' : 'bg-slate-900 border-white/10 text-slate-300'
              }`}
            >
              {settings.isMuted ? 'Muted' : 'Enabled'}
            </button>
          </div>
        </div>

        {/* Accessibility Toggles */}
        <div className="space-y-3 pt-3 border-t border-white/10">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
            Accessibility & Visuals
          </h3>

          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-200">Reduced Motion</div>
            <button
              onClick={() => onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                settings.reducedMotion ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              {settings.reducedMotion ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-slate-200">High Contrast Mode</div>
            <button
              onClick={() => onUpdateSettings({ ...settings, highContrast: !settings.highContrast })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                settings.highContrast ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              {settings.highContrast ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        {/* Reset Progress */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-slate-400">Reset save data to factory defaults</div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all game data and collection?')) {
                onResetData();
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
