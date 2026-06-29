import { ImageData } from '@/domain/types';
import { shuffle } from '@/lib/shuffle';
import { ImageProvider } from './types';

// Points directly to the file in your public directory
const LANDMARKS_DATA_URL = '/data/landmarks.json';

interface LandmarkItem {
  id: string;
  name: string;
  imageUrl: string;
  location: string;
}

/** World landmarks + names fetched locally for absolute stability. */
export class LandmarksProvider implements ImageProvider {
  readonly category = 'landmarks';
  readonly label = 'landmarks';

  async fetch(count: number): Promise<ImageData[]> {
    const res = await fetch(LANDMARKS_DATA_URL);
    if (!res.ok) throw new Error(`Failed to load landmarks: ${res.status}`);
    
    const landmarks = (await res.json()) as LandmarkItem[];

    // Shuffle the array instantly and take only the requested amount
    return shuffle(landmarks)
      .slice(0, count)
      .map((landmark) => ({
        id: `landmark-${landmark.id}`,
        filename: landmark.imageUrl,
        answers: [landmark.name], // Expected exact text string for validation
        category: 'landmarks',
        difficulty: 'medium',
        hint: `This famous landmark is located in ${landmark.location}`,
      }));
  }
}