import type { Components, Theme } from '@mui/material/styles';
import type { SettingsState } from 'src/components/settings';

import COLORS from '../core/colors.json';
import { components as coreComponents } from '../core/components';
import { grey as coreGreyPalette, primary as corePrimary } from '../core/palette';
import { createPaletteChannel, hexToRgbChannel } from '../styles';
import PRIMARY_COLOR from './primary-color.json';

import type { ThemeComponents, ThemeUpdateOptions } from '../types';

// ----------------------------------------------------------------------

const PRIMARY_COLORS = {
  default: COLORS.primary,
  cyan: PRIMARY_COLOR.cyan,
  purple: PRIMARY_COLOR.purple,
  blue: PRIMARY_COLOR.blue,
  orange: PRIMARY_COLOR.orange,
  red: PRIMARY_COLOR.red,
};

// ----------------------------------------------------------------------

/**
 * [1] settings @primaryColor
 * [2] settings @contrast
 */

export function updateCoreWithSettings(
  theme: ThemeUpdateOptions,
  settings: SettingsState
): ThemeUpdateOptions {
  const { colorSchemes } = theme;

  const updatedPrimary = getPalette(
    settings.primaryColor,
    corePrimary,
    PRIMARY_COLORS[settings.primaryColor]
  );

  return {
    ...theme,
    defaultColorScheme: settings.colorScheme,
    colorSchemes: {
      ...colorSchemes,
      light: {
        palette: {
          ...(colorSchemes?.light as any)?.palette,
          /** [1] */
          primary: updatedPrimary,
          /** [2] */
          background: {
            ...(colorSchemes?.light as any)?.palette?.background,
            default: getBackgroundDefault(settings.contrast),
            defaultChannel: hexToRgbChannel(getBackgroundDefault(settings.contrast)),
          },
        },
      },
      dark: {
        palette: {
          ...(colorSchemes?.dark as any)?.palette,
          /** [1] */
          primary: updatedPrimary,
        },
      },
    },
    colorSchemeSelector: 'class',
  };
}

// ----------------------------------------------------------------------

export function updateComponentsWithSettings(settings: SettingsState) {
  const components: ThemeComponents = {};

  /** [2] */
  if (settings.contrast === 'hight') {
    const MuiCard: Components<Theme>['MuiCard'] = {
      styleOverrides: {
        root: ({ theme, ownerState }) => {
          let rootStyles = {};
          if (typeof coreComponents?.MuiCard?.styleOverrides?.root === 'function') {
            rootStyles = coreComponents.MuiCard.styleOverrides.root({ ownerState, theme }) ?? {};
          }

          return {
            ...rootStyles,
            boxShadow: theme.customShadows.z1,
          };
        },
      },
    };

    components.MuiCard = MuiCard;
  }

  return { components };
}

// ----------------------------------------------------------------------

function getPalette(
  name: SettingsState['primaryColor'],
  initialPalette: typeof corePrimary,
  updatedPalette: typeof corePrimary
) {
  /** [1] */
  return name === 'default' ? initialPalette : createPaletteChannel(updatedPalette);
}

function getBackgroundDefault(contrast: SettingsState['contrast']) {
  /** [2] */
  return contrast === 'default' ? coreGreyPalette[50] : coreGreyPalette[900];
}
