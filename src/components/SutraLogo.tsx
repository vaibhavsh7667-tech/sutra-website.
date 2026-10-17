'use client';

import React from 'react';

interface SutraLogoProps {
  className?: string;
  size?: number; // size in px of the icon
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const SutraLogo: React.FC<SutraLogoProps> = ({
  className = '',
  size = 32,
  showWordmark = true,
  wordmarkClassName = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SUTRA Continuous-Thread Geometric Symbol */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-white border border-slate-200/90 shadow-[0_2px_8px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.03)] group-hover:shadow-[0_4px_14px_rgba(37,99,235,0.18)] group-hover:-translate-y-0.5 transition-all duration-200"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.75}
          height={size * 0.75}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Thread Blue-Cyan Gradient */}
            <linearGradient id="sutraThreadGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            {/* Orbit Glow Gradient */}
            <linearGradient id="sutraOrbitGrad" x1="28" y1="6" x2="4" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Background Mathematical Orbit Ring (Infinity Thread Concept) */}
          <ellipse
            cx="16"
            cy="16"
            rx="11"
            ry="5.5"
            transform="rotate(-28 16 16)"
            stroke="url(#sutraOrbitGrad)"
            strokeWidth="1.2"
            strokeDasharray="2.5 2"
            strokeLinecap="round"
          />

          {/* Primary SUTRA Thread (Continuous smooth mathematical 'S' line connecting knowledge) */}
          <path
            d="M 9 9 C 16 3, 23 10, 16 16 C 9 22, 16 29, 23 23"
            stroke="url(#sutraThreadGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Connected Knowledge Nodes */}
          {/* Node 1: Input / Axiom */}
          <circle cx="9" cy="9" r="2.2" fill="#2563eb" />
          <circle cx="9" cy="9" r="1" fill="#ffffff" />

          {/* Node 2: Center Synthesis / Bindu */}
          <circle cx="16" cy="16" r="2.5" fill="#0284c7" />
          <circle cx="16" cy="16" r="1.2" fill="#ffffff" />

          {/* Node 3: Output / Solution */}
          <circle cx="23" cy="23" r="2.2" fill="#d97706" />
          <circle cx="23" cy="23" r="1" fill="#ffffff" />
        </svg>
      </div>

      {/* SUTRA Wordmark */}
      {showWordmark && (
        <div className={`flex flex-col ${wordmarkClassName}`}>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-lg md:text-xl tracking-wider text-slate-900 font-sans sutra-nav-3d">
              SUTRA
            </span>
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #fef3c7 0%, #f59e0b 55%, #b45309 100%)',
                boxShadow: '0 0 8px rgba(245,158,11,0.8), 0 1px 2px rgba(180,83,9,0.5)',
              }}
            />
          </div>
          <span className="text-[9.5px] font-medium tracking-wide text-slate-400 uppercase leading-tight pt-0.5">
            Calculate • Solve • Visualize
          </span>
        </div>
      )}
    </div>
  );
};

export default SutraLogo;
