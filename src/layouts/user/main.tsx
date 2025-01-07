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
        pt: 'var(--layout-dashboard-content-pt)',
        pb: 'var(--layout-dashboard-content-pb)',
        [theme.breakpoints.up(layoutQuery)]: {
          px: 'var(--layout-dashboard-content-px',
        },
      }}
    >
      {children}
    </Container>
  );
}
