'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GraphFunction, GraphAnalysis } from '@/types/calculator';
import { compileGraphFunction, numericalDerivative } from '@/lib/math-engine';
import { generateGraphExplanation } from '@/lib/solver-engine';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Download,
  Crosshair,
  Table as TableIcon,
  Sparkles,
} from 'lucide-react';

interface GraphingCalculatorProps {
  initialEquation?: string;
}

const DEFAULT_COLORS = ['#06b6d4', '#818cf8', '#34d399', '#f59e0b', '#f43f5e', '#a855f7'];

export const GraphingCalculator: React.FC<GraphingCalculatorProps> = ({
  initialEquation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Function List
  const [functions, setFunctions] = useState<GraphFunction[]>([
    {
      id: 'fn-1',
      expression: initialEquation || 'x^2 - 4',
      color: '#06b6d4',
      visible: true,
    },
    {
      id: 'fn-2',
      expression: '2*x - 1',
      color: '#818cf8',
      visible: false,
    },
  ]);

  const [newExpr, setNewExpr] = useState<string>('');

  // View bounds
  const [xMin, setXMin] = useState<number>(-8);
  const [xMax, setXMax] = useState<number>(8);
  const [yMin, setYMin] = useState<number>(-6);
  const [yMax, setYMax] = useState<number>(6);

  // Interaction Modes
  const [traceMode, setTraceMode] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [activeFunctionId, setActiveFunctionId] = useState<string>('fn-1');
  const [traceCoords, setTraceCoords] = useState<{ x: number; y: number; slope: number | null } | null>(null);
  const [plotProgress, setPlotProgress] = useState<number>(1);
  const animFrameRef = useRef<number | null>(null);

  // Smooth progressive curve drawing animation
  const animatePlot = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlotProgress(1);
      return;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    const start = performance.now();
    const duration = 280;

    const frame = (time: number) => {
      const elapsed = time - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - progress) * (1 - progress);
      setPlotProgress(eased);
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(frame);
      }
    };
    setPlotProgress(0);
    animFrameRef.current = requestAnimationFrame(frame);
  }, []);

  // Panning state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update initial equation when prop changes
  useEffect(() => {
    if (initialEquation) {
      setFunctions((prev) => [
        {
          id: Math.random().toString(36).substring(2, 9),
          expression: initialEquation,
          color: DEFAULT_COLORS[prev.length % DEFAULT_COLORS.length],
          visible: true,
        },
        ...prev.map((f) => ({ ...f, visible: false })),
      ]);
      animatePlot();
    }
  }, [initialEquation, animatePlot]);

  // Compiled functions cache
  const compiledFns = useRef<Map<string, (x: number) => number | null>>(new Map());

  // Canvas Drawing Engine
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Coordinate conversion helpers
    const toScreenX = (x: number, width: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number, height: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (px: number, width: number) => xMin + (px / width) * (xMax - xMin);

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#ffffff'; // Crisp engineering white
    ctx.fillRect(0, 0, width, height);

    // Calculate grid spacing
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    let gridStepX = 1;
    if (xRange > 50) gridStepX = 10;
    else if (xRange > 20) gridStepX = 5;
    else if (xRange > 10) gridStepX = 2;
    else if (xRange < 4) gridStepX = 0.5;

    let gridStepY = 1;
    if (yRange > 50) gridStepY = 10;
    else if (yRange > 20) gridStepY = 5;
    else if (yRange > 10) gridStepY = 2;
    else if (yRange < 4) gridStepY = 0.5;

    // Draw Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f1f5f9'; // Slate-100 grid
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';

    // Vertical grid lines
    const startX = Math.ceil(xMin / gridStepX) * gridStepX;
    for (let x = startX; x <= xMax; x += gridStepX) {
      const sx = toScreenX(x, width);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      if (Math.abs(x) > 1e-6) {
        ctx.fillText(x.toFixed(x % 1 === 0 ? 0 : 1), sx + 3, toScreenY(0, height) + 12);
      }
    }

    // Horizontal grid lines
    const startY = Math.ceil(yMin / gridStepY) * gridStepY;
    for (let y = startY; y <= yMax; y += gridStepY) {
      const sy = toScreenY(y, height);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      if (Math.abs(y) > 1e-6) {
        ctx.fillText(y.toFixed(y % 1 === 0 ? 0 : 1), toScreenX(0, width) + 4, sy - 3);
      }
    }

    // Main Axes X and Y
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#94a3b8'; // Slate-400 axis line

    // X Axis
    const originY = toScreenY(0, height);
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();

    // Y Axis
    const originX = toScreenX(0, width);
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Plot Each Visible Function
    functions.forEach((fn) => {
      if (!fn.visible) return;
      const f = compiledFns.current.get(fn.id);
      if (!f) return;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = fn.color;
      ctx.beginPath();

      let isDrawing = false;
      const pxStep = 1; // 1 pixel step for ultra-crisp resolution
      const maxPx = width * plotProgress;

      for (let px = 0; px <= maxPx; px += pxStep) {
        const mathX = toMathX(px, width);
        const mathY = f(mathX);

        if (mathY !== null && isFinite(mathY) && !isNaN(mathY)) {
          const py = toScreenY(mathY, height);
          // Clamp bounds to prevent canvas overflow artifacts
          if (py >= -100 && py <= height + 100) {
            if (!isDrawing) {
              ctx.moveTo(px, py);
              isDrawing = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            isDrawing = false;
          }
        } else {
          isDrawing = false;
        }
      }
      ctx.stroke();
    });

    // Draw Trace Point if available
    if (traceCoords) {
      const sx = toScreenX(traceCoords.x, width);
      const sy = toScreenY(traceCoords.y, height);

      // Outer halo
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.fill();

      // Inner dot
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tangent slope indicator line
      if (traceCoords.slope !== null && isFinite(traceCoords.slope)) {
        const dx = 25;
        const dy = -traceCoords.slope * (dx / ((xMax - xMin) / (yMax - yMin)));
        ctx.beginPath();
        ctx.moveTo(sx - dx, sy - dy);
        ctx.lineTo(sx + dx, sy + dy);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }, [functions, xMin, xMax, yMin, yMax, traceCoords, plotProgress]);

  useEffect(() => {
    compiledFns.current.clear();
    functions.forEach((fn) => {
      if (fn.visible && fn.expression.trim()) {
        compiledFns.current.set(fn.id, compileGraphFunction(fn.expression));
      }
    });
    drawGraph();
  }, [functions, xMin, xMax, yMin, yMax, drawGraph]);

  // Handle Mouse Events for Pan & Trace
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mousePxX = e.clientX - rect.left;

    if (isDraggingRef.current) {
      const deltaPxX = e.clientX - dragStartRef.current.x;
      const deltaPxY = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };

      const mathDeltaX = (deltaPxX / canvas.clientWidth) * (xMax - xMin);
      const mathDeltaY = (deltaPxY / canvas.clientHeight) * (yMax - yMin);

      setXMin((prev) => prev - mathDeltaX);
      setXMax((prev) => prev - mathDeltaX);
      setYMin((prev) => prev + mathDeltaY);
      setYMax((prev) => prev + mathDeltaY);
    } else if (traceMode) {
      // Find coordinates on active or first visible function
      const activeFn = functions.find((f) => f.id === activeFunctionId && f.visible) || functions.find((f) => f.visible);
      if (activeFn) {
        const f = compiledFns.current.get(activeFn.id);
        if (f) {
          const mx = xMin + (mousePxX / canvas.clientWidth) * (xMax - xMin);
          const my = f(mx);
          if (my !== null) {
            const slope = numericalDerivative(f, mx);
            setTraceCoords({ x: mx, y: my, slope });
          } else {
            setTraceCoords(null);
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.85 : 1.15;
    zoom(factor);
  };

  const zoom = (factor: number) => {
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;
    const xHalf = ((xMax - xMin) * factor) / 2;
    const yHalf = ((yMax - yMin) * factor) / 2;

    setXMin(xCenter - xHalf);
    setXMax(xCenter + xHalf);
    setYMin(yCenter - yHalf);
    setYMax(yCenter + yHalf);
  };

  const resetView = () => {
    setXMin(-8);
    setXMax(8);
    setYMin(-6);
    setYMax(6);
    setTraceCoords(null);
  };

  const handleAddFunction = () => {
    if (!newExpr.trim()) return;
    const newFn: GraphFunction = {
      id: Math.random().toString(36).substring(2, 9),
      expression: newExpr.trim(),
      color: DEFAULT_COLORS[functions.length % DEFAULT_COLORS.length],
      visible: true,
    };
    setFunctions([...functions, newFn]);
    setActiveFunctionId(newFn.id);
    setNewExpr('');
    animatePlot();
  };

  const handleDeleteFunction = (id: string) => {
    setFunctions(functions.filter((f) => f.id !== id));
  };

  const handleToggleVisible = (id: string) => {
    setFunctions(
      functions.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f))
    );
    animatePlot();
  };

  // Export graph as PNG image
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `sutra-graph-${Date.now()}.png`;
    a.click();
  };

  // Get current active function analysis for "What does this graph mean?"
  const activeFnObj = functions.find((f) => f.id === activeFunctionId) || functions[0];
  const graphAnalysis: GraphAnalysis = generateGraphExplanation(activeFnObj?.expression || 'x^2 - 4');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Controls & Status Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 md:p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs">
            <Crosshair className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight">Interactive Graphing Engine</h2>
            <p className="text-xs text-slate-500">Multi-function plotting, root finding, trace analysis & AI graph reasoning</p>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => zoom(0.8)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoom(1.25)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Reset Origin"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTraceMode(!traceMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              traceMode
                ? 'bg-sky-50 text-sky-800 border border-sky-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Trace Mode</span>
          </button>
          <button
            onClick={() => setShowTable(!showTable)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              showTable
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table of Values</span>
          </button>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              showExplanation
                ? 'bg-cyan-50 text-cyan-800 border border-cyan-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Analysis</span>
          </button>
          <button
            onClick={handleExportPNG}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
            title="Export Graph as PNG Image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Graph Grid & Equation Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Interactive Canvas */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.03)] relative flex flex-col preserve-3d animate-entrance-calc">
          {/* Canvas Box */}
          <div className="relative w-full h-[420px] md:h-[500px] cursor-crosshair">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className="w-full h-full block"
            />

            {/* Trace HUD Overlay (Elevated 3D Information Card - Section 12) */}
            {traceCoords && (
              <div className="absolute top-4 left-4 bg-white/95 border border-slate-200/90 rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(15,23,42,0.1)] backdrop-blur-md text-xs font-mono space-y-1 transform -translate-y-2 transition-all preserve-3d">
                <div className="text-blue-600 font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>3D Trace Point</span>
                </div>
                <div className="text-slate-700">
                  x = <span className="font-extrabold text-slate-900">{traceCoords.x.toFixed(3)}</span>
                </div>
                <div className="text-slate-700">
                  y = <span className="font-extrabold text-blue-600">{traceCoords.y.toFixed(3)}</span>
                </div>
                {traceCoords.slope !== null && (
                  <div className="text-slate-500 pt-1 border-t border-slate-100 text-[11px]">
                    Tangent Slope (dy/dx) = <span className="text-indigo-600 font-bold">{traceCoords.slope.toFixed(3)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Quick Range Indicators */}
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-600 bg-white/90 px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
              x: [{xMin.toFixed(1)}, {xMax.toFixed(1)}] | y: [{yMin.toFixed(1)}, {yMax.toFixed(1)}]
            </div>
          </div>
        </div>

        {/* Right Column: Equation Editor & Function Manager */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Functions to Plot</h3>

            {/* Add Function Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-700 font-bold">y =</span>
              <input
                type="text"
                value={newExpr}
                onChange={(e) => setNewExpr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFunction()}
                placeholder="e.g. x^3 - 4*x or sin(x)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-600 shadow-inner"
              />
              <button
                onClick={handleAddFunction}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition shadow-sm"
                title="Add function"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Function List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {functions.map((fn) => (
                <div
                  key={fn.id}
                  onClick={() => setActiveFunctionId(fn.id)}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    activeFunctionId === fn.id
                      ? 'bg-sky-50/60 border-sky-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: fn.color }}
                    />
                    <span className="text-xs font-mono font-semibold text-slate-900">
                      y = {fn.expression}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisible(fn.id);
                      }}
                      className="p-1 text-slate-500 hover:text-slate-800"
                    >
                      {fn.visible ? <Eye className="w-3.5 h-3.5 text-cyan-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    {functions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFunction(fn.id);
                        }}
                        className="p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Sample Presets */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold">Quick curves:</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['x^2 - 4', 'sin(x)', 'x^3 - 4*x', '2*x + 5', '1/x'].map((eq) => (
                  <button
                    key={eq}
                    onClick={() => {
                      setFunctions([
                        {
                          id: Math.random().toString(36).substring(2, 9),
                          expression: eq,
                          color: '#06b6d4',
                          visible: true,
                        },
                      ]);
                      resetView();
                    }}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:text-cyan-800 hover:bg-slate-200 border border-slate-200 transition"
                  >
                    y = {eq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table of Values (Collapsible) */}
      {showTable && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-cyan-600" />
              <span>Table of Values for y = {activeFnObj?.expression}</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">Step Δx = 1</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 my-4">
            {[-4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((valX) => {
              const f = compiledFns.current.get(activeFnObj?.id || '');
              const valY = f ? f(valX) : null;
              return (
                <div key={valX} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-[11px] font-mono text-slate-500">x = {valX}</div>
                  <div className="text-xs font-mono font-bold text-cyan-700 mt-0.5">
                    y = {valY !== null ? valY.toFixed(2) : 'undef'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 5: AI GRAPH EXPLANATION ("What does this graph mean?") */}
      {showExplanation && graphAnalysis && (
        <div className="bg-white border border-sky-200 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  What Does This Graph Mean? (AI Graph Explanation)
                </h3>
                <p className="text-xs text-slate-500">
                  Direct mathematical and conceptual analysis of y = {graphAnalysis.expression}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Shape & Geometric Nature */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">1. Shape & Curve Nature</span>
              <p className="text-sm font-bold text-slate-900 mt-1">{graphAnalysis.shape}</p>
              <p className="text-xs text-slate-500">
                Opening direction: <span className="text-slate-800 font-semibold capitalize">{graphAnalysis.openingDirection}</span>
              </p>
            </div>

            {/* Roots / X-Intercepts */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">2. Roots & X-Intercepts</span>
              <div className="text-sm font-mono font-bold text-emerald-700 mt-1">
                {graphAnalysis.xIntercepts.length > 0
                  ? graphAnalysis.xIntercepts.map((r) => `x = ${r}`).join(', ')
                  : 'No real x-intercepts'}
              </div>
              <p className="text-xs text-slate-500">Points where the curve intersects the horizontal axis (y = 0).</p>
            </div>

            {/* Y-Intercept */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">3. Y-Intercept</span>
              <div className="text-sm font-mono font-bold text-indigo-700 mt-1">
                {graphAnalysis.yIntercept !== null ? `(0, ${graphAnalysis.yIntercept.toFixed(2)})` : 'None'}
              </div>
              <p className="text-xs text-slate-500">The value of the function when independent variable x = 0.</p>
            </div>

            {/* Extrema & Vertex */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">4. Extrema & Vertex</span>
              <div className="text-xs font-mono text-slate-800 mt-1 space-y-0.5">
                {graphAnalysis.extrema.length > 0 ? (
                  graphAnalysis.extrema.map((e, idx) => (
                    <div key={idx}>
                      <span className="capitalize font-bold text-amber-700">{e.type}</span>: ({e.x}, {e.y})
                    </div>
                  ))
                ) : (
                  <span className="text-slate-500">No localized finite extrema.</span>
                )}
              </div>
            </div>

            {/* Monotonicity & Behavior */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">5. Increasing / Decreasing</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{graphAnalysis.monotonicity}</p>
            </div>

            {/* Practical & Physical Meaning */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">6. Physical & Real-World Meaning</span>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">{graphAnalysis.physicalMeaning}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphingCalculator;
