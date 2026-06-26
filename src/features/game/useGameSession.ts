'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageData, LeaderboardEntry, User } from '@/domain/types';
import { repos } from '@/data';
import { shuffle } from '@/lib/shuffle';
import { useGame } from './useGame';

const SESSION_ID = 'free-play';

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Orchestrates a free-play session: loads images, drops the player straight
 * into a game (no gate), supports instant replay, and saves the result to the
 * leaderboard only when a user is signed in.
 */
export function useGameSession(user: User | null) {
  const { state, init, startGame, guess, useHint, nextImage, revealMore, reset } = useGame();

  const [imagePool, setImagePool] = useState<ImageData[]>([]);
  const [shakeInput, setShakeInput] = useState(false);
  const [saved, setSaved] = useState(false);
  const recordedRef = useRef(false);

  // Begin a fresh game: reshuffle and auto-start (no ready gate).
  const begin = useCallback(
    (pool: ImageData[]) => {
      recordedRef.current = false;
      setSaved(false);
      init(shuffle(pool), SESSION_ID, todayLabel());
      startGame();
    },
    [init, startGame]
  );

  // Initial load → straight into play.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await repos.images.getImages();
        if (cancelled) return;
        setImagePool(data);
        begin(data);
      } catch (err) {
        console.error('Failed to load game data:', err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [begin]);

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
    reset();
    begin(imagePool);
  }, [imagePool, reset, begin]);

  return {
    state,
    guess,
    useHint,
    nextImage,
    shakeInput,
    restart,
    isLoggedIn: !!user,
    saved,
  };
}
