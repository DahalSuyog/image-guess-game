'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GameState } from '@/domain/types';
import { IMAGES_PER_SESSION, MAX_REVEALS } from '@/config/game.config';

interface ResultOverlayProps {
  state: GameState;
  onNext: () => void;
  onRestart: () => void;
  currentAnswer: string;
  isLoggedIn: boolean;
  saved: boolean;
}

function scoreToEmoji(score: number): string {
  if (score <= 2) return '🟩';
  if (score <= 6) return '🟨';
  return '🟥';
}

function buildShareText(state: GameState): string {
  const blocks = state.results.map((r) => scoreToEmoji(r.score)).join('');
  return [`PixelPeel`, `Score: ${state.score}/50`, blocks].join('\n');
}

const overlayClass =
  'modal-overlay fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4';
const cardClass = 'w-full max-w-sm text-center space-y-5';
const primaryBtn =
  'w-full h-11 bg-primary text-on-primary rounded-md font-label-sm text-label-sm uppercase tracking-wider hover:opacity-90 transition-opacity';
const ghostBtn =
  'w-full h-11 rounded-md border border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider hover:border-primary hover:text-primary transition-colors';

export function ResultOverlay({ state, onNext, onRestart, currentAnswer, isLoggedIn, saved }: ResultOverlayProps) {
  const [copied, setCopied] = useState(false);
  const isLast = state.currentImageIndex + 1 >= IMAGES_PER_SESSION;

  if (state.phase === 'correct' || state.phase === 'gameover' || state.phase === 'skipped') {
    const correct = state.phase === 'correct';
    const skipped = state.phase === 'skipped';
    const statusLabel = correct ? 'correct' : skipped ? 'skipped' : 'out of reveals';
    const statusColor = correct ? 'text-success' : skipped ? 'text-outline' : 'text-error';
    return (
      <div className={overlayClass}>
        <div className={cardClass}>
          <p className={`font-label-sm text-label-sm uppercase tracking-[0.2em] ${statusColor}`}>
            {statusLabel}
          </p>
          <p className="font-headline-lg text-headline-lg text-on-surface">{currentAnswer}</p>
          <p className="font-label-sm text-label-sm text-outline">
            {correct ? `solved at level ${state.currentLevel}/10 · +${state.revealsUsed}` : `+${MAX_REVEALS}`}
          </p>
          <button onClick={onNext} className={primaryBtn}>
            {isLast ? 'see results' : 'next image'}
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === 'complete') {
    const shareText = buildShareText(state);
    return (
      <div className={overlayClass}>
        <div className={`${cardClass} space-y-6`}>
          <div className="space-y-1">
            <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-outline">complete</p>
            <p className="font-display-lg text-display-lg text-primary">{state.score}/50</p>
          </div>

          <div className="space-y-1.5 text-left">
            {state.results.map((result, index) => (
              <div key={result.image.id} className="flex items-center justify-between font-label-sm text-label-sm">
                <span className="text-on-surface-variant truncate">
                  {index + 1}. {result.image.answers[0]}
                </span>
                <span className="text-outline">{scoreToEmoji(result.score)} {result.score}</span>
              </div>
            ))}
          </div>

          <p className="font-label-sm text-label-sm text-outline">
            {isLoggedIn
              ? saved ? 'saved to leaderboard' : 'saving…'
              : <><Link href="/login" className="text-primary hover:opacity-80">log in</Link> to save your result</>}
          </p>

          <div className="space-y-2">
            <button onClick={onRestart} className={primaryBtn}>play again</button>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
              }}
              className={ghostBtn}
            >
              {copied ? 'copied' : 'share'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
