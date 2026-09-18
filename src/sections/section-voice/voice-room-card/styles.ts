// src/sections/section-voice/voice-room-card/styles.ts

import { keyframes } from '@mui/material/styles';

export const livePulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.6);
  }
  70% {
    box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
`;

export const supporterSheen = keyframes`
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const getLevelColor = (level?: string): string => {
  switch (level?.toLowerCase()) {
    case 'beginner':
    case 'a1':
    case 'a2':
      return '#22C55E';
    case 'intermediate':
    case 'b1':
    case 'b2':
      return '#3B82F6';
    case 'advanced':
    case 'c1':
    case 'c2':
      return '#A855F7';
    case 'native':
    case 'fluent':
      return '#EC4899';
    default:
      return '#F59E0B';
  }
};
