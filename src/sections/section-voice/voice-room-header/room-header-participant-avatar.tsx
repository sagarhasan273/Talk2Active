// src/sections/section-voice/voice-room-header/room-header-participant-avatar.tsx
import { useIsSpeaking } from '@livekit/components-react';
import { alpha, Avatar, Box, keyframes, Tooltip, useTheme } from '@mui/material';
import { Participant } from 'livekit-client';
import { Mic } from 'lucide-react';
import { useMemo } from 'react';

import { getCachedUserInfo } from '@/utils/user-cache';

// ----------------------------------------------------------------------

const ripple = keyframes`
  0%   { transform: scale(1);   opacity: 0.75; }
  100% { transform: scale(1.7); opacity: 0; }
`;

const badgeIn = keyframes`
  from { transform: scale(0); }
  to   { transform: scale(1); }
`;

type Props = {
  participant: Participant;
  size?: number;
  surface?: string;
};

export function ParticipantAvatar({ participant, size = 32, surface }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const success = theme.palette.success.main;
  const cutout = surface ?? (isDark ? '#181c26' : '#ffffff');

  const speaking = useIsSpeaking(participant);

  const cached = useMemo(
    () => (participant.identity ? getCachedUserInfo(participant.identity) : null),
    [participant.identity]
  );

  const displayName = participant.name || participant.identity || 'Guest';
  const badgeSize = Math.max(14, Math.round(size * 0.42));

  return (
    <Tooltip title={participant.isLocal ? `${displayName} (you)` : displayName} arrow>
      <Box
        aria-label={`${displayName}${speaking ? ' is speaking' : ''}`}
        sx={{
          position: 'relative',
          width: size,
          height: size,
          // FIX: Dynamic Z-Index forces the speaker to the front of the stack
          zIndex: speaking ? 999 : 1,
          transition: 'z-index 0.2s',
        }}
      >
        {/* Ripple ring */}
        {speaking && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px solid ${success}`,
              pointerEvents: 'none',
              animation: `${ripple} 1.4s ease-out infinite`,
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.4 },
            }}
          />
        )}

        <Avatar
          src={cached?.avatarUrl || undefined}
          alt={displayName}
          sx={{
            width: size,
            height: size,
            fontSize: size * 0.42,
            fontWeight: 800,
            bgcolor: participant.isLocal
              ? alpha(theme.palette.primary.main, isDark ? 0.35 : 0.15)
              : isDark
                ? '#252b3b'
                : '#eef2f7',
            color: participant.isLocal
              ? theme.palette.primary.main
              : isDark
                ? '#fff'
                : '#0f172a',
            border: `2px solid ${speaking ? success : cutout}`,
            boxShadow: speaking ? `0 0 14px ${alpha(success, 0.65)}` : 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>

        {speaking && (
          <Box
            sx={{
              position: 'absolute',
              right: -3,
              bottom: -3,
              width: badgeSize,
              height: badgeSize,
              borderRadius: '50%',
              bgcolor: 'success.main',
              border: `2px solid ${cutout}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              animation: `${badgeIn} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards`,
            }}
          >
            <Mic size={Math.round(badgeSize * 0.58)} strokeWidth={3} />
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
