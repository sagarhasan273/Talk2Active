// src/sections/section-voice/voice-room-card/room-list-card-main.tsx

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import {
  alpha,
  Box,
  Button,
  Paper,
  Stack,
  type SxProps,
  Typography,
  useTheme,
} from '@mui/material';

import AnimatedAvatar from '@/components/avatar-user/animated-avatar';
import { Label, ParticipantLevel } from '@/components/label';
import { RoomType } from '@/types/type-room';
import { fgetLanguageName } from 'src/utils/helper';
import VoiceRoomHostWrapper from './room-list-card-host-wrapper';
import VoiceRoomCardStage, { computeStageLayout, LiteAvatar } from './room-list-card-stage';
import { BUTTON_HEIGHT, HEADER_HEIGHT, STAGE_HEIGHT } from './room-list-constants';
import { hydratedRooms, hydrationQueue } from './room-list-scheduler';

// ----------------------------------------------------------------------

type VoiceRoomCardProps = {
  roomData: RoomType;
  onJoinRoom: (room: RoomType) => void;
};

type VoiceRoomCardExtendedProps = VoiceRoomCardProps & {
  currentUserId?: string;
  onAvatarClick: (user: any) => void;
  onOverflowClick: (room: RoomType) => void;
  cardWidth?: number;
  /** First-row cards skip the lite phase so above-the-fold content is full immediately. */
  priority?: boolean;
  sx?: SxProps;
};

const sxCardBase = {
  height: '100%',
  width: '100%',
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxSizing: 'border-box',
  overflow: 'hidden',
  contain: 'strict',
};

const VoiceRoomCardComponent = ({
  roomData,
  onJoinRoom,
  onAvatarClick,
  onOverflowClick,
  cardWidth = 320,
  priority = false,
  sx,
}: VoiceRoomCardExtendedProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primaryMain = theme.palette.primary.main;

  const refs = useRef({ onJoinRoom, onAvatarClick, onOverflowClick });
  refs.current = { onJoinRoom, onAvatarClick, onOverflowClick };

  // ── Progressive hydration ───────────────────────────────────────────
  // Phase 1 (lite): static initials, no AnimatedAvatar, no image decode. Same geometry.
  // Phase 2 (full): upgraded in an idle slot, one card at a time, paused on fast scroll.
  const roomId = roomData?.roomId ?? '';
  const [hydrated, setHydrated] = useState(() => priority || hydratedRooms.has(roomId));

  useEffect(() => {
    if (hydrated) {
      hydratedRooms.add(roomId);
      return undefined;
    }
    return hydrationQueue.enqueue(roomId, () => {
      hydratedRooms.add(roomId);
      setHydrated(true);
    });
  }, [hydrated, roomId]);

  const hostId = roomData?.host?.userId;
  const participants = roomData?.participants || [];
  const participantsCount = participants.length;

  const max = roomData?.max_participants ?? 5;
  const isFull = participantsCount >= max && max > 0;
  const availableSpace = Math.max(0, max - participantsCount);
  const totalSlots = participantsCount + availableSpace;

  const allUsers = useMemo(
    () =>
      participants.map((p) => ({
        ...p,
        isHost: Boolean(hostId && p?.userId === hostId),
      })),
    [participants, hostId]
  );

  // Round to nearest 4px so sub-pixel resize jitter never recalculates the layout
  const stageInnerWidth = Math.max(220, Math.round((cardWidth - 32) / 4) * 4);
  const layout = useMemo(
    () => computeStageLayout(stageInnerWidth, STAGE_HEIGHT, totalSlots),
    [stageInnerWidth, totalSlots]
  );

  const handleAvatarClick = (e: React.MouseEvent, rawParticipant: any) => {
    e.stopPropagation();
    refs.current.onAvatarClick(rawParticipant);
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFull) refs.current.onJoinRoom(roomData);
  };

  const handleOverflowClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    refs.current.onOverflowClick(roomData);
  };

  const paperSx = useMemo(
    () => [
      {
        p: 2,
        borderRadius: 0.5,
        position: 'relative',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        transition: 'border-color 0.2s ease',
        // no sticky :hover on touch screens
        '@media (hover: hover)': {
          '&:hover': { borderColor: alpha(primaryMain, isDark ? 0.45 : 0.4) },
        },
        ...sxCardBase,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ],
    [isDark, primaryMain, sx]
  );

  return (
    <Paper onClick={() => handleOverflowClick()} elevation={0} sx={paperSx as SxProps}>
      {/* 1. Header & Topic (locked height so it never shifts) */}
      <Box sx={{ flexShrink: 0, minWidth: 0, height: HEADER_HEIGHT }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1}>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ minWidth: 0, overflow: 'hidden', height: 20 }}>
            {(roomData.languages?.length ? roomData.languages : ['en']).slice(0, 2).map((lang, idx) => (
              <Label
                key={`${lang}-${idx}`}
                label={lang !== 'unknown' ? fgetLanguageName(lang) : 'Any'}
                size="small"
                color="primary"
                sx={{ height: 20, borderRadius: 0.5, bgcolor: alpha(primaryMain, 0.08) }}
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
                height: 20,
                borderRadius: 0.5,
                bgcolor: isDark ? alpha(theme.palette.success.main, 0.12) : '#ecfdf5',
                border: '1px solid',
                borderColor: isDark ? alpha(theme.palette.success.main, 0.25) : '#a7f3d0',
                color: isDark ? 'success.main' : '#059669',
                flexShrink: 0,
              }}
            >
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
              <Typography sx={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}>Live</Typography>
            </Box>
          )}
        </Stack>
        <Typography
          title={roomData?.topic || 'Untitled room'}
          variant="subtitle1"
          fontWeight={800}
          noWrap
          sx={{ color: isDark ? 'text.primary' : '#0f172a', fontSize: '1.025rem', lineHeight: '22px', height: 22, letterSpacing: '-0.01em' }}
        >
          {roomData?.topic || 'Untitled room'}
        </Typography>
      </Box>

      {/* 2. Host Strip */}
      <VoiceRoomHostWrapper accountType={(roomData?.host as any)?.accountType || 'MEMBER'}>
        <Box
          onClick={(e) => handleAvatarClick(e, roomData?.host)}
          sx={{ position: 'relative', cursor: 'pointer', width: 36, height: 36, flexShrink: 0 }}
        >
          {hydrated ? (
            <AnimatedAvatar
              accountType={roomData?.host?.accountType}
              src={roomData?.host?.profilePhoto || undefined}
              name={roomData?.host?.name}
              ringGap={4}
              speed={4}
              size={36}
            />
          ) : (
            <LiteAvatar name={roomData?.host?.name} size={36} fontSize={13} />
          )}
        </Box>
        <Stack sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ color: isDark ? 'text.primary' : '#0f172a', lineHeight: 1.2, fontSize: 13 }}>
            {roomData?.host?.name || 'Unknown Host'}
          </Typography>
          <Typography variant="caption" sx={{ color: isDark ? 'text.secondary' : '#64748b', fontSize: 11, fontWeight: 600 }}>
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
            borderRadius: 0.5,
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
      </VoiceRoomHostWrapper>

      {/* 3. Stage Area: strictly locked height */}
      <Box
        sx={{
          height: STAGE_HEIGHT,
          minHeight: STAGE_HEIGHT,
          maxHeight: STAGE_HEIGHT,
          flexShrink: 0,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          contain: 'strict',
        }}
      >
        {layout && (
          <VoiceRoomCardStage
            lite={!hydrated}
            speakers={allUsers}
            availableSpace={availableSpace}
            layout={layout}
            isFull={isFull}
            isDark={isDark}
            onAvatarClick={handleAvatarClick}
            onJoinClick={handleJoinClick}
            onOverflowClick={handleOverflowClick}
          />
        )}
      </Box>

      {/* 4. Join Button */}
      <Button
        fullWidth
        size="medium"
        variant={isFull ? 'outlined' : 'contained'}
        disabled={isFull}
        color={isFull ? 'inherit' : 'primary'}
        disableElevation
        onClick={handleJoinClick}
        endIcon={isFull ? <BlockRoundedIcon sx={{ fontSize: 16 }} /> : <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
        sx={{
          flexShrink: 0,
          height: BUTTON_HEIGHT,
          minHeight: BUTTON_HEIGHT,
          borderRadius: 0.5,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: 13,
          boxShadow: 'none',
        }}
      >
        {isFull ? 'Room Full' : 'Want to talk? Join the room!'}
      </Button>
    </Paper>
  );
};

