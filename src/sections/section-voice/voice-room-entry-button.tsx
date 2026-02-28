import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Badge, Avatar, Typography, ButtonBase, AvatarGroup } from '@mui/material';

import { AvatarUser } from 'src/components/avatar-user';

type VoiceRoomEntryButtonProps = {
  selected?: boolean;
  room: RoomResponse;
  onClick: (room: RoomResponse) => void;
};

const VoiceRoomEntryButton = ({ selected = false, room, onClick }: VoiceRoomEntryButtonProps) => {
  if (!room.id) return null;
  return (
    <ButtonBase
      onClick={() => onClick(room)}
      sx={{
        width: 1,
        height: 60,
        bgcolor: selected ? 'background.paper' : 'background.default',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        mb: 1,
        px: 1.5,
        gap: 1.5,
        textAlign: 'left',
        transition: 'all 0.2s ease',
        border: selected
          ? (theme) => `1px solid ${theme.palette.primary.main}`
          : '1px solid transparent',
        '&:hover': {
          bgcolor: 'background.paper',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      {/* Host Avatar with Language Badge */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Box
            sx={{
              bgcolor: selected ? 'background.paper' : 'background.default',
              borderRadius: '50%',
              p: 0.2,
              display: 'flex',
              border: selected
                ? (theme) => `1.5px solid ${theme.palette.primary.main}`
                : '1.5px solid #2b2d31',
            }}
          >
            <Typography
              sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 'bold', px: 0.3 }}
            >
              {room.languages?.[0]?.toUpperCase()}
            </Typography>
          </Box>
        }
      >
        <AvatarUser
          avatarUrl={room.host?.profilePhoto}
          verified={Boolean(room.host?.verified)}
          name={room.host?.name}
        />
      </Badge>

      {/* Room Text Info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.875rem' }}
          >
            {room.name}
          </Typography>
          <LockIcon sx={{ fontSize: 12, color: '#949ba4' }} />
        </Box>

        {/* Participants Sub-text */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
          <AvatarGroup
            max={3}
            sx={{
              '& .MuiAvatar-root': {
                width: 16,
                height: 16,
                fontSize: 8,
                border: '1px solid #2b2d31',
              },
            }}
          >
            {room?.currentParticipants?.map((participant) => (
              <Avatar key={participant.user.id} src={participant.user.profilePhoto} />
            ))}
          </AvatarGroup>
          <Typography sx={{ color: '#949ba4', fontSize: '0.75rem', ml: 1 }}>
            +{room?.currentParticipants?.length} online
          </Typography>
        </Box>
      </Box>

      {/* Live Indicator Dot */}
      <Box
        sx={{
          width: 8,
          height: 8,
          bgcolor: '#23a55a',
          borderRadius: '50%',
          boxShadow: '0 0 8px #23a55a',
        }}
      />
    </ButtonBase>
  );
};

export default VoiceRoomEntryButton;
