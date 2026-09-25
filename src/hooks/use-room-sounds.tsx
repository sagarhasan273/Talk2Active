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
          // Cheerful ascending two-tone chime (F5 -> A5)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          osc1.type = 'sine';
          osc2.type = 'sine';

          osc1.frequency.setValueAtTime(698.46, now); // F5
          osc2.frequency.setValueAtTime(880.0, now + 0.1); // A5

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.4, now + 0.03);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc1.connect(gainNode);
          osc2.connect(gainNode);

          osc1.start(now);
          osc1.stop(now + 0.12);
          osc2.start(now + 0.1);
          osc2.stop(now + 0.35);
          break;
        }

        case 'userLeave': {
          // Subtle descending two-tone chime (G5 -> Eb5)
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          osc1.type = 'sine';
          osc2.type = 'sine';

          osc1.frequency.setValueAtTime(783.99, now); // G5
          osc2.frequency.setValueAtTime(622.25, now + 0.1); // Eb5

          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.exponentialRampToValueAtTime(effectiveVolume * 0.3, now + 0.03);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc1.connect(gainNode);
          osc2.connect(gainNode);

          osc1.start(now);
          osc1.stop(now + 0.12);
          osc2.start(now + 0.1);
          osc2.stop(now + 0.35);
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
