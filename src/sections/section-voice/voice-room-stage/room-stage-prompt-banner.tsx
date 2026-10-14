// src/sections/section-voice/voice-room-stage/room-stage-prompt-banner.tsx

import { alpha, Box, Link, Typography, useTheme } from '@mui/material';
import { Pin } from 'lucide-react';

type PromptBannerProps = {
  prompt: string;
  onChangePrompt?: () => void;
};

export const PromptBanner = ({ prompt, onChangePrompt }: PromptBannerProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 1.75,
        py: 1.25,
        mb: 2,
        borderRadius: 1.5,
        bgcolor: isDark ? alpha('#1a1f2b', 0.85) : alpha(theme.palette.primary.main, 0.04),
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : alpha(theme.palette.primary.main, 0.15),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.14),
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Pin size={14} />
        </Box>

        <Typography
          variant="subtitle2"
          noWrap
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <Box component="strong" sx={{ color: 'primary.main', fontWeight: 700, mr: 0.5 }}>
            Topic Prompt:
          </Box>
          &ldquo;{prompt}&rdquo;
        </Typography>
      </Box>

      {onChangePrompt && (
        <Link
          component="button"
          onClick={onChangePrompt}
          underline="none"
          sx={{
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            fontSize: 11.5,
            fontWeight: 700,
            color: 'primary.main',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            whiteSpace: 'nowrap',
            flexShrink: 0,
            transition: 'background-color 0.15s ease',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.18),
            },
          }}
        >
          Change Prompt
        </Link>
      )}
    </Box>
  );
};
