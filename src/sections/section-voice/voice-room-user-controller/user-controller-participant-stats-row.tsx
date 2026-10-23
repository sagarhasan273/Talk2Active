// src/sections/section-voice/voice-room-user-controller/user-controller-participant-stats-row.tsx

import { RoomParticipantType } from '@/types/type-room';
import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

function formatCompactNumber(num: number = 0): string {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);
}

export const ParticipantStatsRow = ({
  participant,
}: {
  participant: Partial<RoomParticipantType>;
}) => {
  const stats = [
    { label: 'Friends', value: participant?.friend_count ?? 0 },
    { label: 'Followers', value: participant?.follower_count ?? 0 },
    { label: 'Following', value: participant?.following_count ?? 0 },
  ];

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        width: '100%',
      }}
    >
      {stats.map((item) => (
        <Box
          key={item.label}
          sx={{
            flex: 1,
            minWidth: 0,
            py: 0.75,
            px: 0.5,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.025),
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? alpha('#fff', 0.07) : alpha('#000', 0.06),
            transition: 'all 0.18s ease',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 13, sm: 14 },
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              color: 'text.primary',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {formatCompactNumber(item.value)}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: 9.5, sm: 10 },
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'text.secondary',
              lineHeight: 1.2,
              mt: 0.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default ParticipantStatsRow;
