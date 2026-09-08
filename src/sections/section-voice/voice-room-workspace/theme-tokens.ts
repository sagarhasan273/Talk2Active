import { keyframes } from '@mui/system';

// Tailwind's slate scale — kept as explicit tokens rather than theme.palette
// since this stage uses a fixed dark surface regardless of the app's
// light/dark mode (a "stage" is meant to feel like a dim room).
export const slate = {
  950: '#020617',
  900: '#0f172a',
  800: '#1e293b',
  700: '#334155',
  400: '#94a3b8',
  300: '#cbd5e1',
  200: '#e2e8f0',
  100: '#f1f5f9',
};

export const accent = {
  brand: '#6366f1', // swap for theme.palette.primary.main if the app theme should drive this
  brandSoft: 'rgba(99,102,241,0.1)',
  amber: '#f59e0b',
  emerald: '#34d399',
  rose: '#f43f5e',
};

// Pulsing ring around the active speaker's avatar.
export const speakingGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 ${accent.brand}66; }
  50% { box-shadow: 0 0 0 8px ${accent.brand}00; }
`;

// Equivalent to Tailwind's `animate-bounce`, used for the waveform bars.
export const barBounce = keyframes`
  0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: translateY(-35%); animation-timing-function: cubic-bezier(0,0,0.2,1); }
`;

// Equivalent to Tailwind's `animate-bounce`, used for the raised-hand badge.
export const badgeBounce = keyframes`
  0%, 100% { transform: translateY(0); animation-timing-function: cubic-bezier(0.8,0,1,1); }
  50% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0,0,0.2,1); }
`;
