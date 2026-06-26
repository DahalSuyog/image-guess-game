import { ImageData } from '@/domain/types';

/**
 * A category-specific source of labeled images. Add a new category by adding a
 * new provider — the repository routes to it by `category`.
 */
export interface ImageProvider {
  /** Unique category key, e.g. 'pokemon' or 'landmarks'. */
  readonly category: string;
  /** Human-readable name shown in the category picker. */
  readonly label: string;
  /** Fetch up to `count` labeled images for this category. */
  fetch(count: number): Promise<ImageData[]>;
}
