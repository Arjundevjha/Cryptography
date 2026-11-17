'use client';

import React from 'react';
import { RefreshCw, Shuffle } from 'lucide-react';
import { DiffieHellmanVisualizer } from './DiffieHellmanVisualizer';
import { AesModeVisualizer, AesBlockMode } from './AesModeVisualizer';

export interface CipherParameterControlsProps {
  exhibitId: string;
  mode: 'encrypt' | 'decrypt';
  loading: boolean;
  shift: number;
  setShift: (v: number) => void;
  aKey: number;
  setAKey: (v: number) => void;
  bKey: number;
  setBKey: (v: number) => void;
  keyPhrase: string;
  setKeyPhrase: (v: string) => void;
  substitutionKey: string;
  setSubstitutionKey: (v: string) => void;
  width: number;
  setWidth: (v: number) => void;
  pVal: number;
  setPVal: (v: number) => void;
  qVal: number;
  setQVal: (v: number) => void;
  eVal: number;
  setEVal: (v: number) => void;
  onRSAKeygen: () => void;
  aesKey: string;
  setAesKey: (v: string) => void;
  aesBlockMode: AesBlockMode;
  setAesBlockMode: (v: AesBlockMode) => void;
  aesIv: string;
  setAesIv: (v: string) => void;
  inputText: string;
  onLoadIdenticalBlocks: () => void;
  cbcResult: {
    iv_hex: string;
    padded_blocks_hex: string[];
    ciphertext_blocks_hex: string[];
  } | null;
  enigmaRotors: string[];
  setEnigmaRotors: (v: string[]) => void;
  enigmaPositions: string[];
  setEnigmaPositions: (v: string[]) => void;
  enigmaRings: string[];
  setEnigmaRings: (v: string[]) => void;
  enigmaReflector: string;
  setEnigmaReflector: (v: string) => void;
  enigmaPlugboard: string;
  setEnigmaPlugboard: (v: string) => void;
  lorenzPositions: number[];
  setLorenzPositions: (v: number[]) => void;
  hashAlgorithm: 'sha256' | 'sha3_256' | 'blake2s' | 'md5';
  setHashAlgorithm: (v: 'sha256' | 'sha3_256' | 'blake2s' | 'md5') => void;
  hmacAction: 'hash' | 'sign' | 'verify';
  setHmacAction: (v: 'hash' | 'sign' | 'verify') => void;
  hmacKey: string;
  setHmacKey: (v: string) => void;
  hmacSignature: string;
  setHmacSignature: (v: string) => void;
  dhPrime: number;
  setDhPrime: (v: number) => void;
  dhGen: number;
  setDhGen: (v: number) => void;
  dhAlice: number;
  setDhAlice: (v: number) => void;
  dhBob: number;
  setDhBob: (v: number) => void;
  dhResult: { A: number; B: number; shared_secret: number } | null;
}

