import { varAlpha } from '../styles';
import {
  red,
  grey,
  info,
  blue,
  pink,
  cyan,
  teal,
  rose,
  error,
  green,
  amber,
  stone,
  common,
  purple,
  yellow,
  indigo,
  orange,
  violet,
  primary,
  success,
  warning,
  emerald,
  secondary,
} from './palette';

import type { ThemeColorScheme } from '../types';

// ----------------------------------------------------------------------

export interface CustomShadows {
  z1?: string;
  z4?: string;
  z8?: string;
  z12?: string;
  z16?: string;
  z20?: string;
  z24?: string;
  //
  primary?: string;
  secondary?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
  purple?: string;
  yellow?: string;
  blue?: string;
  red?: string;
  green?: string;
  indigo?: string;
  pink?: string;
  cyan?: string;
  orange?: string;
  teal?: string;
  violet?: string;
  emerald?: string;
  rose?: string;
  amber?: string;
  stone?: string;
  //
  card?: string;
  dialog?: string;
  dropdown?: string;
}

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
  interface ThemeVars {
    customShadows: CustomShadows;
  }
}

// ----------------------------------------------------------------------

export function createShadowColor(colorChannel: string) {
  return `0 8px 16px 0 ${varAlpha(colorChannel, 0.24)}`;
}

export function customShadows(colorScheme: ThemeColorScheme) {
  const colorChannel = colorScheme === 'light' ? grey['500Channel'] : common.blackChannel;

  return {
    z1: `0 1px 2px 0 ${varAlpha(colorChannel, 0.16)}`,
    z4: `0 4px 8px 0 ${varAlpha(colorChannel, 0.16)}`,
    z8: `0 8px 16px 0 ${varAlpha(colorChannel, 0.16)}`,
    z12: `0 12px 24px -4px ${varAlpha(colorChannel, 0.16)}`,
    z16: `0 16px 32px -4px ${varAlpha(colorChannel, 0.16)}`,
    z20: `0 20px 40px -4px ${varAlpha(colorChannel, 0.16)}`,
    z24: `0 24px 48px 0 ${varAlpha(colorChannel, 0.16)}`,
    //
    dialog: `-40px 40px 80px -8px ${varAlpha(common.blackChannel, 0.24)}`,
    card: `0 0 2px 0 ${varAlpha(colorChannel, 0.2)}, 0 12px 24px -4px ${varAlpha(colorChannel, 0.12)}`,
    dropdown: `0 0 2px 0 ${varAlpha(colorChannel, 0.24)}, -20px 20px 40px -4px ${varAlpha(colorChannel, 0.24)}`,
    //
    primary: createShadowColor(primary.mainChannel),
    secondary: createShadowColor(secondary.mainChannel),
    info: createShadowColor(info.mainChannel),
    success: createShadowColor(success.mainChannel),
    warning: createShadowColor(warning.mainChannel),
    error: createShadowColor(error.mainChannel),
    purple: createShadowColor(purple.mainChannel),
    yellow: createShadowColor(yellow.mainChannel),
    blue: createShadowColor(blue.mainChannel),
    red: createShadowColor(red.mainChannel),
    green: createShadowColor(green.mainChannel),
    indigo: createShadowColor(indigo.mainChannel),
    pink: createShadowColor(pink.mainChannel),
    cyan: createShadowColor(cyan.mainChannel),
    orange: createShadowColor(orange.mainChannel),
    teal: createShadowColor(teal.mainChannel),
    violet: createShadowColor(violet.mainChannel),
    emerald: createShadowColor(emerald.mainChannel),
    rose: createShadowColor(rose.mainChannel),
    amber: createShadowColor(amber.mainChannel),
    stone: createShadowColor(stone.mainChannel),
  };
}
