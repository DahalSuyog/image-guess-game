/**
 * Central game configuration.
 *
 * Every tunable that defines a game *mode* lives here. Adding a new mode later
 * (daily / practice / endless) means adding another config object of this shape
 * rather than editing the reducer or components.
 */
export interface GameConfig {
  /** Total reveals available per image before it's a game-over. */
  maxReveals: number;
  /** How many images make up one session. */
  imagesPerSession: number;
  /** Highest pixelation level (= fully revealed image). */
  maxLevel: number;
  /** Base path under /public where game images are served from. */
  imageBasePath: string;
}

export const GAME_CONFIG: GameConfig = {
  maxReveals: 10,
  imagesPerSession: 5,
  maxLevel: 10,
  imageBasePath: '/images/game',
};

/** Default image category for a new session — the local curated set. */
export const DEFAULT_CATEGORY = 'landmarks';

/**
 * Back-compat named exports. Several components historically imported these
 * from `@/hooks/useGame`; they now resolve to the central config.
 */
export const MAX_REVEALS = GAME_CONFIG.maxReveals;
export const IMAGES_PER_SESSION = GAME_CONFIG.imagesPerSession;

/** Resolve the displayable URL for an image. Absolute URLs (remote sources) pass through. */
export function imageUrl(filename: string): string {
  if (/^https?:\/\//.test(filename)) return filename;
  return `${GAME_CONFIG.imageBasePath}/${filename}`;
}
