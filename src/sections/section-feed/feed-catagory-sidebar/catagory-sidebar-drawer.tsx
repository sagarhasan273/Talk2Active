import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { SvgIcon, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

export type CategorySidebarDrawerProps = IconButtonProps & {
  children?: React.ReactNode;
  sx?: {};
};

export function CategorySidebarDrawer({ children, sx, ...other }: CategorySidebarDrawerProps) {
  const drawer = useBoolean();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Spanish Conversation Circle
      </Typography>

      <IconButton
        onClick={drawer.onFalse}
        sx={{ ml: 'auto', display: { xs: 'inline-flex', sm: 'none' } }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        onClick={drawer.onTrue}
        sx={{
          width: 40,
          height: 40,
          color: 'common.white',
          backgroundColor: 'primary.main',
          ...sx,
        }}
        {...other}
      >
        <SvgIcon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="m9 4l2.5 5.5L17 12l-5.5 2.5L9 20l-2.5-5.5L1 12l5.5-2.5zm0 4.83L8 11l-2.17 1L8 13l1 2.17L10 13l2.17-1L10 11zM19 9l-1.26-2.74L15 5l2.74-1.25L19 1l1.25 2.75L23 5l-2.75 1.26zm0 14l-1.26-2.74L15 19l2.74-1.25L19 15l1.25 2.75L23 19l-2.75 1.26z"
            />
          </svg>
        </SvgIcon>
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        {renderHead}
        <Scrollbar>{children}</Scrollbar>
      </Drawer>
    </>
  );
}
