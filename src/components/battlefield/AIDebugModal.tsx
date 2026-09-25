import React, { useState, useEffect } from 'react';
import { aiDebugManager, AIDebugStep } from '../../engine/aiDebugInspector';
import { Bug, X, RefreshCw, Zap, Shield, Swords, ArrowRight } from 'lucide-react';
import { audio } from '../../services/audioService';

interface AIDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIDebugModal: React.FC<AIDebugModalProps> = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState<AIDebugStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<AIDebugStep | null>(null);

  useEffect(() => {
    if (isOpen) {
      const hist = aiDebugManager.getHistory();
      setHistory([...hist]);
      if (hist.length > 0) setSelectedStep(hist[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none font-sans">
      <div className="relative w-full max-w-4xl h-[75vh] bg-slate-950 rounded-2xl border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-emerald-500/30 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <Bug className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-mono font-bold text-emerald-300">
              VEILBOUND 2 — AI COMBAT INSPECTOR (DEV)
            </h2>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 uppercase font-mono">
              Live Decision Loop
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                audio.playClick();
                setHistory([...aiDebugManager.getHistory()]);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Refresh log"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* History Column */}
          <div className="w-64 border-r border-slate-800 bg-slate-950/80 p-2 overflow-y-auto space-y-1.5">
            <div className="text-[10px] font-mono uppercase text-slate-500 px-2 py-1">
              Action Timeline ({history.length})
            </div>
            {history.length === 0 ? (
              <div className="text-xs text-slate-500 p-3 italic">No AI actions recorded yet.</div>
            ) : (
              history.map((step) => {
                const isSelected = selectedStep?.id === step.id;
                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      audio.playClick();
                      setSelectedStep(step);
                    }}
                    className={`cursor-pointer p-2 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                      <span>T{step.turnNumber}</span>
                      <span className="font-bold text-amber-400">{step.chosenAction.type}</span>
                    </div>
                    <div className="font-semibold truncate">{step.chosenAction.actionSummary}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details Column */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-900/30">
            {selectedStep ? (
              <div className="space-y-5">
                <div>
                  <div className="text-xs font-mono uppercase text-emerald-400 font-bold mb-1">
                    Chosen Action (Selected by Highest Utility)
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/50 shadow-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{selectedStep.chosenAction.actionSummary}</span>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-600/40">
                        Score: {selectedStep.chosenAction.utilityScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 italic">{selectedStep.chosenAction.reason}</p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
                    Evaluated Candidate Actions ({selectedStep.candidates.length})
                  </div>
                  <div className="space-y-2">
                    {selectedStep.candidates.map((cand, idx) => {
                      const isChosen = idx === 0;
                      return (
                        <div
                          key={idx}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isChosen
                              ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200 font-semibold'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-slate-500">#{idx + 1}</span>
                              <span className="font-bold">{cand.actionSummary}</span>
                              {isChosen && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                                  CHOSEN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{cand.reason}</div>
                          </div>
                          <span className="font-mono font-bold text-xs text-amber-400">
                            {cand.utilityScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Select an action step to view evaluated candidates and utility scores.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
