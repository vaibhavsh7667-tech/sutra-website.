'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ThreeDBackground from '@/components/ThreeDBackground';
import SutraIntroAnimation from '@/components/SutraIntroAnimation';
import Sutra3DTitle from '@/components/Sutra3DTitle';
import ScientificCalculator from '@/components/ScientificCalculator';
import AISolverView from '@/components/AISolverView';
import GraphingCalculator from '@/components/GraphingCalculator';
import ScienceSolverView from '@/components/ScienceSolverView';
import UnitConverterView from '@/components/UnitConverterView';
import SpecializedToolsView from '@/components/SpecializedToolsView';
import ScannerAndCanvasView from '@/components/ScannerAndCanvasView';
import OmniBar from '@/components/OmniBar';
import SettingsModal from '@/components/SettingsModal';
import VisualizerModal from '@/components/VisualizerModal';
import ThreeDLampToggle from '@/components/ThreeDLampToggle';
import { AngleMode } from '@/types/calculator';
import {
  Calculator,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Upload,
  ArrowRightLeft,
  ArrowRight,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [universalInput, setUniversalInput] = useState<string>('');
  const [passedSolverQuery, setPassedSolverQuery] = useState<string>('');
  const [passedGraphEquation, setPassedGraphEquation] = useState<string>('');

  // Modals state
  const [isOmniBarOpen, setIsOmniBarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [visualizerState, setVisualizerState] = useState<{
    isOpen: boolean;
    type: string;
    data?: Record<string, unknown>;
  }>({
    isOpen: false,
    type: 'geometry',
    data: undefined,
  });

  // User Settings state
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('light');
  const [defaultAngleMode, setDefaultAngleMode] = useState<AngleMode>('DEG');

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('sutra_api_key') || localStorage.getItem('novacalc_api_key');
      if (savedKey) setUserApiKey(savedKey);
      const savedTheme = (localStorage.getItem('sutra_theme') || localStorage.getItem('novacalc_theme')) as 'dark' | 'light' | 'system' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.classList.remove('dark');
      }
      const savedAngle = (localStorage.getItem('sutra_angle_mode') || localStorage.getItem('novacalc_angle_mode')) as AngleMode | null;
      if (savedAngle) setDefaultAngleMode(savedAngle);
    } catch {}
  }, []);

  const handleSaveApiKey = (key: string) => {
    setUserApiKey(key);
    try {
      localStorage.setItem('sutra_api_key', key);
    } catch {}
  };

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('sutra_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  };

  const handleAngleModeChange = (mode: AngleMode) => {
    setDefaultAngleMode(mode);
    try {
      localStorage.setItem('sutra_angle_mode', mode);
    } catch {}
  };

  // Universal Homepage Query Submit
  const handleUniversalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = universalInput.trim();
    if (!q) return;

    const lower = q.toLowerCase();
    if (lower.startsWith('graph') || lower.startsWith('plot') || lower.includes('y =')) {
      const eq = q.replace(/graph/i, '').replace(/plot/i, '').replace(/y\s*=\s*/i, '').trim();
      setPassedGraphEquation(eq);
      setActiveTab('graph');
    } else if (lower.startsWith('convert') || lower.includes('to m/s') || lower.includes('to km')) {
      setActiveTab('converter');
    } else {
      setPassedSolverQuery(q);
      setActiveTab('solver');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#070B14] text-slate-800 dark:text-slate-100 relative selection:bg-blue-500/20 selection:text-blue-900 transition-colors duration-500">
      {/* 0. 3D SUTRA Brand Intro Animation on page load */}
      <SutraIntroAnimation />

      {/* 1. Full-Page Interactive 3D Background with Floating Math Objects & Parallax */}
      <ThreeDBackground />

      {/* 2. Glass-like 3D Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenOmniBar={() => setIsOmniBarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Content Container */}
      <main className="flex-1 pb-16 relative z-10">
        {/* ========================================================
            3D SUTRA HERO SECTION (Section 4 & 6)
            SUTRA • Calculate • Solve • Visualize
            An intelligent scientific workspace for mathematics, science, equations, graphs, and problem solving.
            ======================================================== */}
        <section className="max-w-5xl mx-auto px-4 pt-6 md:pt-10 pb-4 text-center space-y-4 relative animate-entrance-hero preserve-3d">
          {/* Floating Mathematical Elements Orbiting Hero Title */}
          <div className="absolute inset-0 pointer-events-none select-none overflow-visible hidden sm:block" aria-hidden="true">
            <span className="absolute -top-1 left-[14%] font-mono text-xl font-bold text-blue-500/25 dark:text-cyan-400/20 animate-float-slow">
              π
            </span>
            <span className="absolute -top-2 right-[15%] font-mono text-lg font-bold text-cyan-500/25 dark:text-teal-400/20 animate-float-fast">
              √x
            </span>
            <span className="absolute bottom-12 left-[12%] font-mono text-2xl font-bold text-indigo-500/25 dark:text-indigo-400/20 animate-float-fast">
              ∫
            </span>
            <span className="absolute bottom-10 right-[14%] font-mono text-xl font-bold text-sky-500/25 dark:text-sky-400/20 animate-float-slow">
              x²
            </span>
            <span className="absolute top-1/2 left-[4%] font-mono text-base font-bold text-amber-500/25 dark:text-amber-400/20 animate-float-slow">
              ∞
            </span>
            <span className="absolute top-1/2 right-[4%] font-mono text-base font-bold text-blue-600/20 dark:text-blue-400/20 animate-float-fast">
              Δ
            </span>
          </div>

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_8px_rgba(15,23,42,0.04)] text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
              <span>An intelligent scientific workspace for mathematics, science, equations, graphs, and problem solving.</span>
            </div>

            <div className="flex items-center justify-center">
              <Sutra3DTitle />
            </div>

            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase">
              Calculate • Solve • Visualize
            </p>
          </div>

          {/* 3D Floating Universal Search Input Box (Section 6) */}
          <form
            onSubmit={handleUniversalSubmit}
            className="max-w-3xl mx-auto relative flex items-center group transition-all duration-200 hover:-translate-y-0.5 focus-within:-translate-y-1"
          >
            <input
              type="text"
              value={universalInput}
              onChange={(e) => setUniversalInput(e.target.value)}
              placeholder="Ask SUTRA anything... (e.g. Solve x² + 5x + 6 = 0, Differentiate x³, 50 km/h to m/s)..."
              className="w-full pl-5 pr-28 py-3.5 md:py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-600 dark:focus:border-cyan-500 text-xs md:text-sm font-mono shadow-[0_8px_25px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] group-focus-within:shadow-[0_14px_36px_rgba(37,99,235,0.12)] transition-all duration-200"
            />
            <button
              type="submit"
              className="absolute right-2.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all duration-200 shadow-[0_3px_8px_rgba(37,99,235,0.28)] hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>Solve</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick 3D Action Pills Below Input (Section 16) */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                activeTab === 'calculator'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] -translate-y-0.5'
                  : 'bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Scientific Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('solver')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                activeTab === 'solver'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] -translate-y-0.5'
                  : 'bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>AI Solve</span>
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                activeTab === 'graph'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 font-semibold shadow-[0_2px_8px_rgba(15,23,42,0.06)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] -translate-y-0.5'
                  : 'bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>Graph</span>
            </button>

            <button
              onClick={() => {
                setPassedSolverQuery('Solve x² + 5x + 6 = 0');
                setActiveTab('solver');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Explain Question</span>
            </button>

            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Upload Question</span>
            </button>

            <button
              onClick={() => setActiveTab('converter')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-800 shadow-2xs transition-all duration-200 hover:-translate-y-0.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Unit Converter</span>
            </button>
          </div>
        </section>

        {/* ========================================================
            ACTIVE MODULE VIEW (Section 15: 3D Transitions)
            ======================================================== */}
        <section className="mt-4 relative z-10">
          <div key={activeTab} className="animate-section-3d preserve-3d">
            {activeTab === 'calculator' && (
              <ScientificCalculator
                onSendToSolver={(expr) => {
                  setPassedSolverQuery(expr);
                  setActiveTab('solver');
                }}
                onSendToGraph={(expr) => {
                  setPassedGraphEquation(expr);
                  setActiveTab('graph');
                }}
              />
            )}

            {activeTab === 'solver' && (
              <AISolverView
                initialQuery={passedSolverQuery}
                userApiKey={userApiKey}
                onNavigateToGraph={(eq) => {
                  setPassedGraphEquation(eq);
                  setActiveTab('graph');
                }}
                onOpenVisualizer={(type, data) => {
                  setVisualizerState({ isOpen: true, type, data });
                }}
              />
            )}

            {activeTab === 'graph' && (
              <GraphingCalculator
                initialEquation={passedGraphEquation}
              />
            )}

            {activeTab === 'science' && (
              <ScienceSolverView
                onSendToGraph={(eq) => {
                  setPassedGraphEquation(eq);
                  setActiveTab('graph');
                }}
              />
            )}

            {activeTab === 'converter' && <UnitConverterView />}

            {activeTab === 'specialized' && (
              <SpecializedToolsView
                onSendToGraph={(eq) => {
                  setPassedGraphEquation(eq);
                  setActiveTab('graph');
                }}
              />
            )}

            {activeTab === 'scanner' && (
              <ScannerAndCanvasView
                onSendToSolver={(expr) => {
                  setPassedSolverQuery(expr);
                  setActiveTab('solver');
                }}
                onSendToGraph={(eq) => {
                  setPassedGraphEquation(eq);
                  setActiveTab('graph');
                }}
              />
            )}
          </div>
        </section>
      </main>

      {/* ========================================================
          CLEAN FOOTER — SUTRA
          ======================================================== */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-slate-400 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900 dark:text-white tracking-wider">SUTRA</span>
            <span>—</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">Calculate • Solve • Visualize</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500 font-medium">
            <span>Deterministic Math Engine</span>
            <span>•</span>
            <span>SUTRA AI Solver</span>
            <span>•</span>
            <span>Desmos-grade Canvas Plotter</span>
            <span>•</span>
            <span>3D Scientific Laboratory</span>
          </div>
        </div>
      </footer>

      {/* Floating 3D Desk Lamp Mode Switcher at Bottom Right */}
      <ThreeDLampToggle
        isDark={theme === 'dark'}
        onToggle={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
        variant="floating"
      />

      {/* MODALS */}
      <OmniBar
        isOpen={isOmniBarOpen}
        onClose={() => setIsOmniBarOpen(false)}
        onSelectAction={(tab, query) => {
          if (query) {
            if (tab === 'graph') setPassedGraphEquation(query);
            else setPassedSolverQuery(query);
          }
          setActiveTab(tab);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userApiKey={userApiKey}
        onSaveApiKey={handleSaveApiKey}
        theme={theme}
        onThemeChange={handleThemeChange}
        defaultAngleMode={defaultAngleMode}
        onAngleModeChange={handleAngleModeChange}
      />

      <VisualizerModal
        isOpen={visualizerState.isOpen}
        onClose={() => setVisualizerState({ isOpen: false, type: 'geometry', data: undefined })}
        type={visualizerState.type}
        data={visualizerState.data}
      />
    </div>
  );
}
