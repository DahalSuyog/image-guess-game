import { LeaderboardEntry } from '@/domain/types';
import { safeGet, safeSet } from '@/data/storage';
import { LeaderboardRepository } from './types';

const KEY = 'leaderboard';
const MAX_STORED = 100;
const MAX_WEEKLY_SHOWN = 20;

/** localStorage-backed leaderboard. All entries ever played are stored; reads filter by week. */
export class LocalLeaderboardRepository implements LeaderboardRepository {
  private readAll(): LeaderboardEntry[] {
    const raw = safeGet(KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as LeaderboardEntry[];
    } catch {
      return [];
    }
  }

  async getWeekly(weekLabel: string): Promise<LeaderboardEntry[]> {
    return this.readAll()
      .filter((entry) => entry.date === weekLabel)
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_WEEKLY_SHOWN);
  }

  async add(entry: LeaderboardEntry): Promise<void> {
    const board = this.readAll();
    board.push(entry);
    safeSet(KEY, JSON.stringify(board.slice(0, MAX_STORED)));
  }
}
