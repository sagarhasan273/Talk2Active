import { defaultFont } from 'src/theme/core/typography';

import type { SettingsState } from './types';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'app-settings';

export const defaultSettings: SettingsState = {
  colorScheme: 'light',
  contrast: 'default',
  primaryColor: 'blue',
  compactLayout: true,
  fontFamily: defaultFont,
} as const;
