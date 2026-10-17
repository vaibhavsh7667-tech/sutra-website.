'use client';

import React, { useRef, useEffect } from 'react';
import { X, Eye } from 'lucide-react';

interface VisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  data?: Record<string, unknown>;
}

export const VisualizerModal: React.FC<VisualizerModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    if (type === 'geometry') {
      // Draw circle or geometric shape
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = 90;

      // Circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.fill();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Radius line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center dot
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Labels
      const geoData = data as { radius?: number; area?: number } | undefined;
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px monospace';
      ctx.fillText(`Radius r = ${geoData?.radius || 7}`, centerX + 20, centerY - 10);
      ctx.fillText(`Area = πr² ≈ ${(geoData?.area || 153.94).toFixed(2)}`, centerX - 60, centerY + radius + 30);
    } else if (type === 'motion') {
      // Draw parabolic motion projectile or force vector
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      // Ground line
      ctx.beginPath();
      ctx.moveTo(40, h - 50);
      ctx.lineTo(w - 40, h - 50);
      ctx.stroke();

      // Projectile trajectory
      ctx.beginPath();
      ctx.moveTo(60, h - 50);
      ctx.quadraticCurveTo(w / 2, 40, w - 80, h - 50);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Force Vector
      ctx.beginPath();
      ctx.moveTo(w / 2, 75);
      ctx.lineTo(w / 2, 135);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(w / 2 - 6, 125);
      ctx.lineTo(w / 2, 135);
      ctx.lineTo(w / 2 + 6, 125);
      ctx.fillStyle = '#f43f5e';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText('Gravity / Force F = m·g ↓', w / 2 + 10, 110);
      ctx.fillText('Kinematic Path s(t) = ut + ½at²', 70, 70);
    } else {
      // Default: Normal distribution bell curve
      ctx.beginPath();
      ctx.moveTo(30, h - 40);
      for (let x = 30; x <= w - 30; x++) {
        const normX = (x - w / 2) / 70;
        const normY = Math.exp(-0.5 * normX * normX);
        const y = h - 40 - normY * 180;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Fill area under curve
      ctx.lineTo(w - 30, h - 40);
      ctx.closePath();
      ctx.fillStyle = 'rgba(129, 140, 248, 0.2)';
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '13px monospace';
      ctx.fillText('Standard Gaussian Distribution N(μ, σ²)', w / 2 - 140, 50);
    }
  }, [isOpen, type, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-base">Mathematical Visualizer</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={520}
            height={300}
            className="w-full max-w-[520px] h-[300px] rounded-2xl border border-slate-800 bg-slate-950"
          />
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisualizerModal;
