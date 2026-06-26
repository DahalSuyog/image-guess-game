import { ProfileStats } from '@/domain/types';
import { safeGet, safeSet } from '@/data/storage';
import { getCurrentWeekId } from '@/lib/week';
import { ProfileRepository } from './types';

/** localStorage-backed player profile: identity, all-time stats, and weekly play-lock. */
export class LocalProfileRepository implements ProfileRepository {
  async getUsername(): Promise<string> {
    return safeGet('username') || '';
  }

  async setUsername(name: string): Promise<void> {
    safeSet('username', name);
  }

  async getStats(): Promise<ProfileStats> {
    return {
      bestScore: this.readInt('bestScore'),
      bestStreak: this.readInt('bestStreak'),
      gamesPlayed: this.readInt('totalGamesPlayed'),
    };
  }

  async recordResult({ score, streak }: { score: number; streak: number }): Promise<void> {
    // Lower score is better; 0 means "unset".
    const bestScore = this.readInt('bestScore');
    if (bestScore === 0 || score < bestScore) {
      safeSet('bestScore', score.toString());
    }

    const bestStreak = this.readInt('bestStreak');
    if (streak > bestStreak) {
      safeSet('bestStreak', streak.toString());
    }

    safeSet('totalGamesPlayed', (this.readInt('totalGamesPlayed') + 1).toString());
  }

  async hasPlayedThisWeek(): Promise<boolean> {
    return safeGet('lastPlayedWeek') === getCurrentWeekId();
  }

  async setPlayedThisWeek(): Promise<void> {
    safeSet('lastPlayedWeek', getCurrentWeekId());
  }

  private readInt(key: string): number {
    return parseInt(safeGet(key) || '0', 10);
  }
}
