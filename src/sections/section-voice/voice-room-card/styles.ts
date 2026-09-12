import { keyframes } from '@mui/system';

// One quiet, deliberate motion for supporter names — a slow sheen rather than
// a stack of competing effects.
export const supporterSheen = keyframes`
  0% { background-position: 160% 0 }
  100% { background-position: -40% 0 }
`;

// The "live" dot's pulse. Previously referenced as a bare string
// (`animation: 'pulse 1.5s infinite'`) with no matching @keyframes, so it
// silently never animated — this is the actual keyframe definition.
export const livePulse = keyframes`
  0% { box-shadow: 0 0 0 0 currentColor }
  70% { box-shadow: 0 0 0 5px transparent }
  100% { box-shadow: 0 0 0 0 transparent }
`;

export const LEVEL_COLOR: Record<string, string> = {
  beginner: '#43A047',
  intermediate: '#F0A800',
  advanced: '#E5484D',
};

export const getLevelColor = (level: string) => LEVEL_COLOR[level] ?? '#8A8F98';
