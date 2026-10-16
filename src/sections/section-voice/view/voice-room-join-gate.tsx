// src/sections/section-voice/voice-room-view/voice-room-join-gate.tsx

import { ArrowRight, Mic, Radio, X } from 'lucide-react';

import type { RoomParticipantType } from '@/types/type-room';
import { getInitials } from '@/utils/social-chat-helper';
import { alpha, Avatar, AvatarGroup, Box, Button, IconButton, Paper, Typography, useTheme } from '@mui/material';

// ----------------------------------------------------------------------
// Join Room Gate (Compact & Mobile Responsive)
// ----------------------------------------------------------------------

interface VoiceRoomJoinGateProps {
  userName?: string;
  roomTopic?: string;
  participantCount?: number;
  maxParticipants?: number;
  participants?: RoomParticipantType[];
  onJoin: () => void;
  onCancel: () => void;
}

export function VoiceRoomJoinGate({
  userName,
  roomTopic,
  participantCount = 0,
  maxParticipants,
  participants = [],
  onJoin,
  onCancel,
}: VoiceRoomJoinGateProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const totalParticipants = participantCount || participants.length;
  const hasParticipants = totalParticipants > 0;
  const isFull = maxParticipants !== undefined && totalParticipants >= maxParticipants;

  const greetingTitle = userName ? `Hey ${userName}, ready to talk?` : 'Ready to join?';

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
        p: { xs: 2, sm: 3 },
        bgcolor: alpha(theme.palette.common.black, isDark ? 0.7 : 0.5),
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: { xs: '100%', sm: 360 },
          overflow: 'hidden',
          p: { xs: 2.5, sm: 3 },
          borderRadius: 1,
          textAlign: 'center',
          bgcolor: isDark ? alpha('#131722', 0.95) : alpha('#ffffff', 0.98),
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.06),
          boxShadow: isDark
            ? '0 20px 40px -12px rgba(0, 0, 0, 0.8)'
            : '0 20px 40px -12px rgba(15, 23, 42, 0.15)',
          animation: 'voiceJoinGateIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',

          '@keyframes voiceJoinGateIn': {
            from: { opacity: 0, transform: 'translateY(10px) scale(0.96)' },
            to: { opacity: 1, transform: 'translateY(0) scale(1)' },
          },
        }}
      >
        {/* Close Button */}
        <IconButton
          aria-label="Cancel joining room"
          onClick={onCancel}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 3,
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
            color: isDark ? 'text.secondary' : '#64748b',
            '&:hover': {
              bgcolor: isDark ? alpha('#fff', 0.12) : alpha('#000', 0.08),
              color: isDark ? 'text.primary' : '#0f172a',
            },
          }}
        >
          <X size={14} />
        </IconButton>

        {/* Top Accent Line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            bgcolor: 'primary.main',
          }}
        />

        {/* Mini Radio Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            mx: 'auto',
            mb: 1.5,
            mt: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
            color: 'primary.main',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Radio size={22} strokeWidth={2.2} />
        </Box>

        {/* Title */}
        <Typography
          id="voice-room-join-title"
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.01em',
            color: isDark ? 'text.primary' : '#0f172a',
            mb: 0.5,
            fontSize: '1.05rem',
          }}
        >
          {greetingTitle}
        </Typography>

        {/* Room Topic */}
        <Typography
          variant="body2"
          sx={{
            color: isDark ? 'text.secondary' : '#475569',
            fontWeight: 500,
            fontSize: '0.85rem',
            mb: 2,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            px: 1,
          }}
        >
          {roomTopic || 'Jump in and start talking.'}
        </Typography>

        {/* Participants Row */}
        {hasParticipants && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              py: 1,
              px: 1.5,
              mb: 2,
              borderRadius: 1.5,
              bgcolor: isDark ? alpha(theme.palette.success.main, 0.08) : alpha(theme.palette.success.main, 0.05),
              border: '1px solid',
              borderColor: isDark ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.success.main, 0.12),
            }}
          >
            {participants.length > 0 && (
              <AvatarGroup
                max={6}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 24,
                    height: 24,
                    fontSize: 10,
                    fontWeight: 800,
                    border: `2px solid ${isDark ? '#131722' : '#ffffff'}`,
                    bgcolor: alpha(theme.palette.success.main, 0.2),
                    color: 'success.main',
                  },
                }}
              >
                {participants.map((p) => (
                  <Avatar key={p.userId || p.name} src={p.profilePhoto || undefined} alt={p.name}>
                    {getInitials(p.name)}
                  </Avatar>
                ))}
              </AvatarGroup>
            )}
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 700,
                color: isDark ? 'success.light' : 'success.dark',
              }}
            >
              {totalParticipants} {totalParticipants === 1 ? 'person' : 'people'} in room
              {maxParticipants ? ` · ${totalParticipants}/${maxParticipants}` : ''}
            </Typography>
          </Box>
        )}

        {/* Full Room Warning */}
        {isFull && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1.5,
              color: 'error.main',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            ⚠️ Room is currently full.
          </Typography>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            size="medium"
            variant="contained"
            disableElevation
            disabled={isFull}
            onClick={onJoin}
            endIcon={<ArrowRight size={16} />}
            sx={{
              borderRadius: 1,
              py: 0.9,
              fontWeight: 800,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
            }}
          >
            {isFull ? 'Room is full' : 'Click to join room'}
          </Button>

          <Button
            fullWidth
            size="small"
            variant="text"
            onClick={onCancel}
            sx={{
              borderRadius: 1,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.825rem',
              color: isDark ? 'text.secondary' : '#64748b',
              '&:hover': {
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              },
            }}
          >
            Cancel
          </Button>
        </Box>

        {/* Micro Footer Note */}
        <Typography
          variant="caption"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            mt: 1.5,
            color: isDark ? 'text.disabled' : '#94a3b8',
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        >
          <Mic size={11} />
          Mic starts muted
        </Typography>
      </Paper>
    </Box>
  );
}
