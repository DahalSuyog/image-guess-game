import { User } from '@/domain/types';
import { safeGet, safeSet } from '@/data/storage';
import { AuthRepository } from './types';

const KEY = 'user';

/**
 * Dummy auth backed by localStorage. Accepts any credentials and fabricates a
 * session — swap this for a real implementation (the interface stays the same).
 */
export class LocalAuthRepository implements AuthRepository {
  async getCurrentUser(): Promise<User | null> {
    const raw = safeGet(KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    void password; // dummy auth ignores the password
    const username = email.split('@')[0] || 'player';
    const user: User = { id: username, username, email };
    safeSet(KEY, JSON.stringify(user));
    return user;
  }

  async signOut(): Promise<void> {
    safeSet(KEY, '');
  }
}
