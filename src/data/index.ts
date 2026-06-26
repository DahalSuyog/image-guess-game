import { Repositories } from './repositories/types';
import { LocalImagesRepository } from './repositories/localImagesRepository';
import { LocalLeaderboardRepository } from './repositories/localLeaderboardRepository';
import { LocalProfileRepository } from './repositories/localProfileRepository';

/**
 * Composition root for the data layer. To move to a real backend, swap these
 * local implementations for remote ones here — no call site changes required.
 */
function createLocalRepositories(): Repositories {
  return {
    images: new LocalImagesRepository(),
    leaderboard: new LocalLeaderboardRepository(),
    profile: new LocalProfileRepository(),
  };
}

export const repos: Repositories = createLocalRepositories();

export type { Repositories } from './repositories/types';
