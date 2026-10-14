// src/sections/section-voice/voice-room-card/room-list-card-main.tsx

import { useState } from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  type SxProps,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

import { Label, ParticipantLevel } from '@/components/label';
import UserDisplayer, { type UserDisplayerProfile } from '@/sections/section-common/user-displayer';
import { useBoolean } from 'src/hooks/use-boolean';
import { fgetLanguageName } from 'src/utils/helper';

import { useCredentials } from '@/core/slices';
import { RoomType } from '@/types/type-room';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { RoomParticipantsDialog } from './room-list-card-dialog';

type VoiceRoomCardProps = {
  roomData: RoomType;
  onJoinRoom: (room: RoomType) => void;
};

type VoiceRoomCardExtendedProps = VoiceRoomCardProps & {
  currentUserId?: string;
  onRemoveParticipant?: (roomId: string, userId: string) => void;
  onTransferHost?: (roomId: string, userId: string) => void;
  onRoomUpdated?: (roomData: any) => void;
  onToggleFollow?: (userId: string, isFollowing: boolean) => void;
  onBlockUser?: (userId: string) => void;
  onReportUser?: (userId: string, reason: string) => void;
  sx?: SxProps;
};

const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
];

const getSpeakerGradient = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SPEAKER_GRADIENTS[Math.abs(hash) % SPEAKER_GRADIENTS.length];
};

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatCompactCount = (num: number = 0): string =>
  new Intl.NumberFormat('en', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num);

// Gradually decreases avatar size as more users join the room
const getStageAvatarScale = (totalItemsShown: number) => {
  if (totalItemsShown <= 2) {
    return {
      size: 60,
      fontSize: 17,
      gap: 2.25,
      badgeSize: 18,
      micIconSize: 10.5,
      pillFontSize: '0.65rem',
      plusIconSize: 18,
    };
  }
  if (totalItemsShown === 3) {
    return {
      size: 52,
      fontSize: 15,
      gap: 1.75,
      badgeSize: 17,
      micIconSize: 10,
      pillFontSize: '0.62rem',
      plusIconSize: 16,
    };
  }
  if (totalItemsShown === 4) {
    return {
      size: 46,
      fontSize: 13.5,
      gap: 1.35,
      badgeSize: 15,
      micIconSize: 9,
      pillFontSize: '0.58rem',
      plusIconSize: 15,
    };
  }
  if (totalItemsShown === 5) {
    return {
      size: 40,
      fontSize: 12,
      gap: 1,
      badgeSize: 14,
      micIconSize: 8.5,
      pillFontSize: '0.55rem',
      plusIconSize: 14,
    };
  }
  // 6+ items: compact mode so all avatars fit on one centered line
  return {
    size: 34,
    fontSize: 11,
    gap: 0.75,
    badgeSize: 13,
    micIconSize: 8,
    pillFontSize: '0.52rem',
    plusIconSize: 12,
  };
};

