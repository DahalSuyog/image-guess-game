'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { repos } from '@/data';
import { DEFAULT_CATEGORY, GAME_CONFIG } from '@/config/game.config';
import { useGame } from './useGame';

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Orchestrates a free-play session: loads images, drops the player straight
 * into a game (no gate), and supports instant replay.
 */
export function useGameSession() {
  const { state, init, startGame, guess, useHint, skip, nextImage, revealMore, reset } = useGame();

  const [shakeInput, setShakeInput] = useState(false);
  const [category, setCategoryState] = useState(DEFAULT_CATEGORY);
  const trackedRef = useRef(false);
  const runRef = useRef(0);
  const categoryRef = useRef(DEFAULT_CATEGORY);

  const categories = repos.images.listCategories();

  // Fetch a fresh set of images for the current category, then drop straight
  // into play. Each call pulls new images, so every replay is a new game.
  const begin = useCallback(async () => {
    const run = ++runRef.current;
    trackedRef.current = false;
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

  // Session complete.
  useEffect(() => {
    if (state.phase !== 'complete' || trackedRef.current) return;
    trackedRef.current = true;
  }, [
    state.phase,
    state.score,
    state.maxStreak,
    state.correctGuesses,
    state.totalGuesses,
  ]);

  const restart = useCallback(() => {
    begin();
  }, [begin]);

  // Give up on the current image, then skip.
  const giveUp = useCallback(() => {
    skip();
  }, [skip]);

  return {
    state,
    guess,
    useHint,
    skip: giveUp,
    nextImage,
    shakeInput,
    restart,
    categories,
    category,
    selectCategory,
  };
}
