import { LeaderboardEntry } from './types';

/**
 * Safe localStorage wrapper that handles privacy-restricted environments.
 */
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(`pixelpeel_${key}`);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(`pixelpeel_${key}`, value);
  } catch {
    // Storage unavailable — silently fail
  }
}

export function getUsername(): string {
  return safeGet('username') || '';
}

export function setUsername(name: string): void {
  safeSet('username', name);
}

export function getCurrentWeekIndex(): number {
  return Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
}

export function getWeeklySeed(): string {
  return getCurrentWeekIndex().toString();
}

export function getCurrentWeekId(): string {
  return `week-${getWeeklySeed()}`;
}

export function getCurrentWeekLabel(): string {
  return `Week ${getWeeklySeed()}`;
}

export function hasPlayedThisWeek(): boolean {
  return safeGet('lastPlayedWeek') === getCurrentWeekId();
}

export function setPlayedThisWeek(): void {
  safeSet('lastPlayedWeek', getCurrentWeekId());
}

export function getLeaderboard(): LeaderboardEntry[] {
  const raw = safeGet('leaderboard');
  if (!raw) return [];

  try {
    const all = JSON.parse(raw) as LeaderboardEntry[];
    const currentWeek = getCurrentWeekLabel();
    return all
      .filter((entry) => entry.date === currentWeek)
      .sort((a, b) => a.score - b.score)
      .slice(0, 20);
  } catch {
    return [];
  }
}

function getAllLeaderboardEntries(): LeaderboardEntry[] {
  const raw = safeGet('leaderboard');
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  const board = getAllLeaderboardEntries();
  board.push(entry);
  safeSet('leaderboard', JSON.stringify(board.slice(0, 100)));
}

export function getBestScore(): number {
  const raw = safeGet('bestScore');
  return raw ? parseInt(raw, 10) : 0;
}

export function setBestScore(score: number): void {
  const current = getBestScore();
  if (current === 0 || score < current) {
    safeSet('bestScore', score.toString());
  }
}

export function getBestStreak(): number {
  return parseInt(safeGet('bestStreak') || '0', 10);
}

export function setBestStreak(streak: number): void {
  const current = getBestStreak();
  if (streak > current) {
    safeSet('bestStreak', streak.toString());
  }
}

export function getTotalGamesPlayed(): number {
  return parseInt(safeGet('totalGamesPlayed') || '0', 10);
}

export function incrementGamesPlayed(): void {
  const current = getTotalGamesPlayed();
  safeSet('totalGamesPlayed', (current + 1).toString());
}

/**
 * Deterministic shuffle using a seed string.
 * Uses a simple hash-based PRNG for repeatable results.
 */
export function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }

  for (let i = result.length - 1; i > 0; i--) {
    hash = ((hash << 5) - hash + i) | 0;
    const j = Math.abs(hash) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
