import type { IconButtonProps } from '@mui/material/IconButton';

// ----------------------------------------------------------------------

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Badge } from '@mui/material';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { Chat as ChatIcon } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useRoomTools } from 'src/core/slices/slice-room';

import { Iconify } from 'src/components/iconify';

import { CtrlBtn } from '../buttons';
import { VoiceRoomMessageGroupHeader } from './voice-room-message-group-header';

export type VoiceRoomMessageGroupDrawerProps = IconButtonProps & {
  children?: React.ReactNode;
  title?: string;
  openDrawer?: UseBooleanReturn;
};

export function VoiceRoomMessageGroupDrawer({
  children,
  title,
  openDrawer,
  sx,
  ...other
}: VoiceRoomMessageGroupDrawerProps) {
  const drawer = useBoolean();

  const { isUnreadRoomMessage, participants } = useRoomTools();

  const renderHead = (
    <Stack direction="row" alignItems="center" sx={{ py: 1, pl: 2.5, pr: 1, minHeight: 68 }}>
      <VoiceRoomMessageGroupHeader
        roomName="Group messages"
        users={[
          ...(Object.values(participants)?.map((participant) => ({
            _id: participant?.socketId,
            name: participant.name,
            profilePhoto: participant.profilePhoto,
            verified: participant.verified,
          })) || []),
        ]}
      />

      <IconButton
        onClick={openDrawer?.onFalse || drawer.onFalse}
        sx={{ ml: 'auto', display: { xs: 'inline-flex' } }}
      >
        <Iconify icon="mingcute:close-line" />
      </IconButton>
    </Stack>
  );

  return (
    <>
      {!openDrawer && (
        <CtrlBtn tooltip={title || 'Group messages'} onClick={drawer.onTrue}>
          <Badge
            badgeContent="!"
            color="error"
            invisible={!isUnreadRoomMessage}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: 10,
                minWidth: 12,
                height: 14,
                borderRadius: '50%',
                top: -4,
                right: -4,
              },
            }}
          >
            <ChatIcon sx={{ fontSize: 18 }} />
          </Badge>
        </CtrlBtn>
      )}

      <Drawer
        open={openDrawer?.value || drawer.value}
        onClose={openDrawer?.onFalse || drawer.onFalse}
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
