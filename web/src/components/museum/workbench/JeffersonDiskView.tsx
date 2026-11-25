'use client';

import React, { useState } from 'react';
import { AlertTriangle, Disc, Lock, Unlock } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export function JeffersonDiskView() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [text, setText] = useState('RETREAT AT DAWN');
  const [offset, setOffset] = useState(5);
  const [result, setResult] = useState('');
  const [sampleRows, setSampleRows] = useState<{ offset: number; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const endpoint = mode === 'encrypt' ? '/api/jefferson/encrypt' : '/api/jefferson/decrypt';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, offset }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Jefferson Disk request failed' }));
        throw new Error(err.detail || 'Jefferson Disk request failed');
      }
      const data = await res.json();
      setResult(mode === 'encrypt' ? data.ciphertext : data.plaintext);
      setSampleRows((data.all_rows || []).slice(0, 6));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setErrorMsg(err instanceof TypeError || !msg ? OFFLINE_ERROR_MSG : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid="jefferson-disk-view">
      <div className="flex rounded-lg p-1 bg-[#221f1c] border border-stone-800 gap-1">
        <button
          type="button"
          onClick={() => setMode('encrypt')}
          className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1 ${
            mode === 'encrypt' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
          }`}
        >
          <Lock className="w-3 h-3" /> Encrypt
        </button>
        <button
          type="button"
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
          <label htmlFor="jefferson-text" className="block text-[11px] text-stone-200 mb-1">
            {mode === 'encrypt' ? 'Plaintext (A–Z)' : 'Ciphertext (A–Z)'}
          </label>
          <input
            id="jefferson-text"
            data-testid="jefferson-text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300"
          />
        </div>
        <div>
          <label htmlFor="jefferson-offset" className="block text-[11px] text-stone-300 mb-1">
            Cylinder Row Offset (1–25): {offset}
          </label>
          <input
            id="jefferson-offset"
            data-testid="jefferson-offset-input"
            type="range"
            min={1}
            max={25}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>
        <button
          type="button"
          data-testid="jefferson-run-btn"
          onClick={handleRun}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1.5"
        >
          <Disc className="w-3.5 h-3.5" /> Rotate Cylinder
        </button>
      </div>

      {result && (
        <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-2 font-mono" data-testid="jefferson-result">
          <div className="text-sm text-amber-300 break-all">{result}</div>
          {sampleRows.length > 0 && (
            <div className="text-[10px] text-stone-400 space-y-0.5 pt-1 border-t border-stone-800">
              {sampleRows.map((r) => (
                <div key={r.offset}>
                  Row {r.offset}: {r.text}
                </div>
              ))}
            </div>
          )}
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
