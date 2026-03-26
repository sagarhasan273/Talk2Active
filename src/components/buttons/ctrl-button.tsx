import type { SxProps } from '@mui/material';

import React from 'react';

import { alpha, Tooltip, useTheme, IconButton } from '@mui/material';

export const CtrlBtn = React.forwardRef<
  HTMLButtonElement,
  {
    tooltip?: string;
    active?: boolean;
    danger?: boolean;
    warn?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    sx?: SxProps;
  }
>(({ tooltip, active, danger, warn, onClick, children, disabled, sx }, ref) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const p = theme.palette;

  const color = danger ? '#ff4d4d' : warn ? p.warning.main : active ? p.primary.main : 'grey.500';
  const bg = danger
    ? alpha('#ff4d4d', 0.12)
    : warn
      ? alpha(p.warning.main, 0.12)
      : active
        ? alpha(p.primary.main, 0.12)
        : 'transparent';
  const bdr = danger
    ? alpha('#ff4d4d', 0.28)
    : warn
      ? alpha(p.warning.main, 0.28)
      : active
        ? alpha(p.primary.main, 0.28)
        : 'transparent';

  return (
    <Tooltip title={tooltip} arrow>
      <span>
        <IconButton
          ref={ref}
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            borderRadius: '10px',
            color,
            bgcolor: bg,
            border: '1px solid',
            borderColor: bdr,
            transition: 'all 0.16s ease',
            minWidth: 34,
            minHeight: 34,
            '&:hover': {
              bgcolor: danger
                ? alpha('#ff4d4d', 0.22)
                : warn
                  ? alpha(p.warning.main, 0.22)
                  : active
                    ? alpha(p.primary.main, 0.2)
                    : isDark
                      ? alpha('#fff', 0.08)
                      : alpha('#000', 0.06),
              transform: 'scale(1.06)',
            },
            '&:active': { transform: 'scale(0.94)' },
            '&.Mui-disabled': { opacity: 0.38 },
            ...sx,
          }}
        >
          {children}
        </IconButton>
      </span>
    </Tooltip>
  );
});
