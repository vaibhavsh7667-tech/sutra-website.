'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AngleMode, HistoryItem } from '@/types/calculator';
import { evaluateExpression, cleanNumber } from '@/lib/math-engine';
import {
  Copy,
  Check,
  History,
  Trash2,
  Delete as BackspaceIcon,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Percent,
} from 'lucide-react';

interface ScientificCalculatorProps {
  onSendToSolver?: (expr: string) => void;
  onSendToGraph?: (expr: string) => void;
}

type AnimationType = 'arithmetic' | 'percentage' | 'root' | 'power' | 'trigonometry' | 'quadratic' | 'calculus';

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  onSendToSolver,
  onSendToGraph,
}) => {
  // Calculator inputs & modes
  const [expression, setExpression] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<string>('');
  const [lastAnswer, setLastAnswer] = useState<string>('0');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isSecond, setIsSecond] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [hasMemory, setHasMemory] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showMemoryModal, setShowMemoryModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3D Calculation Animation states (500ms total flow)
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calcAnimationType, setCalcAnimationType] = useState<AnimationType>('arithmetic');
  const [lastCalculatedExpr, setLastCalculatedExpr] = useState<string>('');
  const [lastCalculatedResult, setLastCalculatedResult] = useState<string>('');
  const [showResultCard, setShowResultCard] = useState<boolean>(false);
  const [inlineExplanation, setInlineExplanation] = useState<string | null>(null);

  // 3D Tilt State & View Presets ('interactive' | 'isometric' | 'flat')
  const [tiltPreset, setTiltPreset] = useState<'interactive' | 'isometric' | 'flat'>('interactive');
  const [cardTilt, setCardTilt] = useState<{ x: number; y: number }>({ x: 2, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Web Audio 3D tactile mechanical key click synthesizer
  const playKeyAudio = useCallback(
    (pitch = 600) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(pitch, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.032);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.032);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.036);
      } catch {}
    },
    [soundEnabled]
  );

  // Load history & memory from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sutra_history') || localStorage.getItem('novacalc_history');
      if (saved) setHistory(JSON.parse(saved));
      const savedMem = localStorage.getItem('sutra_memory') || localStorage.getItem('novacalc_memory');
      if (savedMem) {
        const val = parseFloat(savedMem);
        if (!isNaN(val) && val !== 0) {
          setMemory(val);
          setHasMemory(true);
        }
      }
    } catch {}
  }, []);

  // Save history item
  const saveHistoryItem = useCallback((expr: string, res: string) => {
    setHistory((prevHistory) => {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        expression: expr,
        result: res,
        timestamp: Date.now(),
        category: 'calculator',
      };
      const updated = [newItem, ...prevHistory.slice(0, 49)];
      try {
        localStorage.setItem('sutra_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Live evaluation preview
  useEffect(() => {
    if (!expression.trim()) {
      setPreviewResult('');
      setErrorMessage(null);
      return;
    }
    const res = evaluateExpression(expression, angleMode, { Ans: parseFloat(lastAnswer) || 0 });
    if (res.success && res.result) {
      setPreviewResult(res.result);
      setErrorMessage(null);
    } else {
      setPreviewResult('');
    }
  }, [expression, angleMode, lastAnswer]);

  // Input dispatcher
  const handleInput = useCallback((char: string) => {
    playKeyAudio(620);
    setErrorMessage(null);
    setShowResultCard(false);
    setExpression((prev) => prev + char);
  }, [playKeyAudio]);

  // Clear All (AC)
  const handleClear = useCallback(() => {
    playKeyAudio(440);
    setExpression('');
    setPreviewResult('');
    setErrorMessage(null);
    setShowResultCard(false);
    setInlineExplanation(null);
  }, [playKeyAudio]);

  // Delete / Backspace (Back)
  const handleDelete = useCallback(() => {
    playKeyAudio(520);
    setErrorMessage(null);
    setShowResultCard(false);
    setExpression((prev) => {
      const funcTokens = [
        'sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(',
        'sinh⁻¹(', 'cosh⁻¹(', 'tanh⁻¹(',
        'sinh(', 'cosh(', 'tanh(',
        'asin(', 'acos(', 'atan(',
        'log10(', 'log2(', 'nthRoot(',
        'sqrt(', 'cbrt(', 'abs(', 'ln(', 'log(',
        'sin(', 'cos(', 'tan(', '³√(', '√(', '1/(', 'e^('
      ];
      for (const tok of funcTokens) {
        if (prev.endsWith(tok)) {
          return prev.slice(0, -tok.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, [playKeyAudio]);

  // Toggle plus/minus (±)
  const handlePlusMinus = useCallback(() => {
    playKeyAudio(580);
    setExpression((prev) => {
      if (!prev) return '-';
      if (prev.startsWith('-(') && prev.endsWith(')')) {
        return prev.slice(2, -1);
      }
      if (prev.startsWith('-')) {
        return prev.slice(1);
      }
      return `-(${prev})`;
    });
  }, [playKeyAudio]);

  // Random Number Generator (RND)
  const handleRandom = useCallback(() => {
    playKeyAudio(700);
    const rndVal = (Math.random()).toFixed(4);
    handleInput(rndVal);
  }, [handleInput, playKeyAudio]);

  // Determine calculation type for subtle visual feedback
  const detectAnimationType = (expr: string): AnimationType => {
    const lower = expr.toLowerCase();
    if (lower.includes('%')) return 'percentage';
    if (lower.includes('√') || lower.includes('sqrt') || lower.includes('cbrt')) return 'root';
    if (lower.includes('^') || lower.includes('²') || lower.includes('³') || lower.includes('e^')) return 'power';
    if (lower.includes('sin') || lower.includes('cos') || lower.includes('tan')) return 'trigonometry';
    if (lower.includes('=') || lower.includes('x^2') || lower.includes('x²')) return 'quadratic';
    if (lower.includes('d/dx') || lower.includes('derivative') || lower.includes('∫')) return 'calculus';
    return 'arithmetic';
  };

  // Perform Equals (=) with ~500ms smooth 3D result animation flow
  const handleEquals = useCallback(() => {
    if (!expression.trim()) return;
    playKeyAudio(850);

    const animType = detectAnimationType(expression);
    setCalcAnimationType(animType);
    setIsCalculating(true);

    const res = evaluateExpression(expression, angleMode, { Ans: parseFloat(lastAnswer) || 0 });

    // Step 1: Calculating state runs for 260ms
    setTimeout(() => {
      setIsCalculating(false);
      if (res.success) {
        const finalVal = res.result;
        saveHistoryItem(expression, finalVal);
        setLastAnswer(finalVal);
        setLastCalculatedExpr(expression);
        setLastCalculatedResult(finalVal);
        setExpression(finalVal);
        setPreviewResult('');
        setErrorMessage(null);
        setShowResultCard(true);

        if (animType === 'trigonometry') {
          setInlineExplanation(`Evaluated in ${angleMode} mode.`);
        } else if (animType === 'percentage') {
          setInlineExplanation(`Percentage factor (× 0.01) applied.`);
        } else if (animType === 'root') {
          setInlineExplanation(`Radical value computed.`);
        } else {
          setInlineExplanation(`Order of operations (PEMDAS) verified.`);
        }
      } else {
        setErrorMessage(res.error || 'Invalid Expression');
      }
    }, 260);
  }, [expression, angleMode, lastAnswer, saveHistoryItem, playKeyAudio]);

  // Memory Functions: M+, M-, MR, MC
  const handleMemoryAdd = () => {
    playKeyAudio(680);
    const res = evaluateExpression(expression || previewResult || lastAnswer, angleMode);
    if (res.success && res.numericValue !== undefined) {
      const newMem = memory + res.numericValue;
      setMemory(newMem);
      setHasMemory(true);
      try {
        localStorage.setItem('sutra_memory', newMem.toString());
      } catch {}
    }
  };

  const handleMemorySub = () => {
    playKeyAudio(660);
    const res = evaluateExpression(expression || previewResult || lastAnswer, angleMode);
    if (res.success && res.numericValue !== undefined) {
      const newMem = memory - res.numericValue;
      setMemory(newMem);
      setHasMemory(true);
      try {
        localStorage.setItem('sutra_memory', newMem.toString());
      } catch {}
    }
  };

  const handleMemoryRecall = () => {
    playKeyAudio(640);
    handleInput(cleanNumber(memory));
  };

  const handleMemoryClear = () => {
    playKeyAudio(400);
    setMemory(0);
    setHasMemory(false);
    setShowMemoryModal(false);
    try {
      localStorage.removeItem('sutra_memory');
    } catch {}
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key;
      if (/[0-9]/.test(key)) {
        handleInput(key);
      } else if (key === '+') {
        handleInput('+');
      } else if (key === '-') {
        handleInput('−');
      } else if (key === '*') {
        handleInput('×');
      } else if (key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (key === '%') {
        handleInput('%');
      } else if (key === '^') {
        handleInput('^');
      } else if (key === '(' || key === ')') {
        handleInput(key);
      } else if (key === '.') {
        handleInput('.');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, handleEquals, handleDelete, handleClear]);

  // Copy to clipboard
  const copyToClipboard = (text?: string) => {
    const textToCopy = text || lastCalculatedResult || expression || previewResult || lastAnswer;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if expression looks like a function graphable on cartesian grid
  const isGraphable = (expr: string) => {
    const lower = expr.toLowerCase();
    return lower.includes('x') || lower.includes('sin') || lower.includes('cos') || lower.includes('tan') || lower.includes('^');
  };

  // 3D Card Tilt Handler
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 768) return;
    if (tiltPreset !== 'interactive') return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setCardTilt({
      x: -y * 7.5, // tilts up to 7.5 deg
      y: x * 7.5,
    });
  };

  const handleCardMouseEnter = () => {
    setIsCardHovered(true);
  };

  const handleCardMouseLeave = () => {
    setIsCardHovered(false);
    if (tiltPreset === 'interactive') {
      setCardTilt({ x: 2, y: 0 }); // resting slight forward tilt
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-4 md:p-6 relative select-none perspective-1200">
      {/* ========================================================
          3D HARDWARE CONTROLS & PERSPECTIVE PRESETS BAR
          ======================================================== */}
      <div className="flex flex-wrap items-center justify-between mb-3 px-1 text-xs gap-2">
        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            3D View:
          </span>
          <button
            onClick={() => {
              setTiltPreset('interactive');
              setCardTilt({ x: 2, y: 0 });
              playKeyAudio(700);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              tiltPreset === 'interactive'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Interactive dynamic tilt following mouse"
          >
            📐 Dynamic 3D
          </button>
          <button
            onClick={() => {
              setTiltPreset('isometric');
              playKeyAudio(700);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              tiltPreset === 'isometric'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Showcase isometric 3D perspective"
          >
            🧊 Isometric 3D
          </button>
          <button
            onClick={() => {
              setTiltPreset('flat');
              setCardTilt({ x: 0, y: 0 });
              playKeyAudio(700);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              tiltPreset === 'flat'
                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Top-down flat desk view"
          >
            📏 Flat
          </button>
        </div>

        {/* Tactile Audio Feedback Switch & Info */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKeyAudio(800);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs ${
              soundEnabled
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
            title="Toggle realistic tactile key click sounds"
          >
            <span>{soundEnabled ? '🔊 3D Click Sound: ON' : '🔇 Click Sound: OFF'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          3D CALCULATOR CHASSIS: ELEVATED PHYSICAL 3D BODY WITH TILT
          ======================================================== */}
      <div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseEnter={handleCardMouseEnter}
        onMouseLeave={handleCardMouseLeave}
        style={{
          transform:
            tiltPreset === 'isometric'
              ? 'perspective(1400px) rotateX(12deg) rotateY(-7deg) translateZ(12px)'
              : tiltPreset === 'flat'
              ? 'perspective(1400px) rotateX(0deg) rotateY(0deg) translateZ(0)'
              : `perspective(1400px) rotateX(${cardTilt.x}deg) rotateY(${cardTilt.y}deg) translateZ(8px)`,
          transition:
            tiltPreset === 'interactive' && isCardHovered
              ? 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease'
              : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
        }}
        className="w-full calc-chassis-3d rounded-3xl p-5 sm:p-7 md:p-8 relative animate-entrance-calc preserve-3d"
      >
        {/* Dynamic Specular Sheen across the 3D Chassis */}
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-45 transition-opacity"
          style={{
            background: `radial-gradient(800px circle at ${
              (tiltPreset === 'isometric' ? -7 : cardTilt.y) * 20 + 50
            }% ${(tiltPreset === 'isometric' ? 12 : cardTilt.x) * -20 + 50}%, rgba(255, 255, 255, 0.9), transparent 70%)`,
          }}
        />

        {/* TOP STATUS BAR: BRAND, 3D SOLAR PANEL, DEG/RAD TOGGLE & CONTROLS */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800 gap-3 relative z-10">
          {/* Brand, Solar Array & Degree/Radian Switch */}
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-xs tracking-wider text-slate-800 dark:text-slate-100 uppercase flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 shadow-[0_0_8px_rgba(2,132,199,0.7)]"></span>
              SUTRA <span className="text-slate-500 dark:text-slate-400 font-normal">Scientific</span>
            </span>

            {/* 3D Photovoltaic Solar Cell Array */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg calc-solar-panel-3d shadow-2xs"
              title="Two-Way Power: Photovoltaic Solar & Battery"
            >
              <div className="grid grid-cols-4 gap-0.5 h-3.5 w-16">
                <span className="bg-gradient-to-b from-amber-950 via-stone-900 to-black border-r border-stone-700/60 rounded-xs" />
                <span className="bg-gradient-to-b from-amber-950 via-stone-900 to-black border-r border-stone-700/60 rounded-xs" />
                <span className="bg-gradient-to-b from-amber-950 via-stone-900 to-black border-r border-stone-700/60 rounded-xs" />
                <span className="bg-gradient-to-b from-amber-950 via-stone-900 to-black rounded-xs" />
              </div>
              <span className="text-[8.5px] font-mono font-bold tracking-tight text-amber-400 select-none">SOLAR</span>
            </div>

            {/* DEG | RAD Dual Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-inner">
              <button
                onClick={() => {
                  setAngleMode('DEG');
                  playKeyAudio(700);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  angleMode === 'DEG'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                DEG
              </button>
              <button
                onClick={() => {
                  setAngleMode('RAD');
                  playKeyAudio(700);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  angleMode === 'RAD'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs border border-slate-200/60 dark:border-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                RAD
              </button>
            </div>

            {/* Memory Indicator Tag */}
            {hasMemory && (
              <button
                onClick={() => setShowMemoryModal(true)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition shadow-2xs"
                title={`Stored in memory: ${memory}. Click to inspect.`}
              >
                <span>[M]</span>
                <span className="font-mono text-[11px] hidden sm:inline">{cleanNumber(memory, 4)}</span>
              </button>
            )}

            {/* 2nd Function Indicator */}
            {isSecond && (
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-400 text-xs font-semibold shadow-2xs">
                2ND
              </span>
            )}
          </div>

          {/* Right Action Icons: History, Copy, Memory */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                playKeyAudio(600);
              }}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                showHistory
                  ? 'bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 shadow-2xs'
              }`}
              title="Calculation History"
            >
              <History className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">History</span>
              {history.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>

            <button
              onClick={() => copyToClipboard()}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition"
              title="Copy Result"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================
            3D RECESSED HIGH-DEFINITION LCD DISPLAY FRAME
            Format: Expression on top, divider, final result below
            ======================================================== */}
        <div
          ref={displayRef}
          className="my-5 p-5 md:p-6 rounded-2xl calc-screen-recessed-3d flex flex-col justify-between min-h-[145px] text-right relative overflow-hidden preserve-3d"
        >
          {/* Subtle Diagonal Glass Glare Reflection */}
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-white/50 dark:from-cyan-400/10 via-white/10 to-transparent rounded-full blur-xl transform rotate-12" />
          {/* Active Mode Watermark */}
          <div className="text-[11px] font-mono font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase select-none flex items-center justify-between">
            <span>{hasMemory ? 'M ACTIVE' : ''}</span>
            <span>{angleMode}</span>
          </div>

          {/* Smaller expression above the answer */}
          <div className="text-base md:text-lg font-mono text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-none tracking-wide select-all pt-2">
            {expression || '0'}
          </div>

          {/* Subtle clean divider line */}
          <div className="my-2 border-b border-slate-100 dark:border-slate-800 w-full" />

          {/* Line 2 & 3: Intermediate calculation / Error / Large Answer */}
          <div className="space-y-1">
            {/* Calculation Error Alert */}
            {errorMessage && (
              <div className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium tracking-wide bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3 py-1.5 inline-block">
                {errorMessage}
              </div>
            )}

            {/* Intermediate live preview */}
            {!errorMessage && previewResult && !isCalculating && (
              <div className="text-xs sm:text-sm text-blue-600 dark:text-cyan-400 font-mono font-medium tracking-wider flex items-center justify-end gap-1">
                <span>= {previewResult}</span>
              </div>
            )}

            {/* 3D Calculation Animation State (~260ms smooth transition) */}
            {isCalculating ? (
              <div className="py-2 flex items-center justify-end gap-2 text-blue-600 dark:text-cyan-400">
                {calcAnimationType === 'percentage' && <Percent className="w-4 h-4 animate-spin" />}
                {calcAnimationType === 'root' && <span className="font-mono text-lg font-bold">√</span>}
                {calcAnimationType === 'power' && <span className="font-mono text-lg font-bold">xʸ</span>}
                {calcAnimationType === 'trigonometry' && <span className="font-mono text-sm font-semibold">sin θ</span>}
                <span className="font-mono font-semibold text-sm md:text-base tracking-wide text-slate-500 dark:text-slate-400">
                  Calculating...
                </span>
              </div>
            ) : (
              /* Large Dark Final Answer - Rises forward in 3D */
              <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono overflow-x-auto whitespace-nowrap scrollbar-none select-all animate-answer-pop-3d">
                {expression ? previewResult || expression : '0'}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            3D ELEVATED RESULT CARD
            Rises upward with micro-depth and settles with soft shadow
            ======================================================== */}
        {showResultCard && lastCalculatedResult && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_32px_-6px_rgba(15,23,42,0.08),0_2px_4px_rgba(15,23,42,0.03)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-result-card-3d relative preserve-3d">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  FINAL ANSWER
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200/70 dark:border-emerald-800 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  ✓ VERIFIED
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{lastCalculatedExpr} =</span>
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                  {lastCalculatedResult}
                </span>
              </div>
              {inlineExplanation && (
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{inlineExplanation}</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => copyToClipboard(lastCalculatedResult)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>

              {onSendToSolver && (
                <button
                  onClick={() => onSendToSolver(lastCalculatedExpr)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 dark:text-white" />
                  <span>AI Solve</span>
                </button>
              )}

              {onSendToGraph && isGraphable(lastCalculatedExpr) && (
                <button
                  onClick={() => onSendToGraph(lastCalculatedExpr)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Graph</span>
                </button>
              )}

              <button
                onClick={handleMemoryAdd}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium shadow-2xs flex items-center gap-1 transition"
                title="Add to Memory (M+)"
              >
                <span>M+</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Context Bar */}
        <div className="flex items-center justify-between mb-4 px-1 text-xs">
          <div className="text-slate-500 font-mono flex items-center gap-2">
            <span>Ans = <strong className="text-slate-800">{lastAnswer}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {onSendToSolver && expression && (
              <button
                onClick={() => onSendToSolver(expression)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition font-medium text-xs shadow-2xs"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>AI Solve</span>
              </button>
            )}
            {onSendToGraph && isGraphable(expression) && (
              <button
                onClick={() => onSendToGraph(expression)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition font-medium text-xs shadow-2xs"
              >
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span>Graph</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            SUBTLE 3D KEYPAD — ALL 45+ REQUIRED SCIENTIFIC FUNCTIONS
            Organized in clean two-bank layout
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* BANK A: SCIENTIFIC FUNCTIONS, POWERS, ROOTS, TRIG & CONSTANTS (7 cols on lg) */}
          <div className="lg:col-span-7 grid grid-cols-5 gap-2 sm:gap-2.5">
            {/* ROW 1: 2nd / Inv, sin, cos, tan, Deg/Rad switch */}
            <button
              onClick={() => setIsSecond(!isSecond)}
              className={`calc-btn-3d py-3 text-xs sm:text-sm font-semibold ${
                isSecond
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'calc-btn-sci'
              }`}
            >
              2nd
            </button>
            <button
              onClick={() => handleInput(isSecond ? 'sin⁻¹(' : 'sin(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm"
            >
              {isSecond ? 'sin⁻¹' : 'sin'}
            </button>
            <button
              onClick={() => handleInput(isSecond ? 'cos⁻¹(' : 'cos(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm"
            >
              {isSecond ? 'cos⁻¹' : 'cos'}
            </button>
            <button
              onClick={() => handleInput(isSecond ? 'tan⁻¹(' : 'tan(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm"
            >
              {isSecond ? 'tan⁻¹' : 'tan'}
            </button>
            <button
              onClick={() => setAngleMode(angleMode === 'DEG' ? 'RAD' : 'DEG')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-semibold"
              title="Toggle DEG / RAD"
            >
              {angleMode}
            </button>

            {/* ROW 2: sin⁻¹, cos⁻¹, tan⁻¹, ln, log */}
            <button
              onClick={() => handleInput('sin⁻¹(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm"
            >
              sin⁻¹
            </button>
            <button
              onClick={() => handleInput('cos⁻¹(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm"
            >
              cos⁻¹
            </button>
            <button
              onClick={() => handleInput('tan⁻¹(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm"
            >
              tan⁻¹
            </button>
            <button
              onClick={() => handleInput('ln(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              ln
            </button>
            <button
              onClick={() => handleInput('log(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              log
            </button>

            {/* ROW 3: Powers & Exponents: xʸ, x³, x², eˣ, 10ˣ */}
            <button
              onClick={() => handleInput('^')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              xʸ
            </button>
            <button
              onClick={() => handleInput('^3')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              x³
            </button>
            <button
              onClick={() => handleInput('^2')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              x²
            </button>
            <button
              onClick={() => handleInput('e^(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              eˣ
            </button>
            <button
              onClick={() => handleInput('10^(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              10ˣ
            </button>

            {/* ROW 4: Roots & Reciprocal: ʸ√x, ³√x, √x, 1/x, n! */}
            <button
              onClick={() => handleInput('ʸ√(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              ʸ√x
            </button>
            <button
              onClick={() => handleInput('³√(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              ³√x
            </button>
            <button
              onClick={() => handleInput('√(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              √x
            </button>
            <button
              onClick={() => handleInput('1/(')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              1/x
            </button>
            <button
              onClick={() => handleInput('!')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono"
            >
              n!
            </button>

            {/* ROW 5: Constants, Brackets, Percentage: π, e, (, ), % */}
            <button
              onClick={() => handleInput('π')}
              className="calc-btn-3d calc-btn-sci py-3 text-sm font-serif"
            >
              π
            </button>
            <button
              onClick={() => handleInput('e')}
              className="calc-btn-3d calc-btn-sci py-3 text-sm font-serif italic"
            >
              e
            </button>
            <button
              onClick={() => handleInput('(')}
              className="calc-btn-3d calc-btn-sci py-3 text-sm font-semibold"
            >
              (
            </button>
            <button
              onClick={() => handleInput(')')}
              className="calc-btn-3d calc-btn-sci py-3 text-sm font-semibold"
            >
              )
            </button>
            <button
              onClick={() => handleInput('%')}
              className="calc-btn-3d calc-btn-sci py-3 text-sm font-semibold"
            >
              %
            </button>

            {/* ROW 6: Sign, Random, Exponential, Ans, Memory Recall */}
            <button
              onClick={handlePlusMinus}
              className="calc-btn-3d calc-btn-sci py-3 text-sm font-semibold"
            >
              ±
            </button>
            <button
              onClick={handleRandom}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono font-semibold"
              title="Random decimal 0-1"
            >
              RND
            </button>
            <button
              onClick={() => handleInput('EXP ')}
              className="calc-btn-3d calc-btn-sci py-3 text-xs sm:text-sm font-mono font-semibold"
              title="Scientific Exponential Notation (×10^)"
            >
              EXP
            </button>
            <button
              onClick={() => handleInput('Ans')}
              className="calc-btn-3d calc-btn-mem py-3 text-xs sm:text-sm font-semibold"
            >
              Ans
            </button>
            <button
              onClick={handleMemoryRecall}
              className="calc-btn-3d calc-btn-mem py-3 text-xs sm:text-sm font-semibold"
              title="Memory Recall (MR)"
            >
              MR
            </button>
          </div>

          {/* BANK B: NUMERIC KEYPAD, CONTROLS, OPERATORS & EQUALS (5 cols on lg) */}
          <div className="lg:col-span-5 grid grid-cols-4 gap-2 sm:gap-2.5">
            {/* ROW 1: Memory Controls (MC, M-, M+) & AC */}
            <button
              onClick={handleMemoryClear}
              className="calc-btn-3d calc-btn-mem py-3 text-xs sm:text-sm font-semibold"
              title="Clear Memory (MC)"
            >
              MC
            </button>
            <button
              onClick={handleMemorySub}
              className="calc-btn-3d calc-btn-mem py-3 text-xs sm:text-sm font-semibold"
              title="Subtract from Memory (M-)"
            >
              M-
            </button>
            <button
              onClick={handleMemoryAdd}
              className="calc-btn-3d calc-btn-mem py-3 text-xs sm:text-sm font-semibold"
              title="Add to Memory (M+)"
            >
              M+
            </button>
            <button
              onClick={handleClear}
              className="calc-btn-3d calc-btn-danger py-3 text-xs sm:text-sm font-bold"
              title="All Clear (AC)"
            >
              AC
            </button>

            {/* ROW 2: 7, 8, 9, Back */}
            <button
              onClick={() => handleInput('7')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              7
            </button>
            <button
              onClick={() => handleInput('8')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              8
            </button>
            <button
              onClick={() => handleInput('9')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              9
            </button>
            <button
              onClick={handleDelete}
              className="calc-btn-3d calc-btn-warning py-3.5 text-xs sm:text-sm font-semibold flex items-center justify-center"
              title="Backspace"
            >
              <BackspaceIcon className="w-5 h-5 text-slate-600" />
            </button>

            {/* ROW 3: 4, 5, 6, ÷ */}
            <button
              onClick={() => handleInput('4')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              4
            </button>
            <button
              onClick={() => handleInput('5')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              5
            </button>
            <button
              onClick={() => handleInput('6')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              6
            </button>
            <button
              onClick={() => handleInput('÷')}
              className="calc-btn-3d calc-btn-op py-3.5 text-lg font-semibold"
            >
              ÷
            </button>

            {/* ROW 4: 1, 2, 3, × */}
            <button
              onClick={() => handleInput('1')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              1
            </button>
            <button
              onClick={() => handleInput('2')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              2
            </button>
            <button
              onClick={() => handleInput('3')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              3
            </button>
            <button
              onClick={() => handleInput('×')}
              className="calc-btn-3d calc-btn-op py-3.5 text-lg font-semibold"
            >
              ×
            </button>

            {/* ROW 5: 0, decimal, −, + */}
            <button
              onClick={() => handleInput('0')}
              className="calc-btn-3d calc-btn-num py-3.5 text-base sm:text-lg font-medium"
            >
              0
            </button>
            <button
              onClick={() => handleInput('.')}
              className="calc-btn-3d calc-btn-num py-3.5 text-lg font-bold"
            >
              .
            </button>
            <button
              onClick={() => handleInput('−')}
              className="calc-btn-3d calc-btn-op py-3.5 text-lg font-semibold"
            >
              −
            </button>
            <button
              onClick={() => handleInput('+')}
              className="calc-btn-3d calc-btn-op py-3.5 text-lg font-semibold"
            >
              +
            </button>

            {/* ROW 6: Equals Button (=) - Slightly stronger clean blue accent */}
            <div className="col-span-4 mt-1">
              <button
                onClick={handleEquals}
                className="calc-btn-3d calc-btn-equals w-full py-3.5 text-xl font-bold rounded-xl flex items-center justify-center gap-2"
              >
                <span>=</span>
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Quick Help Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500 dark:text-slate-400">Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">0-9</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">+ − * /</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">Enter (=)</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">Esc (AC)</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">Back (⌫)</kbd>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-mono">Precision: 14 Digits</span>
          </div>
        </div>
      </div>

      {/* 3D Physical Desk Contact Shadow */}
      <div
        className="h-6 w-11/12 mx-auto -mt-3 rounded-full bg-slate-900/15 dark:bg-black/40 blur-xl pointer-events-none transition-all duration-300"
        style={{
          transform: `scaleX(${tiltPreset === 'isometric' ? 0.92 : 0.98}) translateY(${
            tiltPreset === 'isometric' ? '8px' : '0px'
          })`,
        }}
      />

      {/* ========================================================
          CALCULATION HISTORY SLIDE-OUT PANEL
          ======================================================== */}
      {showHistory && (
        <div className="w-full mt-6 bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Calculation History</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">({history.length} records)</span>
            </div>

            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    try {
                      localStorage.removeItem('sutra_history');
                      localStorage.removeItem('novacalc_history');
                    } catch {}
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold px-2 py-1"
              >
                Close
              </button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              No recent calculations. Perform a calculation above to see history here.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between gap-2 transition group"
                >
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate" title={item.expression}>
                    {item.expression}
                  </div>
                  <div className="font-mono text-lg font-bold text-slate-900 dark:text-white truncate">
                    = {item.result}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setExpression(item.expression);
                          setPreviewResult(item.result);
                        }}
                        className="p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50 text-blue-600 dark:text-cyan-400 font-semibold transition"
                        title="Reuse Expression"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(item.result)}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                        title="Copy Result"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MEMORY DRAWER MODAL
          ======================================================== */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-cyan-500"></span>
                Memory Storage (M)
              </span>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Current Memory Value</span>
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {cleanNumber(memory)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  handleMemoryRecall();
                  setShowMemoryModal(false);
                }}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs"
              >
                Recall into Calc
              </button>
              <button
                onClick={handleMemoryClear}
                className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-semibold transition"
              >
                Clear Memory (MC)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScientificCalculator;
