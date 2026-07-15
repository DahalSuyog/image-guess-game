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

/** Levenshtein edit distance between two normalized strings. */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * If a wrong guess is within a small edit distance of an accepted answer,
 * return that answer so the UI can surface a "did you mean…" nudge. Returns
 * null for exact matches (those are correct) and for guesses that are too far
 * off to be a likely typo.
 */
export function findCloseMatch(image: ImageData, guess: string): string | null {
  const normalizedGuess = normalizeAnswer(guess);
  if (!normalizedGuess) return null;

  let best: { answer: string; dist: number } | null = null;
  for (const answer of image.answers) {
    const normalizedAnswer = normalizeAnswer(answer);
    if (normalizedAnswer === normalizedGuess) continue; // exact → correct, not "close"
    const dist = levenshtein(normalizedGuess, normalizedAnswer);
    // Allow ~1 typo per 4 characters, capped at 2, and never for tiny answers.
    const maxAllowed = normalizedAnswer.length >= 4 ? Math.min(2, Math.floor(normalizedAnswer.length / 4)) : 1;
    if (dist === 0 || dist > maxAllowed) continue;
    if (!best || dist < best.dist) best = { answer, dist };
  }
  return best?.answer ?? null;
}

/** Score earned for solving an image: the number of reveals it took. Lower is better. */
export function scoreForImage(revealsUsed: number): number {
  return revealsUsed;
}

/**
 * Render the answer with only the first `revealCount` alphanumeric characters
 * shown and the rest masked, e.g. `E _ _ _ _ _   T _ _ _ _`. Spaces become a
 * wider gap between words; punctuation (hyphens, apostrophes) is shown as-is.
 */
function maskedAnswer(answer: string, revealCount: number): string {
  let revealed = 0;
  return answer
    .split('')
    .map((ch) => {
      if (ch === ' ') return ' ';
      if (/[a-z0-9]/i.test(ch)) {
        if (revealed < revealCount) {
          revealed += 1;
          return ch.toUpperCase();
        }
        return '_';
      }
      return ch; // keep hyphens, apostrophes, etc.
    })
    .join(' ');
}

/**
 * Build the ordered sequence of hints for an image, from vaguest to most
 * revealing. Derived entirely from existing data so it works for every
 * category: curated hint → word/letter count → first letter → partial reveal.
 */
export function getHints(image: ImageData): string[] {
  const answer = image.answers[0] ?? '';
  const letters = answer.replace(/[^a-z0-9]/gi, '').length;
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const firstLetter = (answer.match(/[a-z0-9]/i)?.[0] ?? '').toUpperCase();

  const hints: string[] = [];
  if (image.hint) hints.push(image.hint);
  if (letters > 0) hints.push(`${words} ${words === 1 ? 'word' : 'words'} · ${letters} letters`);
  if (firstLetter) hints.push(`Starts with "${firstLetter}"`);
  if (letters > 1) hints.push(maskedAnswer(answer, Math.ceil(letters / 3)));
  return hints;
}
