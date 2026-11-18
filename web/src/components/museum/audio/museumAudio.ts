'use client';

export const AUDIO_MUTED_STORAGE_KEY = 'cryptography-museum-audio-muted-v1';
export const AUDIO_STATE_EVENT = 'museum-audio-state-updated';

let sharedAudioCtx: AudioContext | null = null;
let ambientActive = false;
let ambientWingCategory: string | undefined;
let ambientOscPrimary: OscillatorNode | null = null;
let ambientOscHarmony: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    try {
      sharedAudioCtx = new AudioCtx();
    } catch {
      return null;
    }
  }

  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {
      // Ignore autoplay resume errors when not triggered by user gesture
    });
  }

  return sharedAudioCtx;
}

export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY);
    return stored !== 'false';
  } catch {
    return true;
  }
}

export function setAudioMuted(muted: boolean): boolean {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(AUDIO_MUTED_STORAGE_KEY, muted ? 'true' : 'false');
    } catch {
      // Ignore storage quota / privacy mode errors
    }
  }

  if (muted) {
    stopAmbient();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUDIO_STATE_EVENT));
  }

  return muted;
}

export function toggleAudioMuted(wingCategory?: string): boolean {
  const nextMuted = !isAudioMuted();
  setAudioMuted(nextMuted);

  if (!nextMuted) {
    // Initialize/resume context on explicit user toggle
    getAudioContext();
    if (wingCategory) {
      ambientWingCategory = wingCategory;
    }
  }

  return nextMuted;
}

export function isAmbientActive(): boolean {
  return ambientActive;
}

export function stopAmbient(): void {
  try {
    ambientOscPrimary?.stop();
    ambientOscPrimary?.disconnect();
  } catch {
    // Ignore already-stopped oscillator
  }
  try {
    ambientOscHarmony?.stop();
    ambientOscHarmony?.disconnect();
  } catch {
    // Ignore already-stopped oscillator
  }
  try {
    ambientGain?.disconnect();
  } catch {
    // Ignore disconnect errors
  }
  ambientOscPrimary = null;
  ambientOscHarmony = null;
  ambientGain = null;
  ambientActive = false;
}

function getWingPadFrequencies(wingCategory?: string): [number, number] {
  switch (wingCategory) {
    case 'Classical':
      return [196.0, 293.66]; // Warm G3 + D4 fifth
    case 'Historical':
      return [146.83, 220.0]; // Mechanical D3 + A3 fifth
    case 'Modern':
      return [220.0, 329.63]; // Crystalline A3 + E4 fifth
    default:
      return [174.61, 261.63]; // Rotunda F3 + C4 fifth
  }
}

export function toggleAmbient(wingCategory?: string): boolean {
  if (isAudioMuted()) {
    stopAmbient();
    return false;
  }

  // If already active and caller didn't request a different wing, toggle off
  if (ambientActive && (!wingCategory || wingCategory === ambientWingCategory)) {
    stopAmbient();
    return false;
  }

  const ctx = getAudioContext();
  if (!ctx) return false;

  stopAmbient();

  try {
    const now = ctx.currentTime;
    const [f1, f2] = getWingPadFrequencies(wingCategory);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.015, now + 0.4);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f1, now);

    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(f2, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    ambientOscPrimary = osc1;
    ambientOscHarmony = osc2;
    ambientGain = gain;
    ambientWingCategory = wingCategory;
    ambientActive = true;
    return true;
  } catch {
    stopAmbient();
    return false;
  }
}

export function playMechanicalClick(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.025);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch {
    // Ignore audio synthesis errors
  }
}

export function playVaultChime(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const start = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.04, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.48);
    });
  } catch {
    // Ignore audio synthesis errors
  }
}

export function _resetAudioForTesting(): void {
  stopAmbient();
  sharedAudioCtx = null;
  ambientWingCategory = undefined;
}
