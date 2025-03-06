import type { ThemeColorScheme } from 'src/theme/types';
import type { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type SettingsDrawerProps = {
  sx?: SxProps<Theme>;
  hideFont?: boolean;
  hideCompact?: boolean;
  hidePresets?: boolean;
  hideNavColor?: boolean;
  hideContrast?: boolean;
  hideDirection?: boolean;
  hideNavLayout?: boolean;
  hideColorScheme?: boolean;
};

export type SettingsState = {
  fontFamily: string;
  compactLayout: boolean;
  colorScheme: ThemeColorScheme;
  contrast: 'default' | 'hight';
  primaryColor: 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red';
};

export type SettingsContextValue = SettingsState & {
  canReset: boolean;
  onReset: () => void;
  onUpdate: (updateValue: Partial<SettingsState>) => void;
  onUpdateField: (
    name: keyof SettingsState,
    updateValue: SettingsState[keyof SettingsState]
  ) => void;
  // Drawer
  openDrawer: boolean;
  onCloseDrawer: () => void;
  onToggleDrawer: () => void;
};

export type SettingsProviderProps = {
  settings: SettingsState;
  children: React.ReactNode;
};
