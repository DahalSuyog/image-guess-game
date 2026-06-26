'use client';

import { Modal } from '@/components/ui/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="about">
      <div className="space-y-4 font-body-md text-body-md text-on-surface-variant">
        <p>
          pixelpeel shows you a pixelated image that sharpens with each wrong guess.
          name it in as few reveals as you can — lower scores are better.
        </p>
        <ul className="space-y-1 font-label-sm text-label-sm text-outline">
          <li>· 5 images per session</li>
          <li>· 10 reveals per image</li>
          <li>· press enter to submit a guess</li>
          <li>· log in to save your results</li>
        </ul>
      </div>
    </Modal>
  );
}
