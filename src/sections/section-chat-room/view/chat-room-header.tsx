import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Settings as SettingsIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Stack, styled, Button, Typography } from '@mui/material';

import { useParams } from 'src/routes/route-hooks';

import { fDateTime } from 'src/utils/format-time';

import { useRoomTools } from 'src/core/slices/slice-room';

const HeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: 'white',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
  },
}));

const ResponsiveTypography = styled(Typography)(({ theme }) => ({
  // xs: caption styles
  fontSize: theme.typography.caption.fontSize,
  fontWeight: theme.typography.caption.fontWeight,
  lineHeight: theme.typography.caption.lineHeight,

  // sm: subtitle2 styles
  [theme.breakpoints.up('sm')]: {
    fontSize: theme.typography.subtitle2.fontSize,
    fontWeight: theme.typography.subtitle2.fontWeight,
    lineHeight: theme.typography.subtitle2.lineHeight,
  },
}));

type ChatRoomHeaderProps = {
  isConnected: boolean;
  editRoomBoolean: UseBooleanReturn;
};

export function ChatRoomHeader({ isConnected, editRoomBoolean }: ChatRoomHeaderProps) {
  const { room } = useRoomTools();
  const roomId = useParams().roomId as string;

  return (
    <HeaderPaper elevation={3} sx={{ p: { xs: 1, sm: 3 } }}>
      <Stack direction="column" spacing={1} flex={1}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {room?.name || `Voice Room ${roomId}`}
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip label={room?.languages?.[0] || 'English'} color="secondary" size="small" />
            <Chip
              label={room?.level || 'Intermediate'}
              variant="outlined"
              size="small"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            <Chip
              label={isConnected ? 'Connected' : 'Disconnected'}
              color={isConnected ? 'success' : 'error'}
              size="small"
            />
          </Stack>
          {/* Conditional Join/Leave Buttons */}
          <Box>
            {!isConnected ? (
              <ResponsiveTypography>{fDateTime(room.updatedAt)}</ResponsiveTypography>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SettingsIcon />}
                size="small"
                onClick={editRoomBoolean.onTrue}
                sx={{
                  color: 'white !important',
                  backgroundColor: 'primary.main',
                  '&:hover': { backgroundColor: 'primary.main' },
                }}
              >
                Room Settings
              </Button>
            )}
          </Box>
        </Stack>
      </Stack>
    </HeaderPaper>
  );
}
