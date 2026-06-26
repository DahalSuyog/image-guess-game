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
    <div className="modal-overlay fixed inset-0 bg-background/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-surface-container rounded-lg p-6 max-w-md w-full border border-outline-variant ${cardClassName}`}>
        {title !== undefined && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface flex items-center gap-2 lowercase">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="material-symbols-outlined text-[20px] text-outline hover:text-primary transition-colors"
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
