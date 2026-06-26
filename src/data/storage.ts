/**
 * Safe localStorage wrapper that handles privacy-restricted environments
 * (Safari private mode, disabled storage, SSR). All keys are namespaced.
 */
const PREFIX = 'pixelpeel_';

export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(`${PREFIX}${key}`);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, value);
  } catch {
    // Storage unavailable — silently fail
  }
}
