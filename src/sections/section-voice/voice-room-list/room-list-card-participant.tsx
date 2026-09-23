// src/sections/section-voice/voice-room-card/room-card-participant.tsx

import { RoomParticipantType } from '@/types/type-room';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import CrownRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { alpha, Avatar, Box, Typography, useTheme } from '@mui/material';


type RoomCardParticipantProps = {
  user: RoomParticipantType;
  isHost?: boolean;
  onParticipantClick: (user: RoomParticipantType) => void;
};

export const RoomCardParticipant = ({ user, isHost, onParticipantClick }: RoomCardParticipantProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isSupporter = user.accountType === 'supporter';
  const displayName = isSupporter ? user.name : user.name?.split(' ')[0];

  const getInitials = (fullName?: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <Box
      onClick={() => onParticipantClick(user)}
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
        border: '1.5px solid',
        borderColor: isHost
          ? theme.palette.warning.main
          : isDark
            ? alpha('#fff', 0.08)
            : alpha('#000', 0.08),
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: isHost ? theme.palette.warning.main : theme.palette.primary.main,
          transform: 'scale(0.2px)',
          boxShadow: isDark
            ? '0 6px 18px rgba(0, 0, 0, 0.45)'
            : '0 6px 18px rgba(145, 158, 171, 0.25)',
          '& .participant-img': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Square Avatar */}
      <Avatar
        src={user.profilePhoto || undefined}
        alt={user.name}
        variant="rounded"
        className="participant-img"
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: 0,
          fontWeight: 800,
          fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: 'primary.main',
          transition: 'transform 0.25s ease',
        }}
      >
        {getInitials(user?.name)}
      </Avatar>

      {/* Host Indicator */}
      {isHost && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 0.35,
            px: 0.6,
            py: 0.2,
            borderRadius: 0.75,
            bgcolor: 'warning.main',
            color: '#000',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        >
          <CrownRoundedIcon sx={{ fontSize: 12 }} />
          <Typography sx={{ fontSize: '0.625rem', fontWeight: 800, lineHeight: 1 }}>
            HOST
          </Typography>
        </Box>
      )}

      {/* Verified Floating Icon */}
      {user.verified && !isHost && (
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 3,
            display: 'flex',
            p: 0.2,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[2],
          }}
        >
          <VerifiedRoundedIcon sx={{ fontSize: 13, color: 'info.main' }} />
        </Box>
      )}

      {/* Bottom Name Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          p: 0.6,
          pt: 1.2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 65%, transparent 100%)',
        }}
      >
        <Typography
          variant="caption"
          noWrap
          sx={{
            px: 0.5,
            fontSize: '0.7rem',
            fontWeight: 700,
            lineHeight: 1.2,
            textAlign: 'center',
            color: '#fff',
            maxWidth: '100%',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            ...(isSupporter && {
              backgroundImage: `linear-gradient(100deg, #fff 35%, ${theme.palette.primary.light} 50%, #fff 65%)`,
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }),
          }}
        >
          {displayName}
        </Typography>
      </Box>
    </Box>
  );
};

export default RoomCardParticipant;
