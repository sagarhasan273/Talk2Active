import { Paper, styled, IconButton } from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Message as MessageIcon,
  CallEnd as CallEndIcon,
} from '@mui/icons-material';

import { VoiceRoomStatusButton } from './voice-room-status-button';

const ControlsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

type VoiceRoomControllerFooterProps = {
  isMicMuted: boolean;
  onClickMic: () => void;
  onStatusChange: (status: string) => void;
  onClickLeaveRoom: () => void;
};

export function VoiceRoomControllerFooter({
  isMicMuted,
  onClickMic,
  onStatusChange,
  onClickLeaveRoom,
}: VoiceRoomControllerFooterProps) {
  return (
    <ControlsPaper elevation={0}>
      <IconButton
        color={isMicMuted ? 'error' : 'primary'}
        onClick={onClickMic}
        sx={{
          p: 1,
          borderRadius: 1,
          border: `2px solid`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isMicMuted ? 'error.main' : 'primary.main',
          '&:hover': {
            color: isMicMuted ? 'error.main' : 'primary.dark',
          },
        }}
      >
        {isMicMuted ? <MicOffIcon fontSize="small" /> : <MicIcon fontSize="small" />}
      </IconButton>

      <VoiceRoomStatusButton onStatusChange={onStatusChange} />

      <IconButton
        onClick={() => {}}
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
      >
        <MessageIcon fontSize="small" />
      </IconButton>
      <IconButton
        color="error"
        onClick={onClickLeaveRoom}
        sx={{
          p: 1,
          borderRadius: 1,
          border: `2px solid`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'error.main',
          '&:hover': {
            color: 'error.dark',
          },
        }}
      >
        <CallEndIcon fontSize="small" />
      </IconButton>
    </ControlsPaper>
  );
}
