'use client';

import Link from 'next/link';

interface HeaderProps {
  score: number;
  onLeaderboard: () => void;
  onSettings: () => void;
}

export function Header({ score, onLeaderboard, onSettings }: HeaderProps) {
  const iconBtn =
    'material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors shrink-0 p-1.5 -m-1.5';

  return (
    <header className="w-full">
      <div className="flex items-center justify-between gap-3 max-w-[640px] mx-auto px-4 sm:px-gutter py-base">
        <Link
          href="/"
          className="font-headline-lg text-headline-lg text-primary lowercase tracking-tight shrink-0"
        >
          pixelpeel
        </Link>

        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          <span className="font-label-sm text-label-sm text-outline whitespace-nowrap">
            <span className="hidden min-[420px]:inline">score </span>
            <span className="text-on-surface-variant">{score}</span>
          </span>

          <button onClick={onLeaderboard} className={iconBtn} aria-label="Leaderboard">
            leaderboard
          </button>
          <button onClick={onSettings} className={iconBtn} aria-label="Settings">
            settings
          </button>
        </div>
      </div>
    </header>
  );
}
