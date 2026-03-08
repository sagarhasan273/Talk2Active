import type { RoomResponse } from 'src/types/type-chat';

import React, { useState, useEffect, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Chip,
  Fade,
  alpha,
  Button,
  Dialog,
  Tooltip,
  useTheme,
  Backdrop,
  IconButton,
  Typography,
  AvatarGroup,
  DialogContent,
} from '@mui/material';

import { fgetLanguageName } from 'src/utils/helper';

import { varAlpha } from 'src/theme/styles';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

// ---------- helpers ----------

const RoomTypeIcon = ({ type }: { type: string }) => {
  const icons: Record<string, string> = {
    conversation: '💬',
    lecture: '🎙️',
    debate: '⚔️',
    study: '📚',
  };
  return <span style={{ fontSize: 13 }}>{icons[type] ?? '🔊'}</span>;
};

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
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? alpha('#fff', 0.06) : alpha('#000', 0.06),
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
        {/* Online dot */}
        {user.status && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: user.status === 'online' ? '#43e97b' : '#aaa',
              boxShadow: user.status === 'online' ? '0 0 6px #43e97b' : 'none',
              border: '2px solid',
              borderColor: 'background.paper',
              zIndex: 3,
            }}
          />
        )}
      </Box>
      <Typography
        variant="caption"
        fontWeight={700}
        noWrap
        sx={{ color: 'text.primary', maxWidth: 80, textAlign: 'center' }}
      >
        {user.name.split(' ')[0]}
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
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);

  const handleBroadcastNewRoom = useCallback(
    (data: any) => {
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
          currentParticipants: prev.currentParticipants.filter(
            (p) => p.user.id !== data.leaveInfo.participant.userId
          ),
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

  const spotsLeft = room.maxParticipants - room.currentParticipants.length;
  const isFull = spotsLeft <= 0;
  const capacityPct = Math.min((room.currentParticipants.length / room.maxParticipants) * 100, 100);
  const levelColor = LevelColor[room.level] ?? '#aaa';

  // Everyone shown in popup: host first, then participants
  const allUsers = [
    { user: { ...room.host, status: room.host.status }, joinedAt: '', isHost: true },
    ...room.currentParticipants.map((p) => ({ ...p, isHost: false })),
  ];

  return (
    <>
      <Box
        onClick={() => setParticipantsOpen(true)}
        sx={{
          width: 1,
          maxWidth: { xs: 1, sm: 360 },
          bgcolor: 'background.paper',
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
      >
        {/* Capacity bar */}
        <Box
          sx={{ height: 4, bgcolor: alpha(theme.palette.primary.main, 0.12), position: 'relative' }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${capacityPct}%`,
              background: isFull
                ? 'linear-gradient(90deg, #ff6b6b, #ff4444)'
                : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              transition: 'width 0.4s ease',
              borderRadius: '0 2px 2px 0',
            }}
          />
        </Box>

        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Row 1: Name + badges */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Tooltip title={room.name} arrow placement="top" enterDelay={400}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                noWrap
                sx={{ color: 'text.primary', flex: 1 }}
              >
                {room.name}
              </Typography>
            </Tooltip>
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              {room.isActive && (
                <Chip
                  label="LIVE"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.15),
                    color: varAlpha(theme.vars.palette.success.mainChannel, 1),
                    border: '1px solid',
                    borderColor: varAlpha(theme.vars.palette.success.mainChannel, 1),
                    px: 0.5,
                    '&:hover': {
                      bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.15),
                      borderColor: varAlpha(theme.vars.palette.success.mainChannel, 1),
                    },
                  }}
                />
              )}
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
            </Box>
          </Box>

          {/* Row 2: Type + description */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <RoomTypeIcon type={room.roomType} />
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'capitalize', fontWeight: 600 }}
            >
              {room.roomType}
            </Typography>
            <Typography variant="caption" sx={{ color: 'divider' }}>
              ·
            </Typography>
            <Tooltip title={room.description} arrow placement="top" enterDelay={400}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  cursor: 'help',
                }}
              >
                {room.description}
              </Typography>
            </Tooltip>
          </Box>

          {/* Row 3: Languages */}
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
              <Chip label="Multiple Languages" size="small" sx={{ borderRadius: 1, height: 22 }} />
            )}
          </Box>

          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mx: -0.5 }} />

          {/* Row 4: Host + participants */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <AvatarUser
                  avatarUrl={room.host.profilePhoto}
                  name={room.host.name}
                  verified={room.host.verified}
                  accountType={room.host.accountType}
                  sx={{ width: 44, height: 44 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 1,
                    right: 1,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    bgcolor: room.host.status === 'online' ? '#43e97b' : '#aaa',
                    boxShadow: room.host.status === 'online' ? '0 0 6px #43e97b' : 'none',
                    border: '2px solid',
                    borderColor: 'background.paper',
                    zIndex: 3,
                  }}
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  noWrap
                  sx={{ color: 'text.primary' }}
                >
                  {room.host.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}
                >
                  Host
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 0.25,
                flexShrink: 0,
              }}
            >
              <AvatarGroup
                max={3}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 28,
                    height: 28,
                    fontSize: 11,
                    border: '2px solid',
                    borderColor: 'background.paper',
                  },
                }}
              >
                {room.currentParticipants.map((p, i) => (
                  <AvatarUser
                    key={`${p.user.id}+${i}`}
                    avatarUrl={p.user.profilePhoto}
                    name={p.user.name}
                    verified={p.user.verified}
                    accountType={p.user.accountType}
                  />
                ))}
              </AvatarGroup>
              <Typography
                variant="caption"
                sx={{ color: isFull ? '#ff6b6b' : 'text.secondary', fontWeight: 600, fontSize: 11 }}
              >
                {room.currentParticipants.length}/{room.maxParticipants}{' '}
                {isFull ? '· Full' : `· ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
              </Typography>
            </Box>
          </Box>

          {/* Join button */}
          <Button
            variant="contained"
            fullWidth
            disabled={isFull}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // don't open popup
              onJoinRoom(room);
            }}
            sx={{
              mt: 0.5,
              borderRadius: 2,
              py: 1,
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              letterSpacing: 0.3,
              background: isFull
                ? undefined
                : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: isFull ? 'none' : `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
              '&:hover:not(:disabled)': {
                background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
              cursor: isFull ? 'not-allowed' : 'pointer',
            }}
          >
            {isFull ? 'Room Full' : 'Join Room'}
          </Button>
        </Box>
      </Box>

      {/* ── Participants Popup ── */}
      <Dialog
        open={participantsOpen}
        onClose={() => setParticipantsOpen(false)}
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
            onClick={() => setParticipantsOpen(false)}
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
                      setParticipantsOpen(false);
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
              setParticipantsOpen(false);
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
            {isFull ? 'Room Full' : 'Join Room'}
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
            setParticipantsOpen(true); // reopen popup after lightbox closes
          }}
        />
      )}
    </>
  );
};

export default VoiceRoomCard;
