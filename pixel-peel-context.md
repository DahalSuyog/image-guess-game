# Pixel Peel — Complete Game Context & Technical Specification
> This document is the single source of truth for building Pixel Peel.
> Do not make assumptions. If something is not listed here, ask before implementing.

---

## 1. What Is Pixel Peel?

Pixel Peel is a **browser-based daily guessing game**. Each session contains **5 images**. Every image starts completely pixelated (unrecognizable). The player types a guess. A wrong guess makes the image 10% clearer. A correct guess ends that round. The player's score for each round is the number of wrong guesses it took them. Lower total score = better performance.

The game resets weekly. Players share their weekly cumulative score with friends to compete.

---

## 2. Game Mechanics — Exhaustive Rules

### 2.1 Session Structure
- One session = exactly 5 images, presented one at a time.
- All 5 images are the same for every player on a given week (date-seeded selection).
- A player can only complete one session per week. Scores persist in `localStorage`.
- If a player has already played this week, the landing page shows their score and the leaderboard.

### 2.2 Pixelation Levels
- Each image has **10 pixelation levels**: Level 1 (most pixelated) → Level 10 (fully clear).
- The image is pre-processed at all 10 levels using the Canvas API when the game loads.
- Level 1 is shown first. Each wrong guess advances the level by 1.
- Pixelation is achieved by **downscaling then upscaling** with `imageSmoothingEnabled = false` (not CSS blur — CSS blur looks soft, not pixel-art blocky). See Section 8 for the exact algorithm.

| Level | Block Size (approx pixels per "pixel block") | Description |
|-------|---------------------------------------------|-------------|
| 1     | 32px blocks                                  | Nearly unrecognizable |
| 2     | 26px blocks                                  | Shapes visible but unclear |
| 3     | 22px blocks                                  | |
| 4     | 18px blocks                                  | |
| 5     | 14px blocks                                  | |
| 6     | 10px blocks                                  | |
| 7     | 7px blocks                                   | |
| 8     | 5px blocks                                   | |
| 9     | 3px blocks                                   | |
| 10    | 0 (original)                                 | Fully clear |

> All 10 levels are pre-rendered into separate `<canvas>` or `ImageData` objects on game start, stored in memory. Switching between levels must be **instant** — no recomputation on guess.

### 2.3 Guess Logic
- Player types a text guess into an input field and submits (Enter key or button click).
- Input is trimmed and compared **case-insensitively** against the accepted answer list.
- Each image has a list of accepted answers (e.g., `["Eiffel Tower", "eiffel tower", "la tour eiffel", "paris tower"]`). Any match = correct.
- **Wrong guess**: increment wrong-guess counter for this image → advance pixelation level by 1.
- **Correct guess**: record the score for this image (= number of wrong guesses so far) → move to next image.
- **10 wrong guesses with no correct answer**: image is auto-revealed (shown at Level 10 for 2 seconds), score for this image = 10 (maximum penalty) → move to next image.
- Player **cannot skip** an image without attempting at least one guess.
- After a correct guess or 10 failed guesses, the answer label appears below the image with a brief animation.

### 2.4 Scoring System
- Score per image = number of wrong guesses used (0 = guessed correctly on first attempt, 10 = failed all 10 guesses).
- Session total = sum of scores for all 5 images.
- **Minimum possible session score**: 0 (guessed all 5 on first attempt).
- **Maximum possible session score**: 50 (failed all guesses on all 5 images).
- The weekly score is the single session score (one session per week per browser).

### 2.5 Session End & Sharing
- After the 5th image is resolved, the **Results Screen** appears.
- It shows:
  - Each image's thumbnail (fully clear), the correct answer, and the score for that image.
  - The total session score out of 50.
  - A shareable text block (copy to clipboard button) in this exact format:
    ```
    Pixel Peel — Week [WEEK_NUMBER]
    Score: [TOTAL]/50
    🟥🟥🟩🟨🟥  ← one emoji per image (see legend below)
    pixelpeel.com
    ```
  - Emoji legend: 🟩 = 0–2 wrong guesses, 🟨 = 3–6 wrong guesses, 🟥 = 7–10 wrong guesses.
