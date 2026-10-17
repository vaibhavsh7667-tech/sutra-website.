'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ThreeDLampToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  variant?: 'navbar' | 'floating' | 'large';
}

export const ThreeDLampToggle: React.FC<ThreeDLampToggleProps> = ({
  isDark,
  onToggle,
  className = '',
  variant = 'navbar',
}) => {
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Page opening entrance and ignition states
  // 1. subtle dim entrance -> 2. smooth warm illumination ignition
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [isIgnited, setIsIgnited] = useState<boolean>(false);

  // 3D tilt tracking for cursor interaction
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lampCardRef = useRef<HTMLDivElement>(null);

  // On mount: trigger entrance animation, then smooth ignition bloom
  useEffect(() => {
    const entranceTimer = setTimeout(() => {
      setHasEntered(true);
    }, 150);

    const ignitionTimer = setTimeout(() => {
      setIsIgnited(true);
    }, 850);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(ignitionTimer);
    };
  }, []);

  // Vintage Brass Pull-Chain Mechanical Sound Synthesizer
  const playPullChainSound = useCallback((turningOn: boolean) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Phase 1: High metallic chain chime / ratchet tension (1250 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(turningOn ? 1280 : 960, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.028);
      gain1.gain.setValueAtTime(0.14, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.028);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.032);

      // Phase 2: Heavy internal tumbler / spring latch snap (16ms later)
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(turningOn ? 1520 : 640, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.035);
          gain2.gain.setValueAtTime(0.12, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.04);
        } catch {}
      }, 16);
    } catch {}
  }, []);

  const handlePull = () => {
    setIsPulling(true);
    playPullChainSound(!isDark);
    onToggle();
    setTimeout(() => setIsPulling(false), 450);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!lampCardRef.current) return;
    const rect = lampCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / rect.height) * 8,
      y: (x / rect.width) * 8,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // Determine whether the lamp is in illuminated state
  // Lamp is illuminated when it's dark mode, OR during the opening ignition sequence
  const isLampLit = isDark || (!hasEntered ? false : isIgnited && isDark);

  // ========================================================
  // VARIANT: ENLARGED 3D VINTAGE DESK LAMP (UPPER RIGHT SIDE)
  // Positioned gracefully in the upper right viewport with badge at upper right,
  // substantial 3D depth, realistic downward light beam, and smooth entrance ignition!
  // ========================================================
  if (variant === 'floating') {
    return (
      <aside
        aria-label="Interactive 3D Desk Lamp"
        className={`fixed top-28 right-3 sm:top-28 sm:right-6 md:top-32 md:right-8 lg:right-10 z-40 select-none pointer-events-none transition-all duration-700 max-sm:scale-75 max-sm:origin-top-right ${
          hasEntered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        } ${className}`}
      >
        <div
          ref={lampCardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={handlePull}
          style={{
            transform: isHovered
              ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) scale(1.03)`
              : 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)',
            transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          className="relative pointer-events-auto cursor-pointer flex flex-col items-end group"
          title={isDark ? 'Pull chain to turn OFF lamp (Daylight Mode)' : 'Pull chain to turn ON lamp (Dark Mode)'}
        >
          {/* ========================================================
              1. ELEGANT INTERACTIVE PULL-CHAIN BADGE / CONTROLLER
              Positioned at the upper right of the lamp with live status
              ======================================================== */}
          <div
            className={`mb-1 px-3 py-1 rounded-xl border backdrop-blur-xl shadow-xl flex items-center gap-2 transition-all duration-300 self-end mr-0.5 ${
              isDark
                ? 'bg-slate-900/90 border-amber-500/40 text-amber-300 shadow-[0_6px_20px_rgba(245,158,11,0.25)] group-hover:border-amber-400 group-hover:bg-slate-800/95'
                : 'bg-white/95 border-slate-300/90 text-slate-800 shadow-[0_6px_16px_rgba(15,23,42,0.1)] group-hover:border-slate-400 group-hover:bg-white'
            }`}
          >
            {/* Status Indicator Dot */}
            <span className="relative flex h-2 w-2">
              {isLampLit && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLampLit ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-400'
                }`}
              />
            </span>

            <span className="text-[11px] font-extrabold tracking-tight">
              {isDark ? 'Lamp: ON' : 'Daylight: ON'}
            </span>

            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold group-hover:scale-105 transition-transform">
              Pull ⛓️
            </span>
          </div>

          {/* ========================================================
              2. LAMP GRAPHIC CONTAINER WITH PRECISE LIGHTING LAYERS
              ======================================================== */}
          <div className="relative flex flex-col items-center">
            {/* Volumetric Downward Light Beam (When Lamp is Lit) */}
            <div
              className={`absolute top-[42px] sm:top-[50px] md:top-[60px] left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-700 transform-gpu ${
                isLampLit ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                width: '190px',
                height: '145px',
                background:
                  'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.52) 0%, rgba(245, 158, 11, 0.25) 45%, rgba(217, 119, 6, 0.08) 70%, transparent 90%)',
                clipPath: 'polygon(32% 0%, 68% 0%, 100% 100%, 0% 100%)',
                filter: 'blur(3.5px)',
              }}
            />

            {/* Ambient Radiant Bloom Halo (Behind Lamp Shade) */}
            <div
              className={`absolute top-4 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-700 ${
                isLampLit
                  ? isHovered
                    ? 'opacity-95 scale-110'
                    : 'opacity-85 scale-100 animate-lamp-warmth'
                  : 'opacity-0 scale-75'
              }`}
              style={{
                width: '175px',
                height: '135px',
                background:
                  'radial-gradient(circle, rgba(251, 191, 36, 0.45) 0%, rgba(245, 158, 11, 0.22) 50%, transparent 75%)',
                filter: 'blur(16px)',
              }}
            />

            {/* Desk Surface Warm Light Pool (Under the Base) */}
            <div
              className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-700 ${
                isLampLit ? 'opacity-95 animate-lamp-desk-pool' : 'opacity-0'
              }`}
              style={{
                width: '155px',
                height: '35px',
                background:
                  'radial-gradient(ellipse, rgba(251, 191, 36, 0.55) 0%, rgba(245, 158, 11, 0.22) 60%, transparent 85%)',
                filter: 'blur(8px)',
              }}
            />

            {/* Sleek Scaled 3D Vintage Pull-Chain Desk Lamp SVG */}
            <div className="relative w-[110px] h-[138px] sm:w-[130px] sm:h-[162px] md:w-[155px] md:h-[194px]">
              <EnlargedVintageLampSvg
                isDark={isLampLit}
                isPulling={isPulling}
                isHovered={isHovered}
                isIgnited={isIgnited}
              />
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // ========================================================
  // VARIANT: NAVBAR 3D VINTAGE LAMP BUTTON
  // Synchronized in the top header with a sleek lamp logo!
  // ========================================================
  return (
    <button
      onClick={handlePull}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200 select-none cursor-pointer group ${
        isDark
          ? 'bg-slate-900/90 hover:bg-slate-800/95 border-amber-500/50 text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] hover:-translate-y-0.5 hover:border-amber-400'
          : 'bg-white hover:bg-slate-50 border-slate-300/90 text-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.08),inset_0_1px_0_#ffffff] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)]'
      } ${className}`}
      title={isDark ? 'Pull string to turn OFF lamp → Light Mode' : 'Pull string to turn ON lamp → Dark Mode'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {/* 3D Vintage Lamp with clearly visible Hanging String */}
      <div className="relative w-9 h-11 sm:w-10 sm:h-12 flex items-center justify-center">
        {isDark && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-14 h-10 pointer-events-none transition-opacity duration-500 animate-lamp-warmth"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.65) 0%, rgba(245, 158, 11, 0.25) 60%, transparent 80%)',
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
              filter: 'blur(2px)',
            }}
          />
        )}
        <EnlargedVintageLampSvg
          isDark={isDark}
          isPulling={isPulling}
          isHovered={isHovered}
          isIgnited={isIgnited}
        />
      </div>

      {/* Button Text */}
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold tracking-tight flex items-center gap-1.5">
          {isDark ? (
            <span className="text-amber-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
              <span>Dark</span>
            </span>
          ) : (
            <span className="text-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Light</span>
            </span>
          )}
        </span>
        <span className="text-[10px] font-mono text-slate-400 dark:text-amber-300/70 hidden sm:inline -mt-0.5">
          {isDark ? 'Lamp ON 💡' : 'Pull ⛓️'}
        </span>
      </div>
    </button>
  );
};

// ========================================================
// ENLARGED 3D VINTAGE PULL-CHAIN LAMP SVG
// Coordinates: 120 x 150 (Desktop)
// - Realistic stepped cast-brass base with contact shadow
// - Polished gooseneck swan arm with specular highlights
// - Fluted bell lampshade with shiny brass edge rim
// - Glowing Edison bulb with incandescent tungsten filament
// - Prominent hanging beaded pull-chain with brass acorn handle
// ========================================================
interface EnlargedLampProps {
  isDark: boolean;
  isPulling: boolean;
  isHovered: boolean;
  isIgnited: boolean;
  compact?: boolean;
}

const EnlargedVintageLampSvg: React.FC<EnlargedLampProps> = ({
  isDark,
  isPulling,
  isHovered,
  compact = false,
}) => {
  return (
    <svg
      viewBox="0 0 120 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full overflow-visible transition-transform duration-300 transform-gpu"
    >
      <defs>
        {/* Antique Polished Brass Tube Gradient */}
        <linearGradient id="antiqueBrassArm" x1="24" y1="20" x2="80" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="15%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="75%" stopColor="#b45309" />
          <stop offset="90%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Stepped Cast-Brass Base Gradient */}
        <linearGradient id="steppedBaseGrad" x1="25" y1="130" x2="85" y2="142" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Fluted Vintage Bell Lampshade Gradient */}
        <linearGradient id="vintageLampshadeGrad" x1="36" y1="38" x2="112" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={isDark ? '#fbbf24' : '#64748b'} />
          <stop offset="35%" stopColor={isDark ? '#f59e0b' : '#475569'} />
          <stop offset="70%" stopColor={isDark ? '#d97706' : '#334155'} />
          <stop offset="100%" stopColor={isDark ? '#92400e' : '#1e293b'} />
        </linearGradient>

        {/* Polished Gold Shade Rim */}
        <linearGradient id="goldRimGrad" x1="36" y1="72" x2="112" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="25%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#d97706" />
          <stop offset="85%" stopColor="#78350f" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
        </linearGradient>

        {/* Edison Bulb Radial Core Glow */}
        <radialGradient id="edisonCoreGrad" cx="74" cy="78" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="65%" stopColor="#f59e0b" />
          <stop offset="90%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>

        {/* Brass Beaded Ball-Chain Gradient */}
        <linearGradient id="ballChainGrad" x1="90" y1="70" x2="94" y2="128" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Acorn Pull Handle Gradient */}
        <radialGradient id="acornGripGrad" cx="92" cy="116" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </radialGradient>

        {/* Drop shadow filter for 3D depth */}
        <filter id="lamp3dShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ========================================================
          1. REALISTIC CAST-BRASS TIERED DESK BASE & SHADOW
          ======================================================== */}
      {!compact && (
        <g>
          {/* Deep physical contact shadow on table surface */}
          <ellipse cx="55" cy="144" rx="34" ry="5.5" fill="#000000" opacity="0.35" />

          {/* Stepped Tier 1 (Bottom Rim) */}
          <ellipse cx="55" cy="140" rx="30" ry="6" fill="#1e293b" />
          <ellipse cx="55" cy="138" rx="29" ry="5.5" fill="url(#steppedBaseGrad)" stroke="#78350f" strokeWidth="1" />

          {/* Stepped Tier 2 (Polished Ring) */}
          <ellipse cx="55" cy="135" rx="22" ry="4.5" fill="url(#antiqueBrassArm)" stroke="#b45309" strokeWidth="0.8" />
          <ellipse cx="55" cy="133.5" rx="20" ry="3.8" fill="#d97706" />

          {/* Stepped Tier 3 (Collar Mount) */}
          <ellipse cx="55" cy="130" rx="13" ry="2.8" fill="#fef08a" stroke="#78350f" strokeWidth="0.8" />
          <rect x="52" y="126" width="6" height="5" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="0.6" />
        </g>
      )}

      {/* ========================================================
          2. ELEGANT SWAN GOOSENECK BRASS ARM
          Sweeps from base up to the shade with metallic bevel
          ======================================================== */}
      <path
        d="M 55 128 C 28 124, 18 84, 34 44 C 42 22, 68 18, 74 34"
        stroke="url(#antiqueBrassArm)"
        strokeWidth={compact ? '5' : '6.5'}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#lamp3dShadow)"
      />

      {/* Specular Inner Glare Highlight on Arm */}
      <path
        d="M 54 126 C 30 122, 21 84, 36 45 C 43 24, 66 20, 72 34"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* ========================================================
          3. TOP BRASS FINIAL & SOCKET COLLAR
          ======================================================== */}
      <circle cx="74" cy="32" r="4.2" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
      <circle cx="73" cy="31" r="1.5" fill="#ffffff" opacity="0.8" />
      <rect x="70" y="34.5" width="8" height="6" rx="1.8" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />

      {/* ========================================================
          4. FLUTED VINTAGE BELL LAMPSHADE
          Flares gracefully from socket neck down to polished rim
          ======================================================== */}
      <g filter="url(#lamp3dShadow)">
        {/* Exterior Shade Surface */}
        <path
          d="M 68 40 C 67 47, 44 60, 36 72 C 36 72, 74 77, 112 72 C 104 60, 81 47, 80 40 Z"
          fill="url(#vintageLampshadeGrad)"
          stroke={isDark ? '#d97706' : '#334155'}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* 3D Fluted Ribs / Specular Curved Contours on Shade */}
        <path d="M 71 41 C 70 48, 56 61, 52 72" stroke="#ffffff" strokeWidth="1.5" opacity={isDark ? '0.35' : '0.2'} />
        <path d="M 74 41 C 74 49, 74 62, 74 74" stroke="#ffffff" strokeWidth="1.8" opacity={isDark ? '0.45' : '0.25'} />
        <path d="M 77 41 C 78 48, 92 61, 96 72" stroke="#ffffff" strokeWidth="1.5" opacity={isDark ? '0.35' : '0.2'} />

        {/* Polished Brass Lower Edge Rim */}
        <ellipse
          cx="74"
          cy="72"
          rx="38"
          ry="7.5"
          fill={isDark ? '#78350f' : '#1e293b'}
          stroke="url(#goldRimGrad)"
          strokeWidth="2.2"
        />

        {/* Interior Underbelly Cavity */}
        <ellipse
          cx="74"
          cy="72"
          rx="35"
          ry="6.5"
          fill={isDark ? '#d97706' : '#0f172a'}
          opacity={isDark ? '0.9' : '0.95'}
        />
      </g>

      {/* ========================================================
          5. EDISON INCANDESCENT BULB & TUNGSTEN FILAMENT
          ======================================================== */}
      {isDark ? (
        <g className="animate-lamp-warmth">
          {/* Glowing Bulb Glass Envelope */}
          <ellipse
            cx="74"
            cy="78"
            rx="9"
            ry="11"
            fill="url(#edisonCoreGrad)"
            style={{ filter: 'drop-shadow(0 0 14px #f59e0b) drop-shadow(0 0 28px #fbbf24)' }}
          />

          {/* White-Hot Electric Core Arc */}
          <ellipse cx="74" cy="77" rx="4.5" ry="6" fill="#ffffff" opacity="0.95" />

          {/* Glowing Tungsten Double-Loop Filament */}
          <path
            d="M 70 82 C 69 76, 72 74, 74 81 C 76 74, 79 76, 78 82"
            stroke="#ffffff"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 4px #ffffff)' }}
          />
        </g>
      ) : (
        <g>
          {/* Cool Resting Frosted Glass Bulb Envelope */}
          <ellipse
            cx="74"
            cy="78"
            rx="8.5"
            ry="10"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1.2"
            opacity="0.85"
          />

          {/* Inactive Tungsten Wire Thread */}
          <path
            d="M 71 82 C 70 76, 73 75, 74 81 C 75 75, 78 76, 77 82"
            stroke="#64748b"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}

      {/* Brass Switch Nut Socket Eyelet (Where chain emerges) */}
      <circle cx="92" cy="72" r="3" fill="#fef08a" stroke="#b45309" strokeWidth="1" />

      {/* ========================================================
          6. THE PROMINENT BEADED BRASS PULL-CHAIN (STRING)
          Originates at (92, 72) and hangs down to (92, 108) (or 126 on pull)
          Features individual metallic ball beads and classic acorn handle!
          ======================================================== */}
      <g
        className={`transition-all duration-300 transform-gpu ${
          isPulling ? 'animate-lamp-pull' : isHovered ? 'animate-lamp-chain-sway' : ''
        }`}
        style={{ transformOrigin: '92px 72px' }}
      >
        {/* Beaded Wire Backbone */}
        <line
          x1="92"
          y1="73"
          x2="92"
          y2={isPulling ? 122 : 106}
          stroke="url(#ballChainGrad)"
          strokeWidth="1.8"
          strokeDasharray="1.2 2"
        />

        {/* Individual Shiny Golden Ball-Chain Beads */}
        <circle cx="92" cy="77" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="92" cy="82" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="92" cy="87" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="92" cy="92" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="92" cy="97" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="92" cy="102" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
        <circle cx="92" cy="107" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />

        {/* Additional Beads Revealed When Pulled Down */}
        {isPulling && (
          <>
            <circle cx="92" cy="112" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
            <circle cx="92" cy="117" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
            <circle cx="92" cy="122" r="1.8" fill="url(#ballChainGrad)" stroke="#78350f" strokeWidth="0.5" />
          </>
        )}

        {/* Top Connecting Ring of the Acorn Fob Handle */}
        <circle
          cx="92"
          cy={isPulling ? 124 : 108}
          r="2.4"
          fill="#fef08a"
          stroke="#b45309"
          strokeWidth="0.8"
        />

        {/* Classic Sculpted Antique Brass Acorn Pull Fob Handle */}
        <path
          d={
            isPulling
              ? 'M 92 125 C 88 127, 87 134, 92 138 C 97 134, 96 127, 92 125 Z'
              : 'M 92 109 C 88 111, 87 118, 92 122 C 97 118, 96 111, 92 109 Z'
          }
          fill="url(#acornGripGrad)"
          stroke="#78350f"
          strokeWidth="1.2"
          style={{
            filter: isDark
              ? 'drop-shadow(0 0 6px rgba(251, 191, 36, 0.8))'
              : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.45))',
          }}
        />

        {/* Acorn Grip Ridges */}
        <line
          x1="89.5"
          y1={isPulling ? 131 : 115}
          x2="94.5"
          y2={isPulling ? 131 : 115}
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Specular White Highlight on Acorn Handle */}
        <ellipse
          cx="91"
          cy={isPulling ? 133 : 117}
          rx="1.5"
          ry="2.8"
          fill="#ffffff"
          opacity="0.8"
        />
      </g>
    </svg>
  );
};

export default ThreeDLampToggle;
