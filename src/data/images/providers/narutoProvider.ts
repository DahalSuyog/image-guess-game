import { ImageData } from '@/domain/types';
import { shuffle } from '@/lib/shuffle';
import { ImageProvider } from './types';

// Slim, vendored subset of the NarutoDB character dataset. Regenerate with
// `node scripts/build-naruto-data.mjs` when the upstream data changes.
const NARUTO_DATA_URL = '/data/naruto.json';

interface NarutoCharacterItem {
  id: number;
  name: string;
  image: string;
  clan: string | null;
  village: string | null;
  rank: string | null;
  status: string | null;
}

/** Naruto characters + names loaded locally for absolute stability. */
export class NarutoProvider implements ImageProvider {
  readonly category = 'naruto';
  readonly label = 'naruto';

  async fetch(count: number): Promise<ImageData[]> {
    const res = await fetch(NARUTO_DATA_URL);
    if (!res.ok) throw new Error(`Failed to load naruto data: ${res.status}`);

    const characters = (await res.json()) as NarutoCharacterItem[];

    // Shuffle the pool instantly and take only the requested amount.
    return shuffle(characters)
      .slice(0, count)
      .map((c) => ({
        id: `naruto-${c.id}`,
        filename: c.image, // absolute URL (Fandom CDN)
        answers: [c.name],
        category: 'naruto',
        difficulty: 'medium',
        hint: this.buildHint(c),
      }));
  }

  private buildHint(c: NarutoCharacterItem): string {
    const parts: string[] = [];
    if (c.village) parts.push(`from ${c.village}`);
    if (c.clan) parts.push(`of the ${c.clan}`);
    if (c.rank) parts.push(`a ${c.rank}`);
    if (parts.length) return `A Naruto character ${parts.join(', ')}`;
    return 'A Naruto character';
  }
}
