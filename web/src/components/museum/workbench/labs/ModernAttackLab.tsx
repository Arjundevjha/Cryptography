'use client';

import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Play, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { postCryptanalysis } from './labApi';

interface FlippedPosition {
  plaintext_offset: number;
  target_block: number;
  modified_block: number;
  byte_index: number;
  orig_byte_hex: string;
  new_byte_hex: string;
  xor_mask_hex: string;
}

interface DecryptedBlock {
  index: number;
  hex: string;
  text: string;
  status: 'corrupted' | 'forged' | 'intact';
}

interface CbcBitflipResponse {
  plaintext: string;
  target_from: string;
  target_to: string;
  iv_hex: string;
  tampered_iv_hex: string;
  original_blocks_hex: string[];
  tampered_blocks_hex: string[];
  flipped_positions: FlippedPosition[];
  decrypted_text: string;
  decrypted_raw_hex: string;
  decrypted_blocks: DecryptedBlock[];
  forged_successfully: boolean;
}

interface FactorTraceResult {
  method: string;
  found: boolean;
  p: number | null;
  q: number | null;
  iterations: number;
  elapsed_ms: number;
  trace: Record<string, unknown>[];
}

interface RsaFactorResponse {
  n: number;
  e: number;
  bit_length: number;
  p: number | null;
  q: number | null;
  phi: number | null;
  d: number | null;
  fermat: FactorTraceResult | null;
  pollard_rho: FactorTraceResult | null;
}

interface PaddingOracleStep {
  byte_index: number;
  pad_value: number;
  guessed_byte_hex: string;
  intermediate_hex: string;
  recovered_byte_hex: string;
  recovered_char: string;
}

interface PaddingOracleResponse {
  recovered_plaintext: string;
  ciphertext_hex: string;
  iv_hex: string;
  block_count: number;
  oracle_queries: number;
  steps: PaddingOracleStep[];
}

interface EcdsaNonceReuseResponse {
  curve: string;
  actual_private_key: string;
  recovered_private_key: string;
  recovered_nonce: string;
  r: string;
  s1: string;
  s2: string;
  recovered_match: boolean;
}

interface ModernAttackLabProps {
  exhibitId: 'aes' | 'rsa' | 'ecc';
}

const RSA_PRESETS = [
  { label: 'Classic N=3233 (61×53)', n: 3233, e: 17 },
  { label: 'Close Primes (Fermat)', n: 10403, e: 17 },
  { label: '24-bit Weak N', n: 16773121, e: 65537 },
];