- A "Local Leaderboard" section displays all scores submitted by friends who have played on the same browser/device network (use `localStorage`). This is a simple list stored locally — no server required.

### 2.6 Friend Leaderboard (localStorage-only)
- When a player enters their name before playing, it is saved to `localStorage`.
- At session end, their name + score + week number is saved to `localStorage`.
- The leaderboard displays all entries stored in `localStorage` for the current week, sorted ascending (lowest score first).
- No backend, no accounts, no authentication. This is a purely client-side leaderboard for shared devices (e.g., a household).

---

## 3. Image Data

### 3.1 Image Format
- All game images are stored in `/public/images/game/` as `.webp` format.
- Each image: **800×600px** at maximum, **under 150KB** each.
- Filenames: `image-01.webp`, `image-02.webp`, … `image-30.webp` (a pool of 30 images).

### 3.2 Image Metadata File
Located at `/public/data/images.json`. This is the **only** source of truth for image content. Structure:

```json
[
  {
    "id": "01",
    "filename": "image-01.webp",
    "answers": ["Eiffel Tower", "Tour Eiffel", "Paris Tower"],
    "category": "Landmark",
    "difficulty": "easy",
    "hint": "Built in 1889 for a World's Fair"
  }
]
```

### 3.3 Weekly Image Selection
- A set of 5 images is selected per week using a deterministic seed.
- Seed formula: `Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7))` — changes every 7 days.
- Use this seed with a simple shuffle of the image array to pick the 5 for the week.
- This ensures all players globally see the same 5 images in the same order for that week, with zero server calls.

```typescript
// /lib/weekly.ts — deterministic weekly selection
export function getWeeklyImages(allImages: ImageMeta[]): ImageMeta[] {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const shuffled = seededShuffle([...allImages], seed);
  return shuffled.slice(0, 5);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  let s = seed;
  return arr
    .map((item) => {
      s = (s * 9301 + 49297) % 233280;
      return { item, sort: s / 233280 };
    })
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}
```

---

## 4. User Flow — Screen by Screen

### Screen 1: Landing Page (`/`)
- Game logo + tagline: *"How many peels until you see it?"*
- "How to Play" section (2–3 sentences max, with icon grid).
- "Play This Week" button → goes to `/game`.
- If player already played this week (check `localStorage`): show their score, share button, and local leaderboard instead of the Play button.
- Name entry modal appears **before** the game starts if no name is stored in `localStorage`.

### Screen 2: Name Entry Modal
- A simple modal overlay on top of the landing page.
- One text input: "What should we call you?"
- One button: "Start Playing"
- Name stored in `localStorage` key `pixelpeel_name`.
- If name already exists, skip this modal.

### Screen 3: Game Screen (`/game`)
- **Header**: Game title, image counter (e.g., "Image 2 of 5"), current image score.
- **Canvas area**: The pixelated image, centered, responsive (fills width on mobile).
- **Reveal counter**: "Reveals used: 3 / 10" shown below canvas.
- **Guess input**: Text field + "Guess" button. Auto-focused on mount and after each wrong guess.
- **Wrong guess feedback**: Input shakes (CSS animation), shows "Try again!" message that disappears after 1 second.
- **Correct guess feedback**: Image snaps to full clarity, green overlay with a checkmark appears for 1.5 seconds, then auto-advances.
- **Hint button**: Costs 1 reveal (increments the reveal counter by 1 without showing guess feedback). Shows the hint text from `images.json`. Can only be used once per image.
- **No "Give Up" button** — game forces the player to either guess correctly or exhaust all 10 reveals.

### Screen 4: Results Screen (`/results` or modal overlay on `/game`)
- Appears after the 5th image is resolved.
- Shows a summary table (image thumbnail, answer, score per image).
- Total score prominently displayed.
- "Copy Score" button generates the shareable text block.
- "Local Leaderboard" section.
- "Come back next week" message with the date of the next weekly reset.

