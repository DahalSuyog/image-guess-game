'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Optional header title content (may include an icon). Omit for a bare card. */
  title?: ReactNode;
  /** Extra classes appended to the card (e.g. padding, max-height overrides). */
  cardClassName?: string;
  children: ReactNode;
}

/** Shared modal shell: backdrop overlay + scale-in card + optional titled header with close button. */
export function Modal({ isOpen, onClose, title, cardClassName = '', children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-surface-container rounded-2xl p-6 max-w-md w-full animate-scale-in border border-outline-variant ${cardClassName}`}>
        {title !== undefined && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface flex items-center gap-2">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
            >
              close
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
