'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Zap,
  Atom,
  Compass,
  Play,
  Pause,
  Layers,
} from 'lucide-react';

type LabMode = 'projectile' | 'molecule' | 'surface';

export const Interactive3DScienceVisualizer: React.FC = () => {
  const [labMode, setLabMode] = useState<LabMode>('projectile');

  // --- 1. PROJECTILE MOTION STATE ---
  const [projAngle, setProjAngle] = useState<number>(45); // degrees
  const [projVelocity, setProjVelocity] = useState<number>(30); // m/s
  const [projGravity, setProjGravity] = useState<number>(9.8); // m/s^2
  const [projProgress, setProjProgress] = useState<number>(1);
  const [isProjPlaying, setIsProjPlaying] = useState<boolean>(true);

  // --- 2. MOLECULE STATE ---
  const [moleculeType, setMoleculeType] = useState<'h2o' | 'ch4' | 'co2' | 'bohr'>('h2o');

  // --- 3. 3D SURFACE STATE ---
  const [surfaceFunc, setSurfaceFunc] = useState<'sombrero' | 'saddle' | 'paraboloid' | 'wave'>('sombrero');

  // --- 3D CAMERA ORBIT STATE (Mouse Drag) ---
  const [rotX, setRotX] = useState<number>(25); // Pitch in degrees
  const [rotY, setRotY] = useState<number>(-35); // Yaw in degrees
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Projectile Motion Metrics
  const rad = (projAngle * Math.PI) / 180;
  const timeOfFlight = (2 * projVelocity * Math.sin(rad)) / projGravity;
  const maxHeight = (Math.pow(projVelocity * Math.sin(rad), 2)) / (2 * projGravity);
  const maxRange = (Math.pow(projVelocity, 2) * Math.sin(2 * rad)) / projGravity;

  // Projectile animation loop
  useEffect(() => {
    if (labMode !== 'projectile' || !isProjPlaying) return;

    let startTime = performance.now();
    const duration = Math.max(1200, timeOfFlight * 400);

    const step = (time: number) => {
      const elapsed = time - startTime;
      const progress = (elapsed % duration) / duration;
      setProjProgress(progress);
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [labMode, isProjPlaying, timeOfFlight]);

  // Molecule Bohr auto-spin
  const [atomAngle, setAtomAngle] = useState<number>(0);
  useEffect(() => {
    if (labMode !== 'molecule') return;
    const interval = setInterval(() => {
      setAtomAngle((prev) => (prev + 0.04) % (2 * Math.PI));
    }, 16);
    return () => clearInterval(interval);
  }, [labMode]);

  // --- 3D PROJECTION ENGINE (Isometric / Perspective Transform) ---
  const project3D = useCallback(
    (x: number, y: number, z: number, cx: number, cy: number, scale: number) => {
      const radX = (rotX * Math.PI) / 180;
      const radY = (rotY * Math.PI) / 180;

      // Rotate Y (Yaw)
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const y1 = y;
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

      // Rotate X (Pitch)
      const x2 = x1;
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

      // Perspective projection
      const cameraDistance = 450;
      const perspectiveFactor = cameraDistance / (cameraDistance + z2);

      const px = cx + x2 * scale * perspectiveFactor;
      const py = cy - y2 * scale * perspectiveFactor; // canvas Y is inverted

      return { x: px, y: py, z: z2 };
    },
    [rotX, rotY]
  );

  // --- DRAW CANVAS SCENE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2 + 20;

    // 1. Draw 3D Base Grid & Coordinate Axes
    const drawGrid = () => {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e2e8f0';
      const gridSize = 120;
      const step = 20;

      for (let i = -gridSize; i <= gridSize; i += step) {
        const p1 = project3D(i, 0, -gridSize, cx, cy, 1);
        const p2 = project3D(i, 0, gridSize, cx, cy, 1);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project3D(-gridSize, 0, i, cx, cy, 1);
        const p4 = project3D(gridSize, 0, i, cx, cy, 1);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // X, Y, Z Axes
      const origin = project3D(0, 0, 0, cx, cy, 1);
      const axX = project3D(gridSize + 20, 0, 0, cx, cy, 1);
      const axY = project3D(0, gridSize + 20, 0, cx, cy, 1);
      const axZ = project3D(0, 0, gridSize + 20, cx, cy, 1);

      // X-Axis (Red)
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axX.x, axX.y);
      ctx.stroke();

      // Y-Axis (Green/Height)
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axY.x, axY.y);
      ctx.stroke();

      // Z-Axis (Blue)
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(axZ.x, axZ.y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.fillText('+X', axX.x + 4, axX.y);
      ctx.fillText('+Y', axY.x, axY.y - 4);
      ctx.fillText('+Z', axZ.x + 4, axZ.y);
    };

    drawGrid();

    // 2. RENDER MODE-SPECIFIC 3D OBJECTS
    if (labMode === 'projectile') {
      // Scale physics trajectory to fit canvas bounds
      const scaleX = 220 / Math.max(1, maxRange);
      const scaleY = 120 / Math.max(1, maxHeight);

      // Draw Trajectory Curve in 3D
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#2563eb';
      const steps = 60;
      let startP = project3D(0, 0, 0, cx, cy, 1);
      ctx.moveTo(startP.x, startP.y);

      for (let s = 1; s <= steps; s++) {
        const t = (s / steps) * timeOfFlight;
        const posX = projVelocity * Math.cos(rad) * t * scaleX;
        const posY = (projVelocity * Math.sin(rad) * t - 0.5 * projGravity * t * t) * scaleY;
        const pt = project3D(posX - 100, Math.max(0, posY), 0, cx, cy, 1);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Peak Indicator
      const peakX = (projVelocity * Math.cos(rad) * (timeOfFlight / 2)) * scaleX;
      const peakY = maxHeight * scaleY;
      const peakPt = project3D(peakX - 100, peakY, 0, cx, cy, 1);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(peakPt.x, peakPt.y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Current Projectile Position
      const currentT = projProgress * timeOfFlight;
      const currX = projVelocity * Math.cos(rad) * currentT * scaleX;
      const currY = (projVelocity * Math.sin(rad) * currentT - 0.5 * projGravity * currentT * currentT) * scaleY;
      const currPt = project3D(currX - 100, Math.max(0, currY), 0, cx, cy, 1);

      // Shadow projection on ground (Y = 0)
      const shadowPt = project3D(currX - 100, 0, 0, cx, cy, 1);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.ellipse(shadowPt.x, shadowPt.y, 6, 3, 0, 0, 2 * Math.PI);
      ctx.fill();

      // Drop Line
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(currPt.x, currPt.y);
      ctx.lineTo(shadowPt.x, shadowPt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Projectile Sphere
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(currPt.x, currPt.y, 7, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Velocity Vector Arrow
      const vx = projVelocity * Math.cos(rad);
      const vy = projVelocity * Math.sin(rad) - projGravity * currentT;
      const vPt = project3D(currX - 100 + vx * 0.4, currY + vy * 0.4, 0, cx, cy, 1);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currPt.x, currPt.y);
      ctx.lineTo(vPt.x, vPt.y);
      ctx.stroke();
    } else if (labMode === 'molecule') {
      // 3D Chemistry / Molecule Renderer
      interface AtomNode {
        element: string;
        color: string;
        radius: number;
        x: number;
        y: number;
        z: number;
      }
      interface Bond {
        from: number;
        to: number;
      }

      let atoms: AtomNode[] = [];
      let bonds: Bond[] = [];

      if (moleculeType === 'h2o') {
        // Water: O at center, 2 H at 104.5 degrees
        const bondLen = 65;
        const halfAngle = (104.5 / 2) * (Math.PI / 180);
        atoms = [
          { element: 'O', color: '#ef4444', radius: 18, x: 0, y: 15, z: 0 },
          { element: 'H', color: '#f8fafc', radius: 12, x: -bondLen * Math.sin(halfAngle), y: -bondLen * Math.cos(halfAngle) + 15, z: 0 },
          { element: 'H', color: '#f8fafc', radius: 12, x: bondLen * Math.sin(halfAngle), y: -bondLen * Math.cos(halfAngle) + 15, z: 0 },
        ];
        bonds = [{ from: 0, to: 1 }, { from: 0, to: 2 }];
      } else if (moleculeType === 'co2') {
        // Linear O=C=O (180 deg)
        atoms = [
          { element: 'C', color: '#334155', radius: 16, x: 0, y: 15, z: 0 },
          { element: 'O', color: '#ef4444', radius: 16, x: -75, y: 15, z: 0 },
          { element: 'O', color: '#ef4444', radius: 16, x: 75, y: 15, z: 0 },
        ];
        bonds = [{ from: 0, to: 1 }, { from: 0, to: 2 }];
      } else if (moleculeType === 'ch4') {
        // Methane Tetrahedron (109.5 deg)
        const d = 55;
        atoms = [
          { element: 'C', color: '#334155', radius: 16, x: 0, y: 15, z: 0 },
          { element: 'H', color: '#f8fafc', radius: 11, x: 0, y: d + 15, z: 0 },
          { element: 'H', color: '#f8fafc', radius: 11, x: d * 0.94, y: -d * 0.33 + 15, z: 0 },
          { element: 'H', color: '#f8fafc', radius: 11, x: -d * 0.47, y: -d * 0.33 + 15, z: d * 0.81 },
          { element: 'H', color: '#f8fafc', radius: 11, x: -d * 0.47, y: -d * 0.33 + 15, z: -d * 0.81 },
        ];
        bonds = [{ from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }];
      } else {
        // Bohr Atom Model
        // Nucleus
        atoms = [
          { element: 'Nucleus', color: '#f59e0b', radius: 14, x: 0, y: 15, z: 0 },
        ];
        // Orbit Rings
        const r1 = 55;
        const r2 = 90;

        // Draw 3D Tilted Orbit Rings
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        for (let ring = 0; ring < 2; ring++) {
          const r = ring === 0 ? r1 : r2;
          const tiltZ = ring === 0 ? 0.3 : -0.4;
          ctx.beginPath();
          for (let th = 0; th <= 360; th += 10) {
            const tr = (th * Math.PI) / 180;
            const px = r * Math.cos(tr);
            const py = r * Math.sin(tr) * Math.cos(tiltZ);
            const pz = r * Math.sin(tr) * Math.sin(tiltZ);
            const pt = project3D(px, py + 15, pz, cx, cy, 1);
            if (th === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          ctx.stroke();

          // Orbiting Electron
          const elAngle = atomAngle * (ring === 0 ? 1.5 : -1.2);
          const elX = r * Math.cos(elAngle);
          const elY = r * Math.sin(elAngle) * Math.cos(tiltZ);
          const elZ = r * Math.sin(elAngle) * Math.sin(tiltZ);
          const elPt = project3D(elX, elY + 15, elZ, cx, cy, 1);

          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(elPt.x, elPt.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Draw Bonds
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#cbd5e1';
      bonds.forEach((b) => {
        const p1 = project3D(atoms[b.from].x, atoms[b.from].y, atoms[b.from].z, cx, cy, 1);
        const p2 = project3D(atoms[b.to].x, atoms[b.to].y, atoms[b.to].z, cx, cy, 1);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Sort atoms by Z for painters algorithm
      const projectedAtoms = atoms.map((a, i) => {
        const pt = project3D(a.x, a.y, a.z, cx, cy, 1);
        return { ...a, px: pt.x, py: pt.y, pz: pt.z, origIdx: i };
      });
      projectedAtoms.sort((a, b) => b.pz - a.pz);

      // Draw Atom Spheres
      projectedAtoms.forEach((a) => {
        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.arc(a.px, a.py, a.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = a.element === 'H' ? '#334155' : '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.element, a.px, a.py);
      });
    } else if (labMode === 'surface') {
      // 3D Mathematical Surface Plotter: z = f(x, y)
      const range = 60;
      const step = 8;

      const evalZ = (x: number, y: number) => {
        const d = Math.sqrt(x * x + y * y);
        if (surfaceFunc === 'sombrero') {
          return d === 0 ? 30 : (Math.sin(d / 8) / (d / 8)) * 30;
        } else if (surfaceFunc === 'saddle') {
          return ((x * x - y * y) / 120);
        } else if (surfaceFunc === 'paraboloid') {
          return (x * x + y * y) / 120;
        } else {
          return Math.cos(x / 12) * Math.sin(y / 12) * 25;
        }
      };

      // Draw Quad Wireframe Mesh
      ctx.lineWidth = 1;
      for (let x = -range; x < range; x += step) {
        for (let z = -range; z < range; z += step) {
          const y1 = evalZ(x, z);
          const y2 = evalZ(x + step, z);
          const y3 = evalZ(x + step, z + step);
          const y4 = evalZ(x, z + step);

          const p1 = project3D(x, y1, z, cx, cy, 1);
          const p2 = project3D(x + step, y2, z, cx, cy, 1);
          const p3 = project3D(x + step, y3, z + step, cx, cy, 1);
          const p4 = project3D(x, y4, z + step, cx, cy, 1);

          // Color based on height
          const avgY = (y1 + y2 + y3 + y4) / 4;
          const normY = Math.min(1, Math.max(0, (avgY + 20) / 50));
          ctx.strokeStyle = `rgba(37, 99, 235, ${0.3 + normY * 0.6})`;
          ctx.fillStyle = `rgba(2, 132, 199, ${0.05 + normY * 0.2})`;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }, [labMode, projAngle, projVelocity, projGravity, projProgress, moleculeType, surfaceFunc, rotX, rotY, project3D, maxRange, maxHeight, timeOfFlight, rad, atomAngle]);

  // Mouse drag handlers for 3D Camera Orbit
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => (prev + dx * 0.7) % 360);
    setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.7)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetCamera = () => {
    setRotX(25);
    setRotY(-35);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 md:p-6 shadow-[0_15px_45px_-10px_rgba(15,23,42,0.06),0_1px_3px_rgba(15,23,42,0.03)] border border-slate-200/90 space-y-4 preserve-3d animate-entrance-calc">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 shadow-2xs">
            <Compass className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Interactive 3D Science &amp; Math Laboratory
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Real-time 3D vector physics, molecular chemistry, and surface plots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setLabMode('projectile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              labMode === 'projectile'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>3D Projectile</span>
          </button>

          <button
            onClick={() => setLabMode('molecule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              labMode === 'molecule'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Atom className="w-3.5 h-3.5 text-cyan-600" />
            <span>3D Molecules</span>
          </button>

          <button
            onClick={() => setLabMode('surface')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
              labMode === 'surface'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/70'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>3D Surface</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden select-none cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full block"
        />

        {/* Orbit Hint Watermark */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-white/80 px-2 py-1 rounded-lg border border-slate-200 backdrop-blur-xs pointer-events-none">
          Drag to Orbit 3D • Pitch: {rotX.toFixed(0)}° Yaw: {rotY.toFixed(0)}°
        </div>

        {/* Camera Reset Button */}
        <button
          onClick={resetCamera}
          className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-600 border border-slate-200 shadow-2xs text-[10px] font-semibold flex items-center gap-1 transition"
          title="Reset 3D Camera"
        >
          <RotateCcw className="w-3 h-3 text-slate-500" />
          <span>Reset Camera</span>
        </button>

        {/* Live Metrics Floating Badge */}
        {labMode === 'projectile' && (
          <div className="absolute bottom-3 left-3 bg-white/95 border border-slate-200 rounded-xl p-2.5 shadow-sm text-[11px] font-mono space-y-0.5 pointer-events-none">
            <div className="text-slate-500 font-bold text-[9px] uppercase tracking-wider">Kinematics In Flight</div>
            <div className="text-slate-800">Range: <span className="font-bold text-blue-600">{maxRange.toFixed(1)} m</span></div>
            <div className="text-slate-800">Max Height: <span className="font-bold text-emerald-600">{maxHeight.toFixed(1)} m</span></div>
            <div className="text-slate-800">Flight Time: <span className="font-bold text-cyan-700">{timeOfFlight.toFixed(2)} s</span></div>
          </div>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
        {labMode === 'projectile' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 font-semibold mb-1">
                <span>Angle:</span>
                <span className="font-mono text-blue-600">{projAngle}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="85"
                value={projAngle}
                onChange={(e) => setProjAngle(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 font-semibold mb-1">
                <span>Velocity:</span>
                <span className="font-mono text-blue-600">{projVelocity} m/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={projVelocity}
                onChange={(e) => setProjVelocity(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-600 font-semibold mb-1">
                <span>Gravity:</span>
                <span className="font-mono text-blue-600">{projGravity} m/s²</span>
              </div>
              <select
                value={projGravity}
                onChange={(e) => setProjGravity(Number(e.target.value))}
                className="w-full px-2 py-1 rounded-lg bg-white border border-slate-300 font-mono text-xs text-slate-800"
              >
                <option value={9.8}>Earth (9.80 m/s²)</option>
                <option value={1.62}>Moon (1.62 m/s²)</option>
                <option value={3.72}>Mars (3.72 m/s²)</option>
                <option value={24.79}>Jupiter (24.79 m/s²)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setIsProjPlaying(!isProjPlaying)}
                className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                {isProjPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isProjPlaying ? 'Pause Motion' : 'Play Motion'}</span>
              </button>
            </div>
          </div>
        )}

        {labMode === 'molecule' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Select Molecular Geometry:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'h2o', label: 'H₂O (Water • Bent 104.5°)' },
                { id: 'ch4', label: 'CH₄ (Methane • Tetrahedral 109.5°)' },
                { id: 'co2', label: 'CO₂ (Carbon Dioxide • Linear 180°)' },
                { id: 'bohr', label: 'Bohr Atom Orbitals' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMoleculeType(m.id as 'h2o' | 'ch4' | 'co2' | 'bohr')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    moleculeType === m.id
                      ? 'bg-cyan-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {labMode === 'surface' && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">Surface Function z = f(x, y):</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sombrero', label: 'Sombrero Wave: sin(r)/r' },
                { id: 'saddle', label: 'Saddle: (x² - y²)/4' },
                { id: 'paraboloid', label: 'Paraboloid: (x² + y²)/6' },
                { id: 'wave', label: '2D Wave: cos(x)·sin(y)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSurfaceFunc(s.id as 'sombrero' | 'saddle' | 'paraboloid' | 'wave')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                    surfaceFunc === s.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interactive3DScienceVisualizer;
