import { LeaderboardEntry } from '@/domain/types';
import { safeGet, safeSet } from '@/data/storage';
import { LeaderboardRepository } from './types';

const KEY = 'leaderboard';
const MAX_STORED = 100;
const DEFAULT_LIMIT = 20;

/** localStorage-backed leaderboard of saved results, best (lowest score) first. */
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

  async getTop(limit = DEFAULT_LIMIT): Promise<LeaderboardEntry[]> {
    return this.readAll()
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }

  async add(entry: LeaderboardEntry): Promise<void> {
    const board = this.readAll();
    board.push(entry);
    safeSet(KEY, JSON.stringify(board.slice(0, MAX_STORED)));
  }
}
