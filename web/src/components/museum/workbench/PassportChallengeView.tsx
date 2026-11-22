'use client';

import React, { useState, useEffect } from 'react';
import { CipherExhibit } from '../museumData';
import { Award, CheckCircle2, HelpCircle, Send, AlertCircle } from 'lucide-react';
import { playVaultChime } from '../audio/museumAudio';

export const PASSPORT_STORAGE_KEY = 'cryptography-museum-passport-v1';
export const PASSPORT_UPDATED_EVENT = 'museum-passport-updated';

export interface ExhibitChallenge {
  prompt: string;
  ciphertext: string;
  hint: string;
  answer: string;
}

const DEFAULT_CHALLENGES: Record<string, ExhibitChallenge> = {
  caesar: {
    prompt: 'Decrypt this intercepted Roman dispatch shifted forward by 3.',
    ciphertext: 'YHQH YLGL YLFL',
    hint: 'Shift each letter backward by 3 positions (Y -> V).',
    answer: 'VENE VIDI VICI',
  },
  affine: {
    prompt: 'Crack the Affine ciphertext encrypted with a = 5, b = 8.',
    ciphertext: 'IHHWV',
    hint: 'Use modular inverse a⁻¹ = 21 mod 26: D(y) = 21(y - 8) mod 26.',
    answer: 'HELLO',
  },
  vigenere: {
    prompt: 'Decrypt the Vigenère message encrypted with key "KEY".',
    ciphertext: 'RIJVS',
    hint: 'Subtract K(10), E(4), Y(24) cyclically from RIJVS.',
    answer: 'HELLO',
  },
  playfair: {
    prompt: 'Decrypt the Playfair digraphs using key "MONARCHY".',
    ciphertext: 'GATLMZCLRQTX',
    hint: 'Split into pairs (GA TL MZ CL RQ TX) in the 5x5 MONARCHY grid.',
    answer: 'INSTRUMENTSZ',
  },
  polybius: {
    prompt: 'Decode these Polybius square coordinates (standard 5x5 grid, I=J).',
    ciphertext: '23 15 31 31 34',
    hint: 'Row 2 Col 3 = H, Row 1 Col 5 = E...',
    answer: 'HELLO',
  },
  scytale: {
    prompt: 'Unwrap this Spartan Scytale message with cylinder width 4.',
    ciphertext: 'HLOEL',
    hint: 'Read across 4 columns or test width=2/3/4 in the workbench.',
    answer: 'HELLO',
  },
  substitution: {
    prompt: 'Recover the plaintext from this monoalphabetic substitution.',
    ciphertext: 'QEB NRFZH YOLTK CLU GRJMP LSBO QEB IXWV ALD',
    hint: 'Three-letter word "QEB" appears twice — likely "THE".',
    answer: 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
  },
  enigma: {
    prompt: 'Use Enigma Rotors I-II-III, Reflector B, Positions AAA, Plugboard "AB CD" to decrypt:',
    ciphertext: 'ILBDA',
    hint: 'Enigma is reciprocal — encrypting ILBDA with the same settings returns plaintext.',
    answer: 'HELLO',
  },
  lorenz: {
    prompt: 'Decrypt this Lorenz SZ40 stream with all 12 wheel positions set to 0.',
    ciphertext: 'HELLO',
    hint: 'Test the Lorenz workbench with all positions at 0.',
    answer: 'JFMMP',
  },
  rsa: {
    prompt: 'Given RSA primes p = 61, q = 53, compute modulus n = p × q.',
    ciphertext: 'n = 61 × 53 = ?',
    hint: 'Multiply 61 by 53.',
    answer: '3233',
  },
  aes: {
    prompt: 'What is the block size (in bits) of the AES Rijndael state matrix?',
    ciphertext: '4 × 4 bytes = ? bits',
    hint: '16 bytes × 8 bits per byte.',
    answer: '128',
  },
  sha256: {
    prompt: 'What is the fixed output digest length of SHA-256 in hexadecimal characters?',
    ciphertext: '256 bits / 4 bits per hex char = ?',
    hint: '256 divided by 4.',
    answer: '64',
  },
  'hmac-hash': {
    prompt: 'Verify what HMAC combines with the message before hashing to prevent length-extension attacks.',
    ciphertext: 'H(K ⊕ opad || H(K ⊕ ipad || m))',
    hint: 'A secret shared ___ (3 letters).',
    answer: 'KEY',
  },
  'diffie-hellman': {
    prompt: 'With p = 23, g = 5, Alice secret a = 6, Bob secret b = 15, what is the shared secret S?',
    ciphertext: 'A = 8, B = 19, S = B^a mod 23 = ?',
    hint: 'Compute 19^6 mod 23 (or run the Diffie-Hellman visualizer).',
    answer: '2',
  },
};

