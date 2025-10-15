import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';

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
          p: 1,
          borderRadius: 1,
          color: 'primary.main',
          border: `2px solid`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...sx,
        }}
        {...other}
      >
        <Iconify icon="tabler:social" />
      </IconButton>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420, p: 1 } }}
      >
        {renderHead}
        {children}
      </Drawer>
    </>
  );
}
