// src/sections/section-voice/voice-room-header/room-header-default.tsx

import { VerifiedIcon } from 'lucide-react';

import { LoginPromptDialog } from '@/components/custom-dialog';
import { useCredentials } from '@/core/slices';
import { useBoolean } from '@/hooks/use-boolean';
import { AutoAwesomeMosaicOutlined } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { alpha, Box, Button, Paper, Stack, SxProps, Tooltip, Typography, useTheme } from '@mui/material';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';

// ----------------------------------------------------------------------
// Default Hero Header
// ----------------------------------------------------------------------

export const DefaultHeader = ({
  onQuickJoin,
  sx
}: {
  onQuickJoin?: () => void;
  sx?: SxProps;
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { isAuthenticated } = useCredentials();

  const open = useBoolean();
  const logOpen = useBoolean();

  const handleCreation = () => {
    if (!isAuthenticated) {
      logOpen.onTrue();
      return;
    }
    open.onTrue();
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          gridColumn: '1 / -1',
          position: 'relative',
          overflow: 'hidden',
          my: 1,
          p: { xs: 2.25, sm: 3 },
          borderRadius: 1,
          bgcolor: 'background.default',
          backgroundImage: isDark
            ? `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.primary.main, 0.14)} 0%, transparent 55%)`
            : `radial-gradient(circle at 100% 0%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 55%)`,
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          animation: 'voiceHeroIn 0.35s ease-out',

          '@keyframes voiceHeroIn': {
            from: { opacity: 0, transform: 'translateY(8px)' },
            to: { opacity: 1, transform: 'translateY(0)' },
          },

          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
          ...sx
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 2.5, md: 3 }}
        >
          <Box sx={{ maxWidth: 580 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.25 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.14 : 0.1),
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeMosaicOutlined sx={{ fontSize: 15 }} />
              </Box>

              <Typography
                variant="caption"
                fontWeight={800}
                color="primary.main"
                sx={{
                  letterSpacing: 0.8,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                }}
              >
                Voice Hub
              </Typography>
            </Stack>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: isDark ? 'text.primary' : '#0f172a',
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.35rem', sm: '1.65rem' },
                lineHeight: 1.2,
                mb: 0.75,
              }}
            >
              Dive Into Real-Time Conversation
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: isDark ? 'text.secondary' : '#475569',
                lineHeight: 1.55,
                fontSize: '0.875rem',
              }}
            >
              Join live audio rooms to practice languages, host discussions, or listen in on engaging
              topics with creators.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1.25}
            flexWrap="wrap"
            useFlexGap
            sx={{ width: { xs: '100%', sm: 'auto' }, flexShrink: 0 }}
          >
            <Button
              variant="contained"
              size="medium"
              disableElevation
              startIcon={<AddIcon />}
              onClick={handleCreation}
              sx={{
                borderRadius: 1,
                px: 2.25,
                py: 1,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 13.5,
                boxShadow: 'none',
                transition: 'all 0.18s ease',
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Create New Room
            </Button>

            <Tooltip
              title={
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <VerifiedIcon style={{ fontSize: 14 }} />
                  <span>Verified accounts only</span>
                </Stack>
              }
              arrow
            >
              <span>
                <Button
                  variant="outlined"
                  size="medium"
                  disabled
                  onClick={onQuickJoin}
                  sx={{
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 13.5,
                    borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
                    bgcolor: isDark ? 'transparent' : '#f8fafc',
                  }}
                >
                  Quick Join
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      <VoiceModalCreateRoom open={open.value} onClose={open.onFalse} />

      <LoginPromptDialog openBoolean={logOpen} />
    </>
  );
};
