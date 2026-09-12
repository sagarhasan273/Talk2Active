import React, { useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/EditOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import {
  Box,
  Chip,
  Menu,
  Fade,
  Stack,
  Button,
  Dialog,
  Tooltip,
  MenuItem,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  DialogContent,
} from '@mui/material';

import { RoomCardParticipant } from './room-card-participant';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface RoomParticipantEntry {
  user: any;
  isHost: boolean;
  joinedAt?: string;
}

export interface RoomParticipantsDialogProps {
  open: boolean;
  onClose: () => void;
  room: any;
  allUsers: RoomParticipantEntry[];
  isFull: boolean;
  /** true when the viewer is the room's creator/host — unlocks management actions */
  isHost: boolean;
  onJoinRoom: (room: any) => void;
  onImageClick: (src: string, name: string) => void;
  /** called with the participant's user id when the host removes them */
  onRemoveParticipant?: (userId: string) => void;
  /** called with the participant's user id when the host transfers hosting to them */
  onTransferHost?: (userId: string) => void;
  /** shown as an edit button in the header when the viewer owns this room */
  onEditRoom?: (room: any) => void;
}

const participantId = (entry: RoomParticipantEntry): string | undefined =>
  entry.user?.id || entry.user?.userId;

/* ------------------------------------------------------------------ */
/*  Per-participant management menu (host mode only)                   */
/* ------------------------------------------------------------------ */

interface ParticipantActionsProps {
  entry: RoomParticipantEntry;
  onRemove?: (userId: string) => void;
  onTransferHost?: (userId: string) => void;
}

const ParticipantActions = ({ entry, onRemove, onTransferHost }: ParticipantActionsProps) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const id = participantId(entry);
  if (!id) return null;

  const close = () => setAnchor(null);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          position: 'absolute',
          top: -4,
          right: -4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.shadows[1],
          '&:hover': { bgcolor: 'background.neutral' },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {onTransferHost && (
          <MenuItem
            onClick={() => {
              onTransferHost(id);
              close();
            }}
          >
            <ListItemIcon>
              <SwapHorizIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Make host</ListItemText>
          </MenuItem>
        )}
        {onRemove && (
          <MenuItem
            onClick={() => {
              onRemove(id);
              close();
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <PersonRemoveIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>Remove from room</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Dialog                                                              */
/* ------------------------------------------------------------------ */

export const RoomParticipantsDialog = ({
  open,
  onClose,
  room,
  allUsers,
  isFull,
  isHost,
  onJoinRoom,
  onImageClick,
  onRemoveParticipant,
  onTransferHost,
  onEditRoom,
}: RoomParticipantsDialogProps) => {
  const dedupedUsers = allUsers.filter(
    (entry, index, self) =>
      index === self.findIndex((e) => participantId(e) === participantId(entry))
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 1, bgcolor: 'background.paper', backgroundImage: 'none' },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {room?.topic || 'Untitled room'}
            </Typography>
            {isHost && (
              <Chip
                label="You're hosting"
                size="small"
                color="primary"
                sx={{ height: 20, fontSize: 10.5, fontWeight: 700 }}
              />
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {dedupedUsers.length} {dedupedUsers.length === 1 ? 'person' : 'people'} in this room
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
          {isHost && onEditRoom && (
            <Tooltip title="Edit room details">
              <IconButton
                size="small"
                onClick={() => onEditRoom(room)}
                sx={{ color: 'text.secondary' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <DialogContent sx={{ p: 2.5, pt: 2 }}>
        {room?.welcome_message && (
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            {room.welcome_message}
          </Typography>
        )}

        {!isHost && (
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 2 }}>
            <Tooltip title="Only the host who created this room can manage participants">
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Viewing only — you&apos;re not the host of this room.
              </Typography>
            </Tooltip>
          </Stack>
        )}

        {dedupedUsers.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            No participants yet
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              gap: 0.5,
            }}
          >
            {dedupedUsers.map((entry, i) => {
              const id = participantId(entry);
              const canManage = isHost && !entry.isHost && Boolean(id);

              return (
                <Box key={id || i} sx={{ position: 'relative' }}>
                  <RoomCardParticipant
                    user={{ ...entry.user, verified: entry.user?.verified ?? false }}
                    isHost={entry.isHost}
                    onImageClick={onImageClick}
                  />
                  {canManage && (
                    <ParticipantActions
                      entry={entry}
                      onRemove={onRemoveParticipant}
                      onTransferHost={onTransferHost}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          disabled={isFull}
          onClick={() => {
            onClose();
            onJoinRoom(room);
          }}
          sx={{ mt: 2.5, borderRadius: 1, py: 1, fontWeight: 700, textTransform: 'none' }}
        >
          {isFull ? 'Room full' : 'Join Room'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
