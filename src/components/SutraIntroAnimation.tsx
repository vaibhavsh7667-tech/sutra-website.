'use client';

import React, { useEffect, useState } from 'react';

interface SutraIntroAnimationProps {
  onComplete?: () => void;
}

export const SutraIntroAnimation: React.FC<SutraIntroAnimationProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    // Check if user has already seen intro in this session
    const seen = sessionStorage.getItem('sutra_intro_seen');
    if (seen) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // Sequence:
    // 0: Initial glow line
    // 1: Thread connects mathematical points (250ms)
    // 2: Forms SUTRA symbol (550ms)
    // 3: SUTRA wordmark appears (850ms)
    // 4: Tagline appears (1050ms)
    // 5: Fade out and complete (1350ms)

    const t1 = setTimeout(() => setStage(1), 200);
    const t2 = setTimeout(() => setStage(2), 500);
    const t3 = setTimeout(() => setStage(3), 800);
    const t4 = setTimeout(() => setStage(4), 1050);
    const t5 = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('sutra_intro_seen', 'true');
      if (onComplete) onComplete();
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  const handleSkip = () => {
    setIsVisible(false);
    sessionStorage.setItem('sutra_intro_seen', 'true');
    if (onComplete) onComplete();
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl transition-opacity duration-300 cursor-pointer select-none ${
        stage >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      title="Click anywhere to skip"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm px-6">
        {/* Animated Mathematical Continuous Thread SVG */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="introThreadGrad" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              <filter id="threadGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Orbit Ellipse */}
            <ellipse
              cx="50"
              cy="50"
              rx="36"
              ry="18"
              transform="rotate(-28 50 50)"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className={`transition-all duration-700 ${stage >= 1 ? 'opacity-40' : 'opacity-0'}`}
            />

            {/* The Continuous Sutra Thread Path */}
            <path
              d="M 28 28 C 50 10, 72 32, 50 50 C 28 68, 50 90, 72 72"
              stroke="url(#introThreadGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#threadGlow)"
              style={{
                strokeDasharray: 200,
                strokeDashoffset: stage >= 1 ? 0 : 200,
                transition: 'strokeDashoffset 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />

            {/* 3 Connected Knowledge Nodes */}
            <circle
              cx="28"
              cy="28"
              r={stage >= 1 ? 4 : 0}
              fill="#2563eb"
              className="transition-all duration-300"
            />
            <circle
              cx="50"
              cy="50"
              r={stage >= 2 ? 5 : 0}
              fill="#0284c7"
              className="transition-all duration-300"
            />
            <circle
              cx="72"
              cy="72"
              r={stage >= 2 ? 4 : 0}
              fill="#d97706"
              className="transition-all duration-300"
            />
          </svg>
        </div>

        {/* Brand Name "SUTRA" */}
        <div
          className={`space-y-1 transition-all duration-500 transform ${
            stage >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-black tracking-widest text-slate-900 font-sans sutra-3d-text">
              SUTRA
            </h1>
            <span
              className="w-3 h-3 rounded-full mt-0.5"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #fef3c7 0%, #f59e0b 55%, #b45309 100%)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.9), 0 2px 4px rgba(180, 83, 9, 0.5)',
              }}
            />
          </div>

          <p
            className={`text-xs font-semibold tracking-wider text-slate-500 uppercase transition-all duration-500 ${
              stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Calculate • Solve • Visualize
          </p>
        </div>
      </div>
    </div>
  );
};

export default SutraIntroAnimation;