---

## 5. Tech Stack — Exact Versions and Rationale

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | **Next.js 14** (App Router) | SSG-compatible, Vercel-native, built-in image optimization, metadata API for SEO |
| Language | **TypeScript 5** | Type safety, no `any`, strict mode enabled |
| Styling | **Tailwind CSS v3** | Utility-first, zero runtime CSS, small bundle |
| Pixelation | **HTML5 Canvas API** (native) | No external library; pre-renders all levels on load |
| Animations | **CSS transitions + keyframes** (no library) | Zero JS animation overhead |
| State management | **React `useReducer`** | Game state is complex enough for a reducer; no external lib needed |
| Persistence | **`localStorage`** | No backend, no auth, GDPR-simple |
| Image format | **WebP** | Best compression/quality ratio for pixelation effect |
| Linting | **ESLint + Prettier** | Consistency |
| Deployment | **Vercel** (static export preferred) | `output: 'export'` in `next.config.js` for pure static site |

### Do NOT use:
- No `framer-motion` (overkill, adds bundle weight)
- No `redux` or `zustand` (localStorage + useReducer is sufficient)
- No backend (no API routes, no database, no auth)
- No `canvas` npm package (use native browser Canvas API only)
- No image CDN (all images served from `/public/`)
- No `styled-components` or CSS-in-JS (use Tailwind only)

---

## 6. Project File Structure

```
pixel-peel/
├── app/
│   ├── layout.tsx              # Root layout: fonts, global metadata, viewport
│   ├── page.tsx                # Landing page (/)
│   ├── game/
│   │   └── page.tsx            # Game screen (/game)
│   ├── results/
│   │   └── page.tsx            # Results screen (/results)
│   ├── globals.css             # Tailwind directives + custom keyframes
│   └── sitemap.ts              # Auto-generated sitemap for SEO
│
├── components/
│   ├── GameCanvas.tsx          # The pixelated image canvas component
│   ├── GuessInput.tsx          # Input field + submit button
│   ├── RevealCounter.tsx       # "Reveals: 3/10" display
│   ├── ImageProgress.tsx       # "Image 2 of 5" header indicator
│   ├── ResultsTable.tsx        # End-of-game summary table
│   ├── ShareButton.tsx         # Copy-to-clipboard share block
│   ├── Leaderboard.tsx         # localStorage leaderboard
│   ├── HowToPlay.tsx           # Landing page instructions section
│   └── NameModal.tsx           # Name entry modal
│
├── lib/
│   ├── pixelate.ts             # Canvas pixelation algorithm (all 10 levels)
│   ├── weekly.ts               # Seeded weekly image selection
│   ├── scoring.ts              # Score calculation, emoji grid, share text
│   ├── storage.ts              # All localStorage read/write operations
│   └── types.ts                # TypeScript interfaces and types
│
├── hooks/
│   ├── useGame.ts              # useReducer game state machine
│   └── useLocalLeaderboard.ts  # Read/write leaderboard from localStorage
│
├── public/
│   ├── images/
│   │   └── game/
│   │       ├── image-01.webp
│   │       ├── image-02.webp
│   │       └── ... (up to image-30.webp)
│   ├── data/
│   │   └── images.json         # Image metadata (answers, categories, hints)
│   ├── og-image.png            # Open Graph image (1200×630px)
│   ├── favicon.ico
│   └── manifest.json           # PWA manifest (optional but good for discoverability)
│
├── next.config.js              # output: 'export', image optimization config
├── tailwind.config.ts
├── tsconfig.json               # strict: true
├── vercel.json                 # Cache headers config
└── .env.local                  # Empty for now — no secrets needed
```

---

## 7. TypeScript Types (`/lib/types.ts`)

