'use client';

import { GameState } from '@/domain/types';
import { getHints } from '@/domain/gameRules';
import { IMAGES_PER_SESSION, imageUrl } from '@/config/game.config';
import { GameCanvas } from '@/components/GameCanvas';
import { GuessInput } from '@/components/GuessInput';
import { ChanceIndicator } from '@/components/ChanceIndicator';

interface PlayScreenProps {
  state: GameState;
  shakeInput: boolean;
  onGuess: (answer: string) => void;
  onUseHint: () => void;
  onSkip: () => void;
}

export function PlayScreen({ state, shakeInput, onGuess, onUseHint, onSkip }: PlayScreenProps) {
  const currentImage = state.images[state.currentImageIndex];
  const imageSrc = currentImage ? imageUrl(currentImage.filename) : '';
  const hints = currentImage ? getHints(currentImage) : [];
  const revealedHints = hints.slice(0, state.hintsUsed);
  const hintsLeft = hints.length - state.hintsUsed;

  return (
    <div className="w-full max-w-[480px] lg:max-w-[540px] flex flex-col items-center gap-4 sm:gap-5">
      {/* Minimal status line */}
      <div className="w-full flex items-center justify-between font-label-sm text-label-sm text-outline">
        <span>
          image <span className="text-on-surface-variant">{state.currentImageIndex + 1}</span>/{IMAGES_PER_SESSION}
        </span>
        <ChanceIndicator revealsUsed={state.revealsUsed} />
        <span>
          level <span className="text-on-surface-variant">{state.currentLevel}</span>/10
        </span>
      </div>

      {/* Image */}
      <div className="w-full relative rounded-md overflow-hidden border border-outline-variant">
        {imageSrc && <GameCanvas imageSrc={imageSrc} level={state.currentLevel} />}

        {state.phase === 'playing' && (
          <>
            <button
              onClick={onSkip}
              className="absolute top-2 left-2 px-2 py-1 rounded font-label-sm text-label-sm text-on-surface-variant hover:text-error bg-background/40 backdrop-blur-sm transition-colors"
            >
              i give up
            </button>
            <button
              onClick={onUseHint}
              disabled={hintsLeft <= 0}
              className={`absolute top-2 right-2 px-2 py-1 rounded font-label-sm text-label-sm transition-colors
                ${hintsLeft <= 0
                  ? 'text-amber/70 cursor-default'
                  : 'text-on-surface-variant hover:text-amber bg-background/40 backdrop-blur-sm'
                }`}
            >
              {hintsLeft <= 0 ? 'no more hints' : state.hintsUsed === 0 ? 'hint' : `hint · ${hintsLeft} left`}
            </button>
          </>
        )}
      </div>

      {/* Category + revealed hints */}
      <div className="flex flex-col items-center gap-1 min-h-[2.5rem]">
        {currentImage && (
          <span className="font-label-sm text-label-sm text-outline lowercase">{currentImage.category}</span>
        )}
        {revealedHints.map((hint, i) => (
          <p key={i} className="font-body-md text-body-md text-amber text-center">{hint}</p>
        ))}
      </div>

      <GuessInput onGuess={onGuess} disabled={state.phase !== 'playing'} shake={shakeInput} />
    </div>
  );
}
