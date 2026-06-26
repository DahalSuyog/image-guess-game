import { ImageData } from '@/domain/types';
import { ImagesRepository } from './types';

/** Loads the image catalogue from the static JSON served out of /public. */
export class LocalImagesRepository implements ImagesRepository {
  constructor(private readonly url = '/data/images.json') {}

  async getImages(): Promise<ImageData[]> {
    const res = await fetch(this.url);
    if (!res.ok) {
      throw new Error(`Failed to load images: ${res.status}`);
    }
    return (await res.json()) as ImageData[];
  }
}
