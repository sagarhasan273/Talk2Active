import type { RoomResponse } from 'src/types/type-chat';

import React, { useState, useEffect, useCallback } from 'react';

import { keyframes } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  Fade,
  Stack,
  alpha,
  Button,
  Dialog,
  useTheme,
  Backdrop,
  IconButton,
  Typography,
  AvatarGroup,
  DialogContent,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { fgetLanguageName } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

const gradientShift = keyframes`
  0% { background-position: 0% 50% }
  100% { background-position: 200% 50% }
`;

const glowPulse = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(25,118,210,0.4)) }
  50% { filter: drop-shadow(0 0 8px rgba(25,118,210,0.9)) }
  100% { filter: drop-shadow(0 0 2px rgba(25,118,210,0.4)) }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
`;

const LevelColor: Record<string, string> = {
  beginner: '#43e97b',
  intermediate: '#f9ca24',
  advanced: '#ff6b6b',
};

// ---------- types ----------

type Participant = {
  user: {
    id: string;
    name: string;
    profilePhoto: string | null;
    verified: boolean;
    accountType?: any;
    status?: string;
    username?: string;
  };
  joinedAt: string;
};

type VoiceRoomCardProps = {
  roomData: RoomResponse;
  onJoinRoom: (room: RoomResponse) => void;
};

// ---------- sub-components ----------

/** Full-screen image lightbox */
const ImageLightbox = ({
  src,
  name,
  onClose,
}: {
  src: string;
  name: string;
  onClose: () => void;
}) => (
  <Backdrop
    open
    onClick={onClose}
    sx={{
      zIndex: 2000,
      bgcolor: 'rgba(0,0,0,0.92)',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: -40,
          right: -8,
          color: 'white',
          bgcolor: alpha('#fff', 0.1),
          '&:hover': { bgcolor: alpha('#fff', 0.2) },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Box
        component="img"
        src={src}
        alt={name}
        sx={{
          width: { xs: 280, sm: 380, md: 440 },
          height: { xs: 280, sm: 380, md: 440 },
          objectFit: 'cover',
          borderRadius: 3,
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.12)',
        }}
      />
      <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 700, letterSpacing: 0.3 }}>
        {name}
      </Typography>
    </Box>
  </Backdrop>
);

/** Single participant tile inside the popup */
const ParticipantTile = ({
  user,
  isHost,
  onImageClick,
}: {
  user: Participant['user'];
  isHost?: boolean;
  onImageClick: (src: string, name: string) => void;
}) => {
  const theme = useTheme();

  const hasPhoto = user.verified ? Boolean(user.profilePhoto) : false;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        p: 1,
        borderRadius: 2,
        cursor: hasPhoto ? 'pointer' : 'default',
        transition: 'background 0.15s',
        '&:hover': hasPhoto
          ? {
              bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.06) : alpha('#000', 0.06),
            }
          : {},
      }}
      onClick={() => {
        if (hasPhoto) onImageClick(user.profilePhoto!, user.name);
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <AvatarUser
          avatarUrl={user.profilePhoto}
          name={user.name}
          verified={user.verified}
          accountType={user.accountType}
          sx={{ width: 64, height: 64 }}
        />
      </Box>
      <Typography
        variant="caption"
        fontWeight={800}
        noWrap
        sx={{
          mt: 1,
          px: 1,
          borderRadius: 0.5,
          maxWidth: 80,
          textAlign: 'center',
          position: 'relative',

          ...(user.accountType === 'supporter'
            ? {
                // 🌈 gradient text
                background: `linear-gradient(
              90deg,
              ${theme.palette.primary.light},
              ${theme.palette.primary.main},
              ${theme.palette.primary.dark},
              ${theme.palette.primary.light}
            )`,
                backgroundSize: '200% auto',

                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',

                // ✨ animation combo
                animation: `
            ${gradientShift} 4s linear infinite,
            ${glowPulse} 2s ease-in-out infinite
          `,

                // 💡 shimmer overlay
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(120deg, transparent 20%, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.25)}, transparent 80%)`,
                  backgroundSize: '200% 100%',
                  animation: `${shimmer} 2.5s linear infinite`,
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none',
                },
              }
            : {
                color: 'text.primary',
              }),
        }}
      >
        {user.accountType === 'supporter' ? user?.name : user?.name?.split(' ')[0]}
      </Typography>
      {isHost && (
        <Chip
          label="Host"
          size="small"
          sx={{
            height: 16,
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.8,
            bgcolor: alpha('#f9ca24', 0.15),
            color: '#f9ca24',
            border: '1px solid',
            borderColor: alpha('#f9ca24', 0.4),
            px: 0.25,
          }}
        />
      )}
      {hasPhoto && (
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 9 }}>
          tap to view
        </Typography>
      )}
    </Box>
  );
};

