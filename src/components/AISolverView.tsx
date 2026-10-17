'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AISolution, QuestionExplanation, DifficultyLevel } from '@/types/calculator';
import { MathRenderer } from './MathRenderer';
import { startSpeechRecognition } from '@/lib/speech-rec';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Mic,
  MicOff,
  ChevronRight,
  Eye,
  Columns,
  TrendingUp,
  Copy,
  Check,
  RefreshCw,
  Lightbulb,
  Cpu,
  CheckCheck,
} from 'lucide-react';

interface AISolverViewProps {
  initialQuery?: string;
  userApiKey?: string;
  onNavigateToGraph?: (equation: string) => void;
  onOpenVisualizer?: (type: string, data?: Record<string, unknown>) => void;
}

type SolveStage = 'idle' | 'understanding' | 'analyzing' | 'solving' | 'verifying' | 'ready';

export const AISolverView: React.FC<AISolverViewProps> = ({
  initialQuery = '',
  userApiKey = '',
  onNavigateToGraph,
  onOpenVisualizer,
}) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [solveStage, setSolveStage] = useState<SolveStage>('idle');
  const [solution, setSolution] = useState<AISolution | null>(null);
  const [explanation, setExplanation] = useState<QuestionExplanation | null>(null);
  const [activeTab, setActiveTab] = useState<'solve' | 'explain'>('solve');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [revealedSteps, setRevealedSteps] = useState<number>(1);
  const [showAllSteps, setShowAllSteps] = useState<boolean>(false);
  const [selectedMethodIdx, setSelectedMethodIdx] = useState<number>(0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechStopFn, setSpeechStopFn] = useState<(() => void) | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 3D AI Solving Experience (Section 11):
  // Sequence: UNDERSTANDING -> ANALYZING -> SOLVING -> VERIFYING -> ANSWER READY
  const handleSolve = useCallback(async (searchQuery?: string) => {
    const targetQuery = searchQuery || query;
    if (!targetQuery.trim()) return;

    setLoading(true);
    setSolveStage('understanding');
    setSolution(null);
    setExplanation(null);
    setRevealedSteps(1);
    setShowAllSteps(false);
    setActiveTab('solve');

    // 5-Stage 3D progression timers
    const t1 = setTimeout(() => setSolveStage('analyzing'), 200);
    const t2 = setTimeout(() => setSolveStage('solving'), 400);
    const t3 = setTimeout(() => setSolveStage('verifying'), 650);
    const t4 = setTimeout(() => setSolveStage('ready'), 900);

    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: targetQuery,
          mode: 'solve',
          userApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setTimeout(() => {
          setSolution(data.data);
          setLoading(false);
          setSolveStage('idle');
        }, 950);
      } else {
        setLoading(false);
        setSolveStage('idle');
      }
    } catch (err) {
      console.error('Solve error:', err);
      setLoading(false);
      setSolveStage('idle');
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [query, userApiKey]);

  // Auto-run if initialQuery is passed
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      handleSolve(initialQuery);
    }
  }, [initialQuery, query, handleSolve]);

  const handleExplain = async (level?: DifficultyLevel) => {
    if (!query.trim()) return;
    const targetLevel = level || difficulty;
    setDifficulty(targetLevel);
    setLoading(true);
    setActiveTab('explain');

    try {
      const res = await fetch('/api/ai/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode: 'explain',
          difficulty: targetLevel,
          userApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setExplanation(data.data);
      }
    } catch (err) {
      console.error('Explain error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      if (speechStopFn) speechStopFn();
      setIsListening(false);
      setSpeechStopFn(null);
    } else {
      const controller = startSpeechRecognition(
        (_raw, normalized) => {
          setQuery((prev) => (prev ? `${prev} ${normalized}` : normalized));
          setIsListening(false);
        },
        (error) => {
          alert(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (controller) {
        setIsListening(true);
        setSpeechStopFn(() => controller.stop);
      }
    }
  };

  const copySolution = () => {
    if (!solution) return;
    const text = `Problem: ${solution.query}\nFinal Answer: ${solution.finalAnswer}\nWhy Correct: ${solution.whyCorrect}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePrompts = [
    'Solve x² + 5x + 6 = 0',
    'Differentiate x³ + 2x²',
    'Integrate sin(x)',
    'Find the area of a circle with radius 7',
    'Find velocity when distance is 150m and time is 5s',
    'Calculate force with m = 1200kg, a = 2.5m/s²',
    'Solve 2x + y = 7, x - y = 2',
    'Molar mass of H2SO4',
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Search & Query Input Box */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/90 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-cyan-100/50 via-sky-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm md:text-base text-slate-900 tracking-tight">SUTRA AI Solver</span>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Natural Language • Multi-Step Reasoning • Verification
          </div>
        </div>

        {/* Input Bar */}
        <div className="relative mt-2">
          <textarea
            rows={2}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSolve();
              }
            }}
            placeholder="Type or paste any math or science problem (e.g. Solve x² + 5x + 6 = 0, Differentiate x³, Molar mass of H2SO4)..."
            className="w-full p-4 pr-32 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-300 focus:border-cyan-600 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-cyan-500/20 text-sm font-mono shadow-inner transition"
          />

          <div className="absolute right-3 bottom-4 flex items-center gap-1.5">
            <button
              onClick={handleVoiceToggle}
              className={`p-2.5 rounded-xl border transition ${
                isListening
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600 shadow-xs'
              }`}
              title={isListening ? 'Stop listening' : 'Voice Input (Say your problem)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleSolve()}
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition shadow-md shadow-cyan-600/20 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Solve'}
            </button>
          </div>
        </div>

        {/* Action Tabs & Sample Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('solve');
                if (!solution && query) handleSolve();
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition shadow-xs ${
                activeTab === 'solve'
                  ? 'bg-sky-50 text-sky-800 border border-sky-300'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Step-by-Step Solution
            </button>
            <button
              onClick={() => handleExplain(difficulty)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                activeTab === 'explain'
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-amber-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              I Don’t Understand This Question
            </button>
          </div>

          <div className="text-slate-400 font-medium hidden md:block">
            Press Enter ↵ to solve
          </div>
        </div>

        {/* Quick Example Pills */}
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-xs text-slate-500 font-semibold">Examples:</span>
          {samplePrompts.slice(0, 5).map((p) => (
            <button
              key={p}
              onClick={() => {
                setQuery(p);
                handleSolve(p);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 transition truncate max-w-[200px]"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
      {/* ========================================================
          3D AI SOLVER EXPERIENCE (Section 11)
          UNDERSTANDING -> ANALYZING -> SOLVING -> VERIFYING -> ANSWER READY
          ======================================================== */}
      {loading && (
        <div className="bg-white rounded-3xl p-8 border border-blue-200/90 shadow-[0_20px_60px_-15px_rgba(37,99,235,0.12)] text-center space-y-6 relative overflow-hidden preserve-3d animate-entrance-calc">
          {/* Floating 3D Mathematical Symbols Converging Toward Center */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
            <span className="absolute top-4 left-8 font-mono text-xl font-bold text-blue-500/30 animate-converge" style={{ animationDelay: '0s' }}>∫</span>
            <span className="absolute top-6 right-10 font-mono text-xl font-bold text-cyan-500/30 animate-converge" style={{ animationDelay: '0.3s' }}>Σ</span>
            <span className="absolute bottom-6 left-12 font-mono text-xl font-bold text-indigo-500/30 animate-converge" style={{ animationDelay: '0.6s' }}>√x</span>
            <span className="absolute bottom-5 right-14 font-mono text-xl font-bold text-blue-600/30 animate-converge" style={{ animationDelay: '0.9s' }}>π</span>
            <span className="absolute top-1/2 left-4 font-mono text-lg font-bold text-sky-500/30 animate-converge" style={{ animationDelay: '0.4s' }}>Δ</span>
            <span className="absolute top-1/2 right-4 font-mono text-lg font-bold text-cyan-600/30 animate-converge" style={{ animationDelay: '0.7s' }}>x²</span>
          </div>

          {/* 5-Stage Status Progression Indicator */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-2xl mx-auto relative z-10">
            {[
              { id: 'understanding', label: 'UNDERSTANDING' },
              { id: 'analyzing', label: 'ANALYZING' },
              { id: 'solving', label: 'SOLVING' },
              { id: 'verifying', label: 'VERIFYING' },
              { id: 'ready', label: 'ANSWER READY' },
            ].map((step, idx) => {
              const stages = ['understanding', 'analyzing', 'solving', 'verifying', 'ready'];
              const currentIdx = stages.indexOf(solveStage);
              const stepIdx = stages.indexOf(step.id);
              const isPast = currentIdx >= stepIdx;
              const isCurrent = currentIdx === stepIdx;

              return (
                <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                  <div
                    className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-extrabold tracking-wider transition-all duration-200 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 scale-105'
                        : isPast
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCurrent && <RefreshCw className="w-3 h-3 animate-spin" />}
                    {isPast && !isCurrent && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                    <span>{step.label}</span>
                  </div>
                  {idx < 4 && <span className="text-slate-300 font-mono text-xs">→</span>}
                </div>
              );
            })}
          </div>

          <div className="space-y-1 relative z-10">
            <p className="text-sm font-bold text-slate-800">
              {solveStage === 'understanding' && 'Deconstructing problem statement & identifying given variables...'}
              {solveStage === 'analyzing' && 'Selecting target formulas & mapping physical laws...'}
              {solveStage === 'solving' && 'Applying rigorous mathematical algebraic deduction...'}
              {solveStage === 'verifying' && 'Executing numerical tolerance checks & boundary proof...'}
              {solveStage === 'ready' && 'Final answer verified. Formatting step-by-step presentation...'}
            </p>
            <div className="flex justify-center gap-4 text-xs font-mono text-blue-600/80 pt-1">
              <span>π</span>
              <span>√</span>
              <span>∫</span>
              <span>dx</span>
              <span>∑</span>
              <span>Δ</span>
            </div>
          </div>
        </div>
      )}

      {/* "I DON'T UNDERSTAND THIS QUESTION" MODE EXPLANATION (Section 3) */}
      {activeTab === 'explain' && explanation && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-amber-200/90 space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
                <Lightbulb className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Question Explanation in Plain Language</h3>
                <p className="text-xs text-slate-500">Deconstructing requirements before solving</p>
              </div>
            </div>

            {/* Difficulty Level Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {(['Easy', 'Medium', 'Advanced'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => handleExplain(level)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    difficulty === level
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What is asking */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">1. What is the question asking?</span>
              <p className="text-sm text-slate-800 mt-2 leading-relaxed">{explanation.whatIsAsking}</p>
            </div>

            {/* What is given */}
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
              <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">2. What information is given?</span>
              <ul className="list-disc list-inside text-sm text-slate-800 mt-2 space-y-1">
                {explanation.givenInfo.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>

            {/* What is missing */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">3. What information is missing?</span>
              <ul className="list-disc list-inside text-sm text-slate-800 mt-2 space-y-1">
                {explanation.missingInfo.map((info, idx) => (
                  <li key={idx}>{info}</li>
                ))}
              </ul>
            </div>

            {/* Formula / Concept needed */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">4. Formulas & Concepts Needed</span>
              <div className="text-sm text-slate-800 mt-2 space-y-2">
                {explanation.conceptsAndFormulas.map((concept, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-indigo-200/80 font-mono text-xs shadow-xs">
                    <MathRenderer latex={concept} />
                  </div>
                ))}
              </div>
            </div>

            {/* What user should do first */}
            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">5. What You Should Do First</span>
              <p className="text-sm text-slate-800 mt-2 font-medium">{explanation.firstStep}</p>
            </div>

            {/* Symbols & Meanings */}
            <div className="col-span-1 md:col-span-2 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">6. Symbol Definitions & Glossary</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                {explanation.symbolsMeanings.map((sym, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white border border-purple-200 text-xs shadow-xs">
                    <span className="font-bold text-purple-900 font-mono">{sym.symbol}</span>: <span className="text-slate-700">{sym.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <span>💡 {explanation.summaryNote}</span>
            <button
              onClick={() => setActiveTab('solve')}
              className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 transition shadow-sm"
            >
              See Solution Now →
            </button>
          </div>
        </div>
      )}

      {/* AI STEP-BY-STEP SOLUTION CARD */}
      {activeTab === 'solve' && solution && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-200/90 space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <span className="text-xs font-mono uppercase font-bold tracking-wider text-cyan-600">Structured Solution</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{solution.query}</h3>
            </div>

            <div className="flex items-center gap-2">
              {solution.verification && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs"
                  title={solution.verification.details}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Answer Verified</span>
                </div>
              )}
              <button
                onClick={copySolution}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                title="Copy Solution"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section 1: Given Information */}
          {solution.given && solution.given.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">1. Given Information</h4>
              <div className="flex flex-wrap gap-2">
                {solution.given.map((g, idx) => (
                  <div key={idx} className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="text-slate-500 font-medium">{g.label}:</span>{' '}
                    <span className="font-bold text-slate-900 font-mono">{g.value}</span>{' '}
                    {g.unit && <span className="text-slate-500">{g.unit}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Formulas Required */}
          {solution.formulaRequired && solution.formulaRequired.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">2. Formula Required</h4>
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 text-sky-950">
                {solution.formulaRequired.map((f, idx) => (
                  <div key={idx} className="my-1">
                    <MathRenderer latex={f} displayMode={true} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Progressive Step-by-Step Solution */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                3. Step-by-Step Solution ({showAllSteps ? solution.steps.length : Math.min(revealedSteps, solution.steps.length)} of {solution.steps.length} Steps Revealed)
              </h4>
              <div className="flex items-center gap-2">
                {!showAllSteps && revealedSteps < solution.steps.length && (
                  <button
                    onClick={() => setRevealedSteps((prev) => prev + 1)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-xs"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowAllSteps(!showAllSteps)}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200 transition"
                >
                  {showAllSteps ? 'Step Controls' : 'Reveal All Steps'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {solution.steps
                .slice(0, showAllSteps ? solution.steps.length : revealedSteps)
                .map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2 transition-all duration-300 animate-fadeIn"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-xs font-bold">
                        {step.stepNumber}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{step.title}</span>
                    </div>

                    <p className="text-xs md:text-sm text-slate-700 leading-relaxed pl-8">
                      {step.description}
                    </p>

                    {step.mathExpression && (
                      <div className="pl-8 my-2 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-900">
                        <MathRenderer latex={step.mathExpression} displayMode={true} />
                      </div>
                    )}

                    {step.explanation && (
                      <p className="text-xs text-slate-500 pl-8 italic">
                        Note: {step.explanation}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Section 4 & 5: Substitution & Calculation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">4. Substitution</span>
              <div className="mt-2 text-xs md:text-sm text-slate-800 font-mono">
                {solution.substitution}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">5. Calculation</span>
              <div className="mt-2 text-xs md:text-sm text-cyan-800 font-mono font-semibold">
                {solution.calculation}
              </div>
            </div>
          </div>

          {/* Section 6: Final Answer Elevated 3D Result Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-result-rise">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">FINAL ANSWER</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-slate-900 font-mono mt-1">
                <MathRenderer latex={solution.finalAnswer} />
              </div>
              {solution.unit && (
                <span className="text-xs text-slate-500 font-medium">Standard SI Unit: {solution.unit}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {solution.graphEquation && onNavigateToGraph && (
                <button
                  onClick={() => onNavigateToGraph(solution.graphEquation!)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-2xs"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>View Graph</span>
                </button>
              )}
              {solution.visualizationType && onOpenVisualizer && (
                <button
                  onClick={() => onOpenVisualizer(solution.visualizationType!, solution.visualizationData)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-2xs"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Visualize</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 7: Why Correct & Important Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-700 space-y-2">
            <div>
              <span className="font-bold text-emerald-700">7. Why this answer is correct: </span>
              {solution.whyCorrect}
            </div>
            {solution.importantNote && (
              <div className="pt-2 border-t border-slate-200 text-slate-600">
                <span className="font-bold text-amber-700">Important Note: </span>
                {solution.importantNote}
              </div>
            )}
          </div>

          {/* Section 8: Compare Methods (if alternative methods exist) */}
          {solution.alternativeMethods && solution.alternativeMethods.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Columns className="w-4 h-4 text-indigo-600" />
                  <span>8. Compare Alternative Solution Methods</span>
                </h4>
                <div className="flex gap-1.5">
                  {solution.alternativeMethods.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedMethodIdx(idx)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                        selectedMethodIdx === idx
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              {solution.alternativeMethods[selectedMethodIdx] && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs text-slate-600">
                    {solution.alternativeMethods[selectedMethodIdx].description}
                  </p>
                  <div className="space-y-2">
                    {solution.alternativeMethods[selectedMethodIdx].steps.map((st) => (
                      <div key={st.stepNumber} className="text-xs text-slate-700">
                        <span className="font-bold text-cyan-700">{st.stepNumber}. {st.title}:</span> {st.description}
                        {st.mathExpression && (
                          <div className="my-1 pl-4 py-1 text-slate-900 font-mono">
                            <MathRenderer latex={st.mathExpression} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 text-xs font-bold text-slate-900 border-t border-slate-200">
                    Result: <MathRenderer latex={solution.alternativeMethods[selectedMethodIdx].finalAnswer} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AISolverView;
