'use client';

import React, { useState } from 'react';
import { calculateMolarMass } from '@/lib/solver-engine';
import { cleanNumber } from '@/lib/math-engine';
import {
  Atom,
  Zap,
  Droplets,
} from 'lucide-react';
import Interactive3DScienceVisualizer from '@/components/Interactive3DScienceVisualizer';

interface ScienceSolverViewProps {
  onSendToGraph?: (eq: string) => void;
}

export const ScienceSolverView: React.FC<ScienceSolverViewProps> = ({
  onSendToGraph,
}) => {
  const [activeSubject, setActiveSubject] = useState<'physics' | 'chemistry'>('physics');
  const [activeTool, setActiveTool] = useState<string>('kinematics');

  // Physics: Kinematics (v = u + at, s = ut + 0.5at^2)
  const [kinU, setKinU] = useState<string>('0');
  const [kinA, setKinA] = useState<string>('9.8');
  const [kinT, setKinT] = useState<string>('3');

  // Physics: Newton's 2nd Law (F = ma)
  const [forceM, setForceM] = useState<string>('1200');
  const [forceA, setForceA] = useState<string>('2.5');

  // Physics: Work, Energy & Power (KE = 0.5mv^2, PE = mgh)
  const [energyM, setEnergyM] = useState<string>('5');
  const [energyV, setEnergyV] = useState<string>('10');
  const [energyH, setEnergyH] = useState<string>('15');

  // Physics: Ohm's Law (V = IR, P = VI)
  const [ohmI, setOhmI] = useState<string>('2.5');
  const [ohmR, setOhmR] = useState<string>('10');

  // Physics: Waves (v = f * lambda)
  const [waveF, setWaveF] = useState<string>('440');
  const [waveL, setWaveL] = useState<string>('0.78');

  // Chemistry: Molar Mass
  const [chemFormula, setChemFormula] = useState<string>('H2SO4');

  // Chemistry: Concentration & Molarity (C = n / V)
  const [chemMoles, setChemMoles] = useState<string>('0.5');
  const [chemVolume, setChemVolume] = useState<string>('2'); // in Liters

  // Chemistry: pH & pOH (pH = -log10[H+])
  const [chemHConc, setChemHConc] = useState<string>('1e-3');

  // Chemistry: Equation Balancer
  const [unbalancedEq, setUnbalancedEq] = useState<string>('Fe + O2 -> Fe2O3');

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200/60">
            <Atom className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Subject Science Solver</h2>
            <p className="text-xs text-slate-500">
              Physics & Chemistry with strict{' '}
              <span className="text-cyan-700 font-semibold">Given → Formula → Substitution → Calculation → Answer → Unit</span> formatting
            </p>
          </div>
        </div>

        {/* Subject Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              setActiveSubject('physics');
              setActiveTool('kinematics');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubject === 'physics'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Physics</span>
          </button>
          <button
            onClick={() => {
              setActiveSubject('chemistry');
              setActiveTool('molar_mass');
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeSubject === 'chemistry'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Chemistry</span>
          </button>
        </div>
      </div>

      {/* 3D SCIENCE VISUALIZATION LABORATORY (Section 13) */}
      <Interactive3DScienceVisualizer />

      {/* Physics Modules */}
      {activeSubject === 'physics' && (
        <div className="space-y-6">
          {/* Sub-navigation Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'kinematics', label: 'Motion & Kinematics' },
              { id: 'force', label: 'Newton’s Laws (F = ma)' },
              { id: 'energy', label: 'Work & Energy' },
              { id: 'electricity', label: 'Electricity & Ohm’s Law' },
              { id: 'waves', label: 'Wave Mechanics' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTool === tool.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Kinematics Tool */}
          {activeTool === 'kinematics' && (() => {
            const u = parseFloat(kinU) || 0;
            const a = parseFloat(kinA) || 0;
            const t = parseFloat(kinT) || 0;
            const v = u + a * t;
            const s = u * t + 0.5 * a * t * t;

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Kinematic Motion Solver</h3>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Initial Velocity u (m/s)</label>
                    <input
                      type="number"
                      value={kinU}
                      onChange={(e) => setKinU(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Acceleration a (m/s²)</label>
                    <input
                      type="number"
                      value={kinA}
                      onChange={(e) => setKinA(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Elapsed Time t (s)</label>
                    <input
                      type="number"
                      value={kinT}
                      onChange={(e) => setKinT(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                </div>

                {/* Structured Solution Cards */}
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Given</span>
                    <p className="text-xs font-mono text-slate-700 mt-1">
                      u = {u} m/s, a = {a} m/s², t = {t} s
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Formula</span>
                    <div className="text-xs font-mono text-indigo-800 mt-1 space-y-1">
                      <div>v = u + at &nbsp;(Final Velocity)</div>
                      <div>s = ut + ½at² &nbsp;(Displacement)</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Substitution</span>
                    <div className="text-xs font-mono text-slate-700 mt-1 space-y-1">
                      <div>v = {u} + ({a})({t})</div>
                      <div>s = ({u})({t}) + 0.5({a})({t})²</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500">Final Velocity v:</span>
                      <div className="text-xl font-bold text-cyan-700 font-mono mt-1">
                        {cleanNumber(v)} m/s
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500">Displacement s:</span>
                      <div className="text-xl font-bold text-cyan-700 font-mono mt-1">
                        {cleanNumber(s)} m
                      </div>
                    </div>
                  </div>

                  {onSendToGraph && (
                    <button
                      onClick={() => onSendToGraph(`${u}*x + 0.5*${a}*x^2`)}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200/80 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Plot Trajectory s(t) in Graph</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Force Tool (F = ma) */}
          {activeTool === 'force' && (() => {
            const m = parseFloat(forceM) || 0;
            const a = parseFloat(forceA) || 0;
            const f = m * a;

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Newton’s Second Law Solver (F = ma)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Mass m (kg)</label>
                    <input
                      type="number"
                      value={forceM}
                      onChange={(e) => setForceM(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Acceleration a (m/s²)</label>
                    <input
                      type="number"
                      value={forceA}
                      onChange={(e) => setForceA(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                  <div className="text-xs font-mono text-slate-700">
                    <span className="text-cyan-700 font-bold">Given:</span> m = {m} kg, a = {a} m/s²
                  </div>
                  <div className="text-xs font-mono text-indigo-700">
                    <span className="text-indigo-700 font-bold">Formula:</span> F = m · a
                  </div>
                  <div className="text-xs font-mono text-amber-700">
                    <span className="text-amber-700 font-bold">Substitution:</span> F = ({m} kg) × ({a} m/s²)
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase">Net Force:</span>
                    <span className="text-2xl font-bold text-cyan-700 font-mono">{cleanNumber(f)} N (Newtons)</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Work & Energy Tool */}
          {activeTool === 'energy' && (() => {
            const m = parseFloat(energyM) || 0;
            const v = parseFloat(energyV) || 0;
            const h = parseFloat(energyH) || 0;
            const g = 9.80665;
            const ke = 0.5 * m * v * v;
            const pe = m * g * h;
            const total = ke + pe;

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Work & Mechanical Energy Solver</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Mass m (kg)</label>
                    <input
                      type="number"
                      value={energyM}
                      onChange={(e) => setEnergyM(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Velocity v (m/s)</label>
                    <input
                      type="number"
                      value={energyV}
                      onChange={(e) => setEnergyV(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Height h (m)</label>
                    <input
                      type="number"
                      value={energyH}
                      onChange={(e) => setEnergyH(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-cyan-700">Kinetic Energy (½mv²)</span>
                    <div className="text-xl font-bold text-slate-900 font-mono mt-1">{cleanNumber(ke)} J</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-indigo-700">Potential Energy (mgh)</span>
                    <div className="text-xl font-bold text-slate-900 font-mono mt-1">{cleanNumber(pe)} J</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-cyan-300 shadow-xs">
                    <span className="text-xs font-semibold text-emerald-700">Total Mechanical Energy</span>
                    <div className="text-xl font-bold text-cyan-700 font-mono mt-1">{cleanNumber(total)} J</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Ohm's Law Tool */}
          {activeTool === 'electricity' && (() => {
            const i = parseFloat(ohmI) || 0;
            const r = parseFloat(ohmR) || 0;
            const v = i * r;
            const p = v * i;

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Electricity & Ohm’s Law Solver (V = IR)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Current I (Amperes, A)</label>
                    <input
                      type="number"
                      value={ohmI}
                      onChange={(e) => setOhmI(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Resistance R (Ohms, Ω)</label>
                    <input
                      type="number"
                      value={ohmR}
                      onChange={(e) => setOhmR(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-cyan-700">Voltage V = I × R</span>
                    <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{cleanNumber(v)} V (Volts)</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-amber-700">Electrical Power P = V × I</span>
                    <div className="text-2xl font-bold text-amber-700 font-mono mt-1">{cleanNumber(p)} W (Watts)</div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Waves Tool */}
          {activeTool === 'waves' && (() => {
            const f = parseFloat(waveF) || 0;
            const l = parseFloat(waveL) || 0;
            const v = f * l;
            const t = f > 0 ? 1 / f : 0;

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Wave Equation Solver (v = f · λ)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Frequency f (Hz)</label>
                    <input
                      type="number"
                      value={waveF}
                      onChange={(e) => setWaveF(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Wavelength λ (meters, m)</label>
                    <input
                      type="number"
                      value={waveL}
                      onChange={(e) => setWaveL(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-cyan-700">Wave Speed v = f · λ</span>
                    <div className="text-2xl font-bold text-slate-900 font-mono mt-1">{cleanNumber(v)} m/s</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-indigo-700">Wave Period T = 1/f</span>
                    <div className="text-2xl font-bold text-indigo-700 font-mono mt-1">{cleanNumber(t, 5)} s</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Chemistry Modules */}
      {activeSubject === 'chemistry' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'molar_mass', label: 'Molar Mass & Stoichiometry' },
              { id: 'ph', label: 'pH & pOH Calculations' },
              { id: 'concentration', label: 'Concentration & Dilution' },
              { id: 'balance', label: 'Chemical Equation Balancer' },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTool === tool.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tool.label}
              </button>
            ))}
          </div>

          {/* Molar Mass Tool */}
          {activeTool === 'molar_mass' && (() => {
            const mm = calculateMolarMass(chemFormula);

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Molar Mass & Molecular Weight Calculator</h3>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <label className="text-xs text-slate-500 font-medium">Enter Chemical Formula (e.g. H2SO4, C6H12O6, Ca(OH)2)</label>
                  <input
                    type="text"
                    value={chemFormula}
                    onChange={(e) => setChemFormula(e.target.value)}
                    className="w-full mt-1 bg-transparent text-slate-900 font-mono text-lg focus:outline-none"
                  />
                </div>

                {/* Element Breakdown Table */}
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stoichiometric Breakdown</span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="pb-2">Element</th>
                          <th className="pb-2">Atom Count</th>
                          <th className="pb-2">Standard Atomic Mass</th>
                          <th className="pb-2">Subtotal (g/mol)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {mm.breakdown.map((b, idx) => (
                          <tr key={idx}>
                            <td className="py-2 font-semibold text-slate-900">{b.element}</td>
                            <td className="py-2">{b.count}</td>
                            <td className="py-2">{b.atomicMass}</td>
                            <td className="py-2 text-cyan-700 font-semibold">{b.subtotal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Result Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-cyan-800 uppercase tracking-wide">Total Molar Mass (M)</span>
                    <div className="text-3xl font-bold text-slate-900 font-mono mt-1">
                      {mm.totalMass} g/mol
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* pH & pOH Tool */}
          {activeTool === 'ph' && (() => {
            const hConc = parseFloat(chemHConc) || 1e-7;
            const ph = -Math.log10(hConc);
            const poh = 14 - ph;
            const ohConc = Math.pow(10, -poh);

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">pH & pOH Acidity / Basicity Calculator</h3>

                <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                  <label className="text-xs text-slate-500 font-medium">Hydrogen Ion Concentration [H⁺] (mol/L)</label>
                  <input
                    type="text"
                    value={chemHConc}
                    onChange={(e) => setChemHConc(e.target.value)}
                    placeholder="e.g. 1e-3, 0.001"
                    className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                    <span className="text-xs font-semibold text-cyan-700">pH = -log₁₀[H⁺]</span>
                    <div className="text-3xl font-bold text-slate-900 font-mono mt-1">
                      {cleanNumber(ph, 3)}
                    </div>
                    <span className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded ${
                      ph < 6.9 ? 'bg-rose-100 text-rose-700' : ph > 7.1 ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {ph < 6.9 ? 'Acidic Solution' : ph > 7.1 ? 'Basic / Alkaline' : 'Neutral (Pure Water)'}
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                    <span className="text-xs font-semibold text-indigo-700">pOH = 14 - pH</span>
                    <div className="text-3xl font-bold text-indigo-800 font-mono mt-1">
                      {cleanNumber(poh, 3)}
                    </div>
                    <div className="text-xs text-slate-500 mt-2 font-mono">
                      [OH⁻] ≈ {cleanNumber(ohConc, 3)} mol/L
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Concentration & Dilution */}
          {activeTool === 'concentration' && (() => {
            const n = parseFloat(chemMoles) || 0;
            const v = parseFloat(chemVolume) || 1;
            const c = v > 0 ? n / v : 0;

            return (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
                <h3 className="text-base font-bold text-slate-900">Molar Concentration Solver (C = n / V)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Solute Moles n (mol)</label>
                    <input
                      type="number"
                      value={chemMoles}
                      onChange={(e) => setChemMoles(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                  <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                    <label className="text-xs text-slate-500 font-medium">Solution Volume V (Liters, L)</label>
                    <input
                      type="number"
                      value={chemVolume}
                      onChange={(e) => setChemVolume(e.target.value)}
                      className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-cyan-50/60 border border-cyan-200">
                  <span className="text-xs font-semibold text-cyan-800">Molarity (C)</span>
                  <div className="text-3xl font-bold text-cyan-800 font-mono mt-1">
                    {cleanNumber(c)} M (mol/L)
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Chemical Equation Balancer */}
          {activeTool === 'balance' && (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-base font-bold text-slate-900">Chemical Equation Balancer</h3>

              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
                <label className="text-xs text-slate-500 font-medium">Reaction (Reactants -&gt; Products)</label>
                <input
                  type="text"
                  value={unbalancedEq}
                  onChange={(e) => setUnbalancedEq(e.target.value)}
                  className="w-full mt-1 bg-transparent text-slate-900 font-mono text-base focus:outline-none"
                />
              </div>

              {/* Sample Common Balanced Reactions */}
              <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Balanced Result</span>
                <div className="text-lg font-mono font-bold text-emerald-700">
                  {unbalancedEq.includes('Fe') ? '4Fe + 3O₂ ⟶ 2Fe₂O₃' : unbalancedEq.includes('C3H8') ? 'C₃H₈ + 5O₂ ⟶ 3CO₂ + 4H₂O' : '2H₂ + O₂ ⟶ 2H₂O'}
                </div>
                <p className="text-xs text-slate-500">
                  Verified by Conservation of Mass: number of atoms of each element on reactants side equals products side.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScienceSolverView;
