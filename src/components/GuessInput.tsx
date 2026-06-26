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
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  // Clear input shortly after a wrong answer (alongside the shake).
  useEffect(() => {
    if (!shake) return;
    const timer = setTimeout(() => setValue(''), 500);
    return () => clearTimeout(timer);
  }, [shake]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onGuess(trimmed);
    setValue('');
  };

  return (
    <div className="w-full max-w-[420px] space-y-2">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={disabled}
        placeholder="type your guess"
        autoComplete="off"
        autoCapitalize="off"
        className={`w-full h-12 bg-transparent border-b text-center
          font-body-md text-body-md text-on-surface placeholder:text-outline/50
          focus:outline-none transition-colors disabled:opacity-40
          ${shake ? 'animate-shake border-error text-error' : 'border-outline-variant focus:border-primary'}
        `}
      />
      <p className="text-center font-label-sm text-label-sm text-outline">
        press <span className="text-on-surface-variant">enter</span> to guess
      </p>
    </div>
  );
}
