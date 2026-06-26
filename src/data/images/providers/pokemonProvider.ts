import { ImageData } from '@/domain/types';
import { ImageProvider } from './types';

const POKEAPI = 'https://pokeapi.co/api/v2/pokemon';
const MAX_POKEMON = 1025; // current National Dex size
const OVERFETCH = 3; // request a few extra to tolerate failed fetches

interface PokeResponse {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: {
    front_default: string | null;
    other: { 'official-artwork': { front_default: string | null } };
  };
}

function randomIds(count: number): number[] {
  const ids = new Set<number>();
  while (ids.size < Math.min(count, MAX_POKEMON)) {
    ids.add(1 + Math.floor(Math.random() * MAX_POKEMON));
  }
  return Array.from(ids);
}

/** Unlimited source: random Pokémon with their name as the answer and type as the hint. */
export class PokemonProvider implements ImageProvider {
  readonly category = 'pokemon';
  readonly label = 'pokémon';

  async fetch(count: number): Promise<ImageData[]> {
    const ids = randomIds(count + OVERFETCH);
    const settled = await Promise.all(ids.map((id) => this.fetchOne(id)));
    return settled.filter((x): x is ImageData => x !== null).slice(0, count);
  }

  private async fetchOne(id: number): Promise<ImageData | null> {
    try {
      const res = await fetch(`${POKEAPI}/${id}`);
      if (!res.ok) return null;
      const p = (await res.json()) as PokeResponse;
      const image = p.sprites.other['official-artwork'].front_default ?? p.sprites.front_default;
      if (!image) return null;

      const types = p.types.map((t) => t.type.name);
      const spaced = p.name.replace(/-/g, ' ');
      const answers = Array.from(new Set([p.name, spaced]));

      return {
        id: `pokemon-${p.id}`,
        filename: image, // absolute URL
        answers,
        category: 'pokemon',
        difficulty: 'medium',
        hint: types.length ? `A ${types.join('/')}-type Pokémon` : 'A Pokémon',
      };
    } catch {
      return null;
    }
  }
}
