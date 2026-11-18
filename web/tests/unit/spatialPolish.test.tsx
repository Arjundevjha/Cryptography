import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  AUDIO_MUTED_STORAGE_KEY,
  isAudioMuted,
  setAudioMuted,
  toggleAudioMuted,
  toggleAmbient,
  isAmbientActive,
  playMechanicalClick,
  playVaultChime,
  _resetAudioForTesting,
} from '../../src/components/museum/audio/museumAudio';
import { MobileNavPad } from '../../src/components/museum/hud/MobileNavPad';
import { MuseumHUD } from '../../src/components/museum/hud/MuseumHUD';

describe('Spatial Polish: museumAudio', () => {
  const originalAudioContext = window.AudioContext;

  beforeEach(() => {
    window.localStorage.clear();
    _resetAudioForTesting();
    delete (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
  });

  afterAll(() => {
    window.AudioContext = originalAudioContext;
  });

  it('defaults to muted and persists mute state in localStorage', () => {
    expect(isAudioMuted()).toBe(true);

    const next = toggleAudioMuted();
    expect(next).toBe(false);
    expect(isAudioMuted()).toBe(false);
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('false');

    setAudioMuted(true);
    expect(isAudioMuted()).toBe(true);
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('true');
  });

  it('gracefully no-ops when AudioContext is absent', () => {
    setAudioMuted(false);
    expect(() => playMechanicalClick()).not.toThrow();
    expect(() => playVaultChime()).not.toThrow();
    expect(toggleAmbient('Classical')).toBe(false);
    expect(isAmbientActive()).toBe(false);
  });

  it('synthesizes mechanical click, vault chime, and ambient pad when AudioContext is available and unmuted', () => {
    const startMock = jest.fn();
    const stopMock = jest.fn();
    const connectMock = jest.fn();
    const disconnectMock = jest.fn();

    const mockAudioContext = function () {
      return {
        state: 'running',
        currentTime: 0,
        destination: {},
        resume: jest.fn().mockResolvedValue(undefined),
        createOscillator: jest.fn(() => ({
          type: 'sine',
          frequency: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
          connect: connectMock,
          disconnect: disconnectMock,
          start: startMock,
          stop: stopMock,
        })),
        createGain: jest.fn(() => ({
          gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
          connect: connectMock,
          disconnect: disconnectMock,
        })),
        createBiquadFilter: jest.fn(() => ({
          type: 'lowpass',
          frequency: { setValueAtTime: jest.fn() },
          connect: connectMock,
        })),
      };
    } as unknown as typeof AudioContext;

    window.AudioContext = mockAudioContext;

    // While muted, no audio nodes are started
    playMechanicalClick();
    expect(startMock).not.toHaveBeenCalled();

    // Unmute and trigger sounds
    setAudioMuted(false);
    playMechanicalClick();
    expect(startMock).toHaveBeenCalledTimes(1);

    playVaultChime();
    expect(startMock).toHaveBeenCalledTimes(5); // 1 click + 4 chime notes

    expect(toggleAmbient('Historical')).toBe(true);
    expect(isAmbientActive()).toBe(true);

    expect(toggleAmbient()).toBe(false);
    expect(isAmbientActive()).toBe(false);
  });
});

describe('Spatial Polish: MobileNavPad', () => {
  it('renders accessible directional buttons and fires touch/pointer callbacks', () => {
    const onMoveChange = jest.fn();
    render(<MobileNavPad onMoveChange={onMoveChange} />);

    expect(screen.getByRole('group', { name: /mobile movement controls/i })).toBeInTheDocument();

    const forwardBtn = screen.getByRole('button', { name: /move forward/i });
    const backwardBtn = screen.getByRole('button', { name: /move backward/i });
    const leftBtn = screen.getByRole('button', { name: /strafe left/i });
    const rightBtn = screen.getByRole('button', { name: /strafe right/i });

    fireEvent.pointerDown(forwardBtn);
    expect(onMoveChange).toHaveBeenCalledWith('forward', true);
    expect(forwardBtn).toHaveAttribute('aria-pressed', 'true');

    fireEvent.pointerUp(forwardBtn);
    expect(onMoveChange).toHaveBeenCalledWith('forward', false);
    expect(forwardBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.pointerDown(leftBtn);
    expect(onMoveChange).toHaveBeenCalledWith('left', true);
    fireEvent.pointerLeave(leftBtn);
    expect(onMoveChange).toHaveBeenCalledWith('left', false);

    fireEvent.pointerDown(rightBtn);
    expect(onMoveChange).toHaveBeenCalledWith('right', true);
    fireEvent.pointerCancel(rightBtn);
    expect(onMoveChange).toHaveBeenCalledWith('right', false);

    fireEvent.keyDown(backwardBtn, { key: ' ' });
    expect(onMoveChange).toHaveBeenCalledWith('backward', true);
    fireEvent.keyUp(backwardBtn, { key: ' ' });
    expect(onMoveChange).toHaveBeenCalledWith('backward', false);
  });
});

describe('Spatial Polish: MuseumHUD Audio Toggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    _resetAudioForTesting();
  });

  it('renders accessible audio toggle button and persists mute state', () => {
    render(
      <MuseumHUD
        currentView="atrium"
        onSelectRoom={jest.fn()}
        onReturnToFoyer={jest.fn()}
      />
    );

    const toggleBtn = screen.getByTestId('hud-audio-toggle');
    expect(toggleBtn).toHaveAttribute('aria-label', 'Unmute museum audio');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-label', 'Mute museum audio');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('false');

    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-label', 'Unmute museum audio');
    expect(toggleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY)).toBe('true');
  });
});
