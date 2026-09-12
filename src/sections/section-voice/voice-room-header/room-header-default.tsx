import React from 'react';
import { VerifiedIcon } from 'lucide-react';

import AddIcon from '@mui/icons-material/Add';
import { AutoAwesomeMosaicOutlined } from '@mui/icons-material';
import { Box, Stack, alpha, Paper, Button, Tooltip, useTheme, Typography } from '@mui/material';

// ----------------------------------------------------------------------
// Default Hero Header
// ----------------------------------------------------------------------

export const DefaultHeader = ({
  onQuickJoin,
  onCreateRoom,
}: {
  onQuickJoin?: () => void;
  onCreateRoom?: () => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: { xs: 1.5, sm: 2 },
        borderRadius: { xs: 1 },
        bgcolor: 'background.paper',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,

        animation: 'voiceHeroIn 0.35s ease-out',

        '@keyframes voiceHeroIn': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },

        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Stack
        direction="column"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={{ xs: 1.5, sm: 2 }}
      >
        <Box sx={{ maxWidth: 520 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeMosaicOutlined sx={{ fontSize: 16 }} />
            </Box>

            <Typography
              variant="caption"
              fontWeight={800}
              color="primary.main"
              sx={{
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Voice Hub
            </Typography>
          </Stack>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 0.75,
            }}
          >
            Dive Into Real-Time Conversation
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.5,
            }}
          >
            Join live audio rooms to practice languages, host discussions, or listen in on engaging
            topics with creators.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          flexWrap="wrap"
          useFlexGap
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onCreateRoom}
            sx={{
              borderRadius: 1,
              px: 2,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: 'primary.main',
              color: 'primary.main',
              transition: theme.transitions.create(
                ['background-color', 'border-color', 'transform'],
                {
                  duration: 150,
                }
              ),

              '&:hover': {
                borderColor: 'primary.light',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
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
                variant="contained"
                size="small"
                disabled
                onClick={onQuickJoin}
                sx={{
                  borderRadius: 1,
                  px: 2,
                  opacity: 0.6,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Quick Join
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};
