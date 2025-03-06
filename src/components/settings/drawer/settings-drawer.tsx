import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { paper, varAlpha } from 'src/theme/styles';
import { defaultFont } from 'src/theme/core/typography';

import { Iconify } from '../../iconify';
import { BaseOption } from './base-option';
import { NavOptions } from './nav-options';
import { Scrollbar } from '../../scrollbar';
import { FontOptions } from './font-options';
import { useSettingsContext } from '../context';
import { defaultSettings } from '../config-settings';
import { FullScreenButton } from './fullscreen-button';

import type { SettingsDrawerProps } from '../types';

// ----------------------------------------------------------------------

export function SettingsDrawer({
  sx,
  hideFont,
  hideCompact,
  hidePresets,
  hideNavColor,
  hideContrast,
  hideNavLayout,
  hideDirection,
  hideColorScheme,
}: SettingsDrawerProps) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const { mode, setMode } = useColorScheme();

  const renderHead = (
    <Box display="flex" alignItems="center" sx={{ py: 2, pr: 1, pl: 2.5 }}>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        Settings
      </Typography>

      <FullScreenButton />

      <Tooltip title="Reset">
        <IconButton
          onClick={() => {
            settings.onReset();
            setMode(defaultSettings.colorScheme);
          }}
        >
          <Badge color="error" variant="dot" invisible={!settings.canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = (
    <BaseOption
      label="Dark mode"
      icon="moon"
      selected={settings.colorScheme === 'dark'}
      onClick={() => {
        settings.onUpdateField('colorScheme', mode === 'light' ? 'dark' : 'light');
        setMode(mode === 'light' ? 'dark' : 'light');
      }}
    />
  );

  const renderNav = (
    <NavOptions
      value={{
        color: settings.primaryColor,
      }}
      onClickOption={{
        color: (newValue) => settings.onUpdateField('primaryColor', newValue),
      }}
      options={{
        colors: ['blue', 'cyan', 'orange', 'purple', 'red'],
      }}
    />
  );

  const renderFont = (
    <FontOptions
      value={settings.fontFamily}
      onClickOption={(newValue) => settings.onUpdateField('fontFamily', newValue)}
      options={[defaultFont, 'Inter Variable', 'DM Sans Variable', 'Nunito Sans Variable']}
    />
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{ backdrop: { invisible: true } }}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          ...paper({
            theme,
            color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
          }),
          width: 360,
          ...sx,
        },
      }}
    >
      {renderHead}

      <Scrollbar>
        <Stack spacing={6} sx={{ px: 2.5, pb: 5 }}>
          <Box gap={2} display="grid" gridTemplateColumns="repeat(2, 1fr)">
            {!hideColorScheme && renderMode}
          </Box>
          {!(hideNavLayout && hideNavColor) && renderNav}
          {!hideFont && renderFont}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}
