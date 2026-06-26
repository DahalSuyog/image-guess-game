'use client';

import { useEffect, useState } from 'react';
import { LeaderboardEntry, ProfileStats } from '@/domain/types';
import { repos } from '@/data';
import { getCurrentWeekLabel } from '@/lib/week';
import { Modal } from '@/components/ui/Modal';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMPTY_STATS: ProfileStats = { bestScore: 0, bestStreak: 0, gamesPlayed: 0 };

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<ProfileStats>(EMPTY_STATS);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    async function load() {
      const [weekly, profileStats] = await Promise.all([
        repos.leaderboard.getWeekly(getCurrentWeekLabel()),
        repos.profile.getStats(),
      ]);
      if (cancelled) return;
      setEntries(weekly);
      setStats(profileStats);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      cardClassName="max-h-[80vh] overflow-hidden"
      title={
        <>
          <span className="material-symbols-outlined text-amber" style={{ fontVariationSettings: "'FILL' 1" }}>
            leaderboard
          </span>
          Leaderboard
        </>
      }
    >
      {/* Personal stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface-container-high rounded-xl p-3 text-center">
          <p className="font-headline-lg text-headline-lg-mobile text-primary">{stats.bestScore.toLocaleString()}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Best Score</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-3 text-center">
          <p className="font-headline-lg text-headline-lg-mobile text-amber">{stats.bestStreak}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Best Streak</p>
        </div>
        <div className="bg-surface-container-high rounded-xl p-3 text-center">
          <p className="font-headline-lg text-headline-lg-mobile text-success">{stats.gamesPlayed}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Games</p>
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="overflow-y-auto max-h-[40vh]">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-[48px] text-outline/30 mb-2">trophy</span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              No scores yet. Play a game to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors
                  ${i === 0 ? 'bg-amber/10 border border-amber/20' : 'bg-surface-container-high'}
                `}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-label-sm
                  ${i === 0 ? 'bg-amber text-black' : i === 1 ? 'bg-on-surface-variant/20 text-on-surface' : i === 2 ? 'bg-amber/30 text-amber' : 'bg-surface-container text-on-surface-variant'}
                `}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-body-md text-on-surface truncate">
                    {entry.username || 'Anonymous'}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {entry.date} · {entry.correctGuesses}/{Math.min(entry.totalGuesses, 5)} correct
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-headline-lg text-headline-lg-mobile text-primary">{entry.score.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
