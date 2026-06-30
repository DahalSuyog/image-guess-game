import { GAME_CONFIG } from '@/config/game.config';
import { GameState, GameAction } from './types';
import { getHints, getLevelForReveals, isCorrectGuess, scoreForImage } from './gameRules';

const { maxReveals, maxLevel, imagesPerSession } = GAME_CONFIG;

export const initialGameState: GameState = {
  phase: 'loading',
  currentImageIndex: 0,
  currentLevel: 1,
  revealsUsed: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  totalGuesses: 0,
  correctGuesses: 0,
  hintsUsed: 0,
  guessHistory: [],
  images: [],
  results: [],
  weekId: '',
  weekLabel: '',
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT': {
      return {
        ...initialGameState,
        phase: 'ready',
        images: action.images.slice(0, imagesPerSession),
        weekId: action.weekId,
        weekLabel: action.weekLabel,
      };
    }

    case 'START': {
      if (state.phase !== 'ready') return state;
      return { ...state, phase: 'playing' };
    }

    case 'GUESS': {
      if (state.phase !== 'playing') return state;

      const currentImage = state.images[state.currentImageIndex];
      if (!currentImage) return state;

      if (isCorrectGuess(currentImage, action.answer)) {
        const score = scoreForImage(state.revealsUsed);
        const newStreak = state.streak + 1;
        return {
          ...state,
          phase: 'correct',
          score: state.score + score,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          totalGuesses: state.totalGuesses + 1,
          correctGuesses: state.correctGuesses + 1,
          guessHistory: [...state.guessHistory, action.answer],
          results: [
            ...state.results,
            { image: currentImage, score, revealsUsed: state.revealsUsed },
          ],
        };
      }

      const nextReveals = state.revealsUsed + 1;
      if (nextReveals >= maxReveals) {
        return {
          ...state,
          phase: 'gameover',
          revealsUsed: maxReveals,
          currentLevel: maxLevel,
          streak: 0,
          totalGuesses: state.totalGuesses + 1,
          guessHistory: [...state.guessHistory, action.answer],
          results: [
            ...state.results,
            { image: currentImage, score: maxReveals, revealsUsed: maxReveals },
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
        return { ...state, phase: 'playing' };
      }
      return state;
    }

    case 'USE_HINT': {
      if (state.phase !== 'playing') return state;

      const currentImage = state.images[state.currentImageIndex];
      if (!currentImage) return state;

      // No hints left to reveal for this image.
      if (state.hintsUsed >= getHints(currentImage).length) return state;

      const nextReveals = state.revealsUsed + 1;
      if (nextReveals >= maxReveals) {
        return {
          ...state,
          phase: 'gameover',
          revealsUsed: maxReveals,
          currentLevel: maxLevel,
          streak: 0,
          hintsUsed: state.hintsUsed + 1,
          results: [
            ...state.results,
            { image: currentImage, score: maxReveals, revealsUsed: maxReveals },
          ],
        };
      }

      return {
        ...state,
        hintsUsed: state.hintsUsed + 1,
        revealsUsed: nextReveals,
        currentLevel: getLevelForReveals(nextReveals),
      };
    }

    case 'SKIP': {
      if (state.phase !== 'playing') return state;

      const currentImage = state.images[state.currentImageIndex];
      if (!currentImage) return state;

      return {
        ...state,
        phase: 'skipped',
        revealsUsed: maxReveals,
        currentLevel: maxLevel,
        streak: 0,
        results: [
          ...state.results,
          { image: currentImage, score: maxReveals, revealsUsed: maxReveals },
        ],
      };
    }

    case 'NEXT_IMAGE': {
      const nextIndex = state.currentImageIndex + 1;
      if (nextIndex >= state.images.length) {
        return { ...state, phase: 'complete' };
      }
      return {
        ...state,
        phase: 'playing',
        currentImageIndex: nextIndex,
        currentLevel: 1,
        revealsUsed: 0,
        hintsUsed: 0,
      };
    }

    case 'RESET': {
      return { ...initialGameState };
    }

    default:
      return state;
  }
}
