'use client';

import { GameState } from '@/domain/types';
import { IMAGES_PER_SESSION, MAX_REVEALS, imageUrl } from '@/config/game.config';
import { GameCanvas } from '@/components/GameCanvas';
import { GuessInput } from '@/components/GuessInput';
import { ChanceIndicator } from '@/components/ChanceIndicator';

interface PlayScreenProps {
  state: GameState;
  shakeInput: boolean;
  onGuess: (answer: string) => void;
  onUseHint: () => void;
}

export function PlayScreen({ state, shakeInput, onGuess, onUseHint }: PlayScreenProps) {
  const currentImage = state.images[state.currentImageIndex];
  const imageSrc = currentImage ? imageUrl(currentImage.filename) : '';

  return (
    <>
      <div className="w-full flex items-center gap-3 mb-md animate-fade-in">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
          Level {state.currentLevel}/10
        </span>
        <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full level-bar"
            style={{ width: `${(state.revealsUsed / MAX_REVEALS) * 100}%` }}
          />
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
          {state.currentImageIndex + 1}/{IMAGES_PER_SESSION}
        </span>
      </div>

      <ChanceIndicator revealsUsed={state.revealsUsed} />

      <section className="w-full relative group animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border-2 border-outline-variant game-card-shadow transition-transform duration-300 hover:scale-[1.005]">
          {imageSrc && <GameCanvas imageSrc={imageSrc} level={state.currentLevel} />}
        </div>

        {state.phase === 'playing' && (
          <button
            onClick={onUseHint}
            disabled={state.hintUsed}
            className={`absolute top-3 right-3 backdrop-blur-md border px-3 py-1.5 rounded-full
              flex items-center gap-1.5 font-label-sm text-label-sm transition-all active:scale-95 shadow-sm
              ${state.hintUsed
                ? 'bg-amber/20 border-amber/30 text-amber cursor-default'
                : 'bg-surface-container-high/80 border-outline-variant text-on-surface hover:bg-surface-bright'
              }
            `}
          >
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            {state.hintUsed ? 'HINT USED' : 'HINT'}
          </button>
        )}
      </section>

      {state.hintUsed && currentImage && (
        <div className="w-full mt-sm p-3 bg-amber/10 border border-amber/20 rounded-xl animate-fade-in">
          <p className="font-body-md text-body-md text-amber text-center">💡 {currentImage.hint}</p>
        </div>
      )}

      {currentImage && (
        <div className="mt-sm">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant border border-outline-variant">
            <span className="material-symbols-outlined text-[14px]">category</span>
            {currentImage.category}
          </span>
        </div>
      )}

      <GuessInput onGuess={onGuess} disabled={state.phase !== 'playing'} shake={shakeInput} />
    </>
  );
}