```typescript
export interface ImageMeta {
  id: string;
  filename: string;
  answers: string[];      // All accepted answer strings (case-insensitive match)
  category: string;       // "Landmark" | "Historical" | "Object" | "Animal" | etc.
  difficulty: "easy" | "medium" | "hard";
  hint: string;           // Shown when player taps hint button (costs 1 reveal)
}

export interface RoundState {
  image: ImageMeta;
  revealsUsed: number;    // 0–10
  hintUsed: boolean;
  solved: boolean;        // true if guessed correctly
  failed: boolean;        // true if 10 reveals exhausted without correct guess
  score: number;          // revealsUsed at the moment of correct guess (or 10 if failed)
}

export interface GameState {
  phase: "idle" | "playing" | "round_end" | "game_end";
  currentRoundIndex: number;   // 0–4
  rounds: RoundState[];
  weekNumber: number;
  playerName: string;
}

export type GameAction =
  | { type: "START_GAME"; payload: { images: ImageMeta[]; playerName: string; weekNumber: number } }
  | { type: "SUBMIT_GUESS"; payload: { guess: string } }
  | { type: "USE_HINT" }
  | { type: "NEXT_ROUND" }
  | { type: "END_GAME" };

export interface LeaderboardEntry {
  name: string;
  score: number;
  weekNumber: number;
  timestamp: number;
}
```

---

## 8. Pixelation Algorithm (`/lib/pixelate.ts`)

This is the core visual mechanic. It must produce **sharp pixel blocks**, not blurry/fuzzy edges.

```typescript
// Block sizes for each level (index 0 = level 1, index 9 = level 10)
const BLOCK_SIZES = [32, 26, 22, 18, 14, 10, 7, 5, 3, 0] as const;

/**
 * Pre-render all 10 pixelation levels for an image into ImageData objects.
 * Call this once per image when the game round starts.
 * Returns an array of 10 HTMLCanvasElement objects (index 0 = most pixelated).
 */
export function prerenderLevels(
  sourceImage: HTMLImageElement,
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement[] {
  return BLOCK_SIZES.map((blockSize) => {
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext("2d")!;

    if (blockSize === 0) {
      // Level 10: draw original image at full resolution
      ctx.drawImage(sourceImage, 0, 0, outputWidth, outputHeight);
    } else {
      // Step 1: draw image at tiny resolution (one pixel per block)
      const smallW = Math.ceil(outputWidth / blockSize);
      const smallH = Math.ceil(outputHeight / blockSize);
      ctx.drawImage(sourceImage, 0, 0, smallW, smallH);

      // Step 2: scale back up WITHOUT smoothing (creates hard pixel blocks)
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, smallW, smallH, 0, 0, outputWidth, outputHeight);
    }

    return canvas;
  });
}
```

**Key constraint**: `imageSmoothingEnabled = false` is **mandatory**. Without it you get a blurry photograph effect, not a pixelated block effect. This line must never be removed or omitted.

---

## 9. Game State Machine (`/hooks/useGame.ts`)

Use `useReducer` with the following reducer logic. Do not use `useState` for game flow — the state transitions are too interdependent.

```typescript
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const rounds: RoundState[] = action.payload.images.map((img) => ({
        image: img,
        revealsUsed: 0,
        hintUsed: false,
        solved: false,
        failed: false,
        score: 0,
      }));
      return {
        phase: "playing",
        currentRoundIndex: 0,
        rounds,
        weekNumber: action.payload.weekNumber,
        playerName: action.payload.playerName,
      };
    }

    case "SUBMIT_GUESS": {
      const round = state.rounds[state.currentRoundIndex];
      const isCorrect = round.image.answers.some(
        (a) => a.toLowerCase() === action.payload.guess.toLowerCase().trim()
      );

      if (isCorrect) {
        const updatedRound = { ...round, solved: true, score: round.revealsUsed };
        const updatedRounds = state.rounds.map((r, i) =>
          i === state.currentRoundIndex ? updatedRound : r
        );
        return { ...state, phase: "round_end", rounds: updatedRounds };
      }

      // Wrong guess
      const newReveals = round.revealsUsed + 1;
      const failed = newReveals >= 10;
      const updatedRound: RoundState = {
        ...round,
        revealsUsed: newReveals,
        failed,
        score: failed ? 10 : 0, // 0 = not yet scored (still playing)
      };
      const updatedRounds = state.rounds.map((r, i) =>
        i === state.currentRoundIndex ? updatedRound : r
      );
      return {
        ...state,
        phase: failed ? "round_end" : "playing",
        rounds: updatedRounds,
      };
    }

    case "USE_HINT": {
      const round = state.rounds[state.currentRoundIndex];
      if (round.hintUsed || round.revealsUsed >= 9) return state; // can't use hint if already used or last reveal
      const updatedRound: RoundState = {
        ...round,
        hintUsed: true,
        revealsUsed: round.revealsUsed + 1, // hint costs 1 reveal
      };
      const updatedRounds = state.rounds.map((r, i) =>
        i === state.currentRoundIndex ? updatedRound : r
      );
      return { ...state, rounds: updatedRounds };
    }

    case "NEXT_ROUND": {
      const nextIndex = state.currentRoundIndex + 1;
      if (nextIndex >= 5) {
        return { ...state, phase: "game_end" };
      }
      return { ...state, phase: "playing", currentRoundIndex: nextIndex };
    }

    default:
      return state;
  }
}
```

