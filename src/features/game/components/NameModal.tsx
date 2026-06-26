'use client';

import { Modal } from '@/components/ui/Modal';

interface NameModalProps {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function NameModal({ isOpen, value, onChange, onSave, onClose }: NameModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enter your name">
      <p className="font-body-md text-body-md text-on-surface-variant mb-4">
        Your name will appear on the local leaderboard.
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your name..."
        className="w-full h-14 bg-surface-container-low border-2 border-outline-variant rounded-xl px-4 mb-4 font-body-md text-body-md text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
        maxLength={20}
      />
      <div className="flex gap-3">
        <button
          onClick={onSave}
          className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-headline-lg text-headline-lg-mobile btn-3d"
        >
          Start Playing
        </button>
        <button
          onClick={onClose}
          className="flex-1 h-14 bg-surface-container text-on-surface rounded-xl border border-outline-variant font-headline-lg text-headline-lg-mobile"
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
