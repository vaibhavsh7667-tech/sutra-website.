'use client';

import React, { useEffect, useState, useRef } from 'react';

interface FloatingObject {
  id: string;
  type: 'symbol' | 'shape';
  content: string;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  depth: 'fg' | 'mid' | 'bg';
  size: number; // in px
  opacity: number;
  rotation: number;
  animDuration: number;
  blur?: number;
}

export const ThreeDBackground: React.FC = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [cursorPx, setCursorPx] = useState<{ x: number; y: number }>({ x: 500, y: 300 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const targetPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  // Check mobile & reduced-motion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(motionQuery.matches);

      checkMobile();
      window.addEventListener('resize', checkMobile);

      const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      motionQuery.addEventListener('change', motionListener);

      return () => {
        window.removeEventListener('resize', checkMobile);
        motionQuery.removeEventListener('change', motionListener);
      };
    }
  }, []);

  // Smooth mouse parallax loop
  useEffect(() => {
    if (reducedMotion || isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetPos.current = {
        x: (e.clientX - cx) / cx, // -1 to 1
        y: (e.clientY - cy) / cy, // -1 to 1
      };
      setCursorPx({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth linear interpolation (lerp) loop
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
    const animate = () => {
      setMousePos((prev) => ({
        x: lerp(prev.x, targetPos.current.x, 0.07),
        y: lerp(prev.y, targetPos.current.y, 0.07),
      }));
      animFrameId.current = requestAnimationFrame(animate);
    };

    animFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [reducedMotion, isMobile]);

  // Floating mathematical & scientific entities across 3 distinct depths
  const floatingObjects: FloatingObject[] = [
    // --- FOREGROUND: Sharpest, moves most, ~18-24px ---
    { id: 'fg-1', type: 'symbol', content: 'π', x: 8, y: 16, depth: 'fg', size: 30, opacity: 0.28, rotation: 12, animDuration: 7 },
    { id: 'fg-2', type: 'symbol', content: '√x', x: 86, y: 22, depth: 'fg', size: 28, opacity: 0.24, rotation: -8, animDuration: 8 },
    { id: 'fg-3', type: 'symbol', content: '∫', x: 91, y: 72, depth: 'fg', size: 36, opacity: 0.26, rotation: 5, animDuration: 6.5 },
    { id: 'fg-4', type: 'symbol', content: 'x²', x: 12, y: 84, depth: 'fg', size: 28, opacity: 0.25, rotation: -12, animDuration: 8.5 },
    { id: 'fg-5', type: 'symbol', content: 'Δ', x: 78, y: 88, depth: 'fg', size: 26, opacity: 0.22, rotation: 15, animDuration: 7.2 },

    // --- MIDGROUND: Moderate movement, slight blur, ~10-15px ---
    { id: 'mid-1', type: 'symbol', content: 'E = mc²', x: 74, y: 12, depth: 'mid', size: 18, opacity: 0.18, rotation: -4, animDuration: 11, blur: 0.5 },
    { id: 'mid-2', type: 'symbol', content: 'F = ma', x: 18, y: 34, depth: 'mid', size: 19, opacity: 0.20, rotation: 6, animDuration: 10, blur: 0.5 },
    { id: 'mid-3', type: 'symbol', content: 'Σ', x: 84, y: 44, depth: 'mid', size: 30, opacity: 0.18, rotation: -10, animDuration: 12, blur: 0.8 },
    { id: 'mid-4', type: 'symbol', content: 'sin θ', x: 6, y: 64, depth: 'mid', size: 20, opacity: 0.17, rotation: 8, animDuration: 9.5, blur: 0.5 },
    { id: 'mid-5', type: 'symbol', content: '∞', x: 68, y: 62, depth: 'mid', size: 28, opacity: 0.16, rotation: -5, animDuration: 10.5, blur: 0.6 },
    { id: 'mid-6', type: 'symbol', content: 'λ', x: 26, y: 92, depth: 'mid', size: 24, opacity: 0.18, rotation: 14, animDuration: 11.2, blur: 0.5 },

    // --- BACKGROUND: Deep space, soft blur, slow motion, ~4-6px ---
    { id: 'bg-1', type: 'symbol', content: 'e', x: 34, y: 15, depth: 'bg', size: 22, opacity: 0.11, rotation: 20, animDuration: 15, blur: 1.5 },
    { id: 'bg-2', type: 'symbol', content: '∇', x: 62, y: 28, depth: 'bg', size: 26, opacity: 0.10, rotation: -15, animDuration: 16, blur: 1.8 },
    { id: 'bg-3', type: 'symbol', content: 'θ', x: 42, y: 78, depth: 'bg', size: 24, opacity: 0.12, rotation: 10, animDuration: 14, blur: 1.4 },
    { id: 'bg-4', type: 'symbol', content: 'ħ', x: 52, y: 88, depth: 'bg', size: 20, opacity: 0.09, rotation: -8, animDuration: 17, blur: 2.0 },
    { id: 'bg-5', type: 'symbol', content: 'lim', x: 22, y: 72, depth: 'bg', size: 18, opacity: 0.11, rotation: 4, animDuration: 15.5, blur: 1.6 },
  ];

  // Calculate parallax offsets based on layer depth
  const getLayerTransform = (depth: 'fg' | 'mid' | 'bg') => {
    if (reducedMotion || isMobile) return 'translate3d(0, 0, 0)';
    switch (depth) {
      case 'fg':
        return `translate3d(${mousePos.x * -22}px, ${mousePos.y * -20}px, 20px)`;
      case 'mid':
        return `translate3d(${mousePos.x * -13}px, ${mousePos.y * -11}px, 0px)`;
      case 'bg':
        return `translate3d(${mousePos.x * -5}px, ${mousePos.y * -4}px, -30px)`;
    }
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      style={{ perspective: '1200px' }}
      aria-hidden="true"
    >
      {/* 1. Dynamic Cursor Lighting Spotlight across background */}
      {!isMobile && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(850px circle at ${cursorPx.x}px ${cursorPx.y}px, rgba(37, 99, 235, 0.038), transparent 75%)`,
          }}
        />
      )}

      {/* 2. Mathematical 3D Coordinate Grid Watermark */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #0f172a 1px, transparent 1px),
            linear-gradient(to bottom, #0f172a 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: !reducedMotion && !isMobile
            ? `rotateX(${mousePos.y * 3}deg) rotateY(${mousePos.x * -3}deg) translateZ(-40px)`
            : 'none',
          transition: 'transform 0.2s ease-out',
        }}
      />

      {/* 3. Deep Geometric 3D Shapes (SVG Wireframe Cube & Coordinate Ring) */}
      <div
        className="absolute w-full h-full preserve-3d"
        style={{ transform: getLayerTransform('bg') }}
      >
        {/* Wireframe 3D Cube (top right) */}
        <div
          className="absolute top-[18%] right-[10%] opacity-15 hidden md:block"
          style={{
            animation: !reducedMotion ? 'float3DSlow 14s ease-in-out infinite' : 'none',
          }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="#2563eb" strokeWidth="1.5">
            <polygon points="30,20 70,20 85,35 45,35" strokeDasharray="3 2" />
            <polygon points="30,20 45,35 45,75 30,60" />
            <polygon points="45,35 85,35 85,75 45,75" />
            <line x1="30" y1="60" x2="70" y2="60" />
            <line x1="70" y1="20" x2="70" y2="60" />
            <line x1="70" y1="60" x2="85" y2="75" />
          </svg>
        </div>

        {/* 3D Orbit Ring (bottom left) */}
        <div
          className="absolute bottom-[20%] left-[8%] opacity-15 hidden md:block"
          style={{
            animation: !reducedMotion ? 'float3DFast 12s ease-in-out infinite' : 'none',
          }}
        >
          <svg width="100" height="60" viewBox="0 0 120 70" fill="none" stroke="#0284c7" strokeWidth="1.2">
            <ellipse cx="60" cy="35" rx="50" ry="20" transform="rotate(-15 60 35)" />
            <circle cx="25" cy="28" r="4" fill="#0284c7" opacity="0.4" />
            <circle cx="95" cy="42" r="3" fill="#2563eb" opacity="0.4" />
          </svg>
        </div>
      </div>

      {/* 4. Layered Mathematical Floating Objects */}
      {/* BACKGROUND LAYER */}
      <div
        className="absolute inset-0 preserve-3d"
        style={{ transform: getLayerTransform('bg') }}
      >
        {floatingObjects
          .filter((obj) => obj.depth === 'bg')
          .map((obj) => (
            <div
              key={obj.id}
              className="absolute font-mono font-medium text-slate-800 dark:text-slate-400 transition-colors"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                fontSize: `${obj.size}px`,
                opacity: obj.opacity,
                filter: obj.blur ? `blur(${obj.blur}px)` : 'none',
                transform: `rotate(${obj.rotation}deg)`,
                animation: !reducedMotion ? `float3DSlow ${obj.animDuration}s ease-in-out infinite` : 'none',
              }}
            >
              {obj.content}
            </div>
          ))}
      </div>

      {/* MIDGROUND LAYER */}
      <div
        className="absolute inset-0 preserve-3d"
        style={{ transform: getLayerTransform('mid') }}
      >
        {floatingObjects
          .filter((obj) => obj.depth === 'mid')
          .map((obj) => (
            <div
              key={obj.id}
              className="absolute font-mono font-semibold text-slate-800 dark:text-slate-300 transition-colors"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                fontSize: `${obj.size}px`,
                opacity: obj.opacity,
                filter: obj.blur ? `blur(${obj.blur}px)` : 'none',
                transform: `rotate(${obj.rotation}deg)`,
                animation: !reducedMotion ? `float3DSlow ${obj.animDuration}s ease-in-out infinite` : 'none',
              }}
            >
              {obj.content}
            </div>
          ))}
      </div>

      {/* FOREGROUND LAYER */}
      <div
        className="absolute inset-0 preserve-3d"
        style={{ transform: getLayerTransform('fg') }}
      >
        {floatingObjects
          .filter((obj) => obj.depth === 'fg')
          .map((obj) => (
            <div
              key={obj.id}
              className="absolute font-mono font-bold text-slate-900 dark:text-slate-100 transition-colors"
              style={{
                left: `${obj.x}%`,
                top: `${obj.y}%`,
                fontSize: `${obj.size}px`,
                opacity: obj.opacity,
                transform: `rotate(${obj.rotation}deg)`,
                animation: !reducedMotion ? `float3DFast ${obj.animDuration}s ease-in-out infinite` : 'none',
              }}
            >
              {obj.content}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ThreeDBackground;