---

## 10. localStorage Schema (`/lib/storage.ts`)

All `localStorage` keys are prefixed with `pixelpeel_`. Never read/write `localStorage` outside of this file.

| Key | Type | Description |
|-----|------|-------------|
| `pixelpeel_name` | `string` | Player's display name |
| `pixelpeel_session_[WEEK_NUMBER]` | `JSON string` of `{ score: number, rounds: RoundState[] }` | This week's completed session |
| `pixelpeel_leaderboard` | `JSON string` of `LeaderboardEntry[]` | All local scores for all weeks |

```typescript
export const STORAGE_KEYS = {
  name: "pixelpeel_name",
  session: (week: number) => `pixelpeel_session_${week}`,
  leaderboard: "pixelpeel_leaderboard",
} as const;

export function hasPlayedThisWeek(weekNumber: number): boolean {
  return localStorage.getItem(STORAGE_KEYS.session(weekNumber)) !== null;
}

export function saveSession(weekNumber: number, score: number, rounds: RoundState[]): void {
  localStorage.setItem(STORAGE_KEYS.session(weekNumber), JSON.stringify({ score, rounds }));
}

export function saveToLeaderboard(entry: LeaderboardEntry): void {
  const existing: LeaderboardEntry[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.leaderboard) ?? "[]"
  );
  existing.push(entry);
  localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(existing));
}

export function getLeaderboardForWeek(weekNumber: number): LeaderboardEntry[] {
  const all: LeaderboardEntry[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.leaderboard) ?? "[]"
  );
  return all
    .filter((e) => e.weekNumber === weekNumber)
    .sort((a, b) => a.score - b.score);
}
```

---

## 11. GameCanvas Component (`/components/GameCanvas.tsx`)

```typescript
// Props
interface GameCanvasProps {
  prerenderedLevels: HTMLCanvasElement[]; // Array of 10 canvases from prerenderLevels()
  currentLevel: number;                    // 0-indexed (0 = most pixelated, 9 = clear)
  className?: string;
}
```

- Renders a `<canvas>` element.
- On `currentLevel` change, use `ctx.drawImage(prerenderedLevels[currentLevel], 0, 0)` — no recomputation.
- Canvas always renders at **full container width** with aspect ratio locked to 4:3 (matching source images).
- On mobile: canvas fills 100% of viewport width. On desktop: max-width 640px, centered.
- No animation between levels — **instant switch**. The reveal is the reward, not a transition.
- Add `aria-label="Pixelated image — guess what it shows"` to the canvas for accessibility.

---

## 12. Scoring and Share Text (`/lib/scoring.ts`)

