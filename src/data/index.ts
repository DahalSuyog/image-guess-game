import { DEFAULT_CATEGORY } from '@/config/game.config';
import { Repositories } from './repositories/types';
import { ProviderImagesRepository } from './images/providerImagesRepository';
import { PokemonProvider } from './images/providers/pokemonProvider';
import { LandmarksProvider } from './images/providers/landmarksProvider';
import { FlagsProvider } from './images/providers/flagsProvider';
import { NarutoProvider } from './images/providers/narutoProvider';
import { LocalLeaderboardRepository } from './repositories/localLeaderboardRepository';
import { LocalProfileRepository } from './repositories/localProfileRepository';

/**
 * Composition root for the data layer. To move to a real backend, swap these
 * implementations here — no call site changes required. To add an image
 * category, register another provider below.
 */
function createRepositories(): Repositories {
  return {
    images: new ProviderImagesRepository(
      // Order here = order in the picker. Landmarks (local) is the default.
      [new LandmarksProvider(), new PokemonProvider(), new FlagsProvider(), new NarutoProvider()],
      DEFAULT_CATEGORY
    ),
    leaderboard: new LocalLeaderboardRepository(),
    profile: new LocalProfileRepository(),
  };
}

export const repos: Repositories = createRepositories();

export type { Repositories } from './repositories/types';
