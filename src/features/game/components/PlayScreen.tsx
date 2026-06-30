'use client';

import { GameState } from '@/domain/types';
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
          <button
            onClick={onUseHint}
            disabled={state.hintUsed}
            className={`absolute top-2 right-2 px-2 py-1 rounded font-label-sm text-label-sm transition-colors
              ${state.hintUsed
                ? 'text-amber/70 cursor-default'
                : 'text-on-surface-variant hover:text-amber bg-background/40 backdrop-blur-sm'
              }`}
          >
            {state.hintUsed ? 'hint used' : 'hint'}
          </button>
        )}
      </div>

      {/* Category + hint text */}
      <div className="flex flex-col items-center gap-1 min-h-[2.5rem]">
        {currentImage && (
          <span className="font-label-sm text-label-sm text-outline lowercase">{currentImage.category}</span>
        )}
        {state.hintUsed && currentImage && (
          <p className="font-body-md text-body-md text-amber text-center">{currentImage.hint}</p>
        )}
      </div>

      <GuessInput onGuess={onGuess} disabled={state.phase !== 'playing'} shake={shakeInput} />

      <button
        onClick={onSkip}
        disabled={state.phase !== 'playing'}
        className="font-label-sm text-label-sm text-outline hover:text-on-surface-variant transition-colors disabled:opacity-40 disabled:hover:text-outline"
      >
        skip this one
      </button>
    </div>
  );
}
