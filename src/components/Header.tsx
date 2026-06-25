'use client';

interface HeaderProps {
  score: number;
  streak: number;
  onLeaderboard: () => void;
  onSettings: () => void;
}

export function Header({ score, streak, onLeaderboard, onSettings }: HeaderProps) {
  return (
    <header className="w-full top-0 bg-surface border-b border-outline-variant shadow-sm sticky z-50">
      <div className="flex justify-between items-center px-gutter py-base max-w-[600px] mx-auto">
        <div className="flex items-center gap-xs">
          <span className="font-headline-lg text-headline-lg-mobile md:text-headline-lg font-extrabold text-primary">
            PixelPeel
          </span>
        </div>
        <div className="flex items-center gap-md">
          {/* Desktop score */}
          <div className="hidden md:flex flex-col items-end">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Score
            </span>
            <span className="font-headline-lg text-headline-lg-mobile text-primary">
              {score.toLocaleString()}
            </span>
          </div>
          {/* Streak badge */}
          {streak > 0 && (
            <div className="flex items-center gap-xs bg-primary/10 px-3 py-1.5 rounded-full animate-scale-in">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                local_fire_department
              </span>
              <span className="font-label-sm text-label-sm text-primary">{streak}</span>
            </div>
          )}
          {/* Action buttons */}
          <div className="flex items-center gap-base">
            <button
              onClick={onLeaderboard}
              className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
              aria-label="Leaderboard"
            >
              leaderboard
            </button>
            <button
              onClick={onSettings}
              className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
              aria-label="Settings"
            >
              settings
            </button>
          </div>
        </div>
      </div>
      {/* Mobile score bar */}
      <div className="md:hidden flex justify-center pb-1">
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Score: <span className="text-primary font-bold">{score.toLocaleString()}</span>
        </span>
      </div>
    </header>
  );
}
