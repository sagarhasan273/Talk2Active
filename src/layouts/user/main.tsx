import type { Breakpoint } from '@mui/material/styles';
import type { ContainerProps } from '@mui/material/Container';

import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import { Box, type BoxProps } from '@mui/material';

import { useSettingsContext } from 'src/components/settings';

import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

type MainProps = BoxProps & {
  isNavHorizontal?: boolean;
};

export function UserMain({ children, isNavHorizontal, sx, ...other }: MainProps) {
  return (
    <Box
      component="main"
      className={layoutClasses.main}
      sx={{
        position: 'relative',
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        ...(isNavHorizontal && {
          '--layout-dashboard-content-pt': '40px',
        }),
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
