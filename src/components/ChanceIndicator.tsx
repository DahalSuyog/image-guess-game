'use client';

import { MAX_REVEALS } from '@/config/game.config';

interface ChanceIndicatorProps {
  revealsUsed: number;
}

export function ChanceIndicator({ revealsUsed }: ChanceIndicatorProps) {
  const remaining = Math.max(0, MAX_REVEALS - revealsUsed);

  return (
    <div className="flex items-center gap-2" aria-label={`${remaining} reveals remaining`}>
      {Array.from({ length: MAX_REVEALS }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
            i < remaining ? 'bg-primary' : 'bg-surface-container-high'
          }`}
        />
      ))}
    </div>
  );
}
