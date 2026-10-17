'use client';

import React from 'react';
import SutraLogo from '@/components/SutraLogo';
import ThreeDLampToggle from '@/components/ThreeDLampToggle';
import {
  Calculator,
  Sparkles,
  TrendingUp,
  Atom,
  ArrowRightLeft,
  Camera,
  Search,
  Settings,
  Grid,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenOmniBar: () => void;
  onOpenSettings: () => void;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenOmniBar,
  onOpenSettings,
  theme = 'light',
  onToggleTheme,
}) => {
  const tabs = [
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'solver', label: 'AI Solver', icon: Sparkles },
    { id: 'graph', label: 'Graph', icon: TrendingUp },
    { id: 'science', label: 'Science', icon: Atom },
    { id: 'converter', label: 'Converter', icon: ArrowRightLeft },
    { id: 'specialized', label: 'Tools', icon: Grid },
    { id: 'scanner', label: 'Scan & Draw', icon: Camera },
  ];

  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_rgba(15,23,42,0.03)] transition-colors duration-300 animate-entrance-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* SUTRA Brand Logo & Tagline with 3D Depth */}
          <div
            onClick={() => setActiveTab('calculator')}
            className="cursor-pointer select-none group"
          >
            <SutraLogo size={32} />
          </div>

          {/* Center 3D Floating Omnibar Trigger */}
          <button
            onClick={onOpenOmniBar}
            className="flex-1 max-w-md hidden md:flex items-center justify-between px-4 py-2 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(37,99,235,0.08)] group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Ask SUTRA anything...</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 shadow-2xs group-hover:border-slate-300">
              Ctrl+K
            </kbd>
          </button>

          {/* Right Action Icons with 3D Lamp Switch & Settings */}
          <div className="flex items-center gap-2">
            {/* 3D Lamp Switch for Light / Dark Mode Toggle */}
            <ThreeDLampToggle
              isDark={isDark}
              onToggle={onToggleTheme || (() => {})}
            />

            <button
              onClick={onOpenOmniBar}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 md:hidden transition-all duration-200 shadow-2xs hover:-translate-y-0.5"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 shadow-2xs hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]"
              title="Settings & API Key"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200/90 dark:border-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] font-semibold -translate-y-0.5'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-900/80 hover:-translate-y-0.5 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 hover:shadow-2xs font-medium'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-blue-600 dark:text-cyan-400 scale-110' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
