'use client';

import React, { useState } from 'react';
import { AlertTriangle, Key } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function HkdfView() {
  const [ikm, setIkm] = useState('shared-ecdh-secret');
  const [salt, setSalt] = useState('museum-salt');
  const [info, setInfo] = useState('tls13-session-key');
  const [length, setLength] = useState(32);
  const [res, setRes] = useState<{ prk_hex: string; okm_hex: string; blocks: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDerive = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/hkdf/derive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ikm, salt, info, length, ikm_format: 'text' }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'HKDF derivation failed' }));
        throw new Error(err.detail || 'HKDF derivation failed');
      }
      setRes(await response.json());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="hkdf-view">
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div>
          <label htmlFor="hkdf-ikm" className="block text-[11px] text-stone-200 mb-1">Input Keying Material (IKM)</label>
          <input
            id="hkdf-ikm"
            data-testid="hkdf-ikm-input"
            type="text"
            value={ikm}
            onChange={(e) => setIkm(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="hkdf-salt" className="block text-[11px] text-stone-300 mb-1">Salt</label>
            <input
              id="hkdf-salt"
              type="text"
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
            />
          </div>
          <div>
            <label htmlFor="hkdf-info" className="block text-[11px] text-stone-300 mb-1">Context Info</label>
            <input
              id="hkdf-info"
              type="text"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-pink-300"
            />
          </div>
        </div>
        <div>
          <label htmlFor="hkdf-len" className="block text-[11px] text-stone-300 mb-1">Output Bytes: {length}</label>
          <input
            id="hkdf-len"
            type="range"
            min={16}
            max={96}
            step={16}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
        <button
          type="button"
          data-testid="hkdf-derive-btn"
          onClick={handleDerive}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1.5"
        >
          <Key className="w-3.5 h-3.5" /> Extract &amp; Expand Key
        </button>
      </div>

      {res && (
        <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-2 font-mono text-[11px]" data-testid="hkdf-result">
          <div className="text-pink-300 break-all">PRK: {res.prk_hex}</div>
          <div className="text-emerald-300 break-all">OKM: {res.okm_hex}</div>
          <div className="text-stone-400">Expand Blocks: {res.blocks.length}</div>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
