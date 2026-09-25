import React, { useState } from 'react';
import { audio } from '../../services/audioService';
import { Shield, Key, X, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

// Configurable development admin code
const DEV_ADMIN_CODE = 'Admin123';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playClick();

    if (code.trim() === DEV_ADMIN_CODE) {
      setError(null);
      setCode('');
      onLoginSuccess();
    } else {
      setError('Invalid admin code.');
      setCode('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn select-none">
      <div className="w-[420px] bg-slate-900 border-2 border-red-500/60 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(239,68,68,0.3)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <Shield className="w-6 h-6 text-red-400" />
          <div>
            <h2 className="text-lg font-cinzel font-bold text-slate-100">System Admin Access</h2>
            <p className="text-[11px] text-slate-400">Restricted internal management console</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 my-2">
          <label className="text-xs font-mono font-bold text-slate-300">
            Enter Admin Authorization Code:
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              autoFocus
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-950/60 border border-red-800 p-2 rounded-lg animate-shake">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