```typescript
export function totalScore(rounds: RoundState[]): number {
  return rounds.reduce((sum, r) => sum + r.score, 0);
}

export function roundEmoji(score: number): string {
  if (score <= 2) return "🟩";
  if (score <= 6) return "🟨";
  return "🟥";
}

export function generateShareText(
  weekNumber: number,
  rounds: RoundState[]
): string {
  const total = totalScore(rounds);
  const emojis = rounds.map((r) => roundEmoji(r.score)).join("");
  return `Pixel Peel — Week ${weekNumber}\nScore: ${total}/50\n${emojis}\npixelpeel.com`;
}
```

---

## 13. SEO Configuration

### 13.1 Root Layout Metadata (`/app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  title: "Pixel Peel — Weekly Pixel Guessing Game",
  description:
    "A weekly guessing game. Famous landmarks, objects, and photos start completely pixelated. Each wrong guess reveals a little more. How few peels does it take you?",
  keywords: ["pixel guessing game", "daily puzzle", "image guessing", "wordle-like", "weekly game"],
  openGraph: {
    title: "Pixel Peel — Weekly Pixel Guessing Game",
    description: "How few reveals does it take you? Guess the pixelated image before it clears.",
    url: "https://pixelpeel.com",
    siteName: "Pixel Peel",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixel Peel — Weekly Pixel Guessing Game",
    description: "Guess the pixelated image. A new set of 5 every week.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://pixelpeel.com"),
};
```

### 13.2 Sitemap (`/app/sitemap.ts`)

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://pixelpeel.com", lastModified: new Date(), priority: 1 },
    { url: "https://pixelpeel.com/game", lastModified: new Date(), priority: 0.8 },
    { url: "https://pixelpeel.com/results", lastModified: new Date(), priority: 0.5 },
  ];
}
```

### 13.3 JSON-LD Structured Data
Add to `layout.tsx` `<head>`:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Pixel Peel",
  "description": "Weekly pixel guessing game. Guess the image before it fully reveals.",
  "url": "https://pixelpeel.com",
  "applicationCategory": "Game",
  "genre": "Puzzle",
  "operatingSystem": "Web Browser"
}
</script>
```

---

## 14. Performance Requirements

### 14.1 Core Web Vitals Targets
| Metric | Target |
|--------|--------|
| LCP (Largest Contentful Paint) | < 1.5s |
| CLS (Cumulative Layout Shift) | < 0.05 |
| INP (Interaction to Next Paint) | < 100ms |

### 14.2 How to Hit These Targets

**Image loading:**
- All 5 game images are preloaded at game start using `Promise.all` + `new Image()` before the first round begins.
- Show a loading screen ("Preparing this week's images...") while preloading. Do not start round 1 until all 5 source images are loaded.
- Use `<link rel="preload">` in `<head>` for the first game image (`image-01.webp` or whatever the first weekly image is) — wait, the image set is dynamic (weekly seed), so use JS preloading, not static HTML `<link>` tags.

**Canvas switching:**
- All 10 pixelation levels per image are pre-generated immediately after the source image loads.
- Switching between levels is a single `ctx.drawImage()` call — effectively zero latency.

**No layout shift:**
- Canvas element has a fixed aspect ratio container (CSS `aspect-ratio: 4/3`) so it never causes layout shift as it loads.

**Bundle size:**
- No animation libraries, no state management libraries, no heavy dependencies.
- Target JS bundle < 80KB gzipped.

**Font loading:**
- Use `next/font` with `display: 'swap'` for the game font (use `Inter` from Google Fonts via next/font).

**Route prefetching:**
- Next.js prefetches `/game` on hover of the "Play" button automatically (default behavior). Do not disable.

---

## 15. Vercel Deployment Configuration

### 15.1 `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",           // Pure static site — no serverless functions needed
  trailingSlash: true,        // Vercel static exports work better with trailing slashes
  images: {
    unoptimized: true,        // Required for static export (no Next.js image server)
  },
};

