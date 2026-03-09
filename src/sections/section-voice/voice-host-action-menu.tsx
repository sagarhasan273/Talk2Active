import type { UserType } from 'src/types/type-user';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { useTheme } from '@mui/material/styles';
import BlockIcon from '@mui/icons-material/Block';
import MicOffIcon from '@mui/icons-material/MicOff';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import {
  Box,
  Menu,
  alpha,
  Divider,
  Tooltip,
  MenuItem,
  Typography,
  IconButton,
  ListItemIcon,
} from '@mui/material';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

export type HostActionType = 'mute' | 'kick' | 'block-mic';

type Props = {
  targetSocketId: string;
  targetUserId: string;
  targetName: string;
  targetProfilePhoto?: string | null;
  targetAccountType?: UserType['accountType'];
  targetVerified?: boolean;
  onAction?: (action: HostActionType, targetSocketId: string) => void;
};

export function HostActionsMenu({
  targetSocketId,
  targetUserId,
  targetName,
  targetProfilePhoto,
  targetAccountType,
  targetVerified,
  onAction,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;

  const { room } = useRoomTools();
  const { emit, socket } = useSocketContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirming, setConfirming] = useState<HostActionType | null>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setConfirming(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setConfirming(null);
  };

  const handleAction = (action: HostActionType) => {
    if (confirming !== action) {
      setConfirming(action);
      return;
    }
    switch (action) {
      case 'mute':
        emit('host-force-mute', {
          roomId: room.id,
          targetSocketId,
          targetUserId,
          hostSocketId: socket?.id,
        });
        break;
      case 'kick':
        emit('host-kick-user', {
          roomId: room.id,
          targetSocketId,
          targetUserId,
          hostSocketId: socket?.id,
        });
        break;
      case 'block-mic':
        emit('host-block-mic', {
          roomId: room.id,
          targetSocketId,
          targetUserId,
          hostSocketId: socket?.id,
          permanent: true,
        });
        break;
      default:
        break;
    }
    onAction?.(action, targetSocketId);
    handleClose();
  };

  const actions = [
    {
      id: 'mute' as HostActionType,
      label: 'Force Mute',
      confirmLabel: 'Confirm Mute',
      icon: <MicOffIcon fontSize="small" />,
      color: theme.palette.warning.main,
      desc: 'Mute their mic (they can unmute)',
    },
    {
      id: 'block-mic' as HostActionType,
      label: 'Block Microphone',
      confirmLabel: 'Confirm Block',
      icon: <VolumeOffIcon fontSize="small" />,
      color: theme.palette.error.light,
      desc: 'Permanently silence until allowed',
    },
    {
      id: 'kick' as HostActionType,
      label: 'Kick from Room',
      confirmLabel: 'Confirm Kick',
      icon: <ExitToAppIcon fontSize="small" />,
      color: theme.palette.error.main,
      desc: 'Remove them from the room',
    },
  ];

  return (
    <>
      <Tooltip title="Host actions" arrow placement="top">
        <IconButton
          size="small"
          onClick={handleOpen}
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            color: isDark ? alpha('#fff', 0.4) : alpha('#000', 0.3),
            '&:hover': { bgcolor: alpha(primary, 0.12), color: primary },
          }}
        >
          <MoreVertIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            width: 222,
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? '#18191f' : '#fff',
            boxShadow: `0 12px 36px ${alpha('#000', isDark ? 0.5 : 0.14)}`,
            overflow: 'hidden',
            p: 0,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <AvatarUser
            avatarUrl={targetProfilePhoto ?? null}
            name={targetName}
            accountType={targetAccountType}
            verified={targetVerified}
            sx={{ width: 30, height: 30 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              noWrap
              sx={{ color: 'text.primary', display: 'block', fontSize: '0.75rem' }}
            >
              {targetName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.62rem' }}>
              Host controls
            </Typography>
          </Box>
          <Box
            sx={{
              ml: 'auto',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 0.35,
              bgcolor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              borderRadius: '7px',
              px: 0.65,
              py: 0.2,
            }}
          >
            <BlockIcon sx={{ fontSize: 9, color: theme.palette.error.main }} />
            <Typography
              sx={{
                fontSize: '0.55rem',
                fontWeight: 800,
                color: theme.palette.error.main,
                letterSpacing: 0.5,
              }}
            >
              HOST
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ py: 0.5 }}>
          {actions.map((action, i) => {
            const isConf = confirming === action.id;
            return (
              <React.Fragment key={action.id}>
                {i === 2 && <Divider sx={{ my: 0.4, mx: 1.25, borderColor: 'divider' }} />}
                <MenuItem
                  onClick={() => handleAction(action.id)}
                  sx={{
                    mx: 0.6,
                    borderRadius: '9px',
                    px: 1.25,
                    py: 0.75,
                    bgcolor: isConf ? alpha(action.color, 0.1) : 'transparent',
                    border: '1px solid',
                    borderColor: isConf ? alpha(action.color, 0.28) : 'transparent',
                    transition: 'all 0.14s',
                    '&:hover': {
                      bgcolor: alpha(action.color, 0.1),
                      borderColor: alpha(action.color, 0.22),
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: action.color, minWidth: 30 }}>
                    {action.icon}
                  </ListItemIcon>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight={isConf ? 800 : 600}
                      sx={{ color: action.color, fontSize: '0.78rem' }}
                    >
                      {isConf ? action.confirmLabel : action.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isConf ? alpha(action.color, 0.7) : 'text.disabled',
                        fontSize: '0.62rem',
                        display: 'block',
                      }}
                    >
                      {isConf ? 'Click again to confirm' : action.desc}
                    </Typography>
                  </Box>
                </MenuItem>
              </React.Fragment>
            );
          })}
        </Box>
      </Menu>
    </>
  );
}
