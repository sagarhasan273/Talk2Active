// src/sections/section-voice/voice-room-card/room-list-card-main.tsx

import { useEffect, useMemo, useRef, useState } from 'react';

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
import { useCredentials } from '@/core/slices';
import { useBoolean } from '@/hooks/use-boolean';
import UserDisplayer, { type UserDisplayerProfile } from '@/sections/section-common/user-displayer';
import { RoomType } from '@/types/type-room';
import { UserPlus } from 'lucide-react';
import { fgetLanguageName } from 'src/utils/helper';
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

/**
 * Calculates the largest possible avatar diameter that fits inside
 * the actual measured width & height of the stage container.
 * Enforces max 2 rows, up to 6 items per row (12 max total pods).
 */
const computeOptimalStageScale = (width: number, height: number, count: number) => {
  if (!width || !height || count <= 0) {
    return {
      size: 56,
      fontSize: 14,
      gapPx: 10,
      badgeSize: 15,
      verifiedIconSize: 12,
      pillFontSize: '0.58rem',
      plusIconSize: 16,
    };
  }

  const pillAllowance = 10; // Extra vertical room for the bottom follower pill
  let bestSize = 42;
  let bestGap = 4;

  // If count <= 6, we can test 1 row or 2 rows. If count > 6, we must use 2 rows (max 6 per row).
  const minRows = count > 6 ? 2 : 1;
  const maxRows = count === 1 ? 1 : 2;

  for (let rows = minRows; rows <= maxRows; rows += 1) {
    const cols = Math.min(6, Math.ceil(count / rows));
    const gap = cols <= 3 ? 14 : cols <= 4 ? 10 : 8;

    const maxW = (width - gap * (cols - 1) - 8) / cols;
    const maxH = (height - gap * (rows - 1) - rows * pillAllowance) / rows;

    const candidateSize = Math.floor(Math.min(maxW, maxH));
    if (candidateSize > bestSize) {
      bestSize = candidateSize;
      bestGap = gap;
    }
  }

  // Clamp between a readable minimum (28px) and single-row max height (88px)
  const size = Math.max(28, Math.min(bestSize, 92));

  return {
    size,
    fontSize: Math.max(10, Math.round(size * 0.25)),
    gapPx: bestGap,
    badgeSize: Math.max(12, Math.round(size * 0.26)),
    verifiedIconSize: Math.max(10, Math.round(size * 0.22)),
    pillFontSize: size >= 56 ? '0.62rem' : size >= 42 ? '0.56rem' : '0.50rem',
    plusIconSize: Math.max(13, Math.round(size * 0.32)),
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

  // Measure actual available width & height of the stage area
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageBounds, setStageBounds] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateBounds = () => {
      setStageBounds({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };

    updateBounds();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setStageBounds({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hostId = roomData?.host?.userId;
  const participants = roomData?.participants || [];
  const allUsers = participants.map((p) => ({
    ...p,
    isHost: Boolean(hostId && (p?.userId === hostId || (p as any)?.userId === hostId)),
  }));

  const max = roomData?.max_participants ?? 5;
  const isFull = allUsers.length >= max && max > 0;
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

  // Available seats
  const availableSpace = Math.max(0, max - allUsers.length);

  const MAX_STAGE_PODS = 12;
  const totalSlots = allUsers.length + availableSpace;
  const hasOverflow = totalSlots > MAX_STAGE_PODS;
  const maxDirectSlots = hasOverflow ? MAX_STAGE_PODS - 1 : MAX_STAGE_PODS; // 11 if overflow, 12 otherwise

  const visibleSpeakers = allUsers.slice(0, maxDirectSlots);
  const remainingDirectSlots = Math.max(0, maxDirectSlots - visibleSpeakers.length);
  const visibleEmptySlotsCount = Math.min(availableSpace, remainingDirectSlots);

  const overflowCount = hasOverflow ? totalSlots - maxDirectSlots : 0;
  const totalItemsInStage =
    visibleSpeakers.length + visibleEmptySlotsCount + (overflowCount > 0 ? 1 : 0);

  const scale = useMemo(
    () => computeOptimalStageScale(stageBounds.width, stageBounds.height, totalItemsInStage),
    [stageBounds.width, stageBounds.height, totalItemsInStage]
  );

  const openUserProfile = (rawUser: any) => {
    const targetUser = rawUser?.user || rawUser;

    setSelectedUser({
      userId: targetUser?.userId || targetUser?.id,
      name: targetUser?.name || 'User',
      username: targetUser?.username,
      genUserId: targetUser?.genUserId,
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

  const sxCard = {
    height: 296,
    minHeight: 280,
    maxHeight: 296,
    width: '100%',
    minWidth: 0,
    maxWidth: { xs: '100%', sm: 1, md: 520 },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxSizing: 'border-box',
    overflow: 'hidden',
  };

  return (
    <>
      <Paper
        onClick={participantsOpen.onTrue}
        elevation={0}
        sx={[
          {
            p: 2,
            borderRadius: 1,
            position: 'relative',
            cursor: 'pointer',
            userSelect: 'none',
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: alpha(theme.palette.primary.main, isDark ? 0.45 : 0.4),
            },
            ...sxCard,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {/* 1. Top Tag & Status Row + Room Topic */}
        <Box sx={{ flexShrink: 0, minWidth: 0 }}>
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
                      height: 20,
                      borderRadius: 0.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
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
                    height: 20,
                    transform: 'none !important',
                    borderRadius: 0.5,
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
                  px: 0.5,
                  borderRadius: 0.5,
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
            my: 1,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
            flexShrink: 0,
            minWidth: 0,
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
              flexShrink: 0,
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>
              {allUsers.length}/{max}
            </Typography>
          </Box>
        </Box>

        {/* 3. Dynamic Stage Area: Max 2 rows (up to 6 per row = 12 pods max) */}
        <Box
          ref={stageRef}
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            minWidth: 0,
            px: 0.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            gap: `${scale.gapPx}px`,
            overflow: 'hidden',
          }}
        >
          {/* Active Speakers (up to 11 if overflow, or 12 if exact fit) */}
          {visibleSpeakers.map((speaker, i) => {
            const followingCount = speaker?.following_count ?? 0;

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
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'scale(1.06)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: scale.size,
                      height: scale.size,
                      borderRadius: '50%',
                      position: 'relative',
                      transition: 'width 0.15s ease, height 0.15s ease',
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

                    {speaker?.verified && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -1,
                          left: -1,
                          width: scale.badgeSize,
                          height: scale.badgeSize,
                          borderRadius: '50%',
                          bgcolor: isDark ? '#181c26' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                        }}
                      >
                        <VerifiedRoundedIcon
                          sx={{ fontSize: scale.verifiedIconSize, color: 'info.main' }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Followers / Likes Pill */}
                  <Box
                    sx={{
                      mt: -0.75,
                      px: 0.6,
                      py: 0.1,
                      borderRadius: 0.75,
                      bgcolor: isDark ? '#252b3b' : '#f1f5f9',
                      border: '1px solid',
                      borderColor: isDark ? alpha('#fff', 0.12) : '#cbd5e1',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.25,
                      zIndex: 3,
                    }}
                  >
                    <FavoriteRoundedIcon sx={{ fontSize: 9.5, color: 'primary.main' }} />
                    <Typography
                      noWrap
                      sx={{
                        fontSize: scale.pillFontSize,
                        fontWeight: 700,
                        color: isDark ? 'grey.100' : '#1e293b',
                        lineHeight: 1,
                      }}
                    >
                      {formatCompactCount(followingCount)}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            );
          })}

          {/* Loop Individual Empty Seat Pods */}
          {Array.from({ length: visibleEmptySlotsCount }).map((_, idx) => (
            <Tooltip
              key={`empty-slot-${idx}`}
              title="Available seat • Click to join stage"
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
                }}
              >
                <Box
                  className="empty-pod-circle"
                  sx={{
                    width: scale.size,
                    height: scale.size,
                    borderRadius: '50%',
                    border: '1.7px dashed',
                    borderColor: theme.palette.grey[500],
                    bgcolor: 'background.default',
                    color: theme.palette.grey[500],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <UserPlus
                    size={scale.plusIconSize}
                    strokeWidth={1.75}
                    style={{ opacity: 0.75 }}
                  />
                </Box>
              </Box>
            </Tooltip>
          ))}

          {/* 12th Pod: Overflow Counter Slot (if total participants + empty seats > 12) */}
          {overflowCount > 0 && (
            <Tooltip
              title={`${overflowCount} more ${allUsers.length > maxDirectSlots ? 'participants & seats' : 'available seats'
                }`}
              arrow
              placement="top"
            >
              <Box
                onClick={participantsOpen.onTrue}
                sx={{
                  width: scale.size,
                  height: scale.size,
                  borderRadius: '50%',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: scale.fontSize - 1,
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.06)',
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                +{overflowCount}
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* 4. Footer Action Button */}
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
            flexShrink: 0,
            mt: 1,
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
        allUsers={allUsers}
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
