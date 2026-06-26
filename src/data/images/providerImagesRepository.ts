import { ImageData } from '@/domain/types';
import { ImagesRepository, ImageQuery, CategoryInfo } from '../repositories/types';
import { ImageProvider } from './providers/types';

/**
 * Routes image requests to a category-specific provider. Register more
 * providers to add categories — no other code changes.
 */
export class ProviderImagesRepository implements ImagesRepository {
  private readonly providers = new Map<string, ImageProvider>();

  constructor(providers: ImageProvider[], private readonly defaultCategory: string) {
    for (const provider of providers) {
      this.providers.set(provider.category, provider);
    }
  }

  listCategories(): CategoryInfo[] {
    return Array.from(this.providers.values()).map((p) => ({ key: p.category, label: p.label }));
  }

  async getImages(query: ImageQuery = {}): Promise<ImageData[]> {
    const category = query.category ?? this.defaultCategory;
    const provider = this.providers.get(category) ?? this.providers.get(this.defaultCategory);
    if (!provider) {
      throw new Error(`No image provider registered for category "${category}"`);
    }
    return provider.fetch(query.count ?? 10);
  }
}
