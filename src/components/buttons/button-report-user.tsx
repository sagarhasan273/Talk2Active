// src/components/button-report-user/button-report-user.tsx

import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import {
  alpha,
  Button,
  IconButton,
  type SxProps,
  type Theme,
  Tooltip,
  useTheme,
} from '@mui/material';
import React from 'react';

export type ReportButtonVariant = 'icon' | 'soft' | 'outlined' | 'button';

export type ButtonReportUserProps = {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  variant?: ReportButtonVariant;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
};

export const ButtonReportUser = ({
  onClick,
  variant = 'icon',
  size = 'small',
  fullWidth = false,
  sx,
}: ButtonReportUserProps) => {
  const theme = useTheme();

  // ── 1. Variant: ICON ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <Tooltip title="Report user" arrow placement="top">
        <IconButton
          size={size}
          onClick={onClick}
          sx={{
            width: size === 'small' ? 36 : 40,
            // height: size === 'small' ? 36 : 40,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            color: 'warning.main',
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            transition: 'all 0.18s ease',
            '&:hover': {
              borderColor: 'warning.main',
              bgcolor: alpha(theme.palette.warning.main, 0.16),
            },
            ...sx,
          }}
        >
          <FlagRoundedIcon sx={{ fontSize: size === 'small' ? 17 : 19 }} />
        </IconButton>
      </Tooltip>
    );
  }

  // ── 2. Variant: SOFT ──────────────────────────────────────────────
  if (variant === 'soft') {
    return (
      <Button
        fullWidth={fullWidth}
        size={size}
        onClick={onClick}
        startIcon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
        sx={{
          // height: size === 'small' ? 36 : 40,
          borderRadius: 1,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: size === 'small' ? 12 : 13,
          color: 'warning.main',
          bgcolor: alpha(theme.palette.warning.main, 0.08),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
          '&:hover': {
            bgcolor: alpha(theme.palette.warning.main, 0.16),
            borderColor: 'warning.main',
          },
          ...sx,
        }}
      >
        Report
      </Button>
    );
  }

  // ── 3. Variant: OUTLINED ──────────────────────────────────────────
  if (variant === 'outlined') {
    return (
      <Button
        fullWidth={fullWidth}
        size={size}
        variant="outlined"
        color="warning"
        onClick={onClick}
        startIcon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
        sx={{
          // height: size === 'small' ? 36 : 40,
          borderRadius: 1,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: size === 'small' ? 12 : 13,
          ...sx,
        }}
      >
        Report
      </Button>
    );
  }

  // ── 4. Variant: BUTTON (Contained) ────────────────────────────────
  return (
    <Button
      fullWidth={fullWidth}
      size={size}
      variant="contained"
      color="warning"
      onClick={onClick}
      startIcon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
      sx={{
        // height: size === 'small' ? 36 : 40,
        borderRadius: 1,
        fontWeight: 700,
        textTransform: 'none',
        fontSize: size === 'small' ? 12 : 13,
        boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.28)}`,
        ...sx,
      }}
    >
      Report
    </Button>
  );
};

export default ButtonReportUser;
