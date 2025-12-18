import type { Message } from 'src/types/type-room';

import { Box, Chip } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

export function MessageMention({ message }: { message: Message }) {
  if (!message.mentions.length) return null;

  const parts: React.ReactNode[] = [];

  message.mentions.forEach((m, i) => {
    parts.push(
      <Chip
        key={m.userId + i}
        label={`@${m.name}`}
        size="small"
        variant="outlined"
        sx={{
          typography: 'caption',
          border: 'none',
          fontWeight: 'bold',
          color: (theme) =>
            theme.palette.mode === 'dark'
              ? theme.vars.palette.info.light
              : theme.vars.palette.info.main,
          backgroundColor: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.05),
        }}
      />
    );
  });

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        color: 'transparent',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        mt: 0.5,
        gap: 0.5,
      }}
    >
      {parts}
    </Box>
  );
}
