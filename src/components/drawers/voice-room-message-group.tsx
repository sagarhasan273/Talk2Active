import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';

// ----------------------------------------------------------------------

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { Box, Chip, Typography } from '@mui/material';
import { SmartToy, Message as MessageIcon } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';

export type VoiceRoomMessageGroupDrawerProps = IconButtonProps & {
  children?: React.ReactNode;
};

export function VoiceRoomMessageGroupDrawer({
  children,
  sx,
  ...other
}: VoiceRoomMessageGroupDrawerProps) {
  const drawer = useBoolean();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Spanish Conversation Circle
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1,
          }}
        >
          <Chip
            icon={<Iconify icon="formkit:people" />}
            label="13"
            size="small"
            color="default"
            variant="outlined"
          />

          <Chip
            icon={<SmartToy />}
            label="AI Assistant"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      <IconButton onClick={drawer.onFalse} sx={{ ml: 'auto', display: { xs: 'inline-flex' } }}>
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
          p: 1,
          borderRadius: 1,
          border: `2px solid`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'primary.main',
          '&:hover': {
            color: 'primary.dark',
          },
        }}
        {...other}
      >
        <MessageIcon fontSize="small" />
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
