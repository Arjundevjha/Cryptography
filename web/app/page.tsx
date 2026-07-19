'use client';

import dynamic from 'next/dynamic';

const MuseumCanvas = dynamic(
  () => import('@/src/components/museum/MuseumCanvas').then((mod) => mod.MuseumCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-100 font-mono">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h1 className="text-sm font-bold tracking-widest text-amber-400 uppercase">INITIALIZING 3D DIGITAL MUSEUM</h1>
        <p className="text-xs text-stone-500 mt-2">Loading WebGL Shaders & Interactive Cryptographic Archive...</p>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-stone-950">
      <MuseumCanvas />
    </main>
  );
}
