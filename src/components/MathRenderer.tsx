'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  latex,
  displayMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Clean leading and trailing backslashes if escaped
      const expr = latex.trim();
      if (!expr) {
        containerRef.current.innerHTML = '';
        return;
      }

      katex.render(expr, containerRef.current, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      if (containerRef.current) {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
};

export default MathRenderer;
