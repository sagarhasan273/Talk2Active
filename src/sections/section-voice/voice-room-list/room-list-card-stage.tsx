// src/sections/section-voice/voice-room-card/room-list-card-stage.tsx

import React, { useMemo } from 'react';

import AvatarWrapper from '@/sections/section-common/avatar-wrapper';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { alpha, Avatar, Box, Typography } from '@mui/material';
import { UserPlus } from 'lucide-react';

export const computeStageLayout = (width: number, height: number, totalRequested: number) => {
  if (!width || !height || totalRequested <= 0) return null;

  const pillAllowance = 10; // Exact extra vertical space added by the follower pill (mt: -0.75 + height)
  const minGap = 8;

  // Safety buffer guarantees border paddings never overflow the flex container
  const safeWidth = Math.max(180, width - 24);

  // 1 to 5 participants stay on 1 row. 6 or more break to 2 rows.
  let bestRows = totalRequested >= 6 ? 2 : 1;

  let bestCols = bestRows === 1 ? totalRequested : Math.ceil(totalRequested / 2);
  bestCols = Math.min(7, bestCols); // Absolute max limit of 7 columns

  let bestGap = bestRows === 1 && totalRequested <= 3 ? 16 : minGap;

  // CRITICAL CLS FIX: Subtract pillAllowance for EVERY row so 2 rows never exceed 110px height
  const maxW = Math.floor((safeWidth - bestGap * (bestCols - 1)) / bestCols);
  const maxH =
    bestRows === 1
      ? height - pillAllowance - 4
      : Math.floor((height - pillAllowance * 2 - bestGap - 4) / 2);

  let bestSize = Math.min(maxW, maxH, 72);

  // Safety Fallback: If 4 or 5 users squish smaller than 36px on a tiny screen, force 2 rows early
  if (bestRows === 1 && bestSize < 36 && totalRequested >= 4) {
    bestRows = 2;
    bestCols = Math.ceil(totalRequested / 2);
    bestGap = minGap;
    const newMaxW = Math.floor((safeWidth - bestGap * (bestCols - 1)) / bestCols);
    const newMaxH = Math.floor((height - pillAllowance * 2 - bestGap - 4) / 2);
    bestSize = Math.min(newMaxW, newMaxH, 72);
  }

  bestSize = Math.max(34, bestSize);

  return {
    maxCols: bestCols,
    maxRows: bestRows,
    maxVisible: bestCols * bestRows,
    size: bestSize,
    fontSize: Math.max(11, Math.round(bestSize * 0.28)),
    gapPx: bestGap,
    badgeSize: Math.max(13, Math.round(bestSize * 0.26)),
    verifiedIconSize: Math.max(10, Math.round(bestSize * 0.22)),
    pillFontSize: bestSize >= 56 ? '0.62rem' : bestSize >= 44 ? '0.56rem' : '0.50rem',
    plusIconSize: Math.max(14, Math.round(bestSize * 0.32)),
  };
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

interface RoomStageProps {
  speakers: any[];
  availableSpace: number;
  layout: ReturnType<typeof computeStageLayout>;
  isFull: boolean;
  isDark: boolean;
  onAvatarClick: (e: React.MouseEvent, user: any) => void;
  onJoinClick: (e: React.MouseEvent) => void;
  onOverflowClick: (e: React.MouseEvent) => void;
}

type PodItem =
  | { type: 'speaker'; data: any; key: string }
  | { type: 'empty'; key: string }
  | { type: 'overflow'; count: number; key: string };

export default function VoiceRoomCardStage({
  speakers,
  availableSpace,
  layout,
  isDark,
  onAvatarClick,
  onJoinClick,
  onOverflowClick,
}: RoomStageProps) {
  const displayPods = useMemo(() => {
    if (!layout) return [];

    const allSlots: PodItem[] = [];
    speakers.forEach((s, idx) =>
      allSlots.push({ type: 'speaker', data: s, key: `sp-${s.userId || idx}` })
    );
    for (let i = 0; i < availableSpace; i++) allSlots.push({ type: 'empty', key: `emp-${i}` });

    if (allSlots.length <= layout.maxVisible) {
      return allSlots;
    }

    const visible = allSlots.slice(0, layout.maxVisible - 1);
    const hiddenCount = allSlots.length - visible.length;
    visible.push({ type: 'overflow', count: hiddenCount, key: 'overflow-badge' });

    return visible;
  }, [speakers, availableSpace, layout]);

  if (!layout) return null;

  // Exact total height of a pod including its follower pill
  const podTotalHeight = layout.size + 8;

  return (
    <Box
      sx={{
        width: '100%',
        height: 110,
        minHeight: 110,
        maxHeight: 110,
        px: 0.5,
        display: 'flex',
        flexWrap: layout.maxRows === 1 ? 'nowrap' : 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        gap: `${layout.gapPx}px`,
        boxSizing: 'border-box',
        // Isolates internal stage rendering so it can NEVER trigger a page layout shift
        contain: 'strict',
      }}
    >
      {displayPods.map((pod) => {
        if (pod.type === 'speaker') {
          const speaker = pod.data;
          return (
            <Box
              key={pod.key}
              title={`${speaker?.name || 'Speaker'} - Click to view profile`}
              onClick={(e) => onAvatarClick(e, speaker)}
              sx={{
                position: 'relative',
                width: layout.size,
                height: podTotalHeight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                zIndex: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  zIndex: 10,
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                sx={{
                  width: layout.size,
                  height: layout.size,
                  borderRadius: '50%',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <AvatarWrapper
                  accountType={speaker?.accountType}
                  showShadow={false}
                  borderThickness={0.38}
                  sx={{ width: '100%', height: '100%', boxSizing: 'border-box' }}
                >
                  <Avatar
                    src={speaker?.profilePhoto || undefined}
                    alt={speaker?.name}
                    imgProps={{ loading: 'lazy', decoding: 'async' }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box',
                      fontSize: layout.fontSize,
                      fontWeight: 800,
                      bgcolor: isDark ? '#252b3b' : '#f1f5f9',
                      color: isDark ? '#fff' : '#0f172a',
                      border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
                    }}
                  >
                    {getInitials(speaker?.name)}
                  </Avatar>
                </AvatarWrapper>
                {speaker?.verified && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -1,
                      left: -1,
                      width: layout.badgeSize,
                      height: layout.badgeSize,
                      borderRadius: '50%',
                      bgcolor: isDark ? '#181c26' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}
                  >
                    <VerifiedRoundedIcon
                      sx={{ fontSize: layout.verifiedIconSize, color: 'info.main' }}
                    />
                  </Box>
                )}
              </Box>
              <Box
                sx={{
                  mt: -0.75,
                  height: 14,
                  px: 0.6,
                  borderRadius: 0.75,
                  bgcolor: isDark ? '#252b3b' : '#f1f5f9',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.12) : '#cbd5e1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.25,
                  zIndex: 3,
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                <FavoriteRoundedIcon sx={{ fontSize: 9.5, color: 'primary.main' }} />
                <Typography
                  noWrap
                  sx={{
                    fontSize: layout.pillFontSize,
                    fontWeight: 700,
                    color: isDark ? 'grey.100' : '#1e293b',
                    lineHeight: 1,
                  }}
                >
                  {formatCompactCount(speaker?.follower_count ?? 0)}
                </Typography>
              </Box>
            </Box>
          );
        }

        if (pod.type === 'empty') {
          return (
            <Box
              key={pod.key}
              title="Available seat • Click to join stage"
              onClick={onJoinClick}
              sx={{
                width: layout.size,
                height: podTotalHeight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexShrink: 0,
                cursor: 'pointer',
                '&:hover .empty-pod-circle': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
                '&:hover .empty-pod-icon': { opacity: 1 },
              }}
            >
              <Box
                className="empty-pod-circle"
                sx={{
                  width: layout.size,
                  height: layout.size,
                  borderRadius: '50%',
                  border: '1.7px dashed',
                  borderColor: isDark ? alpha('#fff', 0.22) : '#cbd5e1',
                  bgcolor: isDark ? alpha('#fff', 0.025) : '#f8fafc',
                  color: isDark ? 'text.secondary' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                }}
              >
                <UserPlus
                  className="empty-pod-icon"
                  size={layout.plusIconSize}
                  strokeWidth={1.75}
                  style={{ opacity: 0.55, transition: 'opacity 0.2s ease' }}
                />
              </Box>
            </Box>
          );
        }

        if (pod.type === 'overflow') {
          return (
            <Box
              key={pod.key}
              title={`${pod.count} more`}
              onClick={onOverflowClick}
              sx={{
                width: layout.size,
                height: podTotalHeight,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  width: layout.size,
                  height: layout.size,
                  borderRadius: '50%',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  border: (theme) => `1.5px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: layout.fontSize - 1,
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.06)',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                +{pod.count}
              </Box>
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
}
