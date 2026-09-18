// src/sections/section-voice/voice-room-card/index.tsx

import { useEffect, useState } from 'react';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import {
  alpha,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';

import { AvatarUser } from 'src/components/avatar-user';
import { useBoolean } from 'src/hooks/use-boolean';
import { fgetLanguageName } from 'src/utils/helper';

import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { ImageLightbox } from './image-lightbox';
import { RoomParticipantsDialog } from './room-card-dialog';
import { getLevelColor, livePulse } from './styles';


import { Label, ParticipantLevel } from '@/components/label';
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
  const isDark = theme.palette.mode === 'dark';

  const [room, setRoom] = useState(roomData);
  const participantsOpen = useBoolean();
  const editRoomOpen = useBoolean();
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null);

  useEffect(() => {
    setRoom(roomData);
  }, [roomData]);

  const hostId = room?.host?.userId;
  const participants = room?.participants || [];
  const allUsers = participants.map((p) => ({
    ...p,
    isHost: Boolean(hostId && (p?.user?.userId === hostId || (p as any)?.userId === hostId)),
  }));

  const max = room?.max_participants ?? 0;
  const isFull = allUsers.length >= max && max > 0;
  const levelColor = getLevelColor(room?.level);
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

  return (
    <>
      <Paper
        onClick={participantsOpen.onTrue}
        elevation={0}
        sx={{
          height: 270,
          minHeight: 270,
          maxHeight: 270,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
          borderRadius: 1,
          position: 'relative',
          cursor: 'pointer',
          userSelect: 'none',
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.85) : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.07),
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isDark
            ? '0 4px 20px -2px rgba(0, 0, 0, 0.45)'
            : '0 4px 20px -2px rgba(145, 158, 171, 0.12)',
          '&:hover': {
            borderColor: alpha(levelColor, 0.45),
            boxShadow: `0 12px 32px -4px ${alpha(levelColor, 0.16)}`,
          },
        }}
      >
        {/* Top Tag & Status Row */}
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1.25}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0, overflow: 'hidden' }}>
              {(room.languages?.length ? room.languages : ['en'])
                .slice(0, 2)
                .map((lang, index) => (
                  <Label
                    key={`${lang}-${index}`}
                    label={lang !== 'unknown' ? fgetLanguageName(lang) : 'Any'}
                    size="small"
                    color='primary'
                    sx={{
                      borderRadius: 1,
                      bgcolor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                    }}
                  />
                ))}


              {room?.level && <ParticipantLevel
                value={room.level}
                label={room.level}
                showEmoji={true}
                size="small"
                sx={{
                  transform: 'none !important',
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  bgcolor: 'transparent',
                  color: theme.palette.text.secondary,
                  transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
                }}
              />}
            </Stack>

            {room?.isActive && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.85,
                  py: 0.2,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.12),
                  color: 'success.main',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    animation: `${livePulse} 1.8s infinite`,
                  }}
                />
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Live</Typography>
              </Box>
            )}
          </Stack>

          {/* Room Topic Heading */}
          <Tooltip title={room?.topic || 'Untitled room'} placement="top-start" arrow>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              noWrap
              sx={{
                color: 'text.primary',
                fontSize: '0.975rem',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {room?.topic || 'Untitled room'}
            </Typography>
          </Tooltip>
        </Box>

        {/* Host Identity Card */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1,
            borderRadius: 1.5,
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.04),
          }}
        >
          <AvatarUser
            avatarUrl={room?.host?.profilePhoto}
            name={room?.host?.name || 'Unknown'}
            verified={room?.host?.verified}
            accountType={room?.host?.accountType}
            sx={{ width: 40, height: 40 }}
          />

          <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'text.primary', lineHeight: 1.2 }}>
              {room?.host?.name || 'Unknown Host'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
              Host
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
              color: 'text.secondary',
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>
              {allUsers.length}/{max}
            </Typography>
          </Box>
        </Box>

        {/* Participants Presence Preview */}
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 32 }}>
          {allUsers.length === 0 ? (
            <Typography
              variant="caption"
              sx={{
                py: 0.6,
                px: 1,
                borderRadius: 1,
                color: 'text.disabled',
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
                width: '100%',
                textAlign: 'center',
              }}
            >
              Empty stage • Be the first to speak
            </Typography>
          ) : (
            <AvatarGroup
              max={5}
              sx={{
                '& .MuiAvatar-root': {
                  width: 30,
                  height: 30,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `2px solid ${isDark ? theme.palette.background.paper : '#fff'}`,
                },
              }}
            >
              {allUsers.map((p, i) => (
                <Avatar
                  key={p?.user?.userId || (p as any)?.userId || i}
                  src={p?.user?.profilePhoto || (p as any)?.profilePhoto}
                  alt={p?.user?.name || (p as any)?.name}
                >
                  {(p?.user?.name || (p as any)?.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </Box>

        {/* Footer Action Button */}
        <Button
          fullWidth
          size="small"
          variant={isFull ? 'outlined' : 'contained'}
          disabled={isFull}
          color={isFull ? 'inherit' : 'primary'}
          onClick={(e) => {
            e.stopPropagation();
            onJoinRoom(room);
          }}
          endIcon={isFull ? <BlockRoundedIcon sx={{ fontSize: 16 }} /> : <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            height: 38,
            borderRadius: 1.25,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: isFull ? 'none' : `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          {isFull ? 'Room Full' : 'Join Stage'}
        </Button>
      </Paper>

      {/* Participants Dialog */}
      <RoomParticipantsDialog
        open={participantsOpen.value}
        onClose={participantsOpen.onFalse}
        room={room}
        allUsers={allUsers as any}
        isFull={isFull}
        isHost={isHost}
        onJoinRoom={onJoinRoom}
        onImageClick={(src, name) => {
          participantsOpen.onFalse();
          setLightbox({ src, name });
        }}
        onRemoveParticipant={isHost ? onRemoveParticipant : undefined}
        onTransferHost={isHost ? onTransferHost : undefined}
        onEditRoom={isHost ? () => { participantsOpen.onFalse(); editRoomOpen.onTrue(); } : undefined}
      />

      {isHost && editRoomOpen.value && (
        <VoiceModalCreateRoom
          open={editRoomOpen.value}
          onClose={editRoomOpen.onFalse}
          onCreateRoom={(updated) => {
            setRoom((prev) => ({
              ...prev,
              ...updated,
              level: updated.level as typeof prev.level,
            }));
            onRoomUpdated?.(updated);
          }}
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

export default VoiceRoomCard;
