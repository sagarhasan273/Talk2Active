import type { IconButtonProps } from '@mui/material/IconButton';

// ----------------------------------------------------------------------

import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import { Badge, Tooltip } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Chat as ChatIcon } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useRoomTools } from 'src/core/slices/slice-room';

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

  const { isUnreadChatRoomMessage, participants } = useRoomTools();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 2, pl: 2.5, pr: 1, minHeight: 68 }}>
      <VoiceRoomMessageGroupHeader
        roomName="Group messages"
        users={[
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
      <Tooltip title="Group messages">
        <IconButton
          onClick={drawer.onTrue}
          size="small"
          sx={{ color: '#b5bac1', '&:hover': { color: '#5865f2' } }}
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
            <ChatIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

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
