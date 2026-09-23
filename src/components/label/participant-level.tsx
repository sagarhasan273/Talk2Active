// src/sections/section-voice/participant-level.tsx

import CancelIcon from '@mui/icons-material/Cancel';
import { alpha, Box, Chip, Typography, useTheme } from '@mui/material';
import React from 'react';
import { LabelColor, LevelOption, ParticipantLevelProps } from './types';



export const LEVEL_OPTIONS: LevelOption[] = [
  { value: 'all', label: 'Any Levels', emoji: '🎯', color: 'info' },
  { value: 'beginner', label: 'A1-A2 Beginner', emoji: '🌱', color: 'success' },
  { value: 'intermediate', label: 'B1-B2 Intermediate', emoji: '📈', color: 'primary' },
  { value: 'advanced', label: 'C1-C2 Advanced', emoji: '🏆', color: 'secondary' },
  { value: 'ielts', label: 'IELTS / Exam Prep', emoji: '📝', color: 'warning' },
  { value: 'business', label: 'Business English', emoji: '💼', color: 'info' },
  { value: 'conversation', label: 'Conversation Practice', emoji: '🗣️', color: 'error' },
];

export const LEVEL_MAP: Record<string, LevelOption> = Object.fromEntries(
  LEVEL_OPTIONS.map((item) => [item.value, item])
);

export const ParticipantLevel = ({
  label,
  value,
  variant = 'soft',
  size = 'small',
  color,
  showEmoji = true,
  onClick,
  onDelete,
  selected = false,
  disabled = false,
  sx,
}: ParticipantLevelProps) => {
  const theme = useTheme();
  const isSmall = size === 'small';

  // Match predefined level configuration or fallback gracefully
  const matchedLevel: Partial<LevelOption> = LEVEL_MAP[value?.toLowerCase()] || {};
  const activeLabel = matchedLevel.label || label;
  const activeEmoji = matchedLevel.emoji;
  const activeColorKey: LabelColor = color || matchedLevel.color || 'primary';
  const activeColor = theme.palette[activeColorKey].main;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          bgcolor: activeColor,
          color: theme.palette[activeColorKey].contrastText,
          border: '1px solid transparent',
          '&:hover': {
            bgcolor: theme.palette[activeColorKey].dark,
          },
          '& .MuiChip-deleteIcon': {
            ml: 0.25,
            mr: 0.25,
            color: alpha(theme.palette[activeColorKey].contrastText, 0.75),
            '&:hover': {
              color: theme.palette[activeColorKey].contrastText,
            },
          },
        };

      case 'outlined':
        return {
          bgcolor: selected ? alpha(activeColor, 0.12) : 'transparent',
          color: activeColor,
          border: '1.5px solid',
          borderColor: activeColor,
          '&:hover': {
            bgcolor: alpha(activeColor, 0.08),
            borderColor: activeColor,
          },
          '& .MuiChip-deleteIcon': {
            ml: 0.25,
            mr: 0.25,
            color: alpha(activeColor, 0.7),
            '&:hover': {
              color: activeColor,
            },
          },
        };

      case 'soft':
      default:
        return {
          bgcolor: selected ? alpha(activeColor, 0.22) : alpha(activeColor, 0.1),
          color: activeColor,
          border: '1px solid',
          borderColor: selected ? alpha(activeColor, 0.45) : alpha(activeColor, 0.2),
          '&:hover': {
            bgcolor: alpha(activeColor, 0.18),
            borderColor: alpha(activeColor, 0.35),
          },
          '& .MuiChip-deleteIcon': {
            ml: 0.25,
            mr: 0.25,
            color: alpha(activeColor, 0.7),
            '&:hover': {
              color: activeColor,
            },
          },
        };
    }
  };

  return (
    <Chip
      size={size}
      disabled={disabled}
      clickable={Boolean(onClick)}
      onClick={onClick}
      onDelete={onDelete ? handleDelete : undefined}
      deleteIcon={
        onDelete ? (
          <CancelIcon
            sx={{
              fontSize: isSmall ? 15 : 17,
              transition: 'transform 0.16s ease, color 0.16s ease',
              '&:hover': {
                transform: 'scale(1.15)',
              },
            }}
          />
        ) : undefined
      }
      label={
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.65 }}>
          {showEmoji && activeEmoji && (
            <Box
              component="span"
              sx={{
                fontSize: isSmall ? '0.85rem' : '0.95rem',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              {activeEmoji}
            </Box>
          )}
          <Typography
            component="span"
            sx={{
              fontSize: isSmall ? '0.75rem' : '0.8125rem',
              fontWeight: 700,
              color: 'inherit',
              lineHeight: 1,
              letterSpacing: '0.015em',
            }}
          >
            {activeLabel}
          </Typography>
        </Box>
      }
      sx={{
        height: isSmall ? 26 : 32,
        borderRadius: 1,
        px: 0.5,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        '& .MuiChip-label': {
          px: 0.75,
        },
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        }),
        ...getVariantStyles(),
        ...sx,
      }}
    />
  );
};

export default ParticipantLevel;
