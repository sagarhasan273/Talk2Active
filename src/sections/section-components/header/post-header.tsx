import { Box, Link, Stack, Avatar, Button, Typography } from '@mui/material';

import { maxLine } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { Label, labelClasses } from 'src/components/label';

import type { PostHeaderProps } from './types';

export function PostHeader({ item }: PostHeaderProps) {
  return (
    <Box
      sx={{
        mt: 1.5,
        px: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, auto)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 1,
        [`& .${labelClasses.root}`]: {
          typography: 'caption',
          color: 'text.secondary',
        },
      }}
    >
      <Stack direction="row" alignItems="flex-end" gap={0.5}>
        <Avatar alt={item.alt} src={item.photoUrl} />
        <Stack>
          <Button
            disableRipple
            sx={{
              height: 20,
              width: 'fit-content',
              '&:hover': {
                background: 'transparent',
              },
            }}
          >
            <Typography variant="subtitle2">{item.userName}</Typography>
          </Button>
          <Label
            sx={{ background: 'transparent', alignItems: 'end', height: 20 }}
            startIcon={<Iconify width={10} icon="solar:clock-circle-outline" />}
          >
            {item.time}
          </Label>
        </Stack>
      </Stack>

      <Link
        variant="body2"
        color="inherit"
        underline="none"
        sx={(theme) => ({
          color: 'text.secondary',
          userSelect: 'text',
          ...maxLine({ line: 2, persistent: theme.typography.subtitle2 }),
          gridColumn: 'span 2 / span 2',
        })}
      >
        {item.caption}
      </Link>
    </Box>
  );
}
