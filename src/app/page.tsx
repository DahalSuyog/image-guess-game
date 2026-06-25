'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { GameCanvas } from '@/components/GameCanvas';
import { GuessInput } from '@/components/GuessInput';
import { ChanceIndicator } from '@/components/ChanceIndicator';
import { ResultOverlay } from '@/components/ResultOverlay';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useGame, IMAGES_PER_SESSION, MAX_REVEALS } from '@/hooks/useGame';
import { ImageData } from '@/lib/types';
import {
  getWeeklySeed,
  getCurrentWeekLabel,
  getUsername,
  setUsername,
  addLeaderboardEntry,
  setBestScore,
  setBestStreak,
  incrementGamesPlayed,
  hasPlayedThisWeek,
  setPlayedThisWeek,
  seededShuffle,
  getLeaderboard,
} from '@/lib/storage';

export default function Home() {
  const { state, init, startGame, guess, revealMore, useHint, nextImage, reset } = useGame();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [imagePool, setImagePool] = useState<ImageData[]>([]);
  const [shakeInput, setShakeInput] = useState(false);

  useEffect(() => {
    async function loadGame() {
      try {
        const res = await fetch('/data/images.json');
        const data: ImageData[] = await res.json();
        setImagePool(data);
        const seed = getWeeklySeed();
        const shuffled = seededShuffle(data, seed);
        init(shuffled, seed, getCurrentWeekLabel());
        setAlreadyPlayed(hasPlayedThisWeek());
      } catch (err) {
        console.error('Failed to load game data:', err);
      }
    }
    loadGame();
  }, [init]);

  useEffect(() => {
    if (state.phase === 'wrong') {
      setShakeInput(true);
      const timer = setTimeout(() => {
        setShakeInput(false);
        revealMore();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state.phase, revealMore]);

  useEffect(() => {
    if (state.phase === 'complete') {
      const username = getUsername() || 'Anonymous';
      addLeaderboardEntry({
        username,
        score: state.score,
        streak: state.maxStreak,
        date: state.weekLabel,
        correctGuesses: state.correctGuesses,
        totalGuesses: state.totalGuesses,
      });
      setBestScore(state.score);
      setBestStreak(state.maxStreak);
      incrementGamesPlayed();
      setPlayedThisWeek();
      setAlreadyPlayed(true);
    }
  }, [state.phase, state.score, state.maxStreak, state.weekLabel, state.correctGuesses, state.totalGuesses]);

  const handleGuess = useCallback(
    (answer: string) => {
      guess(answer);
    },
    [guess]
  );

  const handleNext = useCallback(() => {
    nextImage();
  }, [nextImage]);

  const handleStart = useCallback(() => {
    if (alreadyPlayed) return;
    if (!getUsername()) {
      setNameDraft('');
      setShowNameModal(true);
      return;
    }
    startGame();
  }, [alreadyPlayed, startGame]);

  const handleSaveName = useCallback(() => {
    const trimmed = nameDraft.trim();
    setUsername(trimmed || 'Anonymous');
    setShowNameModal(false);
    startGame();
  }, [nameDraft, startGame]);

  const handleReturnHome = useCallback(() => {
    reset();
    const seed = getWeeklySeed();
    const shuffled = seededShuffle(imagePool, seed);
    init(shuffled, seed, getCurrentWeekLabel());
  }, [imagePool, init, reset]);

  const currentImage = state.images[state.currentImageIndex];
  const imageSrc = currentImage ? `/images/game/${currentImage.filename}` : '';
  const weeklyLeaderboard = getLeaderboard();
  const nextReset = useMemo(() => {
    const weekMs = 1000 * 60 * 60 * 24 * 7;
    const next = new Date(Math.floor(Date.now() / weekMs) * weekMs + weekMs);
    return next.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }, []);

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
          <section className="w-full bg-surface-container-high rounded-[32px] border border-outline-variant p-8 space-y-6 animate-fade-in">
            <div className="space-y-3 text-center">
              <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface-variant">{state.weekLabel}</p>
              <h1 className="font-display-lg text-display-lg text-on-surface">5 images. 10 reveals. One weekly score.</h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-[38rem] mx-auto">
                Guess the image before it fully reveals. Each wrong answer costs a reveal. The goal: finish the week with the lowest total score.
              </p>
            </div>

            {alreadyPlayed ? (
              <div className="rounded-3xl border border-primary/20 bg-surface-container p-6 space-y-4 text-center">
                <p className="font-headline-lg text-headline-lg text-primary">You already played this week</p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Your session is locked until next reset on {nextReset}. Check the leaderboard to see how you ranked.
                </p>
                <button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-lg text-headline-lg-mobile btn-3d flex items-center justify-center gap-2"
                >
                  View Leaderboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleStart}
                  className="w-full h-16 bg-primary text-on-primary rounded-3xl font-display-lg text-display-lg btn-3d flex items-center justify-center gap-3"
                >
                  Play This Week
                  <span className="material-symbols-outlined">play_arrow</span>
                </button>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-3xl bg-surface-container p-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Images</p>
                    <p className="font-headline-lg text-primary">5</p>
                  </div>
                  <div className="rounded-3xl bg-surface-container p-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Reveals</p>
                    <p className="font-headline-lg text-primary">{MAX_REVEALS}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-outline-variant bg-surface-container p-4 text-on-surface-variant">
              <p className="font-label-sm text-label-sm uppercase tracking-[0.2em] mb-3">This week&apos;s leaderboard</p>
              {weeklyLeaderboard.length === 0 ? (
                <p className="font-body-md text-body-md">No scores yet for this week. Be the first to play!</p>
              ) : (
                <div className="space-y-3">
                  {weeklyLeaderboard.slice(0, 3).map((entry, index) => (
                    <div key={`${entry.username}-${index}`} className="flex items-center justify-between gap-3">
                      <span className="text-on-surface">{index + 1}. {entry.username}</span>
                      <span className="font-bold text-primary">{entry.score}/50</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            <div className="w-full flex items-center gap-3 mb-md animate-fade-in">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                Level {state.currentLevel}/10
              </span>
              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full level-bar"
                  style={{ width: `${(state.revealsUsed / MAX_REVEALS) * 100}%` }}
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">
                {state.currentImageIndex + 1}/{IMAGES_PER_SESSION}
              </span>
            </div>

            <ChanceIndicator revealsUsed={state.revealsUsed} />

            <section className="w-full relative group animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden border-2 border-outline-variant game-card-shadow transition-transform duration-300 hover:scale-[1.005]">
                {imageSrc && <GameCanvas imageSrc={imageSrc} level={state.currentLevel} />}
              </div>

              {state.phase === 'playing' && (
                <button
                  onClick={useHint}
                  disabled={state.hintUsed}
                  className={`absolute top-3 right-3 backdrop-blur-md border px-3 py-1.5 rounded-full
                    flex items-center gap-1.5 font-label-sm text-label-sm transition-all active:scale-95 shadow-sm
                    ${state.hintUsed
                      ? 'bg-amber/20 border-amber/30 text-amber cursor-default'
                      : 'bg-surface-container-high/80 border-outline-variant text-on-surface hover:bg-surface-bright'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                  {state.hintUsed ? 'HINT USED' : 'HINT'}
                </button>
              )}
            </section>

            {state.hintUsed && currentImage && (
              <div className="w-full mt-sm p-3 bg-amber/10 border border-amber/20 rounded-xl animate-fade-in">
                <p className="font-body-md text-body-md text-amber text-center">💡 {currentImage.hint}</p>
              </div>
            )}

            {currentImage && (
              <div className="mt-sm">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high font-label-sm text-label-sm text-on-surface-variant border border-outline-variant">
                  <span className="material-symbols-outlined text-[14px]">category</span>
                  {currentImage.category}
                </span>
              </div>
            )}

            <GuessInput onGuess={handleGuess} disabled={state.phase !== 'playing'} shake={shakeInput} />
          </>
        )}
      </main>

      <ResultOverlay
        state={state}
        onNext={handleNext}
        onReturnHome={handleReturnHome}
        currentAnswer={currentImage?.answers[0] || ''}
      />
      <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showNameModal && (
        <div className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl p-6 max-w-md w-full animate-scale-in border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface">Enter your name</h2>
              <button
                onClick={() => setShowNameModal(false)}
                className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-colors"
              >
                close
              </button>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Your name will appear on the local leaderboard.
            </p>
            <input
              type="text"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Enter your name..."
              className="w-full h-14 bg-surface-container-low border-2 border-outline-variant rounded-xl px-4 mb-4 font-body-md text-body-md text-on-surface placeholder:text-outline/50 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
              maxLength={20}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveName}
                className="flex-1 h-14 bg-primary text-on-primary rounded-xl font-headline-lg text-headline-lg-mobile btn-3d"
              >
                Start Playing
              </button>
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 h-14 bg-surface-container text-on-surface rounded-xl border border-outline-variant font-headline-lg text-headline-lg-mobile"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
