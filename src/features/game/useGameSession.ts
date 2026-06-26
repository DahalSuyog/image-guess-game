'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageData, LeaderboardEntry } from '@/domain/types';
import { repos } from '@/data';
import { seededShuffle } from '@/lib/shuffle';
import {
  getWeeklySeed,
  getCurrentWeekLabel,
  getNextResetLabel,
} from '@/lib/week';
import { useGame } from './useGame';

/**
 * Orchestrates a full game session: loads the weekly image set, wires the
 * reducer to async persistence (leaderboard + profile), and owns the
 * start / name-prompt flow. Components consume this; they never touch repos.
 */
export function useGameSession() {
  const { state, init, startGame, guess, useHint, nextImage, revealMore, reset } = useGame();

  const [imagePool, setImagePool] = useState<ImageData[]>([]);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shakeInput, setShakeInput] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const recordedRef = useRef(false);

  const refreshLeaderboard = useCallback(async () => {
    setWeeklyLeaderboard(await repos.leaderboard.getWeekly(getCurrentWeekLabel()));
  }, []);

  // Initial load: fetch catalogue, seed the weekly order, hydrate UI state.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await repos.images.getImages();
        if (cancelled) return;
        setImagePool(data);
        const seed = getWeeklySeed();
        init(seededShuffle(data, seed), seed, getCurrentWeekLabel());
        setAlreadyPlayed(await repos.profile.hasPlayedThisWeek());
        await refreshLeaderboard();
      } catch (err) {
        console.error('Failed to load game data:', err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [init, refreshLeaderboard]);

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

  // Session complete: persist the result exactly once.
  useEffect(() => {
    if (state.phase !== 'complete' || recordedRef.current) return;
    recordedRef.current = true;
    async function record() {
      const username = (await repos.profile.getUsername()) || 'Anonymous';
      await repos.leaderboard.add({
        username,
        score: state.score,
        streak: state.maxStreak,
        date: state.weekLabel,
        correctGuesses: state.correctGuesses,
        totalGuesses: state.totalGuesses,
      });
      await repos.profile.recordResult({ score: state.score, streak: state.maxStreak });
      await repos.profile.setPlayedThisWeek();
      setAlreadyPlayed(true);
      await refreshLeaderboard();
    }
    record();
  }, [
    state.phase,
    state.score,
    state.maxStreak,
    state.weekLabel,
    state.correctGuesses,
    state.totalGuesses,
    refreshLeaderboard,
  ]);

  const start = useCallback(async () => {
    if (alreadyPlayed) return;
    const username = await repos.profile.getUsername();
    if (!username) {
      setNameDraft('');
      setShowNameModal(true);
      return;
    }
    startGame();
  }, [alreadyPlayed, startGame]);

  const saveName = useCallback(async () => {
    await repos.profile.setUsername(nameDraft.trim() || 'Anonymous');
    setShowNameModal(false);
    startGame();
  }, [nameDraft, startGame]);

  const returnHome = useCallback(() => {
    recordedRef.current = false;
    reset();
    const seed = getWeeklySeed();
    init(seededShuffle(imagePool, seed), seed, getCurrentWeekLabel());
  }, [imagePool, init, reset]);

  return {
    state,
    // gameplay actions
    guess,
    useHint,
    nextImage,
    // ready-screen data
    alreadyPlayed,
    weeklyLeaderboard,
    nextResetLabel: getNextResetLabel(),
    // start / name-prompt flow
    start,
    showNameModal,
    nameDraft,
    setNameDraft,
    saveName,
    closeNameModal: () => setShowNameModal(false),
    // misc
    shakeInput,
    returnHome,
  };
}
