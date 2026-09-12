import { MicIcon, UsersIcon, Volume2Icon, ArrowRightIcon } from 'lucide-react';

import { Box, Paper, alpha, Button, useTheme, Typography } from '@mui/material';

// ----------------------------------------------------------------------
// Join Room Gate
//
// Sits over the whole screen and freezes interaction with the room
// behind it until the user explicitly confirms they want to join
// (mic/camera permissions, analytics, etc. can all be kicked off from
// the single onJoin callback). One deliberate entrance animation on
// the card + a slow ambient pulse on the icon; everything else is
// static so it doesn't compete with the confirm action.
// ----------------------------------------------------------------------

export function VoiceRoomJoinGate({
  roomTopic,
  participantCount,
  maxParticipants,
  onJoin,
}: {
  roomTopic?: string;
  participantCount?: number;
  maxParticipants?: number;
  onJoin: () => void;
}) {
  const theme = useTheme();

  const hasParticipants = Boolean(participantCount && participantCount > 0);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        p: 2,

        bgcolor: alpha(theme.palette.background.default, 0.72),
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

          p: { xs: 3, sm: 4 },
          borderRadius: 3,

          textAlign: 'center',
          bgcolor: 'background.paper',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
          boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.18)}`,

          animation: 'voiceJoinGateIn 0.32s cubic-bezier(0.16, 1, 0.3, 1)',

          '@keyframes voiceJoinGateIn': {
            from: { opacity: 0, transform: 'translateY(10px) scale(0.97)' },
            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
          },

          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        }}
      >
        {/* Ambient accent glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 220,
            height: 220,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, 0.14),
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        {/* Icon with pulsing rings */}
        <Box
          sx={{
            position: 'relative',
            width: 72,
            height: 72,
            mx: 'auto',
            mb: 2.5,

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
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                animation: `voiceJoinGateRing 2.2s ease-out ${ring * 0.7}s infinite`,

                '@keyframes voiceJoinGateRing': {
                  '0%': { transform: 'scale(0.85)', opacity: 0.6 },
                  '100%': { transform: 'scale(1.5)', opacity: 0 },
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
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
            }}
          >
            <Volume2Icon size={26} />
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.01em',
            mb: 0.75,
          }}
        >
          Ready to join the room?
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: hasParticipants ? 2 : 3,

            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {roomTopic || 'Jump in and start talking with the room.'}
        </Typography>

        {hasParticipants && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
              mx: 'auto',
              mb: 3,
              px: 1.25,
              py: 0.5,
              borderRadius: 5,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: 'success.dark',
            }}
          >
            <UsersIcon size={13} />
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
              {participantCount} {participantCount === 1 ? 'person is' : 'people are'} already
              talking{maxParticipants ? ` · ${participantCount}/${maxParticipants}` : ''}
            </Typography>
          </Box>
        )}

        <Button
          fullWidth
          size="large"
          variant="contained"
          onClick={onJoin}
          endIcon={<ArrowRightIcon size={18} />}
          sx={{
            borderRadius: 2,
            py: 1.15,
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.32)}`,
            transition: theme.transitions.create(['transform', 'box-shadow'], { duration: 150 }),

            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          Click to join room
        </Button>

        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            mt: 1.5,
            color: 'text.disabled',
          }}
        >
          <MicIcon size={12} />
          Your mic stays muted until you unmute it
        </Typography>
      </Paper>
    </Box>
  );
}
