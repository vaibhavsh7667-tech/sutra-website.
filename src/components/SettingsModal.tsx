'use client';

import React, { useState } from 'react';
import { X, Check, Key, Sun, Moon, Laptop } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userApiKey: string;
  onSaveApiKey: (key: string) => void;
  theme: 'dark' | 'light' | 'system';
  onThemeChange: (theme: 'dark' | 'light' | 'system') => void;
  defaultAngleMode: 'DEG' | 'RAD';
  onAngleModeChange: (mode: 'DEG' | 'RAD') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userApiKey,
  onSaveApiKey,
  theme,
  onThemeChange,
  defaultAngleMode,
  onAngleModeChange,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(userApiKey);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(apiKeyInput);
    try {
      localStorage.setItem('sutra_api_key', apiKeyInput);
    } catch {
      // localStorage may fail in private mode
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shadow-xs">
              <Key className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">SUTRA Preferences</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Gemini API Key Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Google Gemini API Key (Optional)
              </label>
              <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-mono font-medium">Enhances tutoring & vision</span>
            </div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-600 focus:bg-white dark:focus:bg-slate-850 focus:ring-2 focus:ring-cyan-500/20 shadow-xs transition"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When provided, Gemini powers deep natural-language answers and advanced OCR. Even without an API key, all mathematical calculation, graphing, equation solving, calculus, and multi-subject science engines function 100% offline.
            </p>
          </div>

          {/* Theme Settings */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Visual Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onThemeChange('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition ${
                  theme === 'dark'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
              <button
                onClick={() => onThemeChange('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition ${
                  theme === 'light'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => onThemeChange('system')}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-semibold transition ${
                  theme === 'system'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Angle Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              Default Trigonometric Angle Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onAngleModeChange('DEG')}
                className={`p-3 rounded-2xl border text-xs font-semibold transition ${
                  defaultAngleMode === 'DEG'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                Degrees (DEG)
              </button>
              <button
                onClick={() => onAngleModeChange('RAD')}
                className={`p-3 rounded-2xl border text-xs font-semibold transition ${
                  defaultAngleMode === 'RAD'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                Radians (RAD)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition shadow-md shadow-cyan-600/20"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            <span>{saved ? 'Preferences Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
