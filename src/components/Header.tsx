'use client';

import Link from 'next/link';
import { User } from '@/domain/types';

interface HeaderProps {
  score: number;
  user: User | null;
  onLeaderboard: () => void;
  onSettings: () => void;
  onSignOut: () => void;
}

export function Header({ score, user, onLeaderboard, onSettings, onSignOut }: HeaderProps) {
  const iconBtn =
    'material-symbols-outlined text-[20px] text-on-surface-variant hover:text-primary transition-colors';

  return (
    <header className="w-full">
      <div className="flex items-center justify-between max-w-[640px] mx-auto px-gutter py-base">
        <Link href="/" className="font-headline-lg text-headline-lg text-primary lowercase tracking-tight">
          pixelpeel
        </Link>

        <div className="flex items-center gap-md">
          <span className="font-label-sm text-label-sm text-outline">
            score <span className="text-on-surface-variant">{score}</span>
          </span>

          <button onClick={onLeaderboard} className={iconBtn} aria-label="Leaderboard">
            leaderboard
          </button>
          <button onClick={onSettings} className={iconBtn} aria-label="Settings">
            settings
          </button>

          {user ? (
            <div className="flex items-center gap-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{user.username}</span>
              <button
                onClick={onSignOut}
                className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors"
              >
                logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
            >
              login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
