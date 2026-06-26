'use client';

import { LeaderboardEntry } from '@/domain/types';
import { MAX_REVEALS } from '@/config/game.config';

interface ReadyScreenProps {
  weekLabel: string;
  alreadyPlayed: boolean;
  nextResetLabel: string;
  weeklyLeaderboard: LeaderboardEntry[];
  onStart: () => void;
  onOpenLeaderboard: () => void;
}

export function ReadyScreen({
  weekLabel,
  alreadyPlayed,
  nextResetLabel,
  weeklyLeaderboard,
  onStart,
  onOpenLeaderboard,
}: ReadyScreenProps) {
  return (
    <section className="w-full bg-surface-container-high rounded-[32px] border border-outline-variant p-8 space-y-6 animate-fade-in">
      <div className="space-y-3 text-center">
        <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface-variant">{weekLabel}</p>
        <h1 className="font-display-lg text-display-lg text-on-surface">5 images. 10 reveals. One weekly score.</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-[38rem] mx-auto">
          Guess the image before it fully reveals. Each wrong answer costs a reveal. The goal: finish the week with the lowest total score.
        </p>
      </div>

      {alreadyPlayed ? (
        <div className="rounded-3xl border border-primary/20 bg-surface-container p-6 space-y-4 text-center">
          <p className="font-headline-lg text-headline-lg text-primary">You already played this week</p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your session is locked until next reset on {nextResetLabel}. Check the leaderboard to see how you ranked.
          </p>
          <button
            onClick={onOpenLeaderboard}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-lg text-headline-lg-mobile btn-3d flex items-center justify-center gap-2"
          >
            View Leaderboard
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={onStart}
            className="w-full h-16 bg-primary text-on-primary rounded-3xl font-display-lg text-display-lg btn-3d flex items-center justify-center gap-3"
          >
            Play This Week
            <span className="material-symbols-outlined">play_arrow</span>
          </button>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-3xl bg-surface-container p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Images</p>
              <p className="font-headline-lg text-primary">5</p>
            </div>
            <div className="rounded-3xl bg-surface-container p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Reveals</p>
              <p className="font-headline-lg text-primary">{MAX_REVEALS}</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-outline-variant bg-surface-container p-4 text-on-surface-variant">
        <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] mb-3">This week&apos;s leaderboard</p>
        {weeklyLeaderboard.length === 0 ? (
          <p className="font-body-md text-body-md">No scores yet for this week. Be the first to play!</p>
        ) : (
          <div className="space-y-3">
            {weeklyLeaderboard.slice(0, 3).map((entry, index) => (
              <div key={`${entry.username}-${index}`} className="flex items-center justify-between gap-3">
                <span className="text-on-surface">{index + 1}. {entry.username}</span>
                <span className="font-bold text-primary">{entry.score}/50</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
