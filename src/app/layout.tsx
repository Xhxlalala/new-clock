import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Xtar's Interactive Clock | Real-time Clock with Color Magic",
  description: "A beautiful, interactive clock that changes color every minute. Set your own time or watch the real-time clock with magical color transformations.",
  keywords: "clock, interactive, color changing, real-time, next.js"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}