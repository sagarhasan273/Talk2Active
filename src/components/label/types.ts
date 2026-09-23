import { type SxProps, type Theme } from '@mui/material';
import React from 'react';

// ----------------------------------------------------------------------


export type LabelVariant = 'filled' | 'outlined' | 'soft';
export type LabelColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export type LabelProps = {
  label: string;
  endIcon?: React.ReactElement | null;
  startIcon?: React.ReactElement | null;
  color?: LabelColor;
  variant?: LabelVariant;
  size?: 'small' | 'medium';
  onClick?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

// src/sections/section-voice/config-level.ts
export type LevelOption = {
  value: string;
  label: string;
  emoji: string;
  color: LabelColor;
};

export type ParticipantLevelProps = {
  label: string;
  value: string;
  variant?: LabelVariant;
  size?: 'small' | 'medium';
  color?: LabelColor;
  showEmoji?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};
