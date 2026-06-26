'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ResultOverlay } from '@/components/ResultOverlay';
import { useAuth } from '@/features/auth/useAuth';
import { useGameSession } from '@/features/game/useGameSession';
import { PlayScreen } from '@/features/game/components/PlayScreen';
import { CategoryBar } from '@/features/game/components/CategoryBar';
import { LeaderboardModal } from '@/features/leaderboard/LeaderboardModal';
import { SettingsModal } from '@/features/settings/SettingsModal';

export default function Home() {
  const { user, signOut } = useAuth();
  const session = useGameSession(user);
  const { state } = session;
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentImage = state.images[state.currentImageIndex];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        score={state.score}
        user={user}
        onLeaderboard={() => setShowLeaderboard(true)}
        onSettings={() => setShowSettings(true)}
        onSignOut={signOut}
      />

      <main className="flex-1 w-full flex flex-col items-center justify-start sm:justify-center gap-5 sm:gap-6 px-4 sm:px-gutter py-6 sm:py-md">
        <CategoryBar
          categories={session.categories}
          active={session.category}
          onSelect={session.selectCategory}
        />
        {state.phase === 'loading' ? (
          <p className="font-label-sm text-label-sm text-outline animate-pulse">loading…</p>
        ) : (
          <PlayScreen
            state={state}
            shakeInput={session.shakeInput}
            onGuess={session.guess}
            onUseHint={session.useHint}
          />
        )}
      </main>

      <ResultOverlay
        state={state}
        onNext={session.nextImage}
        onRestart={session.restart}
        currentAnswer={currentImage?.answers[0] || ''}
        isLoggedIn={session.isLoggedIn}
        saved={session.saved}
      />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
