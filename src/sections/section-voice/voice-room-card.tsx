import type { RoomResponse } from 'src/types/type-chat';

import React, { useState, useEffect } from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Avatar, Button, Typography, AvatarGroup } from '@mui/material';

import { useSocketContext } from 'src/core/contexts/socket-context';

type VoiceRoomCardProps = {
  roomData: RoomResponse;
  onJoinRoom: (room: RoomResponse) => void;
};

const VoiceRoomCard = ({ roomData, onJoinRoom }: VoiceRoomCardProps) => {
  const { on, off } = useSocketContext();

  const [room, setRoom] = useState<RoomResponse>(roomData);

  useEffect(() => {
    const handleBroadcastNewRoom = (data: any) => {
      if (room.id === data?.joinInfo?.roomId) {
        setRoom((prev) => {
          const newRoom = {
            ...prev,
            currentParticipants: [
              ...prev.currentParticipants,
              { user: data.joinInfo.participant, joinedAt: new Date() },
            ],
          };
          return newRoom;
        });
      }
      if (room.id === data?.leaveInfo?.roomId) {
        setRoom((prev) => {
          const newRoom = {
            ...prev,
            currentParticipants: prev?.currentParticipants?.filter(
              (participant) => participant?.user?.id === data.leaveInfo.participant.userId
            ),
          };
          return newRoom;
        });
      }
    };

    off('room-updated-with-participant', handleBroadcastNewRoom);
    on('room-updated-with-participant', handleBroadcastNewRoom);

    return () => off('room-updated-with-participant', handleBroadcastNewRoom);
  }, [on, off, room.id]);

  return (
    <Box
      sx={{
        maxWidth: 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderRadius: 1,
        padding: 2,
        textAlign: 'center',
        position: 'relative',
        // background: 'rgba(255, 255, 255, 0.1)', // Transparency
        // backdropFilter: 'blur(15px)', // Glass effect
        // border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'text.primary',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="body2" noWrap sx={{ color: 'text.primary', fontWeight: 500 }}>
          {room.name}
        </Typography>
        <LockIcon fontSize="small" sx={{ opacity: 0.7 }} />
      </Box>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'left',
          color: 'text.primary',
          gap: 1,
          mb: 3,
        }}
      >
        <Typography variant="caption" noWrap sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {room.description}
        </Typography>
      </Box>

      {/* User Presence Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'text.primary',
          gap: 3,
          mb: 3,
        }}
      >
        {/* Host Avatar */}
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={room.host.profilePhoto}
            sx={{
              width: 100,
              height: 100,
              border: (theme) => `3px solid ${theme.palette.primary.main}`,
              boxShadow: (theme) => `0 0 15px ${theme.palette.primary.main}`,
            }}
          />
          <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
            {room.host.name}
          </Typography>
        </Box>

        {/* Participant Group */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AvatarGroup max={2}>
            {room.currentParticipants.map((participant) => (
              <Avatar key={participant?.user?.id} src={participant?.user?.profilePhoto} />
            ))}
          </AvatarGroup>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            +{room.currentParticipants.length} online
          </Typography>
        </Box>
      </Box>

      {/* Join Button */}
      <Button
        variant="contained"
        sx={{
          borderRadius: 2,
          py: 0,
          px: 3,
          fontSize: '1rem',
          textTransform: 'none',
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${
              theme.palette.primary.dark
            } 100%)`,
          // boxShadow: (theme) => `0 4px 5px ${theme.palette.primary.main}`,
          '&:hover': {
            background: (theme) =>
              `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          },
        }}
        onClick={() => onJoinRoom(room)}
      >
        Join Room
      </Button>
    </Box>
  );
};
export default VoiceRoomCard;
