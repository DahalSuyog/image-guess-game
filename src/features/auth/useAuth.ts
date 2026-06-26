'use client';

import { useCallback, useEffect, useState } from 'react';
import { User } from '@/domain/types';
import { repos } from '@/data';

/** Reads the current (dummy) session and exposes sign-in / sign-out. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    repos.auth.getCurrentUser().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await repos.auth.signIn(email, password);
    setUser(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    await repos.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signOut };
}
