'use client';

import React, { useState } from 'react';
import { Swords, Play, RefreshCw, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { postCryptanalysis } from './labApi';

interface CaesarCandidate {
  shift: number;
  plaintext: string;
  chi_squared: number;
}

interface CaesarResponse {
  candidates: CaesarCandidate[];
  best: CaesarCandidate;
}

interface AffineCandidate {
  a: number;
  b: number;
  plaintext?: string;
  chi_squared?: number;
}

interface AffineBruteforceResponse {
  mode: 'bruteforce';
  total_keys: number;
  candidates: AffineCandidate[];
  best: AffineCandidate;
}

interface AffineKnownPlaintextResponse {
  mode: 'known_plaintext';
  a: number;
  b: number;
  unique: boolean;
  candidates: AffineCandidate[];
  plaintext: string | null;
}

interface VigenereIocCandidate {
  key_length: number;
  ioc: number;
}

interface VigenereRepeatedNgram {
  ngram: string;
  length: number;
  positions: number[];
  distances: number[];
  gcd: number;
}

interface VigenereFactorScore {
  factor: number;
  count: number;
}

interface VigenereResponse {
  key: string;
  key_length: number;
  plaintext: string;
  chi_squared: number;
  ioc_candidates: VigenereIocCandidate[];
  kasiski: {
    repeated_ngrams: VigenereRepeatedNgram[];
    factor_scores: VigenereFactorScore[];
  };
}

interface SubstitutionCrackResponse {
  best_key: string;
  plaintext: string;
  score: number;
  restarts: number;
  iterations: number;
}

interface ClassicalAttackLabProps {
  exhibitId: 'caesar' | 'affine' | 'vigenere' | 'substitution';
  initialCiphertext?: string;
  onApplyShift?: (shift: number) => void;
  onApplyAffine?: (a: number, b: number) => void;
  onApplyKey?: (key: string) => void;
}

const SAMPLE_CIPHERTEXTS: Record<'caesar' | 'affine' | 'vigenere' | 'substitution', string> = {
  caesar: 'KHOOR PXVHXP ZRUOG WKLV LV D VHFUHW PHVVDJH',
  affine: 'RCLLA MUPWUM WAPLV THIX IX A XWCPWT MWCXAOW',
  vigenere:
    'LXFOPVEFRNHR LXFOPVEFRNHR ATTACKATDAWN LXFOPVEFRNHR IS THE KEYWORD FOR VIGENERE',
  substitution:
    'WKH TXLFN EURZQ IRA MXPSV RYHU WKH ODCB GRJ DQG WKLV PHVVDJH LV EHLQJ FUDFNHG',
};

export function ClassicalAttackLab({
  exhibitId,
  initialCiphertext,
  onApplyShift,
  onApplyAffine,
  onApplyKey,
}: ClassicalAttackLabProps) {
  const [ciphertext, setCiphertext] = useState(
    initialCiphertext && initialCiphertext.trim().length > 0
      ? initialCiphertext
      : SAMPLE_CIPHERTEXTS[exhibitId]
  );
  const [affineMode, setAffineMode] = useState<'bruteforce' | 'known_plaintext'>('bruteforce');
  const [plaintextPair, setPlaintextPair] = useState('HELLO');
  const [ciphertextPair, setCiphertextPair] = useState('RCLLA');
  const [vigenereKeyLen, setVigenereKeyLen] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [caesarRes, setCaesarRes] = useState<CaesarResponse | null>(null);
  const [affineBruteRes, setAffineBruteRes] = useState<AffineBruteforceResponse | null>(null);
  const [affineKnownRes, setAffineKnownRes] = useState<AffineKnownPlaintextResponse | null>(null);
  const [vigenereRes, setVigenereRes] = useState<VigenereResponse | null>(null);
  const [subRes, setSubRes] = useState<SubstitutionCrackResponse | null>(null);

  const handleRunAttack = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (exhibitId === 'caesar') {
        const data = await postCryptanalysis<CaesarResponse>('/api/cryptanalysis/caesar', {
          ciphertext,
          include_zero: false,
        });
        setCaesarRes(data);
      } else if (exhibitId === 'affine') {
        if (affineMode === 'bruteforce') {
          const data = await postCryptanalysis<AffineBruteforceResponse>(
            '/api/cryptanalysis/affine',
            { mode: 'bruteforce', ciphertext, limit: 10 }
          );
          setAffineKnownRes(null);
          setAffineBruteRes(data);
        } else {
          const data = await postCryptanalysis<AffineKnownPlaintextResponse>(
            '/api/cryptanalysis/affine',
            {
              mode: 'known_plaintext',
              plaintext_pair: plaintextPair,
              ciphertext_pair: ciphertextPair,
              ciphertext,
            }
          );
          setAffineBruteRes(null);
          setAffineKnownRes(data);
        }
      } else if (exhibitId === 'vigenere') {
        const parsedLen = vigenereKeyLen.trim() ? Number(vigenereKeyLen) : null;
        const data = await postCryptanalysis<VigenereResponse>('/api/cryptanalysis/vigenere', {
          ciphertext,
          key_length: parsedLen && Number.isFinite(parsedLen) && parsedLen > 0 ? parsedLen : null,
          max_key_length: 12,
        });
        setVigenereRes(data);
      } else if (exhibitId === 'substitution') {
        const data = await postCryptanalysis<SubstitutionCrackResponse>(
          '/api/cryptanalysis/substitution-crack',
          { ciphertext, restarts: 6, iterations: 350 }
        );
        setSubRes(data);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Attack failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 text-xs" data-testid={`attack-lab-${exhibitId}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-display font-semibold text-amber-300 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5" />
          {exhibitId === 'caesar' && 'Caesar Chi-Squared Exhaustive Attack'}
          {exhibitId === 'affine' && 'Affine Brute-Force & Known-Plaintext'}
          {exhibitId === 'vigenere' && 'Vigenère IoC & Kasiski Breaker'}
          {exhibitId === 'substitution' && 'Substitution Hill-Climbing Solver'}
        </span>
        <button
          type="button"
          onClick={() => setCiphertext(SAMPLE_CIPHERTEXTS[exhibitId])}
          className="text-[11px] text-amber-300 hover:text-amber-200 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
        >
          Load Sample
        </button>
      </div>

      <div>
        <label
          htmlFor={`attack-ciphertext-${exhibitId}`}
          className="block text-[11px] font-semibold text-stone-300 mb-1"
        >
          Target Ciphertext
        </label>
        <textarea
          id={`attack-ciphertext-${exhibitId}`}
          data-testid={`attack-ciphertext-${exhibitId}`}
          rows={2}
          value={ciphertext}
          onChange={(e) => setCiphertext(e.target.value)}
          className="w-full px-2.5 py-2 rounded-lg bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        />
      </div>

      {exhibitId === 'affine' && (
        <div className="space-y-2">
          <div
            role="group"
            aria-label="Affine attack mode"
            className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#090b10] border border-stone-800"
          >
            <button
              type="button"
              onClick={() => setAffineMode('bruteforce')}
              aria-pressed={affineMode === 'bruteforce'}
              className={`py-1 rounded text-[11px] font-semibold transition-colors ${
                affineMode === 'bruteforce'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              Brute-Force (312 Keys)
            </button>
            <button
              type="button"
              onClick={() => setAffineMode('known_plaintext')}
              aria-pressed={affineMode === 'known_plaintext'}
              className={`py-1 rounded text-[11px] font-semibold transition-colors ${
                affineMode === 'known_plaintext'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              Known-Plaintext Pair
            </button>
          </div>

          {affineMode === 'known_plaintext' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="affine-pt-pair"
                  className="block text-[11px] text-stone-300 mb-1"
                >
                  Known Plaintext
                </label>
                <input
                  id="affine-pt-pair"
                  type="text"
                  value={plaintextPair}
                  onChange={(e) => setPlaintextPair(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
              </div>
              <div>
                <label
                  htmlFor="affine-ct-pair"
                  className="block text-[11px] text-stone-300 mb-1"
                >
                  Matching Ciphertext
                </label>
                <input
                  id="affine-ct-pair"
                  type="text"
                  value={ciphertextPair}
                  onChange={(e) => setCiphertextPair(e.target.value)}
                  className="w-full px-2 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {exhibitId === 'vigenere' && (
        <div>
          <label
            htmlFor="vigenere-keylen-override"
            className="block text-[11px] text-stone-300 mb-1"
          >
            Key Length Override (leave blank for auto IoC/Kasiski)
          </label>
          <input
            id="vigenere-keylen-override"
            type="number"
            min={1}
            max={20}
            placeholder="Auto"
            value={vigenereKeyLen}
            onChange={(e) => setVigenereKeyLen(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-[#1a1714] border border-stone-800 text-stone-100 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          />
        </div>
      )}

      <button
        type="button"
        data-testid={`run-attack-${exhibitId}`}
        onClick={handleRunAttack}
        disabled={loading}
        aria-busy={loading}
        className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
      >
        {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-stone-950" />}
        <span>Run Cryptanalysis Attack</span>
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

      {/* Caesar Results */}
      {exhibitId === 'caesar' && caesarRes && (
        <div className="space-y-2" data-testid="caesar-attack-results">
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Best Match: Shift {caesarRes.best.shift}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                χ² = {caesarRes.best.chi_squared.toFixed(2)}
              </span>
            </div>
            <p className="font-mono text-xs text-stone-100 break-all">{caesarRes.best.plaintext}</p>
            {onApplyShift && (
              <button
                type="button"
                onClick={() => onApplyShift(caesarRes.best.shift)}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline"
              >
                Apply Shift {caesarRes.best.shift} in Workbench
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-800 bg-[#090b10] divide-y divide-stone-800/70">
            {caesarRes.candidates.map((cand) => (
              <div
                key={cand.shift}
                className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="font-mono text-amber-300 shrink-0">+{cand.shift}</span>
                <span className="font-mono text-stone-200 truncate flex-1">{cand.plaintext}</span>
                <span className="font-mono text-stone-400 shrink-0">
                  χ² {cand.chi_squared.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affine Brute-Force Results */}
      {exhibitId === 'affine' && affineBruteRes && (
        <div className="space-y-2" data-testid="affine-bruteforce-results">
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300">
                Best Key (a={affineBruteRes.best.a}, b={affineBruteRes.best.b})
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {affineBruteRes.total_keys} keys tested
              </span>
            </div>
            <p className="font-mono text-xs text-stone-100 break-all">
              {affineBruteRes.best.plaintext}
            </p>
            {onApplyAffine && (
              <button
                type="button"
                onClick={() => onApplyAffine(affineBruteRes.best.a, affineBruteRes.best.b)}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline"
              >
                Apply Key in Workbench
              </button>
            )}
          </div>

          <div className="max-h-44 overflow-y-auto rounded-lg border border-stone-800 bg-[#090b10] divide-y divide-stone-800/70">
            {affineBruteRes.candidates.map((c, i) => (
              <div
                key={`${c.a}-${c.b}-${i}`}
                className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px]"
              >
                <span className="font-mono text-amber-300 shrink-0">
                  ({c.a},{c.b})
                </span>
                <span className="font-mono text-stone-200 truncate flex-1">{c.plaintext}</span>
                {typeof c.chi_squared === 'number' && (
                  <span className="font-mono text-stone-400 shrink-0">
                    χ² {c.chi_squared.toFixed(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Affine Known-Plaintext Results */}
      {exhibitId === 'affine' && affineKnownRes && (
        <div
          className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1.5"
          data-testid="affine-known-results"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solved Key: a={affineKnownRes.a}, b={affineKnownRes.b}
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {affineKnownRes.unique ? 'Unique' : `${affineKnownRes.candidates.length} candidates`}
            </span>
          </div>
          {affineKnownRes.plaintext && (
            <p className="font-mono text-xs text-stone-100 break-all">{affineKnownRes.plaintext}</p>
          )}
          {onApplyAffine && (
            <button
              type="button"
              onClick={() => onApplyAffine(affineKnownRes.a, affineKnownRes.b)}
              className="text-[11px] text-amber-300 hover:text-amber-200 underline"
            >
              Apply Key in Workbench
            </button>
          )}
        </div>
      )}

      {/* Vigenere Results */}
      {exhibitId === 'vigenere' && vigenereRes && (
        <div className="space-y-2.5" data-testid="vigenere-attack-results">
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300">
                Recovered Key: <span className="font-mono text-amber-300">{vigenereRes.key}</span> (len{' '}
                {vigenereRes.key_length})
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                χ² = {vigenereRes.chi_squared.toFixed(1)}
              </span>
            </div>
            <p className="font-mono text-xs text-stone-100 break-all">{vigenereRes.plaintext}</p>
            {onApplyKey && (
              <button
                type="button"
                onClick={() => onApplyKey(vigenereRes.key)}
                className="text-[11px] text-amber-300 hover:text-amber-200 underline"
              >
                Apply Key in Workbench
              </button>
            )}
          </div>

          {/* IoC per Key Length */}
          <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-300 block">
              Index of Coincidence by Key Length (English ≈ 0.0667)
            </span>
            <div className="space-y-1">
              {vigenereRes.ioc_candidates.slice(0, 8).map((row) => (
                <div key={row.key_length} className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-stone-400 w-7">L={row.key_length}</span>
                  <div className="flex-1 h-2 bg-stone-900 rounded overflow-hidden">
                    <div
                      className={`h-full rounded ${
                        row.key_length === vigenereRes.key_length ? 'bg-emerald-400' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min((row.ioc / 0.08) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-stone-200 w-12 text-right">
                    {row.ioc.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Kasiski Examination */}
          <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 space-y-1.5">
            <span className="text-[11px] font-semibold text-stone-300 block">
              Kasiski Repeated N-Grams
            </span>
            {vigenereRes.kasiski.repeated_ngrams.length === 0 ? (
              <p className="text-[11px] text-stone-400 italic">
                No repeated n-grams found; IoC used for key length estimation.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto divide-y divide-stone-800/70">
                {vigenereRes.kasiski.repeated_ngrams.slice(0, 6).map((ng) => (
                  <div
                    key={ng.ngram}
                    className="py-1 flex items-center justify-between gap-2 text-[11px] font-mono"
                  >
                    <span className="text-amber-300">{ng.ngram}</span>
                    <span className="text-stone-400">
                      dist: [{ng.distances.join(', ')}]
                    </span>
                    <span className="text-emerald-300">gcd={ng.gcd}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {exhibitId === 'substitution' && subRes && (
        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 space-y-1.5" data-testid="substitution-crack-results">
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300">
            <span>Recovered Key: <span className="font-mono">{subRes.best_key}</span></span>
            <span className="font-mono">Score: {subRes.score}</span>
          </div>
          <p className="font-mono text-xs text-stone-100 break-words">{subRes.plaintext}</p>
        </div>
      )}
    </div>
  );
}
