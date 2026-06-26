'use client';

import { useEffect, useState } from 'react';
import { LeaderboardEntry, ProfileStats } from '@/domain/types';
import { repos } from '@/data';
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
      const [top, profileStats] = await Promise.all([
        repos.leaderboard.getTop(),
        repos.profile.getStats(),
      ]);
      if (cancelled) return;
      setEntries(top);
      setStats(profileStats);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} cardClassName="max-h-[80vh] overflow-hidden" title="leaderboard">
      {/* Personal stats */}
      <div className="flex justify-between mb-5 font-label-sm text-label-sm text-outline">
        <span>best <span className="text-primary">{stats.bestScore || '—'}</span></span>
        <span>streak <span className="text-on-surface-variant">{stats.bestStreak}</span></span>
        <span>games <span className="text-on-surface-variant">{stats.gamesPlayed}</span></span>
      </div>

      <div className="overflow-y-auto max-h-[50vh]">
        {entries.length === 0 ? (
          <p className="font-body-md text-body-md text-outline text-center py-8">
            no scores yet — log in and play to save one.
          </p>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 font-label-sm text-label-sm border-b border-outline-variant/40 last:border-0"
              >
                <span className={`w-5 ${i === 0 ? 'text-primary' : 'text-outline'}`}>{i + 1}</span>
                <span className="flex-1 min-w-0 truncate text-on-surface-variant">{entry.username || 'anonymous'}</span>
                <span className="text-outline">{entry.date}</span>
                <span className="w-10 text-right text-on-surface">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
