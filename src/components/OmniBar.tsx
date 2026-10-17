'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  TrendingUp,
  Atom,
  ArrowRightLeft,
  Calculator,
  ArrowRight,
  X,
} from 'lucide-react';

interface OmniBarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: string, query?: string) => void;
}

export const OmniBar: React.FC<OmniBarProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Detect user intent based on natural language
  const detectIntent = (text: string) => {
    const q = text.toLowerCase();
    if (!q) return null;

    if (q.startsWith('graph') || q.startsWith('plot') || q.includes('y =') || q.includes('curve')) {
      return { tab: 'graph', label: 'Plot Interactive Graph', icon: TrendingUp, query: text.replace(/graph/i, '').replace(/plot/i, '').trim() };
    }
    if (q.startsWith('convert') || q.includes('to m/s') || q.includes('to km') || q.includes('to miles')) {
      return { tab: 'converter', label: 'Unit Conversion', icon: ArrowRightLeft, query: text };
    }
    if (q.includes('differentiate') || q.includes('derivative') || q.includes('integrate') || q.includes('integral') || q.includes('matrix')) {
      return { tab: 'specialized', label: 'Calculus & Advanced Tools', icon: Calculator, query: text };
    }
    if (q.includes('force') || q.includes('velocity') || q.includes('molar mass') || q.includes('ph') || q.includes('ohm')) {
      return { tab: 'science', label: 'Science & Physics Solver', icon: Atom, query: text };
    }
    return { tab: 'solver', label: 'AI Step-by-Step Solve', icon: Sparkles, query: text };
  };

  const detected = detectIntent(query);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    if (detected) {
      onSelectAction(detected.tab, detected.query || query);
    } else {
      onSelectAction('solver', query);
    }
    onClose();
  };

  const suggestions = [
    { label: 'Solve x² + 5x + 6 = 0', tab: 'solver' },
    { label: 'Graph y = x³ - 4x', tab: 'graph' },
    { label: 'Differentiate x³ + 2x²', tab: 'solver' },
    { label: 'Convert 100 km/h to m/s', tab: 'converter' },
    { label: 'Calculate force using F = ma', tab: 'science' },
    { label: 'Integrate sin(x)', tab: 'solver' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative flex items-center p-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-cyan-600 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask SUTRA anything (e.g. solve x²+5x+6=0, graph sin(x), convert 50 mph to km/h)..."
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm md:text-base font-mono focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </form>

        {/* Intent Detection Live Badge */}
        {detected && (
          <div
            onClick={() => handleSubmit()}
            className="p-3 mx-4 my-2 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex items-center justify-between cursor-pointer hover:bg-cyan-100/70 transition shadow-xs"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800">
              <detected.icon className="w-4 h-4 text-cyan-600" />
              <span>Detected Intent: {detected.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-cyan-700 font-bold">
              <span>Run</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Suggestions List */}
        <div className="p-4 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Popular Quick Commands
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectAction(s.tab, s.label);
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-xs text-slate-700 hover:text-slate-900 transition flex items-center justify-between shadow-xs"
              >
                <span className="truncate">{s.label}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer shortcuts info */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Press Enter ↵ to launch</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};

export default OmniBar;
