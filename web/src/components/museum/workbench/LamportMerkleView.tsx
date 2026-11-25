'use client';

import React, { useState } from 'react';
import { AlertTriangle, GitBranch, ShieldCheck } from 'lucide-react';

const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

interface LamportDemoResponse {
  merkle_root_hex: string;
  leaf_index: number;
  leaf_hashes_hex: string[];
  auth_path: { position: string; hash_hex: string }[];
  message_digest_hex: string;
  signature_elements: number;
  valid: boolean;
  tampered_valid: boolean;
}

export function LamportMerkleView() {
  const [message, setMessage] = useState('Post-Quantum Seal 2026');
  const [leafIndex, setLeafIndex] = useState(0);
  const [res, setRes] = useState<LamportDemoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/lamport/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, leaf_index: leafIndex }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Lamport Merkle demo failed' }));
        throw new Error(err.detail || 'Lamport Merkle demo failed');
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
    <div className="space-y-3 text-xs" data-testid="lamport-merkle-view">
      <div className="p-3 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2">
        <div>
          <label htmlFor="lamport-msg" className="block text-[11px] text-stone-200 mb-1">Message to Sign</label>
          <input
            id="lamport-msg"
            data-testid="lamport-message-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-amber-300"
          />
        </div>
        <div>
          <label htmlFor="lamport-leaf" className="block text-[11px] text-stone-300 mb-1">
            Merkle Leaf Keypair Index (0–3)
          </label>
          <select
            id="lamport-leaf"
            value={leafIndex}
            onChange={(e) => setLeafIndex(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-100"
          >
            {[0, 1, 2, 3].map((idx) => (
              <option key={idx} value={idx}>Leaf #{idx}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          data-testid="lamport-run-btn"
          onClick={handleRun}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center justify-center gap-1.5"
        >
          <GitBranch className="w-3.5 h-3.5" /> Sign &amp; Build Merkle Auth Path
        </button>
      </div>

      {res && (
        <div className="p-3 rounded-xl bg-[#111520] border border-stone-800 space-y-2 font-mono text-[11px]" data-testid="lamport-result">
          <div className="flex items-center justify-between text-emerald-300 font-sans font-semibold">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Valid: {String(res.valid)}</span>
            <span className="text-rose-300">Tampered: {String(res.tampered_valid)}</span>
          </div>
          <div className="text-purple-300 break-all">
            Merkle Root: {res.merkle_root_hex.slice(0, 32)}…
          </div>
          <div className="text-stone-400">
            Signature Elements: {res.signature_elements} (256 × 32B preimages)
          </div>
          <div className="space-y-1 pt-1 border-t border-stone-800 text-[10px] text-stone-300">
            {res.auth_path.map((node, idx) => (
              <div key={idx}>Sibling #{idx + 1} ({node.position}): {node.hash_hex.slice(0, 24)}…</div>
            ))}
          </div>
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
