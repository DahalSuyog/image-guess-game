'use client';

import { MAX_REVEALS } from '@/config/game.config';

interface ChanceIndicatorProps {
  revealsUsed: number;
}

export function ChanceIndicator({ revealsUsed }: ChanceIndicatorProps) {
  const remaining = Math.max(0, MAX_REVEALS - revealsUsed);

  return (
    <div className="flex gap-sm mb-md animate-fade-in" id="chanceIndicator">
      {Array.from({ length: MAX_REVEALS }).map((_, i) => {
        const isActive = i < remaining;
        return (
          <div
            key={i}
            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300
              ${isActive
                ? 'bg-success text-on-success shadow-md scale-100'
                : 'bg-surface-container-high text-outline/30 scale-90 border border-dashed border-outline/30'
              }
            `}
          >
            <span
              className="material-symbols-outlined text-[22px] md:text-[24px]"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              visibility
            </span>
          </div>
        );
      })}
    </div>
  );
}
