"use client";

/**
 * Root application layout for the Next.js App Router.
 *
 * - Loads global styles and fonts
 * - Wraps every page in `TranslationProvider` so `useTranslation()` works anywhere
 * - Mounts the persistent `FloatingFeedbackWidget` so users can submit feedback on any page
 */

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TranslationProvider } from "./contexts/TranslationContext";
import FloatingFeedbackWidget from "../../components/FloatingFeedbackWidget";

// Register Google fonts and expose them as CSS variables
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Renders shared HTML structure and global providers.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Make translations available to the entire app */}
        <TranslationProvider>
          {children}
          {/* Always-on floating feedback entry point */}
          <FloatingFeedbackWidget />
        </TranslationProvider>
      </body>
    </html>
  );
}
