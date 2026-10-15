// src/components/settings/drawer/base-option.tsx

import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';

import { Iconify } from 'src/components/iconify';

import { SvgColor } from '../../svg-color';

// ----------------------------------------------------------------------

type Props = ButtonBaseProps & {
  icon: string;
  label: string;
  selected: boolean;
  tooltip?: string;
};

export function BaseOption({ icon, label, tooltip, selected, sx, ...other }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <ButtonBase
      disableRipple
      sx={{
        width: 1,
        px: 1.5,
        py: 1,
        borderRadius: 1,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: selected
          ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)
          : isDark
            ? alpha('#fff', 0.025)
            : '#ffffff',
        border: '1px solid',
        borderColor: selected
          ? alpha(theme.palette.primary.main, 0.35)
          : isDark
            ? alpha('#fff', 0.07)
            : '#e2e8f0',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: selected
            ? alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1)
            : isDark
              ? alpha('#fff', 0.05)
              : '#f8fafc',
          borderColor: selected
            ? theme.palette.primary.main
            : isDark
              ? alpha('#fff', 0.14)
              : '#cbd5e1',
        },
        ...sx,
      }}
      {...other}
    >
      {/* Left: Icon Badge + Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: selected
              ? alpha(theme.palette.primary.main, 0.18)
              : isDark
                ? alpha('#fff', 0.05)
                : '#f1f5f9',
            color: selected ? 'primary.main' : 'text.secondary',
            transition: 'all 0.15s ease',
          }}
        >
          <SvgColor
            src={`${CONFIG.assetsDir}/assets/icons/settings/ic-${icon}.svg`}
            sx={{ width: 16, height: 16 }}
          />
        </Box>

        <Box
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: 12.5,
            color: isDark ? 'text.primary' : '#0f172a',
          }}
        >
          {label}
        </Box>

        {tooltip && (
          <Tooltip
            arrow
            title={tooltip}
            slotProps={{
              tooltip: { sx: { maxWidth: 240 } },
            }}
          >
            <Iconify
              width={14}
              icon="eva:info-outline"
              sx={{ cursor: 'pointer', color: 'text.disabled' }}
            />
          </Tooltip>
        )}
      </Box>

      {/* Right: Toggle Switch */}
      <Switch name={label} size="small" checked={selected} sx={{ mr: -0.5 }} />
    </ButtonBase>
  );
}
