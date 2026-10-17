'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Sutra3DTitleProps {
  className?: string;
}

export const Sutra3DTitle: React.FC<Sutra3DTitleProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Mouse move handler for interactive 3D parallax tilt
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Limit maximum tilt angle to 14 degrees for smooth, elegant 3D feel
    const tiltY = Math.max(-14, Math.min(14, deltaX * 14));
    const tiltX = Math.max(-14, Math.min(14, -deltaY * 14));

    setRotate({ x: tiltX, y: tiltY });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smooth reset back to center
    setRotate({ x: 0, y: 0 });
  };

  // Click to trigger a playful 3D rotation flip
  const handleTitleClick = () => {
    setFlipped((prev) => !prev);
  };

  const letters = ['S', 'U', 'T', 'R', 'A'];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block py-2 px-4 cursor-pointer select-none group perspective-[1200px] ${className}`}
      title="Interactive 3D SUTRA • Move cursor to tilt in 3D • Click to rotate"
      onClick={handleTitleClick}
    >
      {/* 3D Transform Stage */}
      <div
        className="transform-gpu transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${
            flipped ? 'rotateY(360deg)' : ''
          }`,
          transformStyle: 'preserve-3d',
          transition: isHovered
            ? 'transform 0.08s ease-out'
            : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Main 3D SUTRA Heading */}
        <h1
          aria-label="SUTRA"
          className="flex items-center justify-center gap-1 md:gap-2 text-5xl sm:text-6xl md:text-7xl font-black tracking-[0.18em] font-sans relative z-10"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {letters.map((char, index) => (
            <span
              key={index}
              className={`sutra-3d-letter animate-sutra-wave-${index} text-slate-900 drop-shadow-sm`}
              style={{
                transform: `translateZ(${16 + index * 2}px)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {char}
            </span>
          ))}

          {/* 3D Glowing Golden Bindu Node */}
          <span
            className="relative inline-flex items-center justify-center ml-1 md:ml-2"
            style={{
              transform: 'translateZ(30px)',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Outer Glowing Radial Aura */}
            <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 blur-md animate-pulse pointer-events-none" />

            {/* Solid 3D Sphere with Specular Highlight and Depth */}
            <span
              className="relative block w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full transition-transform duration-300 group-hover:scale-125"
              style={{
                background:
                  'radial-gradient(circle at 32% 28%, #ffffff 0%, #fef08a 22%, #f59e0b 58%, #b45309 100%)',
                boxShadow:
                  '0 0 16px rgba(245, 158, 11, 0.85), 0 4px 10px rgba(180, 83, 9, 0.6), inset 0 1px 2px rgba(255,255,255,0.9), inset 0 -2px 3px rgba(120, 53, 15, 0.7)',
              }}
            />
          </span>
        </h1>

        {/* 3D Ambient Contact Shadow beneath letters */}
        <div
          className="h-3 md:h-4 w-3/4 mx-auto mt-1 rounded-full bg-slate-900/15 blur-md pointer-events-none transition-all duration-200"
          style={{
            transform: `translateZ(-20px) translateX(${rotate.y * 1.5}px) scaleX(${
              1 - Math.abs(rotate.y) * 0.02
            })`,
          }}
        />
      </div>

      {/* Subtle 3D Interactive Badge (appears on hover) */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
        <span className="px-2.5 py-0.5 rounded-full bg-white/95 border border-slate-200 shadow-xs text-[9.5px] font-semibold text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
          <span>3D Interactive • Tilt &amp; Click to Rotate</span>
        </span>
      </div>
    </div>
  );
};

export default Sutra3DTitle;
