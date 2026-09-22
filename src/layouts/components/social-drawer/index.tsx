import type { IconButtonProps } from '@mui/material/IconButton';

import Diversity2Icon from '@mui/icons-material/Diversity2';
import { Badge, Box, CircularProgress } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import { useCredentials, useMessagesTools } from 'src/core/slices';
import { useBoolean } from 'src/hooks/use-boolean';

import SocialChat from '@/sections/section-common/social-chat';

// ----------------------------------------------------------------------

export type SocialDrawerProps = IconButtonProps;

export function SocialDrawer({ sx, ...other }: SocialDrawerProps) {
  const drawer = useBoolean();
  const { isUnreadIndividualMessage } = useMessagesTools();

  const { user, friends, followers, following } = useCredentials();
  const currentUserId = user?.userId || '';


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
        {!friends.length && !followers.length && !following.length ? (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress size={26} />
          </Box>
        ) : (
          <SocialChat
            friends={friends}
            followers={followers}
            following={following}
            currentUserId={currentUserId}
            currentUserName={user.name}
            isLoading={false}
            onClose={drawer.onFalse}
          />
        )}
      </Drawer>
    </>
  );
}
