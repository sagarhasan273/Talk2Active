import React, { useState, useEffect, useCallback } from 'react';

import { DisabledByDefaultRounded } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Chip, Stack, alpha, Button, useTheme, Typography, AvatarGroup } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fgetLanguageName } from 'src/utils/helper';

import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

import { getLevelColor } from './styles';
import { ImageLightbox } from './image-lightbox';
import { RoomParticipantsDialog } from './room-card-dialog';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';

import type { VoiceRoomCardProps } from './types';

type VoiceRoomCardExtendedProps = VoiceRoomCardProps & {
  currentUserId?: string;
  onRemoveParticipant?: (roomId: string, userId: string) => void;
  onTransferHost?: (roomId: string, userId: string) => void;
  onRoomUpdated?: (roomData: any) => void;
};

export const VoiceRoomCard = ({
  roomData,
  onJoinRoom,
  currentUserId,
  onRemoveParticipant,
  onTransferHost,
  onRoomUpdated,
}: VoiceRoomCardExtendedProps) => {
  const theme = useTheme();
  const { on, off } = useSocketContext();
  const [room, setRoom] = useState(roomData);
  const participantsOpen = useBoolean();
  const editRoomOpen = useBoolean();
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);

  // Keep internal state in sync if prop changes from parent
  useEffect(() => {
    setRoom(roomData);
  }, [roomData]);

  const handleBroadcastNewRoom = useCallback((data: any) => {
    if (data?.type === 'transfer-host') {
      setRoom((prev) => {
        if (prev.roomId !== data?.roomId) return prev;
        return { ...prev, host: data?.host || prev.host };
      });
      return;
    }

    if (data?.joinInfo?.roomId) {
      setRoom((prev) => {
        if (prev.roomId !== data.joinInfo.roomId) return prev;
        const newParticipant = data.joinInfo.participant;

        // Prevent duplicate entries in participant list
        const exists = (prev.participants || []).some(
          (p) => (p.user?.id || p.user?.userId) === (newParticipant?.id || newParticipant?.userId)
        );
        if (exists) return prev;

        return {
          ...prev,
          participants: [
            ...(prev.participants || []),
            { user: newParticipant, joinedAt: new Date().toISOString() },
          ],
        };
      });
    }

    if (data?.leaveInfo?.roomId) {
      setRoom((prev) => {
        if (prev.roomId !== data.leaveInfo.roomId) return prev;
        const targetId = data.leaveInfo.participant?.userId || data.leaveInfo.participant?.id;

        return {
          ...prev,
          participants: (prev.participants || []).filter(
            (p) => ![p.user?.userId, p.user?.id].includes(targetId)
          ),
        };
      });
    }
  }, []);

  useEffect(() => {
    on('room-updated-with-participant', handleBroadcastNewRoom);
    return () => off('room-updated-with-participant', handleBroadcastNewRoom);
  }, [on, off, handleBroadcastNewRoom]);

  // Derived Values
  const hostId = room?.host?.id || room?.host?.userId;
  const participants = room?.participants || [];

  const allUsers = participants.map((p) => ({
    ...p,
    isHost: Boolean(hostId && (p.user?.id === hostId || p.user?.userId === hostId)),
  }));

  const max = room?.max_participants ?? 0;
  const isFull = allUsers.length >= max;
  const levelColor = getLevelColor(room?.level);

  // The viewer only gets management controls in the dialog if they created this room
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

  const openLightbox = (src: string, name: string) => {
    participantsOpen.onFalse();
    setLightbox({ src, name });
  };

  const handleRemoveParticipant = (userId: string) => {
    onRemoveParticipant?.(room.roomId, userId);
    // Optimistically drop them from the local list; the socket broadcast
    // (leaveInfo) will reconcile this across all viewers.
    setRoom((prev) => ({
      ...prev,
      participants: (prev.participants || []).filter(
        (p) => ![p.user?.userId, p.user?.id].includes(userId)
      ),
    }));
  };

  const handleTransferHost = (userId: string) => {
    onTransferHost?.(room.roomId, userId);
  };

  const handleEditRoom = () => {
    participantsOpen.onFalse();
    editRoomOpen.onTrue();
  };

  const handleRoomUpdated = (updatedRoomData: any) => {
    setRoom((prev) => ({ ...prev, ...updatedRoomData }));
    onRoomUpdated?.(updatedRoomData);
  };

  return (
    <>
      <Box
        onClick={participantsOpen.onTrue}
        sx={{
          height: 260,
          minHeight: 240,
          maxHeight: 280,
          position: 'relative',
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          '&:hover': {
            borderColor: alpha(levelColor, 0.5),
            boxShadow: `0 2px 12px ${alpha(levelColor, 0.12)}`,
          },
        }}
      >
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            {(room.languages?.length ? room.languages : ['unknown', 'unknown'])
              .slice(0, 2)
              .map((language, index) => (
                <Chip
                  key={`${language}-${index}`}
                  label={language !== 'unknown' ? fgetLanguageName(language) : 'Unknown language'}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 1,
                  }}
                />
              ))}

            <Stack direction="row" alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: levelColor,
                }}
              />

              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: levelColor,
                  textTransform: 'capitalize',
                }}
              >
                {room?.level}
              </Typography>
            </Stack>
          </Stack>

          {room?.isActive && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ flexShrink: 0 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                }}
              />
              <Typography variant="caption" fontWeight={700} sx={{ color: 'success.main' }}>
                Live
              </Typography>
            </Stack>
          )}
        </Stack>

        <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'text.primary', my: 1 }}>
          {room?.topic || 'Untitled room'}
        </Typography>

        {/* Host */}
        <Box
          sx={{
            mb: 1.5,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.03) : alpha('#000', 0.02),
          }}
        >
          <AvatarUser
            avatarUrl={room?.host?.profilePhoto}
            name={room?.host?.name || 'Unknown'}
            verified={room?.host?.verified}
            accountType={room?.host?.accountType}
            sx={{ width: 48, height: 48 }}
          />
          <Stack direction="column" sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ color: 'text.primary' }}>
              {room?.host?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Hosting
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ ml: 'auto', color: 'text.secondary', flexShrink: 0 }}
          >
            {allUsers.length}/{max} joined
          </Typography>
        </Box>

        {/* Participants */}
        <Box sx={{ display: 'flex', alignItems: 'center', m: 1, minHeight: 40 }}>
          {allUsers.length === 0 ? (
            <Typography
              variant="body2"
              sx={{
                py: 1.25,
                px: 1.5,
                borderRadius: 1,
                color: 'text.secondary',
                bgcolor: 'background.neutral',
                flex: 1,
              }}
            >
              No participants yet
            </Typography>
          ) : (
            <AvatarGroup max={4} sx={{ gap: 1.5 }}>
              {allUsers.map((p, i) => (
                <AvatarUser
                  key={p?.user?.id || p?.user?.userId || i}
                  avatarUrl={p?.user?.profilePhoto}
                  name={p?.user?.name || 'User'}
                  verified={p?.user?.verified}
                  accountType={p?.user?.accountType}
                />
              ))}
            </AvatarGroup>
          )}
        </Box>

        {/* Footer */}
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" gap={1}>
          <Button
            size="small"
            variant="contained"
            disabled={isFull}
            onClick={(e) => {
              e.stopPropagation();
              onJoinRoom(room);
            }}
            endIcon={isFull ? <DisabledByDefaultRounded /> : <ArrowForwardIcon />}
            sx={{
              ml: 'auto',
              mt: 1.5,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 700,
              py: 2,
            }}
          >
            {isFull ? 'Full room' : 'Join room'}
          </Button>
        </Stack>
      </Box>

      {/* Participants dialog — read-only for guests, manageable for the host */}
      <RoomParticipantsDialog
        open={participantsOpen.value}
        onClose={participantsOpen.onFalse}
        room={room}
        allUsers={allUsers}
        isFull={isFull}
        isHost={isHost}
        onJoinRoom={onJoinRoom}
        onImageClick={openLightbox}
        onRemoveParticipant={isHost ? handleRemoveParticipant : undefined}
        onTransferHost={isHost ? handleTransferHost : undefined}
        onEditRoom={isHost ? handleEditRoom : undefined}
      />

      {isHost && editRoomOpen.value && (
        <VoiceModalCreateRoom
          open={editRoomOpen.value}
          onClose={editRoomOpen.onFalse}
          onCreateRoom={handleRoomUpdated}
          currentRoom={room as any}
        />
      )}

      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          name={lightbox.name}
          onClose={() => {
            setLightbox(null);
            participantsOpen.onTrue();
          }}
        />
      )}
    </>
  );
};
