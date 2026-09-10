import type { IconButtonProps } from '@mui/material/IconButton';

import { Badge } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Diversity2Icon from '@mui/icons-material/Diversity2';

import { useBoolean } from 'src/hooks/use-boolean';

import { useMessagesTools } from 'src/core/slices';

import { useSocialSocketListeners } from './social-listeners';
import SocialChat from '../../../sections/section-common/social-chat';

// ----------------------------------------------------------------------

export type SocialDrawerProps = IconButtonProps;

export function SocialDrawer({ sx, ...other }: SocialDrawerProps) {
  const drawer = useBoolean();

  useSocialSocketListeners();

  const { isUnreadIndividualMessage } = useMessagesTools();

  return (
    <>
      <Badge
        color="error"
        badgeContent={isUnreadIndividualMessage}
        overlap="circular"
        sx={{
          pointerEvents: 'auto',
          '& .MuiBadge-badge': {
            fontSize: 10,
            height: 14,
            minWidth: 14,
            padding: '0 4px',
            transform: 'scale(0.9) translate(50%, -50%)',
          },
        }}
      >
        <IconButton
          onClick={() => {
            drawer.onTrue();
          }}
          size="small"
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            textTransform: 'none',
            fontSize: 14,
            borderRadius: 1,
            mr: 1,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <Diversity2Icon style={{ fontSize: 14, marginRight: 4 }} /> Social
        </IconButton>
      </Badge>

      <Drawer
        open={drawer.value}
        onClose={drawer.onFalse}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 1, maxWidth: 420 } }}
      >
        <SocialChat
          onClose={() => {
            drawer.onFalse();
          }}
        />
      </Drawer>
    </>
  );
}
