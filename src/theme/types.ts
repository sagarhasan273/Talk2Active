import type { TypographyStyleOptions } from '@mui/material/styles/createTypography';
import type { CssVarsTheme, Theme as BaseTheme, CssVarsThemeOptions } from '@mui/material/styles';

// ----------------------------------------------------------------------

export type Theme = Omit<BaseTheme, 'palette' | 'applyStyles'> & CssVarsTheme;

export type ThemeUpdateOptions = Omit<CssVarsThemeOptions, 'typography'> & {
  typography?: TypographyStyleOptions;
};

export type ThemeComponents = CssVarsThemeOptions['components'];

export type ThemeColorScheme = 'light' | 'dark';

export type ThemeDirection = 'ltr' | 'rtl';

export type ThemeLocaleComponents = { components: ThemeComponents };