export function CipherParameterControls(props: CipherParameterControlsProps) {
  const { exhibitId } = props;

  const generateRandomSubstitutionKey = () => {
    const arr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    props.setSubstitutionKey(arr.join(''));
  };

  return (
    <div className="mb-4 p-3.5 rounded-xl bg-[#221f1c] border border-stone-800 space-y-2.5">
      <div className="text-xs font-display font-semibold text-amber-300">Cipher Parameters</div>

      {exhibitId === 'caesar' && (
        <div>
          <label htmlFor={`param-shift-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">
            Shift Value: <span className="font-mono text-amber-300">{props.shift}</span>
          </label>
          <input
            id={`param-shift-${exhibitId}`}
            type="text"
            data-testid="param-shift-caesar"
            value={props.shift}
            onChange={(e) => props.setShift(parseInt(e.target.value, 10) || 0)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      )}

      {exhibitId === 'affine' && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label htmlFor={`param-a-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">Key a:</label>
            <input
              id={`param-a-${exhibitId}`}
              type="number"
              data-testid="param-a-affine"
              value={props.aKey}
              onChange={(e) => props.setAKey(parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
          <div>
            <label htmlFor={`param-b-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">Key b:</label>
            <input
              id={`param-b-${exhibitId}`}
              type="number"
              data-testid="param-b-affine"
              value={props.bKey}
              onChange={(e) => props.setBKey(parseInt(e.target.value, 10) || 0)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
        </div>
      )}

      {(exhibitId === 'vigenere' || exhibitId === 'playfair' || exhibitId === 'polybius') && (
        <div>
          <label htmlFor={`param-key-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">Key Phrase:</label>
          <input
            id={`param-key-${exhibitId}`}
            type="text"
            data-testid={`param-key-${exhibitId}`}
            value={props.keyPhrase}
            onChange={(e) => props.setKeyPhrase(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      )}

      {exhibitId === 'substitution' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="param-key-substitution" className="block text-xs font-sans text-stone-300">
              26-Letter Alphabet Key:
            </label>
            <button
              type="button"
              onClick={generateRandomSubstitutionKey}
              className="text-[11px] font-sans text-amber-300 hover:text-amber-200 flex items-center gap-1 underline rounded px-1 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            >
              <Shuffle className="w-3 h-3" /> Shuffle
            </button>
          </div>
          <input
            id="param-key-substitution"
            type="text"
            maxLength={26}
            data-testid="param-key-substitution"
            value={props.substitutionKey}
            onChange={(e) => props.setSubstitutionKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono tracking-wider text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      )}

      {exhibitId === 'scytale' && (
        <div>
          <label htmlFor={`param-width-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">
            Cylinder Diameter Width: <span className="font-mono text-amber-300">{props.width}</span>
          </label>
          <input
            id={`param-width-${exhibitId}`}
            type="number"
            data-testid="param-width-scytale"
            value={props.width}
            onChange={(e) => props.setWidth(parseInt(e.target.value, 10) || 2)}
            className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
        </div>
      )}

      {exhibitId === 'enigma' && (
        <div className="space-y-2.5 text-xs">
          <div>
            <label id={`param-rotors-label-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">
              Rotors (Select I - VIII):
            </label>
            <div role="group" aria-labelledby={`param-rotors-label-${exhibitId}`} className="grid grid-cols-3 gap-1">
              {[0, 1, 2].map((idx) => (
                <select
                  key={`rotor-${idx}`}
                  id={`param-rotor-${idx}-${exhibitId}`}
                  aria-label={`Enigma Rotor ${idx + 1}`}
                  value={props.enigmaRotors[idx] || 'I'}
                  onChange={(e) => {
                    const updated = [...props.enigmaRotors];
                    updated[idx] = e.target.value;
                    props.setEnigmaRotors(updated);
                  }}
                  className="px-1.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                >
                  {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <input
              type="text"
              data-testid="param-rotors-enigma"
              value={props.enigmaRotors.join('-')}
              onChange={(e) => {
                const parts = e.target.value.split(/[-,\s]+/).map((s) => s.trim().toUpperCase());
                if (parts.length === 3) props.setEnigmaRotors(parts);
              }}
              className="sr-only"
            />
          </div>

          <div>
            <label htmlFor={`param-reflector-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">Reflector:</label>
            <select
              id={`param-reflector-${exhibitId}`}
              data-testid="param-reflector-enigma"
              value={props.enigmaReflector}
              onChange={(e) => props.setEnigmaReflector(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-amber-300 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <option value="A">Reflector A (EJMZALYX...)</option>
              <option value="B">Reflector B (YRUHQSLD... Standard)</option>
              <option value="C">Reflector C (FVPJIAOY...)</option>
              <option value="B_THIN">Reflector B Thin (ENKQAUYW...)</option>
              <option value="C_THIN">Reflector C Thin (RDOBJNTK...)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor={`param-positions-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">Positions:</label>
              <input
                id={`param-positions-${exhibitId}`}
                type="text"
                data-testid="param-positions-enigma"
                value={props.enigmaPositions.join('')}
                onChange={(e) => {
                  const raw = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
                  props.setEnigmaPositions([raw[0] || 'A', raw[1] || 'A', raw[2] || 'A']);
                }}
                maxLength={3}
                className="w-full px-2 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-stone-200 uppercase text-xs font-mono tracking-widest text-center focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>

            <div>
              <label htmlFor={`param-rings-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-1">Rings:</label>
              <input
                id={`param-rings-${exhibitId}`}
                type="text"
                data-testid="param-rings-enigma"
                value={props.enigmaRings.join('')}
                onChange={(e) => {
                  const raw = e.target.value.toUpperCase().replace(/[^A-Z1-9]/g, '');
                  props.setEnigmaRings([raw[0] || 'A', raw[1] || 'A', raw[2] || 'A']);
                }}
                maxLength={3}
                className="w-full px-2 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-stone-200 uppercase text-xs font-mono tracking-widest text-center focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={`param-plugboard-${exhibitId}`} className="block text-xs font-sans text-stone-300">
                Plugboard (Steckerbrett Swaps):
              </label>
              <span className="text-[11px] text-amber-300 font-mono">
                {props.enigmaPlugboard.trim() ? props.enigmaPlugboard.trim().split(/\s+/).length : 0} active
              </span>
            </div>
            <input
              id={`param-plugboard-${exhibitId}`}
              type="text"
              data-testid="param-plugboard-enigma"
              value={props.enigmaPlugboard}
              onChange={(e) => props.setEnigmaPlugboard(e.target.value.toUpperCase())}
              placeholder="e.g. AB CD EF"
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-stone-200 placeholder:text-stone-400 text-xs font-mono uppercase focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
            />
          </div>
        </div>
      )}

      {exhibitId === 'lorenz' && (
        <div className="space-y-3 text-xs">
          <input
            type="text"
            data-testid="param-positions-lorenz"
            value={props.lorenzPositions.join(',')}
            readOnly
            className="sr-only"
          />

          <div>
            <label className="block text-xs font-sans text-amber-300 font-semibold mb-1">
              Chi Wheels (χ₁–χ₅ Positions):
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[0, 1, 2, 3, 4].map((posIdx) => (
                <input
                  key={`chi-${posIdx}`}
                  type="number"
                  min={0}
                  aria-label={`Chi Wheel ${posIdx + 1} position`}
                  value={props.lorenzPositions[posIdx]}
                  onChange={(e) => {
                    const updated = [...props.lorenzPositions];
                    updated[posIdx] = parseInt(e.target.value, 10) || 0;
                    props.setLorenzPositions(updated);
                  }}
                  className="w-full px-1 py-1 rounded bg-[#090b10] border border-stone-800 text-center text-amber-300 font-mono text-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans text-amber-300 font-semibold mb-1">
              Motor Wheels (μ₁–μ₂ Positions):
            </label>
            <div className="grid grid-cols-2 gap-1">
              {[5, 6].map((posIdx) => (
                <input
                  key={`motor-${posIdx}`}
                  type="number"
                  min={0}
                  aria-label={`Motor Wheel ${posIdx - 4} position`}
                  value={props.lorenzPositions[posIdx]}
                  onChange={(e) => {
                    const updated = [...props.lorenzPositions];
                    updated[posIdx] = parseInt(e.target.value, 10) || 0;
                    props.setLorenzPositions(updated);
                  }}
                  className="w-full px-1 py-1 rounded bg-[#090b10] border border-stone-800 text-center text-amber-300 font-mono text-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans text-amber-300 font-semibold mb-1">
              Psi Wheels (ψ₁–ψ₅ Positions):
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[7, 8, 9, 10, 11].map((posIdx) => (
                <input
                  key={`psi-${posIdx}`}
                  type="number"
                  min={0}
                  aria-label={`Psi Wheel ${posIdx - 6} position`}
                  value={props.lorenzPositions[posIdx]}
                  onChange={(e) => {
                    const updated = [...props.lorenzPositions];
                    updated[posIdx] = parseInt(e.target.value, 10) || 0;
                    props.setLorenzPositions(updated);
                  }}
                  className="w-full px-1 py-1 rounded bg-[#090b10] border border-stone-800 text-center text-amber-300 font-mono text-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                />
              ))}
            </div>
          </div>

          <button
            onClick={() => props.setLorenzPositions(Array(12).fill(0))}
            aria-label="Reset all Lorenz wheel positions to zero"
            className="w-full py-1.5 rounded-lg bg-[#090b10] hover:bg-stone-900 text-stone-300 text-xs font-sans flex items-center justify-center gap-1.5 border border-stone-800 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Reset Positions to 0
          </button>
        </div>
      )}

      {exhibitId === 'rsa' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <div>
              <label htmlFor={`param-p-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-0.5">p:</label>
              <input
                id={`param-p-${exhibitId}`}
                type="number"
                aria-label="RSA Prime p"
                data-testid="param-p-rsa"
                value={props.pVal}
                onChange={(e) => props.setPVal(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>
            <div>
              <label htmlFor={`param-q-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-0.5">q:</label>
              <input
                id={`param-q-${exhibitId}`}
                type="number"
                aria-label="RSA Prime q"
                data-testid="param-q-rsa"
                value={props.qVal}
                onChange={(e) => props.setQVal(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>
            <div>
              <label htmlFor={`param-e-${exhibitId}`} className="block text-xs font-sans text-stone-300 mb-0.5">e:</label>
              <input
                id={`param-e-${exhibitId}`}
                type="number"
                aria-label="RSA Public Exponent e"
                data-testid="param-e-rsa"
                value={props.eVal}
                onChange={(e) => props.setEVal(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 rounded bg-[#090b10] border border-stone-800 font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              />
            </div>
          </div>
          <button
            data-testid="generate-keys-btn-rsa"
            onClick={props.onRSAKeygen}
            disabled={props.loading}
            aria-busy={props.loading}
            aria-label={props.loading ? 'Generating RSA keys...' : 'Generate RSA keypair'}
            className="w-full py-1.5 text-xs rounded-lg bg-[#090b10] hover:bg-stone-900 border border-amber-500/30 text-amber-300 font-sans font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${props.loading ? 'animate-spin' : ''}`} />
            <span>{props.loading ? 'Generating Keys...' : 'Generate Keys'}</span>
          </button>
        </div>
      )}

      {exhibitId === 'aes' && (
        <AesModeVisualizer
          blockMode={props.aesBlockMode}
          setBlockMode={props.setAesBlockMode}
          aesKey={props.aesKey}
          setAesKey={props.setAesKey}
          aesIv={props.aesIv}
          setAesIv={props.setAesIv}
          inputText={props.inputText}
          onLoadIdenticalBlocks={props.onLoadIdenticalBlocks}
          cbcResult={props.cbcResult}
        />
      )}

      {exhibitId === 'hmac-hash' && (
        <div className="space-y-2.5 text-xs">
          <div className="grid grid-cols-3 gap-1 bg-[#090b10] p-1 rounded-lg border border-stone-800">
            {(['hash', 'sign', 'verify'] as const).map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => props.setHmacAction(act)}
                className={`py-1 rounded text-[11px] font-sans font-semibold capitalize transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none ${
                  props.hmacAction === act ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                {act === 'hash' ? 'Digest' : act === 'sign' ? 'HMAC Sign' : 'HMAC Verify'}
              </button>
            ))}
          </div>

          {props.hmacAction === 'hash' ? (
            <div>
              <label htmlFor="param-algo-hmac-hash" className="block text-xs font-sans text-stone-300 mb-1">
                Hash Algorithm:
              </label>
              <select
                id="param-algo-hmac-hash"
                data-testid="param-algo-hmac-hash"
                value={props.hashAlgorithm}
                onChange={(e) => props.setHashAlgorithm(e.target.value as 'sha256' | 'sha3_256' | 'blake2s' | 'md5')}
                className="w-full px-2 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-amber-300 font-mono text-xs focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
              >
                <option value="sha256">SHA-256</option>
                <option value="sha3_256">SHA3-256</option>
                <option value="blake2s">BLAKE2s</option>
                <option value="md5">MD5 (Legacy)</option>
              </select>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <label htmlFor="param-key-hmac-hash" className="block text-xs font-sans text-stone-300 mb-1">
                  Secret HMAC Key:
                </label>
                <input
                  id="param-key-hmac-hash"
                  type="text"
                  data-testid="param-key-hmac-hash"
                  value={props.hmacKey}
                  onChange={(e) => props.setHmacKey(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                />
              </div>
              {props.hmacAction === 'verify' && (
                <div>
                  <label htmlFor="param-sig-hmac-hash" className="block text-xs font-sans text-stone-300 mb-1">
                    Signature Hex to Verify:
                  </label>
                  <input
                    id="param-sig-hmac-hash"
                    type="text"
                    data-testid="param-sig-hmac-hash"
                    value={props.hmacSignature}
                    onChange={(e) => props.setHmacSignature(e.target.value)}
                    placeholder="Paste hex signature..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-200 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {exhibitId === 'diffie-hellman' && (
        <DiffieHellmanVisualizer
          dhPrime={props.dhPrime}
          setDhPrime={props.setDhPrime}
          dhGen={props.dhGen}
          setDhGen={props.setDhGen}
          dhAlice={props.dhAlice}
          setDhAlice={props.setDhAlice}
          dhBob={props.dhBob}
          setDhBob={props.setDhBob}
          exchangeResult={props.dhResult}
        />
      )}
    </div>
  );
}
