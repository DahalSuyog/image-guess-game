'use client';

import { LeaderboardEntry } from '@/lib/types';
import { getLeaderboard, getBestScore, getBestStreak, getTotalGamesPlayed } from '@/lib/storage';
import { useEffect, useState } from 'react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [bestScore, setBestScore] = useState(0);
  const [bestStreak, setBestStreakVal] = useState(0);
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setEntries(getLeaderboard());
      setBestScore(getBestScore());
      setBestStreakVal(getBestStreak());
      setTotalGames(getTotalGamesPlayed());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-hidden animate-scale-in border border-outline-variant">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber" style={{ fontVariationSettings: "'FILL' 1" }}>
              leaderboard
            </span>
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
          >
            close
          </button>
        </div>

        {/* Personal stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-container-high rounded-xl p-3 text-center">
            <p className="font-headline-lg text-headline-lg-mobile text-primary">{bestScore.toLocaleString()}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Best Score</p>
          </div>
          <div className="bg-surface-container-high rounded-xl p-3 text-center">
            <p className="font-headline-lg text-headline-lg-mobile text-amber">{bestStreak}</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Best Streak</p>
          </div>
          <div className="bg-surface-container-high rounded-xl p-3 text-center">
            <p className="font-headline-lg text-headline-lg-mobile text-success">{totalGames}</p>
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
      </div>
    </div>
  );
}
