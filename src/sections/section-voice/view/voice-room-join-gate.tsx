// src/sections/section-voice/voice-room-view/voice-room-join-gate.tsx

import { ArrowRightIcon, MicIcon, UsersIcon, Volume2Icon, XIcon } from 'lucide-react';

import { alpha, Box, Button, IconButton, Paper, Typography, useTheme } from '@mui/material';

// ----------------------------------------------------------------------
// Join Room Gate
// ----------------------------------------------------------------------

interface VoiceRoomJoinGateProps {
  roomTopic?: string;
  participantCount?: number;
  maxParticipants?: number;
  onJoin: () => void;
  onCancel: () => void;
}

export function VoiceRoomJoinGate({
  roomTopic,
  participantCount = 0,
  maxParticipants,
  onJoin,
  onCancel,
}: VoiceRoomJoinGateProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const hasParticipants = participantCount > 0;
  const isFull = maxParticipants !== undefined && participantCount >= maxParticipants;

  return (
    <Box
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-room-join-title"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        p: 2,

        bgcolor: alpha(theme.palette.common.black, isDark ? 0.65 : 0.45),
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 380,
          overflow: 'hidden',

          p: { xs: 3, sm: 3.5 },
          borderRadius: 1,

          textAlign: 'center',
          bgcolor: isDark ? '#181c26' : '#ffffff',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
          boxShadow: isDark
            ? '0 24px 48px -12px rgba(0, 0, 0, 0.65)'
            : '0 24px 48px -12px rgba(15, 23, 42, 0.18)',

          animation: 'voiceJoinGateIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',

          '@keyframes voiceJoinGateIn': {
            from: {
              opacity: 0,
              transform: 'translateY(10px) scale(0.97)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0) scale(1)',
            },
          },

          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        {/* Close */}
        <IconButton
          aria-label="Cancel joining room"
          onClick={onCancel}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            width: 30,
            height: 30,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            color: isDark ? 'text.secondary' : '#64748b',

            '&:hover': {
              bgcolor: isDark ? alpha('#fff', 0.1) : '#f1f5f9',
              color: isDark ? 'text.primary' : '#0f172a',
            },
          }}
        >
          <XIcon size={16} />
        </IconButton>

        {/* Ambient accent glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -70,
            left: '50%',
            transform: 'translateX(-50%)',

            width: 220,
            height: 220,

            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08),
            filter: 'blur(40px)',

            pointerEvents: 'none',
          }}
        />

        {/* Icon */}
        <Box
          sx={{
            position: 'relative',

            width: 68,
            height: 68,

            mx: 'auto',
            mb: 2.25,

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[0, 1].map((ring) => (
            <Box
              key={ring}
              sx={{
                position: 'absolute',
                inset: 0,

                borderRadius: '50%',
                border: `1.5px solid ${alpha(theme.palette.primary.main, isDark ? 0.38 : 0.3)}`,

                animation: `voiceJoinGateRing 2.2s ease-out ${ring * 0.7}s infinite`,

                '@keyframes voiceJoinGateRing': {
                  '0%': {
                    transform: 'scale(0.85)',
                    opacity: 0.6,
                  },
                  '100%': {
                    transform: 'scale(1.45)',
                    opacity: 0,
                  },
                },

                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  display: 'none',
                },
              }}
            />
          ))}

          <Box
            sx={{
              position: 'relative',

              width: 56,
              height: 56,

              borderRadius: '50%',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.15 : 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              color: 'primary.main',
            }}
          >
            <Volume2Icon size={24} />
          </Box>
        </Box>

        {/* Title */}
        <Typography
          id="voice-room-join-title"
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: isDark ? 'text.primary' : '#0f172a',
            mb: 0.75,
          }}
        >
          Ready to join the room?
        </Typography>

        {/* Room topic */}
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'text.secondary' : '#475569',
            fontWeight: 500,

            mb: hasParticipants ? 2 : 3,

            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {roomTopic || 'Jump in and start talking with the room.'}
        </Typography>

        {/* Participants */}
        {hasParticipants && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',

              gap: 0.6,
              mx: 'auto',
              mb: 2.75,

              px: 1.25,
              py: 0.5,

              borderRadius: 1,

              bgcolor: isDark ? alpha(theme.palette.success.main, 0.12) : '#ecfdf5',
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.success.main, 0.25) : '#a7f3d0',
              color: isDark ? 'success.main' : '#059669',
            }}
          >
            <UsersIcon size={13} />

            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {participantCount} {participantCount === 1 ? 'person is' : 'people are'} already
              talking
              {maxParticipants ? ` · ${participantCount}/${maxParticipants}` : ''}
            </Typography>
          </Box>
        )}

        {/* Full room warning */}
        {isFull && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 2,

              color: 'error.main',
              fontWeight: 700,
            }}
          >
            This room is currently full.
          </Typography>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Button
            fullWidth
            size="large"
            variant="contained"
            disableElevation
            disabled={isFull}
            onClick={onJoin}
            endIcon={<ArrowRightIcon size={18} />}
            sx={{
              borderRadius: 1,
              py: 1.1,

              fontWeight: 700,
              fontSize: 14,
              textTransform: 'none',

              boxShadow: 'none',

              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: 150,
              }),

              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
              },

              '&.Mui-disabled': {
                boxShadow: 'none',
              },
            }}
          >
            {isFull ? 'Room is full' : 'Click to join room'}
          </Button>

          <Button
            fullWidth
            size="medium"
            variant="outlined"
            color="inherit"
            onClick={onCancel}
            sx={{
              borderRadius: 1,
              py: 0.9,
              textTransform: 'none',
              fontWeight: 600,
              color: isDark ? 'text.secondary' : '#475569',
              borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
              bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',

              '&:hover': {
                bgcolor: isDark ? alpha('#fff', 0.06) : '#f1f5f9',
                borderColor: isDark ? alpha('#fff', 0.18) : '#cbd5e1',
              },
            }}
          >
            Cancel
          </Button>
        </Box>

        {/* Mic information */}
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            gap: 0.5,
            mt: 1.75,

            color: isDark ? 'text.disabled' : '#94a3b8',
            fontWeight: 500,
          }}
        >
          <MicIcon size={12} />
          Your mic stays muted until you unmute it
        </Typography>
      </Paper>
    </Box>
  );
}
