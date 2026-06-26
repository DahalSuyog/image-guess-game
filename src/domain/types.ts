export interface ImageData {
  id: string;
  filename: string;
  answers: string[];
  category: string;
  difficulty: string;
  hint: string;
}

export type GamePhase =
  | 'loading'
  | 'ready'
  | 'playing'
  | 'correct'
  | 'wrong'
  | 'gameover'
  | 'complete';

export interface ImageResult {
  image: ImageData;
  score: number;
  revealsUsed: number;
}

export interface GameState {
  phase: GamePhase;
  currentImageIndex: number;
  currentLevel: number; // 1 (most pixelated) to maxLevel (clear)
  revealsUsed: number;
  score: number;
  streak: number;
  maxStreak: number;
  totalGuesses: number;
  correctGuesses: number;
  hintUsed: boolean;
  guessHistory: string[];
  images: ImageData[];
  results: ImageResult[];
  weekId: string;
  weekLabel: string;
}

export type GameAction =
  | { type: 'INIT'; images: ImageData[]; weekId: string; weekLabel: string }
  | { type: 'START' }
  | { type: 'GUESS'; answer: string }
  | { type: 'REVEAL_MORE' }
  | { type: 'USE_HINT' }
  | { type: 'NEXT_IMAGE' }
  | { type: 'RESET' };

export interface LeaderboardEntry {
  username: string;
  score: number;
  streak: number;
  date: string;
  correctGuesses: number;
  totalGuesses: number;
}

export interface ProfileStats {
  bestScore: number;
  bestStreak: number;
  gamesPlayed: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
}
