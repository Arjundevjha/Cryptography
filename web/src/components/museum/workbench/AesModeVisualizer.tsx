'use client';

import React, { useMemo } from 'react';
import { ShieldAlert, Layers, RefreshCw } from 'lucide-react';

export type AesBlockMode = 'ctr' | 'cbc';

interface AesModeVisualizerProps {
  blockMode: AesBlockMode;
  setBlockMode: (mode: AesBlockMode) => void;
  aesKey: string;
  setAesKey: (key: string) => void;
  aesIv: string;
  setAesIv: (iv: string) => void;
  inputText: string;
  onLoadIdenticalBlocks: () => void;
  cbcResult: {
    iv_hex: string;
    padded_blocks_hex: string[];
    ciphertext_blocks_hex: string[];
  } | null;
}

const FIXED_REUSE_IV = '00000000000000000000000000000000';

/** Compute local PKCS#7 padded 16-byte blocks for live visualization. */
function computePkcs7Blocks(text: string): { hex: string; padLen: number }[] {
  const raw =
    typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(text)
      : Uint8Array.from(
          Array.from(text).map((ch) => ch.charCodeAt(0) & 0xff)
        );
  const padLen = 16 - (raw.length % 16);
  const total = raw.length + padLen;
  const padded = new Uint8Array(total);
  padded.set(raw);
  padded.fill(padLen, raw.length);

  const blocks: { hex: string; padLen: number }[] = [];
  for (let offset = 0; offset < padded.length; offset += 16) {
    const slice = padded.slice(offset, offset + 16);
    const hex = Array.from(slice)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const isLast = offset + 16 === padded.length;
    blocks.push({ hex, padLen: isLast ? padLen : 0 });
  }
  return blocks;
}

