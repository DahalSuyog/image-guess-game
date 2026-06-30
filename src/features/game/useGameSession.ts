'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { LeaderboardEntry, User } from '@/domain/types';
import { repos } from '@/data';
import { DEFAULT_CATEGORY, GAME_CONFIG } from '@/config/game.config';
import { useGame } from './useGame';

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Orchestrates a free-play session: loads images, drops the player straight
 * into a game (no gate), supports instant replay, and saves the result to the
 * leaderboard only when a user is signed in.
 */
export function useGameSession(user: User | null) {
  const { state, init, startGame, guess, useHint, skip, nextImage, revealMore, reset } = useGame();

  const [shakeInput, setShakeInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const [category, setCategoryState] = useState(DEFAULT_CATEGORY);
  const recordedRef = useRef(false);
  const runRef = useRef(0);
  const categoryRef = useRef(DEFAULT_CATEGORY);

  const categories = repos.images.listCategories();

  // Fetch a fresh set of images for the current category, then drop straight
  // into play. Each call pulls new images, so every replay is a new game.
  const begin = useCallback(async () => {
    const run = ++runRef.current;
    recordedRef.current = false;
    setSaved(false);
    reset(); // show loading while we fetch
    try {
      const images = await repos.images.getImages({
        category: categoryRef.current,
        count: GAME_CONFIG.imagesPerSession,
      });
      if (run !== runRef.current) return; // a newer begin() superseded this one
      init(images, categoryRef.current, todayLabel());
      startGame();
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  }, [init, startGame, reset]);

  // Start the first game on mount.
  useEffect(() => {
    begin();
  }, [begin]);

  // Switch category and immediately start a new game from it.
  const selectCategory = useCallback(
    (key: string) => {
      if (key === categoryRef.current) return;
      categoryRef.current = key;
      setCategoryState(key);
      begin();
    },
    [begin]
  );

  // Wrong guess: brief shake, then advance the reveal.
  useEffect(() => {
    if (state.phase !== 'wrong') return;
    setShakeInput(true);
    const timer = setTimeout(() => {
      setShakeInput(false);
      revealMore();
    }, 600);
    return () => clearTimeout(timer);
  }, [state.phase, revealMore]);

  // Session complete: persist once, only for signed-in users.
  useEffect(() => {
    if (state.phase !== 'complete' || recordedRef.current) return;
    recordedRef.current = true;
    if (!user) return;
    async function record() {
      const entry: LeaderboardEntry = {
        username: user!.username,
        score: state.score,
        streak: state.maxStreak,
        date: state.weekLabel,
        correctGuesses: state.correctGuesses,
        totalGuesses: state.totalGuesses,
      };
      await repos.leaderboard.add(entry);
      await repos.profile.recordResult({ score: state.score, streak: state.maxStreak });
      setSaved(true);
    }
    record();
  }, [
    state.phase,
    state.score,
    state.maxStreak,
    state.weekLabel,
    state.correctGuesses,
    state.totalGuesses,
    user,
  ]);

  const restart = useCallback(() => {
    begin();
  }, [begin]);

  return {
    state,
    guess,
    useHint,
    skip,
    nextImage,
    shakeInput,
    restart,
    isLoggedIn: !!user,
    saved,
    categories,
    category,
    selectCategory,
  };
}
