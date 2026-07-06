import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Display / question voice — a serif with real weight and presence (the
// case-file headline face), used with restraint.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

// The answer itself — a reading serif so synthesized prose feels trustworthy.
// Italic is used in the empty state and query echo, so it's kept.
const newsreader = Newsreader({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

// Case numbers, exhibit labels, the verdict stamp, the case-log — the
// dossier/typewriter voice.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Case File — an answer engine that renders a verdict on its evidence",
  description:
    "Ask a question and get a synthesized answer as a case report: numbered exhibits, and a verdict on whether the sources agree, differ, or don't address it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${newsreader.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
