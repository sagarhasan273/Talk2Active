// src/sections/section-voice/voice-room-card/room-list-card-main.tsx

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

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
  checkIfFollowing?: (userId: string) => boolean;
  checkIfBlocked?: (userId: string) => boolean;
  sx?: SxProps;
  index?: number;
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

const computeSingleRowStageLayout = (width: number, height: number, totalRequested: number) => {
  if (!width || !height || totalRequested <= 0) {
    return {
      maxCols: 5, size: 52, fontSize: 13, gapPx: 10, badgeSize: 15,
      verifiedIconSize: 12, pillFontSize: '0.58rem', plusIconSize: 16,
    };
  }

  const pillAllowance = 12;
  const minPodDiameter = 44;
  const gap = 10;

  const maxCols = Math.max(3, Math.floor((width - 8 + gap) / (minPodDiameter + gap)));
  const visibleCols = Math.min(totalRequested, maxCols);
  const dynamicGap = visibleCols <= 4 ? 14 : visibleCols <= 6 ? 10 : 8;

  const maxW = (width - dynamicGap * (visibleCols - 1) - 8) / visibleCols;
  const maxH = height - pillAllowance;

  const size = Math.max(38, Math.min(Math.floor(Math.min(maxW, maxH)), 76));

  return {
    maxCols, size, fontSize: Math.max(11, Math.round(size * 0.25)), gapPx: dynamicGap,
    badgeSize: Math.max(13, Math.round(size * 0.26)), verifiedIconSize: Math.max(10, Math.round(size * 0.22)),
    pillFontSize: size >= 56 ? '0.62rem' : size >= 44 ? '0.56rem' : '0.50rem', plusIconSize: Math.max(14, Math.round(size * 0.32)),
  };
};