// ----------------------------------------------------------------------

const sameParticipant = (a: any, b: any) =>
  a?.userId === b?.userId &&
  a?.name === b?.name &&
  a?.profilePhoto === b?.profilePhoto &&
  a?.verified === b?.verified &&
  a?.accountType === b?.accountType &&
  a?.follower_count === b?.follower_count;

const areRoomCardPropsEqual = (prev: VoiceRoomCardExtendedProps, next: VoiceRoomCardExtendedProps) => {
  if (prev.currentUserId !== next.currentUserId) return false;
  if (Math.abs((prev.cardWidth ?? 320) - (next.cardWidth ?? 320)) >= 4) return false;
  if (prev.sx !== next.sx) return false;

  const r1 = prev.roomData;
  const r2 = next.roomData;

  if (r1 === r2) return true;
  if (!r1 || !r2) return false;

  if (
    r1.roomId !== r2.roomId ||
    r1.topic !== r2.topic ||
    r1.isActive !== r2.isActive ||
    r1.level !== r2.level ||
    r1.max_participants !== r2.max_participants ||
    (r1.languages || []).join(',') !== (r2.languages || []).join(',') ||
    !sameParticipant(r1.host, r2.host) ||
    (r1.participants?.length ?? 0) !== (r2.participants?.length ?? 0)
  )
    return false;

  const p1 = r1.participants || [];
  const p2 = r2.participants || [];
  for (let i = 0; i < p1.length; i++) {
    if (!sameParticipant(p1[i], p2[i])) return false;
  }
  return true;
};

export const VoiceRoomCard = memo(VoiceRoomCardComponent, areRoomCardPropsEqual);
export default VoiceRoomCard;
