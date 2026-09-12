import React, { useState, useEffect, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { DisabledByDefaultRounded } from '@mui/icons-material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Chip,
  Fade,
  Stack,
  alpha,
  Button,
  Dialog,
  useTheme,
  IconButton,
  Typography,
  AvatarGroup,
  DialogContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fgetLanguageName } from 'src/utils/helper';

import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

import { getLevelColor } from './styles';
import { ImageLightbox } from './image-lightbox';
import { RoomCardParticipant } from './room-card-participant';

import type { VoiceRoomCardProps } from './types';

export const VoiceRoomCard = ({ roomData, onJoinRoom }: VoiceRoomCardProps) => {
  const theme = useTheme();
  const { on, off } = useSocketContext();
  const [room, setRoom] = useState(roomData);
  const participantsOpen = useBoolean();
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);

  // Keep internal state in sync if prop changes from parent
  useEffect(() => {
    setRoom(roomData);
  }, [roomData]);

  const handleBroadcastNewRoom = useCallback((data: any) => {
    if (data?.type === 'transfer-host') {
      setRoom((prev) => {
        if (prev.id !== data?.roomId) return prev;
        return { ...prev, host: data?.host || prev.host };
      });
      return;
    }

    if (data?.joinInfo?.roomId) {
      setRoom((prev) => {
        if (prev.id !== data.joinInfo.roomId) return prev;
        const newParticipant = data.joinInfo.participant;

        // Prevent duplicate entries in participant list
        const exists = (prev.currentParticipants || []).some(
          (p) => (p.user?.id || p.user?.userId) === (newParticipant?.id || newParticipant?.userId)
        );
        if (exists) return prev;

        return {
          ...prev,
          currentParticipants: [
            ...(prev.currentParticipants || []),
            { user: newParticipant, joinedAt: new Date().toISOString() },
          ],
        };
      });
    }

    if (data?.leaveInfo?.roomId) {
      setRoom((prev) => {
        if (prev.id !== data.leaveInfo.roomId) return prev;
        const targetId = data.leaveInfo.participant?.userId || data.leaveInfo.participant?.id;

        return {
          ...prev,
          currentParticipants: (prev.currentParticipants || []).filter(
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
  const currentParticipants = room?.currentParticipants || [];

  const allUsers = currentParticipants.map((p) => ({
    ...p,
    isHost: Boolean(hostId && (p.user?.id === hostId || p.user?.userId === hostId)),
  }));

  const max = room?.maxParticipants ?? 0;
  const isFull = allUsers.length >= max;
  const levelColor = getLevelColor(room?.level);

  const openLightbox = (src: string, name: string) => {
    participantsOpen.onFalse();
    setLightbox({ src, name });
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

      {/* Participants dialog */}
      <Dialog
        open={participantsOpen.value}
        onClose={participantsOpen.onFalse}
        TransitionComponent={Fade}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, bgcolor: 'background.paper', backgroundImage: 'none' },
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
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {room?.topic || 'Untitled room'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {allUsers.length} {allUsers.length === 1 ? 'person' : 'people'} in this room
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={participantsOpen.onFalse}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 2.5, pt: 2 }}>
          {room?.welcome_message && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              {room.welcome_message}
            </Typography>
          )}

          {allUsers.length === 0 ? (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}
            >
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
              {allUsers
                .filter(
                  (entry, index, self) =>
                    index ===
                    self.findIndex(
                      (e) =>
                        (e.user?.id || e.user?.userId) === (entry.user?.id || entry.user?.userId)
                    )
                )
                .map((entry, i) => (
                  <RoomCardParticipant
                    key={entry.user?.id || entry.user?.userId || i}
                    user={{ ...entry.user, verified: entry.user?.verified ?? false }}
                    isHost={entry.isHost}
                    onImageClick={openLightbox}
                  />
                ))}
            </Box>
          )}

          <Button
            variant="contained"
            fullWidth
            disabled={isFull}
            onClick={() => {
              participantsOpen.onFalse();
              onJoinRoom(room);
            }}
            sx={{ mt: 2.5, borderRadius: 1.5, py: 1, fontWeight: 700, textTransform: 'none' }}
          >
            {isFull ? 'Channel full' : 'Join channel'}
          </Button>
        </DialogContent>
      </Dialog>

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