const sxCardBase = {
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

const VoiceRoomCardComponent = ({
  roomData,
  onJoinRoom,
  currentUserId,
  onRemoveParticipant,
  onTransferHost,
  onToggleFollow,
  onBlockUser,
  onReportUser,
  checkIfFollowing,
  checkIfBlocked,
  index,
  sx,
}: VoiceRoomCardExtendedProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedUser, setSelectedUser] = useState<UserDisplayerProfile | null>(null);

  const participantsOpen = useBoolean();
  const editRoomOpen = useBoolean();
  const openUserDisplayer = useBoolean();

  // Reference storage to avoid stale closures during memoization
  const refs = useRef({
    onJoinRoom, onRemoveParticipant, onTransferHost, onToggleFollow, onBlockUser, onReportUser, checkIfFollowing, checkIfBlocked
  });
  refs.current = { onJoinRoom, onRemoveParticipant, onTransferHost, onToggleFollow, onBlockUser, onReportUser, checkIfFollowing, checkIfBlocked };

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageBounds, setStageBounds] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateBounds = () => {
      setStageBounds((prev) =>
        prev.width === el.clientWidth && prev.height === el.clientHeight
          ? prev
          : { width: el.clientWidth, height: el.clientHeight }
      );
    };

    updateBounds();

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const nextW = Math.round(entry.contentRect.width);
        const nextH = Math.round(entry.contentRect.height);

        // 🛑 THE FIX: Ignore resizing events caused by display: none
        if (nextW === 0 || nextH === 0) return;

        setStageBounds((prev) =>
          prev.width === nextW && prev.height === nextH
            ? prev
            : { width: nextW, height: nextH }
        );
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hostId = roomData?.host?.userId;
  const participants = roomData?.participants || [];
  const allUsers = useMemo(
    () =>
      participants.map((p) => ({
        ...p,
        isHost: Boolean(hostId && (p?.userId === hostId || (p as any)?.userId === hostId)),
      })),
    [participants, hostId]
  );

  const max = roomData?.max_participants ?? 5;
  const isFull = allUsers.length >= max && max > 0;
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);

  const availableSpace = Math.max(0, max - allUsers.length);
  const totalSlots = allUsers.length + availableSpace;

  const scale = useMemo(
    () => computeSingleRowStageLayout(stageBounds.width, stageBounds.height, totalSlots),
    [stageBounds.width, stageBounds.height, totalSlots]
  );

  const maxCols = scale.maxCols;
  const hasOverflow = totalSlots > maxCols;

  let visibleSpeakers = allUsers;
  let visibleEmptySlotsCount = availableSpace;
  let groupedAvailableCount = 0;
  let overflowParticipantsCount = 0;

  if (hasOverflow) {
    if (allUsers.length >= maxCols) {
      if (availableSpace > 0) {
        visibleSpeakers = allUsers.slice(0, Math.max(1, maxCols - 2));
        groupedAvailableCount = availableSpace;
        overflowParticipantsCount = allUsers.length - visibleSpeakers.length;
        visibleEmptySlotsCount = 0;
      } else {
        visibleSpeakers = allUsers.slice(0, Math.max(1, maxCols - 1));
        overflowParticipantsCount = allUsers.length - visibleSpeakers.length;
        visibleEmptySlotsCount = 0;
      }
    } else {
      visibleSpeakers = allUsers;
      const slotsLeftForEmpty = maxCols - visibleSpeakers.length;
      if (slotsLeftForEmpty >= 2) {
        visibleEmptySlotsCount = slotsLeftForEmpty - 2;
        groupedAvailableCount = availableSpace - visibleEmptySlotsCount - 1;
      } else {
        visibleEmptySlotsCount = 0;
        groupedAvailableCount = availableSpace;
      }
    }
  }

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
      isFollowing: refs.current.checkIfFollowing?.(targetUser?.userId) || false,
      isBlocked: refs.current.checkIfBlocked?.(targetUser?.userId) || false,
    });
    openUserDisplayer.onTrue();
  };

  const handleAvatarClick = (e: React.MouseEvent, rawParticipant: any) => {
    e.stopPropagation();
    openUserProfile(rawParticipant);
  };

  console.log('room', index);

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
            ...sxCardBase,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {/* 1. Top Tag & Status Row + Room Topic */}
        <Box sx={{ flexShrink: 0, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1.1}>
            <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0, overflow: 'hidden' }}>
              {(roomData.languages?.length ? roomData.languages : ['en']).slice(0, 2).map((lang, idx) => (
                <Label
                  key={`${lang}-${idx}`}
                  label={lang !== 'unknown' ? fgetLanguageName(lang) : 'Any'}
                  size="small"
                  color="primary"
                  sx={{ height: 20, borderRadius: 0.5, bgcolor: alpha(theme.palette.primary.main, 0.08) }}
                />
              ))}

              {roomData?.level && (
                <ParticipantLevel
                  value={roomData.level}
                  label={roomData.level}
                  showEmoji
                  size="small"
                  sx={{
                    height: 20, transform: 'none !important', borderRadius: 0.5, border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0', bgcolor: isDark ? 'transparent' : '#f8fafc',
                    color: isDark ? theme.palette.text.secondary : '#475569',
                  }}
                />
              )}
            </Stack>

            {roomData?.isActive && (
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5, borderRadius: 0.5,
                  bgcolor: isDark ? alpha(theme.palette.success.main, 0.12) : '#ecfdf5',
                  border: '1px solid', borderColor: isDark ? alpha(theme.palette.success.main, 0.25) : '#a7f3d0',
                  color: isDark ? 'success.main' : '#059669', flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main',
                    '@keyframes pulseLive': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
                    animation: 'pulseLive 1.8s infinite ease-in-out',
                  }}
                />
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Live</Typography>
              </Box>
            )}
          </Stack>

          <Tooltip title={roomData?.topic || 'Untitled room'} placement="top-start" arrow>
            <Typography
              variant="subtitle1" fontWeight={800} noWrap
              sx={{ color: isDark ? 'text.primary' : '#0f172a', fontSize: '1.025rem', lineHeight: 1.3, letterSpacing: '-0.01em' }}
            >
              {roomData?.topic || 'Untitled room'}
            </Typography>
          </Tooltip>
        </Box>

        {/* 2. Host Identity Box */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.25, p: 1, my: 1, borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc', border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0', flexShrink: 0, minWidth: 0,
          }}
        >
          <Box
            onClick={(e) => handleAvatarClick(e, roomData?.host)}
            sx={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.15s ease', '&:hover': { transform: 'scale(1.06)' } }}
          >
            <Avatar
              src={roomData?.host?.profilePhoto || undefined}
              alt={roomData?.host?.name || 'Unknown'}
              sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 800, border: `2px solid ${theme.palette.primary.main}` }}
            >
              {(roomData?.host?.name || 'U').charAt(0).toUpperCase()}
            </Avatar>
          </Box>

          <Stack sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" fontWeight={700} noWrap sx={{ color: isDark ? 'text.primary' : '#0f172a', lineHeight: 1.2, fontSize: 13 }}>
              {roomData?.host?.name || 'Unknown Host'}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? 'text.secondary' : '#64748b', fontSize: 11, fontWeight: 600 }}>Host</Typography>
          </Stack>

          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.5, px: 0.85, py: 0.3, borderRadius: 1,
              bgcolor: isDark ? alpha('#fff', 0.06) : '#ffffff', border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0', color: isDark ? 'text.secondary' : '#475569', flexShrink: 0,
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={700} sx={{ fontSize: 11 }}>{allUsers.length}/{max}</Typography>
          </Box>
        </Box>

        {/* 3. Dynamic Stage Area */}
        <Box
          ref={stageRef}
          sx={{
            flex: 1, minHeight: 0, width: '100%', minWidth: 0, px: 0.5, display: 'flex',
            flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: `${scale.gapPx}px`, overflow: 'hidden',
          }}
        >
          {visibleSpeakers.map((speaker, i) => {
            const followingCount = speaker?.following_count ?? 0;

            return (
              <Tooltip key={speaker?.userId || i} title={`${speaker?.name || 'Speaker'} • Click to view profile`} arrow placement="top">
                <Box
                  onClick={(e) => handleAvatarClick(e, speaker)}
                  sx={{
                    position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                    flexShrink: 0, cursor: 'pointer', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { transform: 'scale(1.06)' },
                  }}
                >
                  <Box sx={{ width: scale.size, height: scale.size, borderRadius: '50%', position: 'relative', transition: 'width 0.15s ease, height 0.15s ease' }}>
                    <Avatar
                      src={speaker?.profilePhoto || undefined}
                      alt={speaker?.name}
                      sx={{
                        width: '100%', height: '100%', fontSize: scale.fontSize, fontWeight: 800,
                        bgcolor: isDark ? '#252b3b' : '#f1f5f9', color: isDark ? '#fff' : '#0f172a',
                        border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
                      }}
                    >
                      {getInitials(speaker?.name)}
                    </Avatar>

                    {speaker?.verified && (
                      <Box
                        sx={{
                          position: 'absolute', top: -1, left: -1, width: scale.badgeSize, height: scale.badgeSize,
                          borderRadius: '50%', bgcolor: isDark ? '#181c26' : '#ffffff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', zIndex: 2,
                        }}
                      >
                        <VerifiedRoundedIcon sx={{ fontSize: scale.verifiedIconSize, color: 'info.main' }} />
                      </Box>
                    )}
                  </Box>

                  <Box
                    sx={{
                      mt: -0.75, px: 0.6, py: 0.1, borderRadius: 0.75, bgcolor: isDark ? '#252b3b' : '#f1f5f9',
                      border: '1px solid', borderColor: isDark ? alpha('#fff', 0.12) : '#cbd5e1', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', gap: 0.25, zIndex: 3,
                    }}
                  >
                    <FavoriteRoundedIcon sx={{ fontSize: 9.5, color: 'primary.main' }} />
                    <Typography noWrap sx={{ fontSize: scale.pillFontSize, fontWeight: 700, color: isDark ? 'grey.100' : '#1e293b', lineHeight: 1 }}>
                      {formatCompactCount(followingCount)}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            );
          })}

          {Array.from({ length: visibleEmptySlotsCount }).map((_, idx) => (
            <Tooltip key={`empty-slot-${idx}`} title="Available seat • Click to join stage" arrow placement="top">
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFull) refs.current.onJoinRoom(roomData);
                }}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer',
                  '&:hover .empty-pod-circle': {
                    borderColor: 'primary.main', color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.08), transform: 'scale(1.06)',
                  },
                  '&:hover .empty-pod-icon': { opacity: 1 },
                }}
              >
                <Box
                  className="empty-pod-circle"
                  sx={{
                    width: scale.size, height: scale.size, borderRadius: '50%', border: '1.7px dashed',
                    borderColor: theme.palette.grey[500], bgcolor: 'background.default', color: theme.palette.grey[500],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0,
                  }}
                >
                  <UserPlus className="empty-pod-icon" size={scale.plusIconSize} strokeWidth={1.75} style={{ opacity: 0.55, transition: 'opacity 0.2s ease' }} />
                </Box>
              </Box>
            </Tooltip>
          ))}

          {groupedAvailableCount > 0 && (
            <Tooltip title={`${groupedAvailableCount} available ${groupedAvailableCount === 1 ? 'seat' : 'seats'} • Click to join`} arrow placement="top">
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFull) refs.current.onJoinRoom(roomData);
                }}
                sx={{
                  width: scale.size, height: scale.size, borderRadius: '50%', border: '1.5px dashed',
                  borderColor: alpha(theme.palette.primary.main, 0.45), bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: scale.fontSize - 1, flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.06)', bgcolor: alpha(theme.palette.primary.main, 0.16), borderColor: 'primary.main' },
                }}
              >
                +{groupedAvailableCount}
              </Box>
            </Tooltip>
          )}

          {hasOverflow && allUsers.length < maxCols && (
            <Tooltip title="Available seat • Click to join stage" arrow placement="top">
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isFull) refs.current.onJoinRoom(roomData);
                }}
                sx={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, cursor: 'pointer',
                  '&:hover .empty-pod-circle': { borderColor: 'primary.main', color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.08), transform: 'scale(1.06)' },
                  '&:hover .empty-pod-icon': { opacity: 1 },
                }}
              >
                <Box
                  className="empty-pod-circle"
                  sx={{
                    width: scale.size, height: scale.size, borderRadius: '50%', border: '1.7px dashed', borderColor: isDark ? alpha('#fff', 0.22) : '#cbd5e1',
                    bgcolor: isDark ? alpha('#fff', 0.025) : '#f8fafc', color: isDark ? 'text.secondary' : '#64748b', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', flexShrink: 0,
                  }}
                >
                  <UserPlus className="empty-pod-icon" size={scale.plusIconSize} strokeWidth={1.75} style={{ opacity: 0.55, transition: 'opacity 0.2s ease' }} />
                </Box>
              </Box>
            </Tooltip>
          )}

          {overflowParticipantsCount > 0 && (
            <Tooltip title={`${overflowParticipantsCount} more ${overflowParticipantsCount === 1 ? 'participant' : 'participants'}`} arrow placement="top">
              <Box
                onClick={participantsOpen.onTrue}
                sx={{
                  width: scale.size, height: scale.size, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.12),
                  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.35)}`, color: 'primary.main', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: scale.fontSize - 1, flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s ease',
                  '&:hover': { transform: 'scale(1.06)', bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                +{overflowParticipantsCount}
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
            refs.current.onJoinRoom(roomData);
          }}
          endIcon={isFull ? <BlockRoundedIcon sx={{ fontSize: 16 }} /> : <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            flexShrink: 0, mt: 1, borderRadius: 1, textTransform: 'none', fontWeight: 700, fontSize: 13, boxShadow: 'none',
            '&:hover': { boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}` },
          }}
        >
          {isFull ? 'Room Full' : 'Want to talk? Join the room!'}
        </Button>
      </Paper>

      {selectedUser && (
        <UserDisplayer
          open={openUserDisplayer.value}
          user={selectedUser}
          currentUserId={currentUserId}
          onClose={openUserDisplayer.onFalse}
          onToggleFollow={(...args) => refs.current.onToggleFollow?.(...args)}
          onBlockUser={(...args) => refs.current.onBlockUser?.(...args)}
          onReportUser={(...args) => refs.current.onReportUser?.(...args)}
        />
      )}

      {participantsOpen.value && (
        <RoomParticipantsDialog
          open={participantsOpen.value}
          onClose={participantsOpen.onFalse}
          room={roomData}
          allUsers={allUsers}
          isFull={isFull}
          isHost={isHost}
          onJoinRoom={(r) => refs.current.onJoinRoom(r)}
          onParticipantClick={(participant) => {
            participantsOpen.onFalse();
            openUserProfile(participant);
          }}
          onRemoveParticipant={isHost ? (...args) => refs.current.onRemoveParticipant?.(...args) : undefined}
          onTransferHost={isHost ? (...args) => refs.current.onTransferHost?.(...args) : undefined}
          onEditRoom={isHost ? () => { participantsOpen.onFalse(); editRoomOpen.onTrue(); } : undefined}
        />
      )}

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

