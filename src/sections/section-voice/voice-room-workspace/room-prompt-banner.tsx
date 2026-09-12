import React from 'react';
import { Pin } from 'lucide-react';

import { Box, Link, Typography } from '@mui/material';

import { accent } from './theme-tokens';

type PromptBannerProps = {
  prompt: string;
  onChangePrompt?: () => void;
};

export const PromptBanner = ({ prompt, onChangePrompt }: PromptBannerProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1.5,
      p: 1,
      mb: 2,
      borderRadius: 1,
      bgcolor: 'background.neutral',
      border: `1px solid`,
      borderColor: 'divider',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Pin size={16} color={accent.brand} style={{ flexShrink: 0 }} />
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
        <Box component="strong" sx={{ color: 'text.secondary' }}>
          Prompt of the minute:
        </Box>{' '}
        &ldquo;{prompt}&rdquo;
      </Typography>
    </Box>

    {onChangePrompt && (
      <Link
        component="button"
        onClick={onChangePrompt}
        underline="hover"
        sx={{
          fontSize: 11,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Change Prompt
      </Link>
    )}
  </Box>
);