module.exports = nextConfig;
```

> **Note**: Because `output: 'export'` is used, the app is a pure static site. All game images are served directly from `/public/`. This means zero cold start, zero serverless function overhead, and maximum CDN cacheability.

### 15.2 `vercel.json`

```json
{
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/data/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=3600, stale-while-revalidate=86400" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### 15.3 Deployment Checklist
- [ ] All game images present in `/public/images/game/` as `.webp`
- [ ] `/public/data/images.json` is valid JSON with all 30 entries
- [ ] `/public/og-image.png` exists (1200×630px)
- [ ] `/public/favicon.ico` exists
- [ ] `next build` completes without errors
- [ ] `next export` (triggered by `output: 'export'`) produces `/out` directory
- [ ] Vercel project root set to project root, build command: `next build`, output directory: `out`

---

## 16. Accessibility Requirements

- All interactive elements must be keyboard-navigable (Tab, Enter, Space).
- Guess input must auto-focus on mount and after each guess submission.
- Canvas must have a descriptive `aria-label`.
- Correct/wrong guess feedback must use both visual AND text (not color-only feedback, for color-blind players).
- Wrong guess: input field gets `aria-invalid="true"` and a visible text message "Incorrect — try again!" (not just a red border).
- Score display must be readable by screen readers (`aria-live="polite"` on the reveal counter).
- Color contrast: all text must meet WCAG AA (4.5:1 ratio minimum).

---

## 17. Things That Must NOT Be Built

These are explicitly out of scope. Do not implement them:

- No user accounts or authentication
- No backend server or API routes
- No database of any kind (no Vercel KV, no Postgres, no Supabase)
- No social login
- No paid tier or premium features
- No dark mode toggle (pick one theme and stick with it)
- No sound effects or music
- No multiplayer / real-time features
- No "streak" tracking across weeks
- No mobile app (web only)
- No PWA install prompt (manifest is optional; no install prompt logic)
- No email subscription
- No analytics beyond Vercel's built-in analytics (if enabled in Vercel dashboard — no Segment, no Mixpanel, no GA)

---

## 18. Visual Design Constraints

- **Palette**: Dark background (`#0f0f0f`), light text (`#f5f5f5`), accent color (`#fbbf24` — amber-400 in Tailwind). Keep it minimal and retro-game-adjacent.
- **Font**: `Inter` (via `next/font/google`) for UI text. Monospace for the score/counter display.
- **Canvas border**: 2px solid `#fbbf24` (accent color) with a subtle glow (`box-shadow: 0 0 16px rgba(251, 191, 36, 0.3)`).
- **No gradients on UI elements** — flat colors only.
- **No rounded corners > 8px** — keep it sharp and game-like.
- Mobile-first layout. The canvas should be the dominant element on mobile, with controls stacked below it.
- The results screen uses a simple table — no animations, no confetti, no celebratory effects. Keep it clean.

---

## 19. Week Number Calculation

```typescript
// /lib/weekly.ts
export function getCurrentWeekNumber(): number {
  const start = new Date("2025-01-01").getTime(); // Epoch for week 1
  const now = Date.now();
  return Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7)) + 1;
}
```

The week number is used in:
- Share text ("Week 12")
- `localStorage` session key (`pixelpeel_session_12`)
- Leaderboard filtering

---

## 20. Edge Cases to Handle

| Scenario | Expected Behavior |
|----------|-------------------|
| Player refreshes mid-game | Game state is **not** persisted mid-session (intentional). They start over. Only completed sessions are saved. |
| Player has already played this week | Landing page shows score summary + share button. No replay allowed. |
| `localStorage` is unavailable (private browsing, storage blocked) | Game still works fully; just skip all `localStorage` reads/writes silently. Wrap all storage calls in try/catch. |
| Image fails to load | Show a "Image unavailable" placeholder in the canvas area. Skip that image, treat score as 0 (not penalized for missing asset). |
| Player submits empty guess | Do nothing. No wrong-guess penalty, no animation. Input shakes gently to indicate "please type something." |
| Player types very long guess (>100 chars) | Truncate input at 100 characters via `maxLength` attribute on the input element. |
| Two players on same device/browser | Leaderboard shows both. Session is tied to the single `pixelpeel_name` in localStorage — whichever name is stored, that's the current player. No multi-profile support. |

---

*End of Pixel Peel specification. Build exactly what is described here.*
