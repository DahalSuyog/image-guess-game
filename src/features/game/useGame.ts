'use client';

import { useReducer, useCallback } from 'react';
import { ImageData } from '@/domain/types';
import { gameReducer, initialGameState } from '@/domain/gameReducer';

/**
 * Thin React binding around the pure game reducer. Holds state and exposes
 * memoized dispatchers; all rules live in `@/domain`.
 */
export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const init = useCallback((images: ImageData[], weekId: string, weekLabel: string) => {
    dispatch({ type: 'INIT', images, weekId, weekLabel });
  }, []);

  const startGame = useCallback(() => dispatch({ type: 'START' }), []);
  const guess = useCallback((answer: string) => dispatch({ type: 'GUESS', answer }), []);
  const revealMore = useCallback(() => dispatch({ type: 'REVEAL_MORE' }), []);
  const useHint = useCallback(() => dispatch({ type: 'USE_HINT' }), []);
  const nextImage = useCallback(() => dispatch({ type: 'NEXT_IMAGE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, init, startGame, guess, revealMore, useHint, nextImage, reset };
}
