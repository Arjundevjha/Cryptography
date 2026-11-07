'use client';

import dynamic from 'next/dynamic';

const MuseumCanvas = dynamic(
  () => import('@/src/components/museum/MuseumCanvas').then((mod) => mod.MuseumCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-[#090b10] flex flex-col items-center justify-center text-stone-200 select-none">
        <div className="flex flex-col items-center max-w-sm text-center px-6">
          <div className="text-amber-500/80 text-xl mb-4 tracking-widest">◈</div>
          <h1 className="font-display text-lg tracking-[0.25em] text-stone-100 uppercase font-medium">
            Cryptography Museum
          </h1>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent my-4" />
          <p className="text-xs text-stone-400 font-serif italic leading-relaxed">
            &ldquo;Secret writing is the art of concealing the existence of the message itself.&rdquo;
          </p>
          <span className="text-[10px] text-stone-500 mt-1 font-sans tracking-wider uppercase">
            Johannes Trithemius, 1518
          </span>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#090b10]">
      <MuseumCanvas />
    </main>
  );
}
