// src/sections/section-voice/voice-room-card/room-list-card-main.tsx

import React, { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  type SxProps,
  Typography,
  useTheme,
} from '@mui/material';

import { Label, ParticipantLevel } from '@/components/label';
import { useBoolean } from '@/hooks/use-boolean';
import UserDisplayer, { type UserDisplayerProfile } from '@/sections/section-common/user-displayer';
import { RoomType } from '@/types/type-room';
import { fgetLanguageName } from 'src/utils/helper';
import { VoiceModalCreateRoom } from '../voice-modal-create-room';
import { RoomParticipantsDialog } from './room-list-card-dialog';
import { computeStageLayout } from './room-list-card-stage';

// Lazy Load the Heavy Stage Area
const VoiceRoomStage = React.lazy(() => import('./room-list-card-stage'));

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

  // Progressive Mounting: Fast Shell first, heavy DOM next
  const [isHeavyContentReady, setIsHeavyContentReady] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsHeavyContentReady(true));
    // CLEANUP 1: Abort progressive mount if scrolled past immediately
    return () => cancelAnimationFrame(timer);
  }, []);

  const refs = useRef({
    onJoinRoom,
    onRemoveParticipant,
    onTransferHost,
    onToggleFollow,
    onBlockUser,
    onReportUser,
    checkIfFollowing,
    checkIfBlocked,
  });
  refs.current = {
    onJoinRoom,
    onRemoveParticipant,
    onTransferHost,
    onToggleFollow,
    onBlockUser,
    onReportUser,
    checkIfFollowing,
    checkIfBlocked,
  };

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageBounds, setStageBounds] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (!isHeavyContentReady) return;
    const el = stageRef.current;
    if (!el) return;

    let isMounted = true; // CLEANUP 2: Prevent state updates on unmounted components

    const observer = new ResizeObserver((entries) => {
      if (!isMounted) return;
      const entry = entries[0];
      if (entry) {
        const nextW = Math.round(entry.contentRect.width);
        const nextH = Math.round(entry.contentRect.height);
        if (nextW === 0 || nextH === 0) return;
        setStageBounds((prev) =>
          prev.width === nextW && prev.height === nextH ? prev : { width: nextW, height: nextH }
        );
      }
    });

    observer.observe(el);
    if (isMounted) setStageBounds({ width: el.clientWidth, height: el.clientHeight });

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [isHeavyContentReady]);

  const hostId = roomData?.host?.userId;
  const participants = roomData?.participants || [];
  const participantsCount = participants.length;

  const max = roomData?.max_participants ?? 5;
  const isFull = participantsCount >= max && max > 0;
  const isHost = Boolean(currentUserId && hostId && currentUserId === hostId);
  const availableSpace = Math.max(0, max - participantsCount);
  const totalSlots = participantsCount + availableSpace;

  // CLEANUP 3: DEFER COMPUTATION - Skip heavy array mapping during fast scroll
  const allUsers = useMemo(() => {
    if (!isHeavyContentReady && !participantsOpen.value) return [];
    return participants.map((p) => ({
      ...p,
      isHost: Boolean(hostId && (p?.userId === hostId || (p as any)?.userId === hostId)),
    }));
  }, [participants, hostId, isHeavyContentReady, participantsOpen.value]);

  // CLEANUP 4: DEFER COMPUTATION - Skip math layout calculations during fast scroll
  const layout = useMemo(() => {
    if (!isHeavyContentReady || stageBounds.width === 0) return null;
    return computeStageLayout(stageBounds.width, stageBounds.height, totalSlots);
  }, [stageBounds.width, stageBounds.height, totalSlots, isHeavyContentReady]);

  const openUserProfile = (rawUser: any) => {
    const targetUser = rawUser?.user || rawUser;
    setSelectedUser({
      userId: targetUser?.userId || targetUser?.id,
      name: targetUser?.name || 'User',
      username: targetUser?.username,
      profilePhoto: targetUser?.profilePhoto,
      verified: targetUser?.verified,
      isFollowing: refs.current.checkIfFollowing?.(targetUser?.userId) || false,
      isBlocked: refs.current.checkIfBlocked?.(targetUser?.userId) || false,
    } as any);
    openUserDisplayer.onTrue();
  };

  const handleAvatarClick = (e: React.MouseEvent, rawParticipant: any) => {
    e.stopPropagation();
    openUserProfile(rawParticipant);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFull) refs.current.onJoinRoom(roomData);
  };

  const handleOverflowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    participantsOpen.onTrue();
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
            WebkitTapHighlightColor: 'transparent',
            bgcolor: 'background.default',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': { borderColor: alpha(theme.palette.primary.main, isDark ? 0.45 : 0.4) },
            ...sxCardBase,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
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
                .map((lang, idx) => (
                  <Label
                    key={`${lang}-${idx}`}
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
                    '@keyframes pulseLive': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
                    animation: 'pulseLive 1.8s infinite ease-in-out',
                  }}
                />
                <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>
                  Live
                </Typography>
              </Box>
            )}
          </Stack>

          <Typography
            title={roomData?.topic || 'Untitled room'}
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
        </Box>

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
              sx={{ color: isDark ? 'text.secondary' : '#64748b', fontSize: 11, fontWeight: 600 }}
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
              {participantsCount}/{max}
            </Typography>
          </Box>
        </Box>

        {/* Dynamic Stage Area Wrapper */}
        <Box
          ref={stageRef}
          sx={{ flex: 1, height: 110, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {isHeavyContentReady && layout && (
            <Suspense fallback={<Box sx={{ flex: 1 }} />}>
              <VoiceRoomStage
                speakers={allUsers}
                availableSpace={availableSpace}
                layout={layout}
                isFull={isFull}
                isDark={isDark}
                onAvatarClick={handleAvatarClick}
                onJoinClick={handleJoinClick}
                onOverflowClick={handleOverflowClick}
              />
            </Suspense>
          )}
        </Box>

        <Button
          fullWidth
          size="medium"
          variant={isFull ? 'outlined' : 'contained'}
          disabled={isFull}
          color={isFull ? 'inherit' : 'primary'}
          disableElevation
          onClick={handleJoinClick}
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
          onRemoveParticipant={
            isHost ? (...args) => refs.current.onRemoveParticipant?.(...args) : undefined
          }
          onTransferHost={isHost ? (...args) => refs.current.onTransferHost?.(...args) : undefined}
          onEditRoom={
            isHost
              ? () => {
                participantsOpen.onFalse();
                editRoomOpen.onTrue();
              }
              : undefined
          }
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
  if (prev.currentUserId !== next.currentUserId) return false;
  if (prev.sx !== next.sx) return false;

  const r1 = prev.roomData;
  const r2 = next.roomData;

  if (r1 === r2) return true;
  if (!r1 || !r2) return false;

  if (r1.roomId !== r2.roomId) return false;
  if (r1.topic !== r2.topic) return false;
  if (r1.isActive !== r2.isActive) return false;
  if (r1.level !== r2.level) return false;
  if (r1.max_participants !== r2.max_participants) return false;
  if (r1.host?.userId !== r2.host?.userId) return false;

  if ((r1.participants?.length ?? 0) !== (r2.participants?.length ?? 0)) return false;

  const p1 = r1.participants || [];
  const p2 = r2.participants || [];
  for (let i = 0; i < p1.length; i++) {
    if (p1[i]?.userId !== p2[i]?.userId) return false;
  }

  return true;
};

export const VoiceRoomCard = memo(VoiceRoomCardComponent, areRoomCardPropsEqual);
export default VoiceRoomCard;
