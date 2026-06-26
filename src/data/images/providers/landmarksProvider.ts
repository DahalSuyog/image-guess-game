import { ImageData } from '@/domain/types';
import { shuffle } from '@/lib/shuffle';
import { ImageProvider } from './types';

/** The original curated set, served from the static JSON in /public. */
export class LandmarksProvider implements ImageProvider {
  readonly category = 'landmarks';
  readonly label = 'landmarks';

  constructor(private readonly url = '/data/images.json') {}

  async fetch(count: number): Promise<ImageData[]> {
    const res = await fetch(this.url);
    if (!res.ok) throw new Error(`Failed to load landmarks: ${res.status}`);
    const all = (await res.json()) as ImageData[];
    return shuffle(all).slice(0, count);
  }
}
