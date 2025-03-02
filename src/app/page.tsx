'use client';

import Clock from '@/components/Clock';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-5 font-sans gap-5">
      <h1 className="text-3xl font-bold mt-8 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
        Xtar's Clock
      </h1>
      <Clock />
    </main>
  );
}