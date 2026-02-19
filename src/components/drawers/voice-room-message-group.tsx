import type { IconButtonProps } from '@mui/material/IconButton';

// ----------------------------------------------------------------------

import { useSelector } from 'react-redux';

import { Badge } from '@mui/material';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { Message as MessageIcon } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { selectAccount } from 'src/core/slices';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { Iconify } from 'src/components/iconify';

import { VoiceRoomMessageGroupHeader } from './voice-room-message-group-header';

export type VoiceRoomMessageGroupDrawerProps = IconButtonProps & {
  children?: React.ReactNode;
};

export function VoiceRoomMessageGroupDrawer({
  children,
  sx,
  ...other
}: VoiceRoomMessageGroupDrawerProps) {
  const drawer = useBoolean();

  const user = useSelector(selectAccount);
  const { isUnreadChatRoomMessage, participants } = useRoomTools();
  const { socket } = useSocketContext();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <VoiceRoomMessageGroupHeader
        roomName="Group messages"
        users={[
          { _id: socket?.id || '$1', name: user.name, profilePhoto: user.profilePhoto },
          ...(Object.values(participants)?.map((participant) => ({
            _id: participant?.socketId,
            name: participant.name,
            profilePhoto: participant.profilePhoto,
          })) || []),
        ]}
      />

      <IconButton onClick={drawer.onFalse} sx={{ ml: 'auto', display: { xs: 'inline-flex' } }}>
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <>
      <IconButton
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
        <Badge
          badgeContent="!"
          color="error"
          invisible={!isUnreadChatRoomMessage}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: 12,
              minWidth: 16,
              height: 16,
              borderRadius: '50%',
              top: -6,
              right: -6,
            },
          }}
        >
          <MessageIcon fontSize="small" />
        </Badge>
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