export function AesModeVisualizer({
  blockMode,
  setBlockMode,
  aesKey,
  setAesKey,
  aesIv,
  setAesIv,
  inputText,
  onLoadIdenticalBlocks,
  cbcResult,
}: AesModeVisualizerProps) {
  const localBlocks = useMemo(() => computePkcs7Blocks(inputText), [inputText]);

  const hasIdenticalPlaintextBlocks = useMemo(() => {
    if (localBlocks.length < 2) return false;
    const seen = new Set<string>();
    for (const b of localBlocks) {
      if (seen.has(b.hex)) return true;
      seen.add(b.hex);
    }
    return false;
  }, [localBlocks]);

  const hasRepeatedCipherBlocks = useMemo(() => {
    if (!cbcResult || cbcResult.ciphertext_blocks_hex.length < 2) return false;
    return new Set(cbcResult.ciphertext_blocks_hex).size < cbcResult.ciphertext_blocks_hex.length;
  }, [cbcResult]);

  const generateRandomIv = () => {
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    setAesIv(Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join(''));
  };

  return (
    <div className="space-y-3 text-xs" data-testid="aes-mode-controls">
      {/* Block Mode Selector */}
      <div>
        <span id="aes-block-mode-label" className="block text-xs font-sans text-stone-300 mb-1">
          Block Cipher Mode:
        </span>
        <div
          role="group"
          aria-labelledby="aes-block-mode-label"
          className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#090b10] border border-stone-800"
        >
          <button
            type="button"
            data-testid="aes-mode-ctr"
            aria-pressed={blockMode === 'ctr'}
            aria-label="Select AES-256-CTR mode"
            onClick={() => setBlockMode('ctr')}
            className={`py-1.5 rounded-md text-xs font-sans font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              blockMode === 'ctr' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            AES-256-CTR
          </button>
          <button
            type="button"
            data-testid="aes-mode-cbc"
            aria-pressed={blockMode === 'cbc'}
            aria-label="Select AES-256-CBC mode"
            onClick={() => setBlockMode('cbc')}
            className={`py-1.5 rounded-md text-xs font-sans font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
              blockMode === 'cbc' ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
            }`}
          >
            AES-256-CBC
          </button>
        </div>
      </div>

      {/* Key Input */}
      <div>
        <label htmlFor="param-key-aes" className="block text-xs font-sans text-stone-300 mb-1">
          AES Key (16-32 bytes / text):
        </label>
        <input
          id="param-key-aes"
          type="text"
          data-testid="param-key-aes"
          value={aesKey}
          onChange={(e) => setAesKey(e.target.value)}
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        />
      </div>

      {/* CBC IV Input & IV-Reuse Controls */}
      {blockMode === 'cbc' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="param-iv-aes" className="block text-xs font-sans text-stone-300">
              CBC IV (32 hex chars):
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="aes-reuse-iv-btn"
                onClick={() => setAesIv(FIXED_REUSE_IV)}
                aria-label="Use fixed zero IV to demonstrate IV reuse"
                className="text-[11px] font-sans text-amber-300 hover:text-amber-200 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                Fixed IV
              </button>
              <button
                type="button"
                data-testid="aes-random-iv-btn"
                onClick={generateRandomIv}
                aria-label="Generate random 16-byte IV"
                className="text-[11px] font-sans text-emerald-300 hover:text-emerald-200 flex items-center gap-0.5 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Random
              </button>
            </div>
          </div>
          <input
            id="param-iv-aes"
            type="text"
            data-testid="param-iv-aes"
            value={aesIv}
            onChange={(e) => setAesIv(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 32))}
            placeholder="Leave blank for random IV or 32 hex chars"
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      )}

      {/* Interactive IV-Reuse & PKCS7 Padding Visualizer */}
      <div
        data-testid="aes-padding-iv-visualizer"
        className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-[11px] font-semibold text-amber-300 flex items-center gap-1">
            <Layers className="w-3 h-3" /> PKCS#7 Blocks &amp; IV-Reuse Lab
          </span>
          <button
            type="button"
            data-testid="aes-load-identical-blocks-btn"
            onClick={onLoadIdenticalBlocks}
            aria-label="Load identical 16-byte plaintext blocks to test pattern leakage"
            className="text-[10px] font-sans px-2 py-0.5 rounded bg-[#1a1714] border border-amber-500/30 text-amber-300 hover:text-amber-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            Load Identical Blocks
          </button>
        </div>

        <div className="space-y-1">
          {localBlocks.slice(0, 4).map((blk, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-[#161412] border border-stone-800/80 font-mono text-[10px]"
            >
              <span className="text-stone-400 shrink-0">B{idx + 1}</span>
              <span className="text-stone-200 truncate">{blk.hex}</span>
              {blk.padLen > 0 ? (
                <span className="text-amber-300 shrink-0">+{blk.padLen}B pad</span>
              ) : (
                <span className="text-stone-500 shrink-0">16B</span>
              )}
            </div>
          ))}
        </div>

        <div className="p-2 rounded bg-[#161412] border border-stone-800/80 text-[11px] font-sans text-stone-300 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            {blockMode === 'cbc' ? (
              <span>
                <strong>CBC Mode:</strong> Chains each block via{' '}
                <code className="font-mono text-amber-300">Cᵢ = E(Pᵢ ⊕ Cᵢ₋₁)</code>. Reusing an IV with identical
                prefixes leaks identical first ciphertext blocks{hasIdenticalPlaintextBlocks ? ' (identical blocks detected in input!)' : '.'}
              </span>
            ) : (
              <span>
                <strong>CTR Mode:</strong> Encrypts incrementing counters{' '}
                <code className="font-mono text-amber-300">Pᵢ ⊕ E(Nonce‖i)</code>. No PKCS#7 padding needed, and
                identical plaintext blocks produce distinct ciphertext blocks unless the nonce itself is reused.
              </span>
            )}
          </div>
        </div>

        {blockMode === 'cbc' && cbcResult && (
          <div className="space-y-1 pt-1 border-t border-stone-800" data-testid="aes-cbc-blocks-output">
            <div className="text-[10px] font-sans text-stone-400 flex items-center justify-between">
              <span>CBC Ciphertext Blocks (IV: {cbcResult.iv_hex.slice(0, 12)}…)</span>
              {hasRepeatedCipherBlocks && (
                <span className="text-rose-300 font-semibold">Pattern Leak Detected</span>
              )}
            </div>
            {cbcResult.ciphertext_blocks_hex.slice(0, 4).map((cHex, i) => (
              <div
                key={i}
                className="px-2 py-1 rounded bg-[#111520] border border-stone-800 font-mono text-[10px] text-emerald-300 truncate"
              >
                C{i + 1}: {cHex}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
