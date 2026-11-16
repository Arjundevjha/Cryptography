'use client';

import React from 'react';

interface DiffieHellmanVisualizerProps {
  dhPrime: number;
  setDhPrime: (val: number) => void;
  dhGen: number;
  setDhGen: (val: number) => void;
  dhAlice: number;
  setDhAlice: (val: number) => void;
  dhBob: number;
  setDhBob: (val: number) => void;
  exchangeResult: { A: number; B: number; shared_secret: number } | null;
}

export function DiffieHellmanVisualizer({
  dhPrime,
  setDhPrime,
  dhGen,
  setDhGen,
  dhAlice,
  setDhAlice,
  dhBob,
  setDhBob,
  exchangeResult,
}: DiffieHellmanVisualizerProps) {
  return (
    <div className="space-y-2.5 text-xs" data-testid="dh-visualizer">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="param-p-diffie-hellman" className="block text-xs font-sans text-stone-300 mb-1">
            Prime (p):
          </label>
          <input
            id="param-p-diffie-hellman"
            type="number"
            min={3}
            data-testid="param-p-diffie-hellman"
            value={dhPrime}
            onChange={(e) => setDhPrime(parseInt(e.target.value, 10) || 23)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
        <div>
          <label htmlFor="param-g-diffie-hellman" className="block text-xs font-sans text-stone-300 mb-1">
            Generator (g):
          </label>
          <input
            id="param-g-diffie-hellman"
            type="number"
            min={2}
            data-testid="param-g-diffie-hellman"
            value={dhGen}
            onChange={(e) => setDhGen(parseInt(e.target.value, 10) || 5)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="param-a-diffie-hellman" className="block text-xs font-sans text-amber-300 mb-1">
            Alice Private (a):
          </label>
          <input
            id="param-a-diffie-hellman"
            type="number"
            min={1}
            data-testid="param-a-diffie-hellman"
            value={dhAlice}
            onChange={(e) => setDhAlice(parseInt(e.target.value, 10) || 1)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
        <div>
          <label htmlFor="param-b-diffie-hellman" className="block text-xs font-sans text-emerald-300 mb-1">
            Bob Private (b):
          </label>
          <input
            id="param-b-diffie-hellman"
            type="number"
            min={1}
            data-testid="param-b-diffie-hellman"
            value={dhBob}
            onChange={(e) => setDhBob(parseInt(e.target.value, 10) || 1)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      </div>

      {exchangeResult && (
        <div className="p-2.5 rounded-lg bg-[#090b10] border border-amber-500/30 grid grid-cols-3 gap-1.5 text-center font-mono">
          <div>
            <span className="text-[10px] text-stone-400 block font-sans">Public A</span>
            <span className="text-amber-300 font-bold">{exchangeResult.A}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-sans">Public B</span>
            <span className="text-emerald-300 font-bold">{exchangeResult.B}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block font-sans">Shared S</span>
            <span className="text-stone-100 font-bold">{exchangeResult.shared_secret}</span>
          </div>
        </div>
      )}
    </div>
  );
}
