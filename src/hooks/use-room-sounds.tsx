import { useCallback, useEffect, useRef, useState } from 'react';

export type RoomSoundType =
  | 'userJoin'
  | 'userLeave'
  | 'messageSend'
  | 'messageReceive'
  | 'poke'
  | 'mute'
  | 'unmute'
  | 'error';

interface UseRoomSoundsOptions {
  volume?: number; // 0.0 to 1.0
  muted?: boolean;
  soundUrls?: Partial<Record<RoomSoundType, string>>; // Optional custom MP3 URLs
}

// ----------------------------------------------------------------------
// Chime note helper
//
// Each note layers two oscillators:
//   - fundamental (sine)   -> the body of the tone
//   - overtone (triangle, one octave up, quieter) -> a glassy shimmer
// Both pass through a shared lowpass filter so the harmonics blend
// instead of sounding like two separate beeps, then through a stereo
// panner so a bounce sequence can drift slightly as it "lands".
// ----------------------------------------------------------------------

interface ChimeNote {
  freq: number;
  start: number;
  dur: number;
  level: number;
  /** -1 (left) to 1 (right). Defaults to centered. */
  pan?: number;
  /** How loud the octave-up shimmer is relative to the fundamental. */
  overtoneLevel?: number;
  /** Lowpass cutoff in Hz — lower = warmer/duller, higher = brighter. */
  filterFreq?: number;
}

function playChimeNote(
  ctx: AudioContext,
  destination: AudioNode,
  now: number,
  { freq, start, dur, level, pan = 0, overtoneLevel = 0.32, filterFreq = 4200 }: ChimeNote
) {
  const noteStart = now + start;
  const noteEnd = noteStart + dur;

  const fundamental = ctx.createOscillator();
  fundamental.type = 'sine';
  fundamental.frequency.setValueAtTime(freq, noteStart);

  const overtone = ctx.createOscillator();
  overtone.type = 'triangle';
  overtone.frequency.setValueAtTime(freq * 2, noteStart);

  const fundamentalGain = ctx.createGain();
  const overtoneGain = ctx.createGain();

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterFreq, noteStart);
  filter.Q.setValueAtTime(0.7, noteStart);

  const panner = ctx.createStereoPanner();
  panner.pan.setValueAtTime(pan, noteStart);

  // Fundamental: snappy attack, a hair of hold so it doesn't click,
  // then a natural exponential decay.
  fundamentalGain.gain.setValueAtTime(0.0001, noteStart);
  fundamentalGain.gain.linearRampToValueAtTime(level, noteStart + 0.004);
  fundamentalGain.gain.setValueAtTime(level, noteStart + 0.012);
  fundamentalGain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

  // Overtone: quieter, and fades out faster than the fundamental so
  // it reads as an initial "shimmer" rather than a constant second tone.
  overtoneGain.gain.setValueAtTime(0.0001, noteStart);
  overtoneGain.gain.linearRampToValueAtTime(level * overtoneLevel, noteStart + 0.003);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, noteStart + dur * 0.5);

  fundamental.connect(fundamentalGain);
  overtone.connect(overtoneGain);
  fundamentalGain.connect(filter);
  overtoneGain.connect(filter);
  filter.connect(panner);
  panner.connect(destination);

  fundamental.start(noteStart);
  fundamental.stop(noteEnd);
  overtone.start(noteStart);
  overtone.stop(noteEnd);
}

function playChimeSequence(
  ctx: AudioContext,
  destination: AudioNode,
  now: number,
  notes: ChimeNote[],
  effectiveVolume: number
) {
  notes.forEach((note) => {
    playChimeNote(ctx, destination, now, {
      ...note,
      level: effectiveVolume * note.level,
    });
  });
}