function loadPassportStamps(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function savePassportStamp(exhibitId: string): string[] {
  const current = loadPassportStamps();
  if (!current.includes(exhibitId)) {
    const updated = [...current, exhibitId];
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new Event(PASSPORT_UPDATED_EVENT));
      } catch {
        // Ignore storage quota errors
      }
    }
    return updated;
  }
  return current;
}

interface PassportChallengeViewProps {
  exhibit: CipherExhibit;
}

export function PassportChallengeView({ exhibit }: PassportChallengeViewProps) {
  const challenge: ExhibitChallenge =
    (exhibit as CipherExhibit & { challenge?: ExhibitChallenge }).challenge ||
    DEFAULT_CHALLENGES[exhibit.id] || {
      prompt: `Verify your mastery of ${exhibit.name} by entering its core cipher name.`,
      ciphertext: exhibit.subtitle,
      hint: `Check the exhibit title: ${exhibit.name}`,
      answer: exhibit.name.toUpperCase(),
    };

  const [answerInput, setAnswerInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [stamps, setStamps] = useState<string[]>([]);

  useEffect(() => {
    setStamps(loadPassportStamps());
    setAnswerInput('');
    setShowHint(false);
    setStatus('idle');
  }, [exhibit.id]);

  const isUnlocked = stamps.includes(exhibit.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedUser = answerInput.trim().toUpperCase();
    const normalizedTarget = challenge.answer.trim().toUpperCase();
    if (!normalizedUser) return;

    if (normalizedUser === normalizedTarget) {
      const updated = savePassportStamp(exhibit.id);
      setStamps(updated);
      setStatus('success');
      playVaultChime();
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-3" data-testid={`passport-challenge-${exhibit.id}`}>
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#221f1c] border border-stone-800">
        <div className="flex items-center gap-2">
          <Award className={`w-4 h-4 ${isUnlocked ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-xs font-display font-semibold text-stone-100">
            Museum Passport Stamp
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
            isUnlocked
              ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
              : 'bg-stone-900 border border-stone-700 text-stone-400'
          }`}
        >
          {isUnlocked ? 'STAMP UNLOCKED' : `${stamps.length} COLLECTED`}
        </span>
      </div>

      <div className="p-3.5 rounded-xl bg-[#111520] border border-amber-500/25 space-y-2.5">
        <p className="text-xs text-stone-200 font-sans leading-relaxed">{challenge.prompt}</p>
        <div className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 font-mono text-xs text-amber-300 break-all select-all">
          {challenge.ciphertext}
        </div>

        <button
          type="button"
          onClick={() => setShowHint((prev) => !prev)}
          className="flex items-center gap-1 text-[11px] font-sans text-amber-300 hover:text-amber-200 underline focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded"
        >
          <HelpCircle className="w-3 h-3" />
          {showHint ? 'Hide Curatorial Hint' : 'Show Curatorial Hint'}
        </button>

        {showHint && (
          <p className="p-2.5 rounded-lg bg-[#090b10] border border-stone-800 text-[11px] text-stone-300 font-sans">
            {challenge.hint}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <label htmlFor={`challenge-answer-${exhibit.id}`} className="block text-xs font-sans font-semibold text-stone-200">
          Your Solution
        </label>
        <div className="flex gap-2">
          <input
            id={`challenge-answer-${exhibit.id}`}
            type="text"
            data-testid={`challenge-input-${exhibit.id}`}
            value={answerInput}
            onChange={(e) => {
              setAnswerInput(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            placeholder="Enter decoded answer..."
            className="flex-1 px-3 py-1.5 rounded-lg bg-[#090b10] border border-stone-800 text-xs font-mono text-stone-100 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          />
          <button
            type="submit"
            data-testid={`challenge-submit-${exhibit.id}`}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-sans font-bold text-xs flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none"
          >
            <Send className="w-3 h-3" /> Verify
          </button>
        </div>
      </form>

      {(status === 'success' || isUnlocked) && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-sans flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Challenge solved! Passport stamp recorded for {exhibit.name}.</span>
        </div>
      )}

      {status === 'error' && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-sans flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Not quite right — use the Workbench or Hint to verify your answer.</span>
        </div>
      )}
    </div>
  );
}
