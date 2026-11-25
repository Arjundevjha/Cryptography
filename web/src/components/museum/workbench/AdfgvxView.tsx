'use client';

import React, { useState } from 'react';
import { AlertTriangle, Lock, Unlock } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function AdfgvxView() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [text, setText] = useState('ATTACK AT 1200');
  const [transKey, setTransKey] = useState('PRIVACY');
  const [fractionated, setFractionated] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const endpoint = mode === 'encrypt' ? '/api/adfgvx/encrypt' : '/api/adfgvx/decrypt';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, transposition_key: transKey }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'ADFGVX request failed' }));
        throw new Error(err.detail || 'ADFGVX request failed');
      }
      const data = await res.json();
      setFractionated(data.fractionated || '');
      setResult(mode === 'encrypt' ? data.ciphertext : data.plaintext);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="adfgvx-view">
      <div className="flex rounded-lg p-1 bg-[#221f1c] border border-stone-800 gap-1">
        <button
          type="button"
          data-testid="adfgvx-mode-encrypt"
          onClick={() => setMode('encrypt')}
          className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1 ${
            mode === 'encrypt' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
          }`}
        >
          <Lock className="w-3 h-3" /> Encrypt
        </button>
        <button
          type="button"
          data-testid="adfgvx-mode-decrypt"
          onClick={() => setMode('decrypt')}
          className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1 ${
            mode === 'decrypt' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
          }`}
        >
          <Unlock className="w-3 h-3" /> Decrypt
        </button>
      </div>

      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div>
          <label htmlFor="adfgvx-text" className="block text-[11px] text-stone-200 mb-1">
            {mode === 'encrypt' ? 'Alphanumeric Plaintext' : 'ADFGVX Ciphertext'}
          </label>
          <input
            id="adfgvx-text"
            data-testid="adfgvx-text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300"
          />
        </div>
        <div>
          <label htmlFor="adfgvx-key" className="block text-[11px] text-stone-300 mb-1">
            Transposition Key
          </label>
          <input
            id="adfgvx-key"
            data-testid="adfgvx-key-input"
            type="text"
            value={transKey}
            onChange={(e) => setTransKey(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
          />
        </div>
        <button
          type="button"
          data-testid="adfgvx-run-btn"
          onClick={handleRun}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
        >
          {mode === 'encrypt' ? 'Fractionate & Transpose' : 'Untranspose & Decode'}
        </button>
      </div>

      {result && (
        <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-1.5 font-mono" data-testid="adfgvx-result">
          {fractionated && (
            <div className="text-[11px] text-lime-300 break-all">
              6×6 Fractionated: {fractionated}
            </div>
          )}
          <div className="text-sm text-amber-300 break-all">{result}</div>
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
