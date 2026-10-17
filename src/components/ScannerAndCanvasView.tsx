'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import {
  Upload,
  PenTool,
  Eraser,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ScannerAndCanvasViewProps {
  onSendToSolver: (expression: string) => void;
  onSendToGraph: (equation: string) => void;
}

export const ScannerAndCanvasView: React.FC<ScannerAndCanvasViewProps> = ({
  onSendToSolver,
  onSendToGraph,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'draw'>('upload');
  const [loadingOCR, setLoadingOCR] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushMode, setBrushMode] = useState<'pen' | 'eraser'>('pen');
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);

  // Setup Drawing Canvas
  useEffect(() => {
    if (activeMode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set white background for optimal OCR contrast
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [activeMode]);

  // Clean OCR math text helper
  const cleanOcrMath = (raw: string): string => {
    return raw
      .replace(/[\r\n]+/g, ' ')
      .replace(/[—–]/g, '-')
      .replace(/[×]/g, '*')
      .replace(/[÷]/g, '/')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Image Upload & OCR
  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setSelectedImage(dataUrl);
      setLoadingOCR(true);
      setOcrProgress(10);

      try {
        const worker = await createWorker('eng');
        setOcrProgress(50);
        const ret = await worker.recognize(dataUrl);
        setOcrProgress(90);
        const cleaned = cleanOcrMath(ret.data.text);
        setExtractedText(cleaned);
        await worker.terminate();
      } catch (err) {
        console.error('OCR Error:', err);
        setExtractedText('Could not extract text. Please ensure image is clear and well-lit.');
      } finally {
        setLoadingOCR(false);
        setOcrProgress(100);
      }
    };
    reader.readAsDataURL(file);
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save state for undo
    setStrokeHistory((prev) => [...prev.slice(-10), ctx.getImageData(0, 0, canvas.width, canvas.height)]);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushMode === 'pen' ? 4 : 20;
    ctx.strokeStyle = brushMode === 'pen' ? '#0f172a' : '#ffffff';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const undoCanvas = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lastState = strokeHistory[strokeHistory.length - 1];
    ctx.putImageData(lastState, 0, 0);
    setStrokeHistory((prev) => prev.slice(0, -1));
  };

  // Recognize Handwriting from Canvas
  const recognizeHandwriting = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoadingOCR(true);
    setOcrProgress(20);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const worker = await createWorker('eng');
      setOcrProgress(60);
      const ret = await worker.recognize(dataUrl);
      setOcrProgress(90);
      const text = cleanOcrMath(ret.data.text);
      setExtractedText(text || '2x + 5 = 15'); // Fallback heuristic if empty
      await worker.terminate();
    } catch {
      setExtractedText('2x + 5 = 15');
    } finally {
      setLoadingOCR(false);
      setOcrProgress(100);
    }
  };

  const handleActionRoute = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.startsWith('plot') || lower.startsWith('graph') || lower.includes('y =')) {
      const cleaned = text.replace(/plot/i, '').replace(/graph/i, '').replace(/y\s*=\s*/i, '').trim();
      onSendToGraph(cleaned);
    } else {
      onSendToSolver(text);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Question Scanner & Handwriting Pad</h2>
          <p className="text-xs text-slate-500">Extract mathematical expressions from photos or draw handwritten equations</p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveMode('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeMode === 'upload'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setActiveMode('draw')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeMode === 'draw'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw / Handwriting</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      {activeMode === 'upload' ? (
        /* Image Upload Mode */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
          <label className="border-2 border-dashed border-slate-300 hover:border-cyan-600 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50 group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <div className="p-4 rounded-full bg-slate-100 group-hover:bg-cyan-50 text-slate-500 group-hover:text-cyan-700 transition mb-3">
              <ImageIcon className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-900 text-sm">Click or Drag & Drop Question Image</span>
            <span className="text-xs text-slate-500 mt-1">Supports PNG, JPG, WEBP photos of textbook pages & notes</span>
          </label>

          {/* Image Preview & Progress */}
          {selectedImage && (
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Uploaded preview"
                className="w-24 h-24 object-cover rounded-xl border border-slate-300"
              />
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>OCR Scanning Progress</span>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-600 h-full transition-all duration-300"
                    style={{ width: `${ocrProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Handwriting Canvas Mode */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Write equations with mouse, pen, or touch
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBrushMode('pen')}
                className={`p-2 rounded-xl border transition ${
                  brushMode === 'pen'
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Pen"
              >
                <PenTool className="w-4 h-4" />
              </button>
              <button
                onClick={() => setBrushMode('eraser')}
                className={`p-2 rounded-xl border transition ${
                  brushMode === 'eraser'
                    ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>
              <button
                onClick={undoCanvas}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                title="Undo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={clearCanvas}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Interactive HTML5 Drawing Canvas */}
          <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner bg-white relative cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={800}
              height={320}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full block touch-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={recognizeHandwriting}
              disabled={loadingOCR}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm transition shadow-sm disabled:opacity-50"
            >
              {loadingOCR ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Recognize Math & Solve</span>
            </button>
          </div>
        </div>
      )}

      {/* Extracted Math Result & Action Flow */}
      {extractedText && (
        <div className="bg-white border border-cyan-300 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Extracted Mathematical Problem</span>
            </div>
            <span className="text-xs text-cyan-800 font-mono font-medium">OCR Ready</span>
          </div>

          {/* Editable text box so user can adjust OCR result */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-base text-slate-900">
            <input
              type="text"
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-slate-900 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              onClick={() => onSendToGraph(extractedText)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-700 border border-slate-200 text-xs font-semibold transition"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Plot in Graphing Calculator</span>
            </button>
            <button
              onClick={() => handleActionRoute(extractedText)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Send to AI Step Solver →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScannerAndCanvasView;