export const useRoomSounds = (options: UseRoomSoundsOptions = {}) => {
  const { volume: initialVolume = 0.5, muted: initialMuted = false, soundUrls } = options;

  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(initialVolume);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Lazy-load AudioContext to respect browser autoplay policies
  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;

    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }, []);

  // Synthetic tone synthesizer using native Web Audio API oscillators
  const playSynthesizedTone = useCallback(
    (type: RoomSoundType) => {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      const effectiveVolume = Math.max(0, Math.min(1, volume));

      switch (type) {
        case 'userJoin': {
          // Bouncy modern glass-tap chime (F#5 -> A5 -> D6)
          // Rapid triple-tap cadence like a bouncing marble that rings
          // out, drifting from slightly left toward center as it "lands".
          const bounceJoinNotes: ChimeNote[] = [
            { freq: 739.99, start: 0.0, dur: 0.09, level: 0.55, pan: -0.15 },  // pre-tap (F#5)
            { freq: 880.0, start: 0.065, dur: 0.11, level: 0.70, pan: -0.05 }, // second bounce (A5)
            {
              freq: 1174.66,
              start: 0.14,
              dur: 0.48,
              level: 0.90,
              pan: 0,
              overtoneLevel: 0.4,
              filterFreq: 5200,
            }, // resonant landing ring (D6)
          ];

          playChimeSequence(ctx, gainNode, now, bounceJoinNotes, effectiveVolume);
          break;
        }

        case 'userLeave': {
          // Bouncy downward departure tap (A5 -> E5 -> C#5)
          // Crisp, tight double-bounce drop, drifting slightly right
          // then settling back to center as the tone falls away.
          const bounceLeaveNotes: ChimeNote[] = [
            { freq: 880.0, start: 0.0, dur: 0.08, level: 0.65, pan: 0.15 },   // initial high tap (A5)
            { freq: 659.25, start: 0.065, dur: 0.11, level: 0.70, pan: 0.05 }, // middle bounce (E5)
            { freq: 554.37, start: 0.14, dur: 0.4, level: 0.80, pan: 0, filterFreq: 3600 }, // deeper final drop (C#5)
          ];

          playChimeSequence(ctx, gainNode, now, bounceLeaveNotes, effectiveVolume);
          break;
        }

        case 'messageSend': {
          // Crisp, light pop
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.25, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'messageReceive': {
          // Soft bell chime (D6)
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1174.66, now);

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.35, now + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.28);
          break;
        }

        case 'poke': {
          // Playful double bubble blip
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          osc1.type = 'triangle';
          osc2.type = 'triangle';

          osc1.frequency.setValueAtTime(523.25, now); // C5
          osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.07);

          osc2.frequency.setValueAtTime(659.25, now + 0.09); // E5
          osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.16);

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.5, now + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc1.connect(gainNode);
          osc2.connect(gainNode);

          osc1.start(now);
          osc1.stop(now + 0.08);
          osc2.start(now + 0.09);
          osc2.stop(now + 0.25);
          break;
        }

        case 'mute': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.1);

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.3, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'unmute': {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.3, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'error': {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.3, now + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gainNode);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
      }
    },
    [getAudioContext, volume]
  );

  // Master play dispatcher
  const playSound = useCallback(
    (type: RoomSoundType) => {
      if (isMuted) return;

      const customFile = soundUrls?.[type];
      if (customFile) {
        try {
          const audio = new Audio(customFile);
          audio.volume = Math.max(0, Math.min(1, volume));
          audio.play().catch(() => playSynthesizedTone(type));
        } catch {
          playSynthesizedTone(type);
        }
      } else {
        playSynthesizedTone(type);
      }
    },
    [isMuted, volume, soundUrls, playSynthesizedTone]
  );

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => { });
      }
    };
  }, []);

  return {
    // Direct action functions
    playUserJoin: useCallback(() => playSound('userJoin'), [playSound]),
    playUserLeave: useCallback(() => playSound('userLeave'), [playSound]),
    playMessageSend: useCallback(() => playSound('messageSend'), [playSound]),
    playMessageReceive: useCallback(() => playSound('messageReceive'), [playSound]),
    playPoke: useCallback(() => playSound('poke'), [playSound]),
    playMute: useCallback(() => playSound('mute'), [playSound]),
    playUnmute: useCallback(() => playSound('unmute'), [playSound]),
    playError: useCallback(() => playSound('error'), [playSound]),
    playSound,

    // Controls
    isMuted,
    setIsMuted,
    toggleSoundMute: () => setIsMuted((prev) => !prev),
    volume,
    setVolume,
  };
};

export default useRoomSounds;
