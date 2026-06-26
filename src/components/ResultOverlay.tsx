'use client';

import { useState } from 'react';
import { GameState } from '@/domain/types';
import { IMAGES_PER_SESSION, MAX_REVEALS } from '@/config/game.config';

interface ResultOverlayProps {
  state: GameState;
  onNext: () => void;
  onReturnHome: () => void;
  currentAnswer: string;
}

function scoreToEmoji(score: number): string {
  if (score <= 2) return '🟩';
  if (score <= 6) return '🟨';
  return '🟥';
}

function buildShareText(state: GameState): string {
  const blocks = state.results.map((result) => scoreToEmoji(result.score)).join('');
  return [`Pixel Peel — ${state.weekLabel}`, `Score: ${state.score}/50`, blocks, 'pixelpeel.com'].join('\n');
}

export function ResultOverlay({ state, onNext, onReturnHome, currentAnswer }: ResultOverlayProps) {
  const [copied, setCopied] = useState(false);

  if (state.phase === 'correct') {
    return (
      <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container rounded-2xl p-8 max-w-md w-full text-center animate-scale-in border border-outline-variant">
          <div className="relative mb-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="confetti-particle animate-confetti absolute"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: '50%',
                  backgroundColor: ['#c0c1ff', '#10b981', '#fbbf24', '#ffb4ab'][i % 4],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.8 + Math.random() * 0.5}s`,
                }}
              />
            ))}
            <span
              className="material-symbols-outlined text-[72px] text-success"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Correct!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            It was <span className="text-primary font-bold">{currentAnswer}</span>
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-6">
            Revealed at level {state.currentLevel}/10 · Score: {state.revealsUsed}
          </p>

          <div className="flex gap-2 justify-center mb-6">
            {Array.from({ length: IMAGES_PER_SESSION }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < state.currentImageIndex + 1
                    ? 'bg-success scale-110'
                    : i === state.currentImageIndex + 1
                    ? 'bg-primary/50'
                    : 'bg-outline-variant'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            className="w-full h-14 bg-success text-on-success font-headline-lg text-headline-lg-mobile rounded-xl btn-3d-success flex items-center justify-center gap-2 transition-all"
          >
            {state.currentImageIndex + 1 >= IMAGES_PER_SESSION ? 'See Results' : 'Next Image'}
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === 'gameover') {
    return (
      <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container rounded-2xl p-8 max-w-md w-full text-center animate-scale-in border border-error/30">
          <span
            className="material-symbols-outlined text-[72px] text-error mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            heart_broken
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Out of reveals!</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            It was <span className="text-amber font-bold">{currentAnswer}</span>
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-6">
            Category: {state.images[state.currentImageIndex]?.category}
          </p>

          <div className="flex gap-2 justify-center mb-6">
            {Array.from({ length: IMAGES_PER_SESSION }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < state.currentImageIndex
                    ? 'bg-success'
                    : i === state.currentImageIndex
                    ? 'bg-error'
                    : 'bg-outline-variant'
                }`}
              />
            ))}
          </div>

          <button
            onClick={onNext}
            className="w-full h-14 bg-primary text-on-primary font-headline-lg text-headline-lg-mobile rounded-xl btn-3d flex items-center justify-center gap-2 transition-all"
          >
            {state.currentImageIndex + 1 >= IMAGES_PER_SESSION ? 'See Results' : 'Next Image'}
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === 'complete') {
    const shareText = buildShareText(state);
    return (
      <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container rounded-2xl p-8 max-w-md w-full text-center animate-scale-in border border-primary/30">
          <span
            className="material-symbols-outlined text-[72px] text-amber mb-4"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            emoji_events
          </span>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Weekly Complete</h2>
          <p className="font-headline-lg text-headline-lg text-primary mb-2">{state.score}/50</p>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Great work — your results are saved for {state.weekLabel}.
          </p>

          <div className="space-y-3 mb-6">
            {state.results.map((result, index) => (
              <div key={result.image.id} className="rounded-3xl bg-surface-container-high p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-body-md text-body-md text-on-surface truncate">{index + 1}. {result.image.answers[0]}</p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{scoreToEmoji(result.score)} {result.score}</span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">
                  Reveals: {result.revealsUsed}/{MAX_REVEALS}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-outline-variant bg-surface-container p-4 mb-6 text-left">
            <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] mb-2 text-on-surface-variant">Share your score</p>
            <pre className="whitespace-pre-wrap break-words rounded-2xl bg-background/80 p-3 font-body-md text-body-md text-on-surface-variant">{shareText}</pre>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(shareText);
                setCopied(true);
              }}
              className="w-full h-14 mt-4 bg-primary text-on-primary font-headline-lg text-headline-lg-mobile rounded-xl btn-3d"
            >
              {copied ? 'Copied!' : 'Copy Score'}
            </button>
          </div>

          <button
            onClick={onReturnHome}
            className="w-full h-14 bg-surface text-on-surface font-headline-lg text-headline-lg-mobile rounded-xl border border-outline-variant transition-all"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
