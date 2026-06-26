'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ResultOverlay } from '@/components/ResultOverlay';
import { useGameSession } from '@/features/game/useGameSession';
import { ReadyScreen } from '@/features/game/components/ReadyScreen';
import { PlayScreen } from '@/features/game/components/PlayScreen';
import { NameModal } from '@/features/game/components/NameModal';
import { LeaderboardModal } from '@/features/leaderboard/LeaderboardModal';
import { SettingsModal } from '@/features/settings/SettingsModal';

export default function Home() {
  const session = useGameSession();
  const { state } = session;
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const currentImage = state.images[state.currentImageIndex];

  if (state.phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <h1 className="font-headline-lg text-headline-lg text-primary">PixelPeel</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading this week&apos;s images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        score={state.score}
        streak={state.streak}
        onLeaderboard={() => setShowLeaderboard(true)}
        onSettings={() => setShowSettings(true)}
      />

      <main className="flex-1 max-w-[600px] w-full mx-auto px-gutter py-md md:py-xl flex flex-col items-center">
        {state.phase === 'ready' ? (
          <ReadyScreen
            weekLabel={state.weekLabel}
            alreadyPlayed={session.alreadyPlayed}
            nextResetLabel={session.nextResetLabel}
            weeklyLeaderboard={session.weeklyLeaderboard}
            onStart={session.start}
            onOpenLeaderboard={() => setShowLeaderboard(true)}
          />
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
        onReturnHome={session.returnHome}
        currentAnswer={currentImage?.answers[0] || ''}
      />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <NameModal
        isOpen={session.showNameModal}
        value={session.nameDraft}
        onChange={session.setNameDraft}
        onSave={session.saveName}
        onClose={session.closeNameModal}
      />
    </div>
  );
}
