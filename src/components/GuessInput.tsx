'use client';

import { useState, useRef, useEffect } from 'react';

interface GuessInputProps {
  onGuess: (answer: string) => void;
  disabled: boolean;
  shake: boolean;
}

export function GuessInput({ onGuess, disabled, shake }: GuessInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Clear input when shake animation finishes (wrong answer)
  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setValue(''), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onGuess(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <section className="w-full mt-lg space-y-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="relative">
        <input
          ref={inputRef}
          id="guessInput"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Enter your guess..."
          className={`w-full h-16 md:h-20 bg-surface-container-low border-2 rounded-xl px-6
            font-headline-lg text-headline-lg-mobile text-on-surface
            placeholder:text-outline/50
            focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
            transition-all disabled:opacity-50 disabled:cursor-not-allowed
            ${shake ? 'animate-shake border-error' : 'border-outline-variant'}
          `}
          autoComplete="off"
          autoCapitalize="off"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={`w-full h-14 md:h-16 bg-primary text-on-primary font-headline-lg text-headline-lg-mobile
          rounded-xl btn-3d flex items-center justify-center gap-base
          active:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed
          disabled:shadow-none transition-all`}
      >
        GUESS
        <span className="material-symbols-outlined text-[28px]">arrow_forward</span>
      </button>
      <p className="text-center font-body-md text-body-md text-on-surface-variant opacity-70">
        Type the name of what you see in the pixelated image above.
      </p>
    </section>
  );
}