export function ModernAttackLab({ exhibitId }: ModernAttackLabProps) {
  // AES CBC Bit-Flipping & Padding Oracle state
  const [aesMode, setAesMode] = useState<'bitflip' | 'padding-oracle'>('bitflip');
  const [cbcPlaintext, setCbcPlaintext] = useState('user=alice;role=guest;pad=1');
  const [targetFrom, setTargetFrom] = useState('guest');
  const [targetTo, setTargetTo] = useState('admin');
  const [cbcRes, setCbcRes] = useState<CbcBitflipResponse | null>(null);
  const [oraclePlaintext, setOraclePlaintext] = useState('ORACLE SECRET');
  const [oracleRes, setOracleRes] = useState<PaddingOracleResponse | null>(null);

  // RSA Factoring state
  const [rsaN, setRsaN] = useState('3233');
  const [rsaE, setRsaE] = useState('17');
  const [rsaMethod, setRsaMethod] = useState<'fermat' | 'pollard_rho' | 'both'>('both');
  const [rsaRes, setRsaRes] = useState<RsaFactorResponse | null>(null);

  // ECDSA Nonce Reuse state
  const [eccMsg1, setEccMsg1] = useState('Transfer 100 coins to Alice');
  const [eccMsg2, setEccMsg2] = useState('Transfer 500 coins to Eve');
  const [eccRes, setEccRes] = useState<EcdsaNonceReuseResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (exhibitId === 'aes') {
        if (aesMode === 'bitflip') {
          const data = await postCryptanalysis<CbcBitflipResponse>(
            '/api/cryptanalysis/cbc-bitflip',
            {
              plaintext: cbcPlaintext,
              target_from: targetFrom,
              target_to: targetTo,
            }
          );
          setOracleRes(null);
          setCbcRes(data);
        } else {
          const data = await postCryptanalysis<PaddingOracleResponse>(
            '/api/cryptanalysis/padding-oracle',
            { plaintext: oraclePlaintext }
          );
          setCbcRes(null);
          setOracleRes(data);
        }
      } else if (exhibitId === 'ecc') {
        const data = await postCryptanalysis<EcdsaNonceReuseResponse>(
          '/api/cryptanalysis/ecdsa-nonce-reuse',
          { message1: eccMsg1, message2: eccMsg2 }
        );
        setEccRes(data);
      } else {
        const data = await postCryptanalysis<RsaFactorResponse>(
          '/api/cryptanalysis/rsa-factor',
          {
            n: Number(rsaN),
            e: Number(rsaE) || 65537,
            method: rsaMethod,
          }
        );
        setRsaRes(data);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Attack failed');
    } finally {
      setLoading(false);
    }
  };

  const renderMethodCard = (title: string, res: FactorTraceResult | null) => {
    if (!res) return null;
    return (
      <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-amber-300">{title}</span>
          <span className="font-mono text-stone-400">
            {res.iterations} iters · {res.elapsed_ms.toFixed(2)} ms
          </span>
        </div>
        <div className="text-[11px] font-mono text-stone-200">
          {res.found ? `Found: p=${res.p}, q=${res.q}` : 'Factor not found within bound'}
        </div>
        {res.trace.length > 0 && (
          <div className="max-h-24 overflow-y-auto text-[10px] font-mono text-stone-400 bg-[#12100e] rounded p-1.5 space-y-0.5">
            {res.trace.slice(0, 6).map((step, idx) => (
              <div key={idx} className="truncate">
                #{idx + 1}: {JSON.stringify(step)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 text-xs" data-testid={`attack-lab-${exhibitId}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
          {exhibitId === 'aes' ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />{' '}
              {aesMode === 'bitflip' ? 'AES-CBC Bit-Flipping Forge' : 'AES-CBC Padding Oracle'}
            </>
          ) : exhibitId === 'ecc' ? (
            <>
              <KeyRound className="w-3.5 h-3.5" /> ECDSA Nonce-Reuse Key Recovery
            </>
          ) : (
            <>
              <KeyRound className="w-3.5 h-3.5" /> Small-Prime RSA Factoring
            </>
          )}
        </span>
      </div>

      {exhibitId === 'aes' ? (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#090b10] border border-stone-800">
            <button
              type="button"
              data-testid="aes-mode-bitflip"
              onClick={() => setAesMode('bitflip')}
              className={`py-1 rounded text-[11px] font-semibold ${
                aesMode === 'bitflip' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
              }`}
            >
              CBC Bit-Flipping
            </button>
            <button
              type="button"
              data-testid="aes-mode-padding-oracle"
              onClick={() => setAesMode('padding-oracle')}
              className={`py-1 rounded text-[11px] font-semibold ${
                aesMode === 'padding-oracle' ? 'bg-amber-500 text-stone-950' : 'text-stone-300'
              }`}
            >
              Padding Oracle
            </button>
          </div>
          {aesMode === 'bitflip' ? (
            <>
          <div>
            <label
              htmlFor="cbc-plaintext"
              className="block text-[11px] font-semibold text-stone-300 mb-1"
            >
              Structured Token Plaintext
            </label>
            <input
              id="cbc-plaintext"
              data-testid="cbc-plaintext"
              type="text"
              value={cbcPlaintext}
              onChange={(e) => setCbcPlaintext(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor="cbc-target-from"
                className="block text-[11px] text-stone-300 mb-1"
              >
                Original Substring
              </label>
              <input
                id="cbc-target-from"
                data-testid="cbc-target-from"
                type="text"
                value={targetFrom}
                onChange={(e) => setTargetFrom(e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
            <div>
              <label
                htmlFor="cbc-target-to"
                className="block text-[11px] text-stone-300 mb-1"
              >
                Forged Target
              </label>
              <input
                id="cbc-target-to"
                data-testid="cbc-target-to"
                type="text"
                value={targetTo}
                onChange={(e) => setTargetTo(e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          </div>
            </>
          ) : (
            <div>
              <label htmlFor="oracle-plaintext" className="block text-[11px] text-stone-300 mb-1">
                Target Secret Plaintext (≤ 32 bytes)
              </label>
              <input
                id="oracle-plaintext"
                data-testid="oracle-plaintext"
                type="text"
                value={oraclePlaintext}
                onChange={(e) => setOraclePlaintext(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-amber-300 font-mono text-xs"
              />
            </div>
          )}
        </div>
      ) : exhibitId === 'ecc' ? (
        <div className="space-y-2">
          <div>
            <label htmlFor="ecc-msg1" className="block text-[11px] text-stone-300 mb-1">Message 1 (signed with nonce k)</label>
            <input
              id="ecc-msg1"
              type="text"
              value={eccMsg1}
              onChange={(e) => setEccMsg1(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs"
            />
          </div>
          <div>
            <label htmlFor="ecc-msg2" className="block text-[11px] text-stone-300 mb-1">Message 2 (signed with same k)</label>
            <input
              id="ecc-msg2"
              type="text"
              value={eccMsg2}
              onChange={(e) => setEccMsg2(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1714] border border-stone-800 text-amber-300 font-mono text-xs"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-1">
            {RSA_PRESETS.map((preset) => (
              <button
                key={preset.n}
                type="button"
                onClick={() => {
                  setRsaN(String(preset.n));
                  setRsaE(String(preset.e));
                }}
                className="px-2 py-1 rounded bg-[#1a1714] border border-stone-800 text-[10px] text-amber-300 hover:border-amber-500/50 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="rsa-factor-n" className="block text-[11px] text-stone-300 mb-1">
                Modulus N
              </label>
              <input
                id="rsa-factor-n"
                data-testid="rsa-factor-n"
                type="number"
                value={rsaN}
                onChange={(e) => setRsaN(e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
            <div>
              <label htmlFor="rsa-factor-e" className="block text-[11px] text-stone-300 mb-1">
                Public Exponent e
              </label>
              <input
                id="rsa-factor-e"
                data-testid="rsa-factor-e"
                type="number"
                value={rsaE}
                onChange={(e) => setRsaE(e.target.value)}
                className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              />
            </div>
          </div>

          <div
            role="group"
            aria-label="Factoring algorithm"
            className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#090b10] border border-stone-800"
          >
            {(['fermat', 'pollard_rho', 'both'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setRsaMethod(m)}
                aria-pressed={rsaMethod === m}
                className={`py-1 rounded text-[11px] font-semibold transition-colors ${
                  rsaMethod === m
                    ? 'bg-amber-500 text-stone-950'
                    : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                {m === 'fermat' ? 'Fermat' : m === 'pollard_rho' ? "Pollard's ρ" : 'Both'}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        data-testid={`run-attack-${exhibitId}`}
        onClick={handleRun}
        disabled={loading}
        aria-busy={loading}
        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-stone-950" />}
        <span>
          {exhibitId === 'aes'
            ? aesMode === 'bitflip'
              ? 'Flip Ciphertext Bits & Decrypt'
              : 'Run Byte-by-Byte Padding Oracle'
            : exhibitId === 'ecc'
            ? 'Extract Private Key from Reused Nonce'
            : 'Factor Modulus & Recover d'}
        </span>
      </button>

      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {exhibitId === 'aes' && cbcRes && (
        <div className="space-y-2" data-testid="aes-bitflip-results">
          <div
            className={`p-2.5 rounded-lg border flex items-center justify-between ${
              cbcRes.forged_successfully
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}
          >
            <span className="text-[11px] font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cbcRes.forged_successfully
                ? `Forged "${cbcRes.target_from}" → "${cbcRes.target_to}"`
                : 'Forge did not match target'}
            </span>
            <span className="font-mono text-[10px]">
              {cbcRes.flipped_positions.length} bytes flipped
            </span>
          </div>

          {/* Flipped byte masks */}
          <div className="p-2 rounded-lg bg-[#090b10] border border-stone-800 space-y-1">
            <span className="text-[11px] font-semibold text-stone-300 block">
              Flipped Bytes (Block i → Forges Block i+1)
            </span>
            <div className="flex flex-wrap gap-1">
              {cbcRes.flipped_positions.map((fp) => (
                <span
                  key={fp.plaintext_offset}
                  className="px-1.5 py-0.5 rounded bg-[#1a1714] border border-stone-800 font-mono text-[10px] text-amber-300"
                >
                  B{fp.modified_block}[{fp.byte_index}]: {fp.orig_byte_hex}⊕{fp.xor_mask_hex}→
                  {fp.new_byte_hex}
                </span>
              ))}
            </div>
          </div>

          {/* Decrypted Blocks showing corrupted vs forged */}
          <div className="space-y-1.5">
            {cbcRes.decrypted_blocks.map((blk) => (
              <div
                key={blk.index}
                className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                  blk.status === 'forged'
                    ? 'bg-emerald-950/25 border-emerald-500/40'
                    : blk.status === 'corrupted'
                    ? 'bg-rose-950/25 border-rose-500/40'
                    : 'bg-[#090b10] border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-stone-200">Block {blk.index}</span>
                  <span
                    className={`uppercase font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      blk.status === 'forged'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : blk.status === 'corrupted'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-stone-800 text-stone-300'
                    }`}
                  >
                    {blk.status}
                  </span>
                </div>
                <p className="font-mono text-xs text-stone-100 break-all">{blk.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {exhibitId === 'rsa' && rsaRes && (
        <div className="space-y-2" data-testid="rsa-factor-results">
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-emerald-300">
                {rsaRes.p && rsaRes.q
                  ? `Factored (${rsaRes.bit_length}-bit): p=${rsaRes.p}, q=${rsaRes.q}`
                  : `Factorization Incomplete (${rsaRes.bit_length}-bit)`}
              </span>
            </div>
            {rsaRes.d !== null && (
              <div className="font-mono text-xs text-amber-300 break-all">
                Recovered Private Key d = {rsaRes.d} (φ(N) = {rsaRes.phi})
              </div>
            )}
          </div>

          {renderMethodCard('Fermat Factorization', rsaRes.fermat)}
          {renderMethodCard("Pollard's Rho Factorization", rsaRes.pollard_rho)}
        </div>
      )}

      {exhibitId === 'aes' && oracleRes && (
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1.5" data-testid="aes-padding-oracle-results">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300">
            <span>Recovered: &quot;{oracleRes.recovered_plaintext}&quot;</span>
            <span className="font-mono">{oracleRes.oracle_queries} queries</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {oracleRes.steps.slice(0, 8).map((s) => (
              <span key={s.byte_index} className="px-1.5 py-0.5 rounded bg-[#090b10] font-mono text-[10px] text-amber-300">
                [{s.byte_index}] {s.recovered_byte_hex} ({s.recovered_char})
              </span>
            ))}
          </div>
        </div>
      )}

      {exhibitId === 'ecc' && eccRes && (
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1.5 font-mono text-[10px]" data-testid="ecc-nonce-reuse-results">
          <div className="font-sans text-[11px] font-semibold text-emerald-300">
            Private Key Recovered: {eccRes.recovered_match ? 'EXACT MATCH' : 'MISMATCH'}
          </div>
          <div className="text-stone-300 break-all">Shared r: {eccRes.r.slice(0, 32)}…</div>
          <div className="text-amber-300 break-all">Recovered d: {eccRes.recovered_private_key.slice(0, 32)}…</div>
        </div>
      )}
    </div>
  );
}