// ---------- main component ----------

const VoiceRoomCard = ({ roomData, onJoinRoom }: VoiceRoomCardProps) => {
  const theme = useTheme();
  const { on, off } = useSocketContext();
  const [room, setRoom] = useState<RoomResponse>(roomData);
  const participantsOpen = useBoolean();
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);

  const handleBroadcastNewRoom = useCallback(
    (data: any) => {
      if (data?.type === 'transfer-host' && room.id === data?.roomId) {
        setRoom((prev) => ({
          ...prev,
          host: data?.host || prev.host,
        }));
        return;
      }
      if (room.id === data?.joinInfo?.roomId) {
        setRoom((prev) => ({
          ...prev,
          currentParticipants: [
            ...prev.currentParticipants,
            { user: data.joinInfo.participant, joinedAt: new Date().toISOString() },
          ],
        }));
      }
      if (room.id === data?.leaveInfo?.roomId) {
        setRoom((prev) => ({
          ...prev,
          currentParticipants: [
            ...prev.currentParticipants.filter(
              (p) => ![p.user.userId, p.user.id].includes(data.leaveInfo.participant.userId)
            ),
          ],
        }));
      }
    },
    [room.id]
  );
  useEffect(() => {
    off('room-updated-with-participant', handleBroadcastNewRoom);
    on('room-updated-with-participant', handleBroadcastNewRoom);
    return () => off('room-updated-with-participant', handleBroadcastNewRoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, off, room.id]);

  const allUsers = [...room.currentParticipants.map((p) => ({ ...p, isHost: false }))];

  const max = room?.maxParticipants ?? 0;
  const isFull = allUsers.length >= max;
  const levelColor = LevelColor[room.level] ?? '#aaa';

  return (
    <>
      <Box
        onClick={() => participantsOpen.onTrue()}
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
          },
          maxWidth: {
            xs: 1,
            sm: 360,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between">
          {/* Title */}
          <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
            {room?.name || 'Untitled Room'}
          </Typography>

          {/* LIVE */}
          {room?.isActive && (
            <Typography
              variant="caption"
              sx={{
                color: 'success.main',
                fontWeight: 700,
                mb: 0.5,
                display: 'block',
              }}
            >
              ● LIVE
            </Typography>
          )}
        </Stack>
        {/* Description */}
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', mb: 1, display: 'block' }}
          noWrap
        >
          {room?.description || 'No description'}
        </Typography>

        {/* Host */}
        <Box
          sx={{
            my: 1.5,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 1,
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <AvatarUser
            avatarUrl={room?.host?.profilePhoto}
            name={room?.host?.name || 'Unknown'}
            verified={room?.host?.verified}
            accountType={room?.host?.accountType}
            sx={{ width: 52, height: 52 }}
          />
          <Stack direction="column" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
              {room?.host?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              @Host
            </Typography>
          </Stack>

          <Typography variant="caption" sx={{ color: 'text.secondary' }} />

          <Chip
            label={`${allUsers.length}/${max}`}
            size="small"
            sx={{
              ml: 'auto',
              height: 20,
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'capitalize',
              bgcolor: alpha(levelColor, 0.12),
              border: '1px solid',
              color: levelColor,
              borderColor: alpha(levelColor, 0.35),
              '&:hover': {
                bgcolor: alpha(levelColor, 0.12),
                color: levelColor,
                borderColor: alpha(levelColor, 0.35),
              },
              px: 0.5,
            }}
          />
        </Box>

        {/* Participants */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          {allUsers.length === 0 ? (
            <Typography
              variant="subtitle2"
              sx={{
                p: 2,
                borderRadius: 1,
                color: 'text.secondary',
                backgroundColor: 'background.neutral',
                flex: 1,
              }}
            >
              No participants yet
            </Typography>
          ) : (
            <AvatarGroup max={4} sx={{ gap: 1.5 }}>
              {allUsers.map((p, i) => (
                <AvatarUser
                  key={p?.user?.id || i}
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Tags */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip
              label={room.level}
              size="small"
              sx={{
                height: 20,
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'capitalize',
                bgcolor: alpha(levelColor, 0.12),
                border: '1px solid',
                color: levelColor,
                borderColor: alpha(levelColor, 0.35),
                '&:hover': {
                  bgcolor: alpha(levelColor, 0.12),
                  color: levelColor,
                  borderColor: alpha(levelColor, 0.35),
                },
                px: 0.5,
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {room.languages?.length ? (
                room.languages.map((lang) => (
                  <Chip
                    key={lang}
                    label={fgetLanguageName(lang)}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 1,
                      color: 'text.secondary',
                      borderColor: 'divider',
                    }}
                  />
                ))
              ) : (
                <Chip
                  label="Multiple Languages"
                  size="small"
                  sx={{ borderRadius: 1, height: 22 }}
                />
              )}
            </Box>
          </Box>

          {/* Join */}
          <Button
            size="small"
            variant="contained"
            disabled={isFull}
            onClick={(e) => {
              e.stopPropagation();
              onJoinRoom(room);
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            {isFull ? 'Full' : 'Join'}
          </Button>
        </Box>
      </Box>

      <Dialog
        open={participantsOpen.value}
        onClose={() => participantsOpen.onFalse()}
        TransitionComponent={Fade}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            overflow: 'hidden',
          },
        }}
      >
        {/* Dialog header */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              {room.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {allUsers.length} {allUsers.length === 1 ? 'person' : 'people'} in this room
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => participantsOpen.onFalse()}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 2.5, pt: 1, pb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 2 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 600 }}
            >
              {room.description}
            </Typography>
          </Box>
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
                    index === self.findIndex((e) => e.user.id === entry.user.id)
                )
                .map((entry, i) => (
                  <ParticipantTile
                    key={entry.user.id ?? i}
                    user={{
                      ...entry.user,
                      verified: entry.user.verified ?? false,
                    }}
                    isHost={entry.isHost}
                    onImageClick={(src, name) => {
                      participantsOpen.onFalse();
                      setLightbox({ src, name });
                    }}
                  />
                ))}
            </Box>
          )}

          {/* Join from popup too */}
          <Button
            variant="contained"
            fullWidth
            disabled={isFull}
            onClick={() => {
              participantsOpen.onFalse();
              onJoinRoom(room);
            }}
            sx={{
              mt: 2.5,
              borderRadius: 2,
              py: 1,
              fontWeight: 700,
              textTransform: 'none',
              background: isFull
                ? undefined
                : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: isFull ? 'none' : `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            {isFull ? 'Channel Full' : 'Join Channel'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Lightbox ── */}
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          name={lightbox.name}
          onClose={() => {
            setLightbox(null);
            participantsOpen.onTrue(); // reopen popup after lightbox closes
          }}
        />
      )}
    </>
  );
};

export default VoiceRoomCard;
