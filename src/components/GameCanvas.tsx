'use client';

import { useRef, useEffect, useState, memo } from 'react';
import { generatePixelationLevels, loadImage } from '@/lib/pixelate';

interface GameCanvasProps {
  imageSrc: string;
  level: number; // 1–10
  onLoaded?: () => void;
}

function GameCanvasInner({ imageSrc, level, onLoaded }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelsRef = useRef<HTMLCanvasElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      setIsLoading(true);
      try {
        const img = await loadImage(imageSrc);
        if (cancelled) return;

        // Use container dimensions for canvas sizing
        const container = containerRef.current;
        const width = container ? container.clientWidth : 600;
        const height = container ? Math.round(width * 0.75) : 450;

        // Pre-render all 10 levels
        levelsRef.current = generatePixelationLevels(img, width, height);

        // Draw current level
        const canvas = canvasRef.current;
        if (canvas && levelsRef.current[level - 1]) {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(levelsRef.current[level - 1], 0, 0);
        }

        setIsLoading(false);
        onLoaded?.();
      } catch (err) {
        console.error('Failed to load image:', err);
        setIsLoading(false);
      }
    }

    render();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc]);

  // Update canvas when level changes (instant — no re-rendering needed)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && levelsRef.current[level - 1]) {
      canvas.width = levelsRef.current[level - 1].width;
      canvas.height = levelsRef.current[level - 1].height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(levelsRef.current[level - 1], 0, 0);
    }
  }, [level]);

  return (
    <div ref={containerRef} className="pixel-container bg-surface-container-high relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">Loading image...</span>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain pixelated"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-gradient-to-br from-white/5 to-transparent" />
    </div>
  );
}

export const GameCanvas = memo(GameCanvasInner);
