import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { SvgIcon, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type DiscoveryPanalDrawerProps = IconButtonProps & {
  children?: React.ReactNode;
};

export function DiscoveryPanalDrawer({ children, sx, ...other }: DiscoveryPanalDrawerProps) {
  const drawer = useBoolean();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Activities
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
        // whileTap="tap"
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
              d="M21 8c-1.45 0-2.26 1.44-1.93 2.51l-3.55 3.56c-.3-.09-.74-.09-1.04 0l-2.55-2.55C12.27 10.45 11.46 9 10 9c-1.45 0-2.27 1.44-1.93 2.52l-4.56 4.55C2.44 15.74 1 16.55 1 18c0 1.1.9 2 2 2c1.45 0 2.26-1.44 1.93-2.51l4.55-4.56c.3.09.74.09 1.04 0l2.55 2.55C12.73 16.55 13.54 18 15 18c1.45 0 2.27-1.44 1.93-2.52l3.56-3.55c1.07.33 2.51-.48 2.51-1.93c0-1.1-.9-2-2-2"
            />
            <path
              fill="currentColor"
              d="m15 9l.94-2.07L18 6l-2.06-.93L15 3l-.92 2.07L12 6l2.08.93zM3.5 11L4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9z"
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
        {children}
      </Drawer>
    </>
  );
}
