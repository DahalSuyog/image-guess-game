import { ImageData, LeaderboardEntry, ProfileStats } from '@/domain/types';

/**
 * Data-access contracts. Methods are async so that the current localStorage-backed
 * implementations can be swapped for a remote API/DB later without changing any
 * call sites — every caller already awaits.
 */

export interface ImagesRepository {
  getImages(): Promise<ImageData[]>;
}

export interface LeaderboardRepository {
  /** Entries for the given week label, sorted best-first. */
  getWeekly(weekLabel: string): Promise<LeaderboardEntry[]>;
  add(entry: LeaderboardEntry): Promise<void>;
}

export interface ProfileRepository {
  getUsername(): Promise<string>;
  setUsername(name: string): Promise<void>;
  getStats(): Promise<ProfileStats>;
  /** Record a finished session against the player's all-time bests + totals. */
  recordResult(args: { score: number; streak: number }): Promise<void>;
  hasPlayedThisWeek(): Promise<boolean>;
  setPlayedThisWeek(): Promise<void>;
}

export interface Repositories {
  images: ImagesRepository;
  leaderboard: LeaderboardRepository;
  profile: ProfileRepository;
}
