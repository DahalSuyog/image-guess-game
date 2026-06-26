import { GAME_CONFIG } from '@/config/game.config';
import { ImageData } from './types';

/** Normalize a guess/answer for comparison: lowercase, trimmed, alphanumeric only. */
export function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/** Map a number of reveals used to the displayed pixelation level. */
export function getLevelForReveals(reveals: number): number {
  return Math.min(GAME_CONFIG.maxLevel, reveals + 1);
}

/** Whether a guess matches any accepted answer for an image. */
export function isCorrectGuess(image: ImageData, guess: string): boolean {
  const normalized = normalizeAnswer(guess);
  return image.answers.some((answer) => normalizeAnswer(answer) === normalized);
}

/** Score earned for solving an image: the number of reveals it took. Lower is better. */
export function scoreForImage(revealsUsed: number): number {
  return revealsUsed;
}
