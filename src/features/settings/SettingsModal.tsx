'use client';

import { useState, useEffect } from 'react';
import { repos } from '@/data';
import { Modal } from '@/components/ui/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    repos.profile.getUsername().then((name) => {
      if (!cancelled) setUsername(name);
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleSave = async () => {
    await repos.profile.setUsername(username.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          Settings
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name..."
            className="w-full h-12 bg-surface-container-low border-2 border-outline-variant rounded-xl px-4
              font-body-md text-body-md text-on-surface placeholder:text-outline/50
              focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            maxLength={20}
          />
          <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
            Your name appears on the leaderboard
          </p>
        </div>

        <div className="pt-2 border-t border-outline-variant">
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase tracking-wider">
            About
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            PixelPeel is a weekly image guessing game. Each week you get 5 pixelated images —
            guess them with as few reveals as possible to maximize your score!
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full h-12 mt-6 bg-primary text-on-primary font-headline-lg text-headline-lg-mobile
          rounded-xl btn-3d flex items-center justify-center gap-2 transition-all"
      >
        Save
        <span className="material-symbols-outlined text-[20px]">check</span>
      </button>
    </Modal>
  );
}
