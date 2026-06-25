'use client';

import { useState, useEffect } from 'react';
import { getUsername, setUsername as saveUsername } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [username, setUsernameLocal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsernameLocal(getUsername());
    }
  }, [isOpen]);

  const handleSave = () => {
    saveUsername(username.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl p-6 max-w-md w-full animate-scale-in border border-outline-variant">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
          >
            close
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsernameLocal(e.target.value)}
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
      </div>
    </div>
  );
}
