// src/sections/section-voice/voice-room-card/room-list-card-dialog.tsx

import { useState } from 'react';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Fade,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { RoomParticipantType } from '@/types/type-room';
import { RoomCardParticipant } from './room-list-card-participant';

export type RoomDialogSize = 'xs' | 'sm' | 'md';

export interface RoomParticipantsDialogProps {
  open: boolean;
  onClose: () => void;
  room: any;
  allUsers: RoomParticipantType[];
  isFull?: boolean;
  isHost: boolean;
  size?: RoomDialogSize;
  onJoinRoom?: (room: any) => void;
  onParticipantClick: (user: any) => void;
  onRemoveParticipant?: (roomId: string, userId: string) => void;
  onTransferHost?: (roomId: string, userId: string) => void;
  onEditRoom?: (room: any) => void;
}

const participantId = (entry: RoomParticipantType): string | undefined =>
  entry?.userId;

export const RoomParticipantsDialog = ({
  open,
  onClose,
  room,
  allUsers,
  isFull = false,
  isHost,
  size = 'xs',
  onJoinRoom,
  onParticipantClick,
  onRemoveParticipant,
  onTransferHost,
  onEditRoom,
}: RoomParticipantsDialogProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [anchor, setAnchor] = useState<{ el: HTMLElement; id: string } | null>(null);

  const dedupedUsers = Array.from(
    new Map(allUsers.map((user) => [participantId(user), user])).values()
  );

  const getGridColumns = () => {
    switch (size) {
      case 'md':
        return { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' };
      case 'sm':
        return { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' };
      case 'xs':
      default:
        return 'repeat(2, 1fr)';
    }
  };

  const getMaxHeight = () => {
    switch (size) {
      case 'md':
        return 520;
      case 'sm':
        return 500;
      case 'xs':
      default:
        return 420;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      maxWidth={size}
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: isDark ? '#181c26' : '#ffffff',
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
          boxShadow: isDark
            ? '0 24px 48px -12px rgba(0, 0, 0, 0.65)'
            : '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: size === 'md' ? 3 : 2.5 },
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          bgcolor: isDark ? 'transparent' : '#f8fafc',
          borderBottom: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h6"
            fontWeight={800}
            noWrap
            sx={{
              color: isDark ? 'text.primary' : '#0f172a',
              fontSize: { xs: '1rem', sm: size === 'md' ? '1.25rem' : '1.05rem' },
              lineHeight: 1.2,
            }}
          >
            {room?.topic || 'Untitled room'}
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
            {isHost && (
              <Chip
                label="Host"
                size="small"
                color="warning"
                sx={{
                  height: 18,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              />
            )}
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'text.secondary' : '#64748b', fontWeight: 600 }}
            >
              {dedupedUsers.length} {dedupedUsers.length === 1 ? 'speaker' : 'speakers'} on stage
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          {isHost && onEditRoom && (
            <Tooltip title="Room settings">
              <IconButton
                size="small"
                onClick={() => onEditRoom(room)}
                sx={{
                  borderRadius: 1,
                  bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                }}
              >
                <EditRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, sm: size === 'md' ? 3 : 2.5 }, pb: { xs: 2.5, sm: 3 } }}>
        {room?.welcome_message && (
          <Box
            sx={{
              p: 1.25,
              mb: 2,
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'text.secondary' : '#475569',
                fontStyle: 'italic',
                display: 'block',
              }}
            >
              &ldquo;{room.welcome_message}&rdquo;
            </Typography>
          </Box>
        )}

        {dedupedUsers.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'text.disabled', textAlign: 'center', py: 4 }}
          >
            Stage is empty
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: getGridColumns(),
              gap: { xs: 1.25, sm: 1.5 },
              maxHeight: getMaxHeight(),
              overflowY: 'auto',
              p: 0.5,
              scrollbarWidth: 'thin',
              '&::-webkit-scrollbar': { width: 5 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.divider, 0.4),
                borderRadius: 1,
              },
            }}
          >
            {dedupedUsers.map((entry, i) => {
              const id = participantId(entry);
              const canManage = isHost && !entry.isHost && Boolean(id);

              return (
                <Box key={id || i} sx={{ position: 'relative' }}>
                  <RoomCardParticipant
                    user={{ ...entry, verified: entry?.verified ?? false }}
                    isHost={entry.isHost}
                    onParticipantClick={onParticipantClick}
                  />

                  {canManage && (
                    <IconButton
                      size="small"
                      onClick={(e) => setAnchor({ el: e.currentTarget, id: id! })}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        zIndex: 4,
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: isDark ? '#181c26' : '#ffffff',
                        border: '1px solid',
                        borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
                        boxShadow: theme.shadows[2],
                      }}
                    >
                      <MoreVertRoundedIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {onJoinRoom && (
          <Button
            variant="contained"
            disableElevation
            fullWidth
            disabled={isFull}
            onClick={() => {
              onClose();
              onJoinRoom(room);
            }}
            sx={{
              mt: 2.5,
              height: 42,
              borderRadius: 1,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
              },
            }}
          >
            {isFull ? 'Room Full' : 'Join Stage'}
          </Button>
        )}
      </DialogContent>

      {/* Host Action Popover Menu */}
      <Menu
        anchorEl={anchor?.el}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: 1,
            minWidth: 160,
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          },
        }}
      >
        {onTransferHost && (
          <MenuItem
            onClick={() => {
              if (anchor?.id) onTransferHost(room.roomId, anchor.id);
              setAnchor(null);
            }}
          >
            <ListItemIcon>
              <SwapHorizRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'caption', fontWeight: 700 }}>
              Make Host
            </ListItemText>
          </MenuItem>
        )}
        {onRemoveParticipant && (
          <MenuItem
            onClick={() => {
              if (anchor?.id) onRemoveParticipant(room.roomId, anchor.id);
              setAnchor(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <PersonRemoveRoundedIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'caption', fontWeight: 700 }}>
              Remove
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Dialog>
  );
};

export default RoomParticipantsDialog;