const areRoomCardPropsEqual = (
  prev: VoiceRoomCardExtendedProps,
  next: VoiceRoomCardExtendedProps
) => {
  // If the component's internal ResizeObserver state changes, memoization doesn't matter (it will render anyway).
  // But if props are failing, this will print exactly which prop broke the shield:

  const logFail = (reason: string) => {
    console.log(`Room ${prev.index} rendered because: ${reason}`);
  };

  if (prev.currentUserId !== next.currentUserId) { logFail('currentUserId changed'); return false; }
  if (prev.sx !== next.sx) { logFail('sx object reference changed'); return false; }

  const r1 = prev.roomData;
  const r2 = next.roomData;

  if (r1 === r2) return true;
  if (!r1 || !r2) { logFail('roomData missing'); return false; }

  if (r1.roomId !== r2.roomId) { logFail('roomId changed'); return false; }
  if (r1.topic !== r2.topic) { logFail('topic changed'); return false; }
  if (r1.isActive !== r2.isActive) { logFail('isActive changed'); return false; }
  if (r1.level !== r2.level) { logFail('level changed'); return false; }
  if (r1.max_participants !== r2.max_participants) { logFail('max_participants changed'); return false; }
  if (r1.host?.userId !== r2.host?.userId) { logFail('host changed'); return false; }

  if ((r1.participants?.length ?? 0) !== (r2.participants?.length ?? 0)) {
    logFail(`participants length changed (${r1.participants?.length} -> ${r2.participants?.length})`);
    return false;
  }

  const p1 = r1.participants || [];
  const p2 = r2.participants || [];
  for (let i = 0; i < p1.length; i += 1) {
    if (p1[i]?.userId !== p2[i]?.userId) {
      logFail(`Participant order changed at index ${i}`);
      return false;
    }
  }

  return true;
};

export const VoiceRoomCard = memo(VoiceRoomCardComponent, areRoomCardPropsEqual);

export default VoiceRoomCard;