export const VoiceRoomCard = ({
  roomData,
  onJoinRoom,
  currentUserId,
  onRemoveParticipant,
  onTransferHost,
  onRoomUpdated,
  onToggleFollow,
  onBlockUser,
  onReportUser,
  sx,
}: VoiceRoomCardExtendedProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { checkIfFollowing, checkIfBlocked } = useCredentials();

  const [selectedUser, setSelectedUser] = useState<UserDisplayerProfile | null>(null);

  const participantsOpen = useBoolean();
  const editRoomOpen = useBoolean();
  const openUserDisplayer = useBoolean();

  const hostId = roomData?.host?.userId;
  const participants = roomData?.participants || [];
  const allUsers = participants.map((p) => ({
    ...p,
    isHost: Boolean(hostId && (p?.userId === hostId || (p as any)?.userId === hostId)),
  }));

  const max = roomData?.max_participants ?? 5;
  const isFull = allUsers.length >= max && max > 0;
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

  // Calculate remaining available seats
  const availableSpace = Math.max(0, max - allUsers.length);
  const showAvailableSlot = availableSpace > 0;

  // Show up to 5 joined speakers (or 6 if full) so they fit cleanly alongside the 1 available-space pod
  const maxVisibleSpeakers = showAvailableSlot ? 5 : 6;
  const visibleSpeakers = allUsers.slice(0, maxVisibleSpeakers);
  const overflowCount = Math.max(0, allUsers.length - visibleSpeakers.length);

  // Total items in the row determines how big or small the avatars are
  const totalItemsInRow =
    visibleSpeakers.length + (showAvailableSlot ? 1 : 0) + (overflowCount > 0 ? 1 : 0);
  const scale = getStageAvatarScale(totalItemsInRow);

  const openUserProfile = (rawUser: any) => {
    const targetUser = rawUser?.user || rawUser;

    setSelectedUser({
      userId: targetUser?.userId || targetUser?.id,
      name: targetUser?.name || 'User',
      username: targetUser?.username,
      profilePhoto: targetUser?.profilePhoto,
      verified: targetUser?.verified,
      accountType: targetUser?.accountType,
      bio: targetUser?.bio,
      follower_count: targetUser?.follower_count,
      following_count: targetUser?.following_count,
      friend_count: targetUser?.friend_count,
      isFollowing: checkIfFollowing(targetUser?.userId),
      isBlocked: checkIfBlocked(targetUser?.userId),
    });
    openUserDisplayer.onTrue();
  };

  const handleAvatarClick = (e: React.MouseEvent, rawParticipant: any) => {
    e.stopPropagation();
    openUserProfile(rawParticipant);
  };

  return (
    <>
      <Paper
        onClick={participantsOpen.onTrue}
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 1,
          position: 'relative',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: isDark ? '#181c26' : '#ffffff',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, isDark ? 0.45 : 0.4),
          },
          ...sx,
        }}
      >
        {/* 1. Top Tag & Status Row + Room Topic */}
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            mb={1.1}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ minWidth: 0, overflow: 'hidden' }}
            >
              {(roomData.languages?.length ? roomData.languages : ['en'])
                .slice(0, 2)
                .map((lang, index) => (
                  <Label
                    key={`${lang}-${index}`}
                    label={lang !== 'unknown' ? fgetLanguageName(lang) : 'Any'}
                    size="small"
                    color="primary"
                    sx={{
                      borderRadius: 1,
                      bgcolor: isDark
                        ? alpha(theme.palette.primary.main, 0.14)
                        : alpha(theme.palette.primary.main, 0.08),
                      fontWeight: 700,
                    }}
                  />
                ))}

              {roomData?.level && (
                <ParticipantLevel
                  value={roomData.level}
                  label={roomData.level}
                  showEmoji
                  size="small"
                  sx={{
                    transform: 'none !important',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                    bgcolor: isDark ? 'transparent' : '#f8fafc',
                    color: isDark ? theme.palette.text.secondary : '#475569',
                  }}
                />
              )}
            </Stack>

            {roomData?.isActive && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 0.85,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: isDark ? alpha(theme.palette.success.main, 0.12) : '#ecfdf5',
                  border: '1px solid',
                  borderColor: isDark ? alpha(theme.palette.success.main, 0.25) : '#a7f3d0',
                  color: isDark ? 'success.main' : '#059669',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                    '@keyframes pulseLive': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.4 },
                    },
                    animation: 'pulseLive 1.8s infinite ease-in-out',
                  }}
                />
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                  Live
                </Typography>
              </Box>
            )}
          </Stack>

          {/* Room Topic Heading */}
          <Tooltip title={roomData?.topic || 'Untitled room'} placement="top-start" arrow>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              noWrap
              sx={{
                color: isDark ? 'text.primary' : '#0f172a',
                fontSize: '1.025rem',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              {roomData?.topic || 'Untitled room'}
            </Typography>
          </Tooltip>
        </Box>

        {/* 2. Host Identity Box */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            p: 1,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
          }}
        >
          <Box
            onClick={(e) => handleAvatarClick(e, roomData?.host)}
            sx={{
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
              '&:hover': { transform: 'scale(1.06)' },
            }}
          >
            <Avatar
              src={roomData?.host?.profilePhoto || undefined}
              alt={roomData?.host?.name || 'Unknown'}
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                fontWeight: 800,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              {(roomData?.host?.name || 'U').charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              fontWeight={700}
              noWrap
              sx={{ color: isDark ? 'text.primary' : '#0f172a', lineHeight: 1.2, fontSize: 13 }}
            >
              {roomData?.host?.name || 'Unknown Host'}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? 'text.secondary' : '#64748b',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              Host
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.85,
              py: 0.3,
              borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.06) : '#ffffff',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
              color: isDark ? 'text.secondary' : '#475569',
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>
              {allUsers.length}/{max}
            </Typography>
          </Box>
        </Box>

        {/* 3. Centered & Responsive Joined User Profiles + Single Available Space Pod */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={scale.gap}
          sx={{
            width: '100%',
            minHeight: 72,
            py: 0.5,
            px: 0.5,
            overflow: 'hidden',
          }}
        >
          {visibleSpeakers.map((speaker, i) => {
            const followingCount = speaker?.following_count ?? 0;
            const ringGradient = getSpeakerGradient(speaker?.userId || speaker?.name || String(i));

            return (
              <Tooltip
                key={speaker?.userId || i}
                title={`${speaker?.name || 'Speaker'} • Click to view profile`}
                arrow
                placement="top"
              >
                <Box
                  onClick={(e) => handleAvatarClick(e, speaker)}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 1,
                    minWidth: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      '& .speaker-ring': {
                        boxShadow: `0 6px 16px -2px ${alpha(theme.palette.primary.main, 0.5)}`,
                      },
                    },
                  }}
                >
                  {/* Gradient Aura Ring around Responsive Speaker Avatar */}
                  <Box
                    className="speaker-ring"
                    sx={{
                      width: scale.size,
                      height: scale.size,
                      borderRadius: '50%',
                      p: '2px',
                      background: ringGradient,
                      transition: 'all 0.22s ease',
                      position: 'relative',
                      flexShrink: 0,
                    }}
                  >
                    <Avatar
                      src={speaker?.profilePhoto || undefined}
                      alt={speaker?.name}
                      sx={{
                        width: '100%',
                        height: '100%',
                        fontSize: scale.fontSize,
                        fontWeight: 800,
                        bgcolor: isDark ? '#252b3b' : '#f1f5f9',
                        color: isDark ? '#fff' : '#0f172a',
                        border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
                      }}
                    >
                      {getInitials(speaker?.name)}
                    </Avatar>

                    {/* Verified Check on Top-Left */}
                    {speaker?.verified && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -1,
                          left: -1,
                          width: scale.badgeSize - 1,
                          height: scale.badgeSize - 1,
                          borderRadius: '50%',
                          bgcolor: isDark ? '#181c26' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                        }}
                      >
                        <VerifiedRoundedIcon
                          sx={{ fontSize: scale.micIconSize + 3, color: 'info.main' }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Following Count Pill Anchored at Bottom (No Name) */}
                  <Box
                    sx={{
                      mt: -0.85,
                      px: 0.7,
                      py: 0.15,
                      borderRadius: 0.75,
                      bgcolor: isDark ? '#252b3b' : '#f1f5f9',
                      border: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.12) : '#cbd5e1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.35,
                      zIndex: 3,
                      boxShadow: isDark
                        ? '0 2px 6px rgba(0,0,0,0.4)'
                        : '0 1px 3px rgba(15,23,42,0.08)',
                    }}
                  >
                    <FavoriteRoundedIcon sx={{ fontSize: 8.5, color: 'primary.main' }} />
                    <Typography
                      noWrap
                      sx={{
                        fontSize: scale.pillFontSize,
                        fontWeight: 700,
                        color: isDark ? 'grey.100' : '#1e293b',
                        lineHeight: 1.1,
                      }}
                    >
                      {formatCompactCount(followingCount)}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            );
          })}

          {/* Extra Speakers Overflow Badge (if room has > 5 joined speakers) */}
          {overflowCount > 0 && (
            <Box
              sx={{
                width: scale.size - 4,
                height: scale.size - 4,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.14),
                border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 11,
                flexShrink: 0,
              }}
            >
              +{overflowCount}
            </Box>
          )}

          {/* Single Dashed Pod Showing Available Space Count */}
          {showAvailableSlot && (
            <Tooltip
              title={`${availableSpace} ${availableSpace === 1 ? 'seat' : 'seats'} available • Click to join stage`}
              arrow
              placement="top"
            >
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFull) onJoinRoom(roomData);
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flexShrink: 0,
                  cursor: 'pointer',
                  '&:hover .empty-pod-circle': {
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    transform: 'scale(1.06)',
                  },
                  '&:hover .empty-pod-label': {
                    color: 'primary.main',
                    borderColor: alpha(theme.palette.primary.main, 0.4),
                  },
                }}
              >
                <Box
                  className="empty-pod-circle"
                  sx={{
                    width: scale.size,
                    height: scale.size,
                    borderRadius: '50%',
                    border: '1.5px dashed',
                    borderColor: isDark ? alpha('#fff', 0.22) : '#cbd5e1',
                    bgcolor: isDark ? alpha('#fff', 0.025) : '#f8fafc',
                    color: isDark ? 'text.secondary' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: scale.plusIconSize, mr: -0.25 }} />
                  <Typography
                    sx={{
                      fontSize: scale.fontSize - 2,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    {availableSpace}
                  </Typography>
                </Box>

                <Box
                  className="empty-pod-label"
                  sx={{
                    mt: -0.85,
                    px: 0.65,
                    py: 0.15,
                    borderRadius: 0.75,
                    bgcolor: isDark ? '#181c26' : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                    zIndex: 2,
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontSize: scale.pillFontSize,
                      fontWeight: 700,
                      color: isDark ? 'text.secondary' : '#64748b',
                      lineHeight: 1.1,
                    }}
                  >
                    {availableSpace} left
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          )}
        </Stack>

        {/* 4. Footer Action Button (borderRadius: 1) */}
        <Button
          fullWidth
          size="medium"
          variant={isFull ? 'outlined' : 'contained'}
          disabled={isFull}
          color={isFull ? 'inherit' : 'primary'}
          disableElevation
          onClick={(e) => {
            e.stopPropagation();
            onJoinRoom(roomData);
          }}
          endIcon={
            isFull ? (
              <BlockRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
            )
          }
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
            },
          }}
        >
          {isFull ? 'Room Full' : 'Want to talk? Join the room!'}
        </Button>
      </Paper>

      {/* User Displayer Profile Modal */}
      {selectedUser && (
        <UserDisplayer
          open={openUserDisplayer.value}
          user={selectedUser}
          currentUserId={currentUserId}
          onClose={openUserDisplayer.onFalse}
          onToggleFollow={onToggleFollow}
          onBlockUser={onBlockUser}
          onReportUser={onReportUser}
        />
      )}

      {/* Participants Dialog */}
      <RoomParticipantsDialog
        open={participantsOpen.value}
        onClose={participantsOpen.onFalse}
        room={roomData}
        allUsers={allUsers as any}
        isFull={isFull}
        isHost={isHost}
        onJoinRoom={onJoinRoom}
        onParticipantClick={(participant) => {
          participantsOpen.onFalse();
          openUserProfile(participant);
        }}
        onRemoveParticipant={isHost ? onRemoveParticipant : undefined}
        onTransferHost={isHost ? onTransferHost : undefined}
        onEditRoom={
          isHost
            ? () => {
              participantsOpen.onFalse();
              editRoomOpen.onTrue();
            }
            : undefined
        }
      />

      {isHost && editRoomOpen.value && (
        <VoiceModalCreateRoom
          open={editRoomOpen.value}
          onClose={editRoomOpen.onFalse}
          onCreateRoom={() => { }}
          currentRoom={roomData}
        />
      )}
    </>
  );
};

export default VoiceRoomCard;
