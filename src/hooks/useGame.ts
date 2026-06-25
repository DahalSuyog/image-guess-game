'use client';

import { useReducer, useCallback } from 'react';
import { GameState, GameAction, ImageData } from '@/lib/types';

const MAX_REVEALS = 10;
const IMAGES_PER_SESSION = 5;

function normalizeAnswer(answer: string): string {
  return answer.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

function getLevelForReveals(reveals: number): number {
  return Math.min(10, reveals + 1);
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT': {
      return {
        ...state,
        phase: 'ready',
        currentImageIndex: 0,
        currentLevel: 1,
        revealsUsed: 0,
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalGuesses: 0,
        correctGuesses: 0,
        hintUsed: false,
        guessHistory: [],
        results: [],
        images: action.images.slice(0, IMAGES_PER_SESSION),
        weekId: action.weekId,
        weekLabel: action.weekLabel,
      };
    }

    case 'START': {
      if (state.phase !== 'ready') return state;
      return {
        ...state,
        phase: 'playing',
      };
    }

    case 'GUESS': {
      if (state.phase !== 'playing') return state;

      const currentImage = state.images[state.currentImageIndex];
      if (!currentImage) return state;

      const normalizedGuess = normalizeAnswer(action.answer);
      const isCorrect = currentImage.answers.some(
        (answer) => normalizeAnswer(answer) === normalizedGuess
      );

      if (isCorrect) {
        const scoreForImage = state.revealsUsed;
        const newStreak = state.streak + 1;
        return {
          ...state,
          phase: 'correct',
          score: state.score + scoreForImage,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          totalGuesses: state.totalGuesses + 1,
          correctGuesses: state.correctGuesses + 1,
          guessHistory: [...state.guessHistory, action.answer],
          results: [
            ...state.results,
            {
              image: currentImage,
              score: scoreForImage,
              revealsUsed: state.revealsUsed,
            },
          ],
        };
      }

      const nextReveals = state.revealsUsed + 1;
      if (nextReveals >= MAX_REVEALS) {
        return {
          ...state,
          phase: 'gameover',
          revealsUsed: MAX_REVEALS,
          currentLevel: 10,
          streak: 0,
          totalGuesses: state.totalGuesses + 1,
          guessHistory: [...state.guessHistory, action.answer],
          results: [
            ...state.results,
            {
              image: currentImage,
              score: MAX_REVEALS,
              revealsUsed: MAX_REVEALS,
            },
          ],
        };
      }

      return {
        ...state,
        phase: 'wrong',
        revealsUsed: nextReveals,
        currentLevel: getLevelForReveals(nextReveals),
        totalGuesses: state.totalGuesses + 1,
        guessHistory: [...state.guessHistory, action.answer],
      };
    }

    case 'REVEAL_MORE': {
      if (state.phase === 'wrong') {
        return {
          ...state,
          phase: 'playing',
        };
      }
      return state;
    }

    case 'USE_HINT': {
      if (state.phase !== 'playing' || state.hintUsed) return state;

      const nextReveals = state.revealsUsed + 1;
      if (nextReveals >= MAX_REVEALS) {
        const currentImage = state.images[state.currentImageIndex];
        return {
          ...state,
          phase: 'gameover',
          revealsUsed: MAX_REVEALS,
          currentLevel: 10,
          streak: 0,
          results: currentImage
            ? [
                ...state.results,
                {
                  image: currentImage,
                  score: MAX_REVEALS,
                  revealsUsed: MAX_REVEALS,
                },
              ]
            : state.results,
        };
      }

      return {
        ...state,
        hintUsed: true,
        revealsUsed: nextReveals,
        currentLevel: getLevelForReveals(nextReveals),
      };
    }

    case 'NEXT_IMAGE': {
      const nextIndex = state.currentImageIndex + 1;
      if (nextIndex >= state.images.length) {
        return {
          ...state,
          phase: 'complete',
        };
      }
      return {
        ...state,
        phase: 'playing',
        currentImageIndex: nextIndex,
        currentLevel: 1,
        revealsUsed: 0,
        hintUsed: false,
      };
    }

    case 'RESET': {
      return {
        ...state,
        phase: 'loading',
        currentImageIndex: 0,
        currentLevel: 1,
        revealsUsed: 0,
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalGuesses: 0,
        correctGuesses: 0,
        hintUsed: false,
        guessHistory: [],
        images: [],
        results: [],
        weekId: '',
        weekLabel: '',
      };
    }

    default:
      return state;
  }
}

const initialState: GameState = {
  phase: 'loading',
  currentImageIndex: 0,
  currentLevel: 1,
  revealsUsed: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  correctGuesses: 0,
  hintUsed: false,
  guessHistory: [],
  images: [],
  results: [],
  weekId: '',
  weekLabel: '',
};

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const init = useCallback((images: ImageData[], weekId: string, weekLabel: string) => {
    dispatch({ type: 'INIT', images, weekId, weekLabel });
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START' });
  }, []);

  const guess = useCallback((answer: string) => {
    dispatch({ type: 'GUESS', answer });
  }, []);

  const revealMore = useCallback(() => {
    dispatch({ type: 'REVEAL_MORE' });
  }, []);

  const useHint = useCallback(() => {
    dispatch({ type: 'USE_HINT' });
  }, []);

  const nextImage = useCallback(() => {
    dispatch({ type: 'NEXT_IMAGE' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    init,
    startGame,
    guess,
    revealMore,
    useHint,
    nextImage,
    reset,
  };
}

export { MAX_REVEALS, IMAGES_PER_SESSION };
