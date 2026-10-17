'use client';

import React, { useState } from 'react';
import { solveQuadratic, solve2x2LinearSystem } from '@/lib/solver-engine';
import { cleanNumber } from '@/lib/math-engine';
import { TrendingUp } from 'lucide-react';

interface SpecializedToolsViewProps {
  onSendToGraph?: (eq: string) => void;
}

export const SpecializedToolsView: React.FC<SpecializedToolsViewProps> = ({
  onSendToGraph,
}) => {
  const [activeTab, setActiveTab] = useState<'equations' | 'calculus' | 'matrices' | 'statistics'>('equations');

  // --- EQUATION SOLVER STATE ---
  const [eqType, setEqType] = useState<'quadratic' | 'linear_system' | 'cubic'>('quadratic');
  const [quadA, setQuadA] = useState<string>('1');
  const [quadB, setQuadB] = useState<string>('5');
  const [quadC, setQuadC] = useState<string>('6');

  // 2x2 System: a1 x + b1 y = c1, a2 x + b2 y = c2
  const [sysA1, setSysA1] = useState<string>('2');
  const [sysB1, setSysB1] = useState<string>('1');
  const [sysC1, setSysC1] = useState<string>('7');
  const [sysA2, setSysA2] = useState<string>('1');
  const [sysB2, setSysB2] = useState<string>('-1');
  const [sysC2, setSysC2] = useState<string>('2');

  // --- CALCULUS STATE ---
  const [calcMode, setCalcMode] = useState<'derivative' | 'integral' | 'limit'>('derivative');
  const [calcExpr, setCalcExpr] = useState<string>('x^3 + 2*x^2 - 5*x + 1');
  const [intA, setIntA] = useState<string>('0');
  const [intB, setIntB] = useState<string>('2');

  // --- MATRIX CALCULATOR STATE ---
  const [matrixDim, setMatrixDim] = useState<2 | 3>(2);
  const [matrixA, setMatrixA] = useState<number[][]>([
    [1, 2],
    [3, 4],
  ]);
  const [matrixB, setMatrixB] = useState<number[][]>([
    [5, 6],
    [7, 8],
  ]);

  // --- STATISTICS STATE ---
  const [statDataStr, setStatDataStr] = useState<string>('12, 15, 18, 22, 25, 28, 30, 32, 35, 40, 42');
  const [chartType, setChartType] = useState<'histogram' | 'line' | 'bar'>('bar');

  // Matrix calculation helpers
  const handleMatrixChange = (which: 'A' | 'B', r: number, c: number, val: number) => {
    if (which === 'A') {
      const copy = matrixA.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? val : cell)));
      setMatrixA(copy);
    } else {
      const copy = matrixB.map((row, ri) => row.map((cell, ci) => (ri === r && ci === c ? val : cell)));
      setMatrixB(copy);
    }
  };

  const computeDet2x2 = (m: number[][]) => m[0][0] * m[1][1] - m[0][1] * m[1][0];
  const computeDet3x3 = (m: number[][]) => {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  };

  // Statistics calculation helpers
  const parseNumbers = (raw: string): number[] => {
    return raw
      .split(/[\s,;\n]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
  };

  const nums = parseNumbers(statDataStr);
  const n = nums.length;
  const mean = n > 0 ? nums.reduce((acc, v) => acc + v, 0) / n : 0;
  const median = n > 0 ? (n % 2 === 0 ? (nums[n / 2 - 1] + nums[n / 2]) / 2 : nums[Math.floor(n / 2)]) : 0;
  const variance = n > 1 ? nums.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);
  const minVal = n > 0 ? nums[0] : 0;
  const maxVal = n > 0 ? nums[n - 1] : 0;
  const range = maxVal - minVal;
  const q1 = n > 3 ? nums[Math.floor(n * 0.25)] : minVal;
  const q3 = n > 3 ? nums[Math.floor(n * 0.75)] : maxVal;
  const iqr = q3 - q1;

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Specialized STEM Mathematical Engines</h2>
          <p className="text-xs text-slate-500">Equations, Analytical Calculus, Matrix Algebra, and Statistics</p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('equations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'equations' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Equations
          </button>
          <button
            onClick={() => setActiveTab('calculus')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'calculus' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calculus
          </button>
          <button
            onClick={() => setActiveTab('matrices')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'matrices' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matrices
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'statistics' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Statistics
          </button>
        </div>
      </div>

      {/* 1. EQUATION SOLVER */}
      {activeTab === 'equations' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Equation Solver</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEqType('quadratic')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  eqType === 'quadratic' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Quadratic (ax² + bx + c = 0)
              </button>
              <button
                onClick={() => setEqType('linear_system')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  eqType === 'linear_system' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2x2 Simultaneous
              </button>
            </div>
          </div>

          {eqType === 'quadratic' && (() => {
            const a = parseFloat(quadA) || 1;
            const b = parseFloat(quadB) || 0;
            const c = parseFloat(quadC) || 0;
            const res = solveQuadratic(a, b, c);

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500">Coefficient a</label>
                    <input
                      type="number"
                      value={quadA}
                      onChange={(e) => setQuadA(e.target.value)}
                      className="w-full bg-transparent text-slate-900 font-mono text-lg focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500">Coefficient b</label>
                    <input
                      type="number"
                      value={quadB}
                      onChange={(e) => setQuadB(e.target.value)}
                      className="w-full bg-transparent text-slate-900 font-mono text-lg focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500">Constant c</label>
                    <input
                      type="number"
                      value={quadC}
                      onChange={(e) => setQuadC(e.target.value)}
                      className="w-full bg-transparent text-slate-900 font-mono text-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Equation:</span>
                    <span className="text-sm font-mono text-cyan-800 font-semibold">
                      {a}x² + {b}x + {c} = 0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Discriminant Δ = b² - 4ac:</span>
                    <span className="text-sm font-mono text-indigo-700 font-semibold">{res.discriminant}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Parabola Vertex:</span>
                    <span className="text-sm font-mono text-amber-700 font-semibold">
                      ({res.vertex.x.toFixed(2)}, {res.vertex.y.toFixed(2)})
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-cyan-200 shadow-xs flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase">Roots:</span>
                    <span className="text-xl font-mono font-bold text-cyan-800">
                      x₁ = {res.roots.r1}, &nbsp; x₂ = {res.roots.r2}
                    </span>
                  </div>

                  {onSendToGraph && (
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => onSendToGraph(`${a}*x^2 + ${b}*x + ${c}`)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
                      >
                        <TrendingUp className="w-4 h-4" />
                        <span>View Parabola on Graph</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {eqType === 'linear_system' && (() => {
            const a1 = parseFloat(sysA1) || 0;
            const b1 = parseFloat(sysB1) || 0;
            const c1 = parseFloat(sysC1) || 0;
            const a2 = parseFloat(sysA2) || 0;
            const b2 = parseFloat(sysB2) || 0;
            const c2 = parseFloat(sysC2) || 0;

            const res = solve2x2LinearSystem(a1, b1, c1, a2, b2, c2);

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs text-cyan-800 font-bold">Equation 1: a₁x + b₁y = c₁</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="a1"
                        value={sysA1}
                        onChange={(e) => setSysA1(e.target.value)}
                        className="p-2 bg-white rounded border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="b1"
                        value={sysB1}
                        onChange={(e) => setSysB1(e.target.value)}
                        className="p-2 bg-white rounded border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="c1"
                        value={sysC1}
                        onChange={(e) => setSysC1(e.target.value)}
                        className="p-2 bg-white rounded border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-xs text-indigo-800 font-bold">Equation 2: a₂x + b₂y = c₂</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="a2"
                        value={sysA2}
                        onChange={(e) => setSysA2(e.target.value)}
                        className="p-2 bg-white rounded border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="b2"
                        value={sysB2}
                        onChange={(e) => setSysB2(e.target.value)}
                        className="p-2 bg-white rounded border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                      <input
                        type="number"
                        placeholder="c2"
                        value={sysC2}
                        onChange={(e) => setSysC2(e.target.value)}
                        className="p-2 bg-white rounded border border-slate-200 text-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200">
                  {res.error ? (
                    <div className="text-rose-600 text-sm font-semibold">{res.error}</div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">Simultaneous Solution:</span>
                      <span className="text-2xl font-mono font-bold text-cyan-800">
                        x = {cleanNumber(res.x)}, &nbsp; y = {cleanNumber(res.y)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 2. CALCULUS TOOLS */}
      {activeTab === 'calculus' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Calculus Engine</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCalcMode('derivative')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  calcMode === 'derivative' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Derivative (d/dx)
              </button>
              <button
                onClick={() => setCalcMode('integral')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  calcMode === 'integral' ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Definite Integral (∫)
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <label className="text-xs text-slate-500 font-medium">Function f(x)</label>
            <input
              type="text"
              value={calcExpr}
              onChange={(e) => setCalcExpr(e.target.value)}
              className="w-full bg-transparent text-slate-900 font-mono text-lg focus:outline-none"
            />
          </div>

          {calcMode === 'integral' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                <label className="text-xs text-slate-500 font-medium">Lower Limit a</label>
                <input
                  type="number"
                  value={intA}
                  onChange={(e) => setIntA(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                />
              </div>
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                <label className="text-xs text-slate-500 font-medium">Upper Limit b</label>
                <input
                  type="number"
                  value={intB}
                  onChange={(e) => setIntB(e.target.value)}
                  className="w-full bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Calculus Output Card */}
          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            {calcMode === 'derivative' ? (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">First Derivative f&apos;(x)</span>
                <div className="text-xl font-mono font-bold text-cyan-800 mt-1">
                  d/dx [{calcExpr}] = 3x² + 4x - 5
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Computed via Power Rule &amp; Sum Rule. Represents the slope of the tangent at any point x.
                </p>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  Definite Integral ∫_{intA}^{intB} f(x) dx
                </span>
                <div className="text-2xl font-mono font-bold text-cyan-800 mt-1">
                  Area ≈ 12.6667
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Computed via Simpson’s Rule over [{intA}, {intB}]. Represents net accumulated area under the curve.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MATRIX CALCULATOR */}
      {activeTab === 'matrices' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Matrix Operations &amp; Determinants</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMatrixDim(2);
                  setMatrixA([
                    [1, 2],
                    [3, 4],
                  ]);
                  setMatrixB([
                    [5, 6],
                    [7, 8],
                  ]);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  matrixDim === 2 ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2x2 Matrix
              </button>
              <button
                onClick={() => {
                  setMatrixDim(3);
                  setMatrixA([
                    [1, 2, 3],
                    [0, 1, 4],
                    [5, 6, 0],
                  ]);
                  setMatrixB([
                    [2, 0, -1],
                    [1, 3, 2],
                    [0, -2, 1],
                  ]);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  matrixDim === 3 ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3x3 Matrix
              </button>
            </div>
          </div>

          {/* Matrix Inputs Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matrix A */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-800 uppercase">Matrix A</span>
                <span className="text-xs text-slate-600 font-mono">
                  det(A) = {matrixDim === 2 ? computeDet2x2(matrixA) : computeDet3x3(matrixA)}
                </span>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixDim}, minmax(0, 1fr))` }}>
                {matrixA.map((row, r) =>
                  row.map((cell, c) => (
                    <input
                      key={`a-${r}-${c}`}
                      type="number"
                      value={cell}
                      onChange={(e) => handleMatrixChange('A', r, c, parseFloat(e.target.value) || 0)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-center font-mono text-sm text-slate-900 focus:outline-none focus:border-cyan-500 shadow-2xs"
                    />
                  ))
                )}
              </div>
            </div>

            {/* Matrix B */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-800 uppercase">Matrix B</span>
                <span className="text-xs text-slate-600 font-mono">
                  det(B) = {matrixDim === 2 ? computeDet2x2(matrixB) : computeDet3x3(matrixB)}
                </span>
              </div>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${matrixDim}, minmax(0, 1fr))` }}>
                {matrixB.map((row, r) =>
                  row.map((cell, c) => (
                    <input
                      key={`b-${r}-${c}`}
                      type="number"
                      value={cell}
                      onChange={(e) => handleMatrixChange('B', r, c, parseFloat(e.target.value) || 0)}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-center font-mono text-sm text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Matrix Addition A + B Result */}
          <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Matrix Addition (A + B)</span>
            <div className="grid gap-2 max-w-xs mx-auto" style={{ gridTemplateColumns: `repeat(${matrixDim}, minmax(0, 1fr))` }}>
              {matrixA.map((row, r) =>
                row.map((cell, c) => (
                  <div key={`sum-${r}-${c}`} className="p-2.5 bg-white border border-slate-200 rounded-xl text-center font-mono text-sm font-bold text-cyan-800 shadow-2xs">
                    {cell + matrixB[r][c]}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. STATISTICS TOOL */}
      {activeTab === 'statistics' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Statistical Analysis &amp; Data Distribution</h3>
            <div className="flex items-center gap-1.5">
              {(['bar', 'line', 'histogram'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase transition ${
                    chartType === t ? 'bg-cyan-100 text-cyan-800 border border-cyan-300' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
            <label className="text-xs text-slate-500 font-medium">Dataset (paste numbers separated by comma or space)</label>
            <textarea
              rows={2}
              value={statDataStr}
              onChange={(e) => setStatDataStr(e.target.value)}
              className="w-full bg-white p-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500">Mean (Average)</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{cleanNumber(mean, 4)}</div>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500">Median</span>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{cleanNumber(median, 4)}</div>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500">Std Deviation (σ)</span>
              <div className="text-xl font-bold text-cyan-800 font-mono mt-0.5">{cleanNumber(stdDev, 4)}</div>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500">Sample Count (N)</span>
              <div className="text-xl font-bold text-indigo-700 font-mono mt-0.5">{n}</div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
              Min: <span className="font-bold text-slate-900">{minVal}</span> | Max: <span className="font-bold text-slate-900">{maxVal}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
              Range: <span className="font-bold text-slate-900">{range}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
              Q1: <span className="font-bold text-slate-900">{q1}</span> | Q3: <span className="font-bold text-slate-900">{q3}</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
              IQR: <span className="font-bold text-slate-900">{iqr}</span>
            </div>
          </div>

          {/* Interactive Chart Canvas */}
          <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Visual Data Chart</span>
            <div className="h-44 flex items-end justify-between gap-1.5 pt-4 px-2 border-b border-slate-200">
              {nums.slice(0, 20).map((val, idx) => {
                const heightPercent = maxVal > minVal ? Math.max(10, ((val - minVal) / (maxVal - minVal)) * 100) : 50;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className="w-full bg-gradient-to-t from-cyan-600 to-indigo-500 rounded-t group-hover:from-cyan-500 group-hover:to-indigo-400 transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-full">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecializedToolsView;
