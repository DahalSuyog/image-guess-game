import { ImageData, LeaderboardEntry, ProfileStats } from '@/domain/types';

/**
 * Data-access contracts. Methods are async so that the current localStorage-backed
 * implementations can be swapped for a remote API/DB later without changing any
 * call sites — every caller already awaits.
 */

export interface ImageQuery {
  /** Which category to pull from. Falls back to the repository default if omitted. */
  category?: string;
  /** How many images to return (a session's worth). */
  count?: number;
}

export interface CategoryInfo {
  key: string;
  label: string;
}

export interface ImagesRepository {
  getImages(query?: ImageQuery): Promise<ImageData[]>;
  /** Categories this repository can serve, for the category picker. */
  listCategories(): CategoryInfo[];
}

export interface LeaderboardRepository {
  /** Top saved results, sorted best-first (lowest score). */
  getTop(limit?: number): Promise<LeaderboardEntry[]>;
  add(entry: LeaderboardEntry): Promise<void>;
}

export interface ProfileRepository {
  getStats(): Promise<ProfileStats>;
  /** Record a finished session against the player's all-time bests + totals. */
  recordResult(args: { score: number; streak: number }): Promise<void>;
}

export interface Repositories {
  images: ImagesRepository;
  leaderboard: LeaderboardRepository;
  profile: ProfileRepository;
}
