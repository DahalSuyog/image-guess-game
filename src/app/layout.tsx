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
      </head>
      <body className="bg-background text-on-background min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
