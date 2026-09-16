import type { ContainerProps } from '@mui/material/Container';
import type { Breakpoint } from '@mui/material/styles';

import { Box, type BoxProps } from '@mui/material';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';

import { useSettingsContext } from 'src/components/settings';

import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

export function UserMain({ children, sx, ...other }: BoxProps) {
  return (
    <Box
      component="main"
      sx={{
        backgroundColor: 'background.neutral',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        height: {
          xs: 'calc(100vh - var(--layout-header-mobile-height))',
          sm: 'calc(100vh - var(--layout-header-desktop-height))',
        },
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

type UserContentProps = ContainerProps & {
  disablePadding?: boolean;
};

export function UserContent({
  sx,
  children,
  disablePadding,
  maxWidth = 'lg',
  ...other
}: UserContentProps) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const layoutQuery: Breakpoint = 'lg';

  return (
    <Container
      className={layoutClasses.content}
      maxWidth={settings.compactLayout ? maxWidth : false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        p: 0,
        mb: 0,
        [theme.breakpoints.up(layoutQuery)]: {
          px: 'var(--layout-dashboard-content-px)',
        },
        [theme.breakpoints.down('sm')]: {
          px: 0,
        },
        ...sx,
      }}
      {...other}
    >
      {children}
    </Container>
  );
}
