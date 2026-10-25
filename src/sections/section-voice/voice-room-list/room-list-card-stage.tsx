import React, { useMemo } from 'react';

import AvatarWrapper from '@/sections/section-common/avatar-wrapper';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { alpha, Avatar, Box, Typography } from '@mui/material';
import { UserPlus } from 'lucide-react';

export const computeStageLayout = (width: number, height: number, totalRequested: number) => {
  if (!width || !height || totalRequested <= 0) return null;

  const pillAllowance = 12; // Extra space at the bottom for the follower pill
  const minPodDiameter = 36;
  const minGap = 8;
  const safeWidth = width - 8;

  // Dynamically calculate how many columns can physically fit so flexbox NEVER wraps to a 3rd row
  const physicalMaxCols = Math.floor((safeWidth + minGap) / (minPodDiameter + minGap));

  // Cap between 3 and 7 columns per row (making the absolute max visible items 14)
  const maxColsAllowed = Math.max(3, Math.min(7, physicalMaxCols));

  let bestSize = 0;
  let bestRows = 1;
  let bestCols = 1;
  let bestGap = 8;

  // --- SCENARIO 1: Try fitting everyone in 1 Row ---
  const cols1 = Math.min(totalRequested, maxColsAllowed);
  const gap1 = cols1 <= 4 ? 14 : minGap;
  const maxW1 = Math.floor((safeWidth - gap1 * (cols1 - 1)) / cols1) - 1;
  const maxH1 = height - pillAllowance;
  const size1 = Math.min(maxW1, maxH1, 76);

  // --- SCENARIO 2: Try splitting them into 2 Rows ---
  // CRITICAL FIX: Math.min() caps the columns so a 100-slot room doesn't try to render 50 items per row
  const cols2 = Math.min(Math.ceil(totalRequested / 2), maxColsAllowed);
  const gap2 = cols2 <= 4 ? 14 : minGap;
  const maxW2 = Math.floor((safeWidth - gap2 * (cols2 - 1)) / cols2) - 1;
  const maxH2 = Math.floor((height - pillAllowance - gap2) / 2);
  const size2 = Math.min(maxW2, maxH2, 76);

  // --- DECISION LOGIC ---
  if (totalRequested > maxColsAllowed) {
    // If they exceed max allowed in a row, FORCE 2 rows
    bestRows = 2;
    bestCols = cols2;
    bestSize = size2;
    bestGap = gap2;
  } else {
    // Switch to 2 rows only if it results in significantly larger avatars
    if (size2 >= size1 + 4 && size2 >= minPodDiameter) {
      bestRows = 2;
      bestCols = cols2;
      bestSize = size2;
      bestGap = gap2;
    } else {
      bestRows = 1;
      bestCols = cols1;
      bestSize = size1;
      bestGap = gap1;
    }
  }

  // Final fallback to prevent disappearing avatars
  bestSize = Math.max(minPodDiameter, bestSize);
  const maxVisible = bestCols * bestRows;

  return {
    maxCols: bestCols,
    maxRows: bestRows,
    maxVisible,
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

    // 1. Unify all elements into a single flat array
    const allSlots: PodItem[] = [];
    speakers.forEach((s, idx) =>
      allSlots.push({ type: 'speaker', data: s, key: `sp-${s.userId || idx}` })
    );
    for (let i = 0; i < availableSpace; i++) allSlots.push({ type: 'empty', key: `emp-${i}` });

    // 2. If it perfectly fits within the max visible limit (e.g., 14 slots), return as-is
    if (allSlots.length <= layout.maxVisible) {
      return allSlots;
    }

    // 3. Overflow case: Reserve the very last slot for the counter
    const visible = allSlots.slice(0, layout.maxVisible - 1);
    const hiddenCount = allSlots.length - visible.length;
    visible.push({ type: 'overflow', count: hiddenCount, key: 'overflow-badge' });

    return visible;
  }, [speakers, availableSpace, layout]);

  if (!layout) return null;

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        minWidth: 0,
        px: 0.5,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        gap: `${layout.gapPx}px`,
        // overflow: 'hidden',
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flexShrink: 0,
                zIndex: 1,
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {},
              }}
            >
              <Box
                sx={{
                  width: layout.size,
                  height: layout.size,
                  borderRadius: '50%',
                  position: 'relative',
                }}
              >
                <AvatarWrapper accountType={speaker?.accountType}>
                  <Avatar
                    src={speaker?.profilePhoto || undefined}
                    alt={speaker?.name}
                    sx={{
                      width: '100%',
                      height: '100%',
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
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
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.06)',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              +{pod.count}
            </Box>
          );
        }

        return null;
      })}
    </Box>
  );
}
