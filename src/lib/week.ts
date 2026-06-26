/**
 * Weekly cadence math. The game rotates content and locks sessions on a
 * fixed weekly boundary derived from the Unix epoch.
 */

const WEEK_MS = 1000 * 60 * 60 * 24 * 7;

export function getCurrentWeekIndex(): number {
  return Math.floor(Date.now() / WEEK_MS);
}

export function getWeeklySeed(): string {
  return getCurrentWeekIndex().toString();
}

export function getCurrentWeekId(): string {
  return `week-${getWeeklySeed()}`;
}

export function getCurrentWeekLabel(): string {
  return `Week ${getWeeklySeed()}`;
}

/** Human-readable date (e.g. "Jul 3") of the next weekly reset. */
export function getNextResetLabel(): string {
  const next = new Date(Math.floor(Date.now() / WEEK_MS) * WEEK_MS + WEEK_MS);
  return next.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
