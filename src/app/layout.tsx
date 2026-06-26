import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelPeel — Weekly Image Guessing Game",
  description:
    "Guess pixelated images as they slowly reveal. Earn points for early guesses, build streaks, and climb the leaderboard!",
  keywords: ["pixel", "guess", "game", "weekly", "image", "puzzle"],
  openGraph: {
    title: "PixelPeel — Weekly Image Guessing Game",
    description: "Can you guess the image before it's fully revealed?",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#0b1326" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
