import { ImageData } from '@/domain/types';
import { shuffle } from '@/lib/shuffle';
import { ImageProvider } from './types';

const CODES_URL = 'https://flagcdn.com/en/codes.json';
const flagImage = (code: string) => `https://flagcdn.com/w320/${code}.png`;

/** Country flags + names via flagcdn (free, no key). */
export class FlagsProvider implements ImageProvider {
  readonly category = 'flags';
  readonly label = 'flags';

  async fetch(count: number): Promise<ImageData[]> {
    const res = await fetch(CODES_URL);
    if (!res.ok) throw new Error(`Failed to load flags: ${res.status}`);
    const codes = (await res.json()) as Record<string, string>;

    // Keep ISO 3166-1 alpha-2 codes only (drop subdivisions like "gb-eng").
    const countries = Object.entries(codes).filter(([code]) => code.length === 2);

    return shuffle(countries)
      .slice(0, count)
      .map(([code, name]) => ({
        id: `flag-${code}`,
        filename: flagImage(code),
        answers: [name],
        category: 'flags',
        difficulty: 'medium',
        hint: `A country whose code is "${code.toUpperCase()}"`,
      }));
  }
}
