// src/layouts/core/header-section.tsx

import type { AppBarProps } from '@mui/material/AppBar';
import type { ContainerProps } from '@mui/material/Container';
import type { Breakpoint } from '@mui/material/styles';
import type { ToolbarProps } from '@mui/material/Toolbar';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { styled, useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

import { useScrollOffSetTop } from 'src/hooks/use-scroll-offset-top';
import { bgBlur, varAlpha } from 'src/theme/styles';
import { layoutClasses } from '../classes';

// ----------------------------------------------------------------------

const StyledElevation = styled('span')(({ theme }) => ({
  left: 0,
  right: 0,
  bottom: 0,
  m: 'auto',
  height: 24,
  zIndex: -1,
  opacity: 0.48,
  borderRadius: '50%',
  position: 'absolute',
  width: `calc(100% - 48px)`,
  boxShadow: theme.customShadows.z8,
}));

// ----------------------------------------------------------------------

export type HeaderSectionProps = AppBarProps & {
  layoutQuery?: Breakpoint;
  disableOffset?: boolean;
  disableElevation?: boolean;
  slots?: {
    leftArea?: React.ReactNode;
    rightArea?: React.ReactNode;
    topArea?: React.ReactNode;
    centerArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  slotProps?: {
    toolbar?: ToolbarProps;
    container?: ContainerProps;
  };
};

export function HeaderSection({
  sx,
  slots,
  slotProps,
  disableOffset,
  disableElevation,
  layoutQuery = 'sm', // Align breakpoint with main container
  ...other
}: HeaderSectionProps) {
  const theme = useTheme();
  const { offsetTop } = useScrollOffSetTop();

  const toolbarStyles = {
    default: {
      p: 0,
      minHeight: 'var(--layout-header-mobile-height) !important',
      height: 'var(--layout-header-mobile-height)',
      transition: theme.transitions.create(['height', 'background-color'], {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
      }),
      [theme.breakpoints.up(layoutQuery)]: {
        minHeight: 'var(--layout-header-desktop-height) !important',
        height: 'var(--layout-header-desktop-height)',
      },
    },
    offset: {
      ...bgBlur({ color: varAlpha(theme.vars.palette.background.defaultChannel, 0.8) }),
    },
  };

  return (
    <AppBar
      position="static" // Static prevents double offsets inside full-height flex column
      elevation={0}
      className={layoutClasses.header}
      sx={{
        flexShrink: 0,
        zIndex: 'var(--layout-header-zIndex)',
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        ...sx,
      }}
      {...other}
    >
      {slots?.topArea}

      <Toolbar
        disableGutters
        {...slotProps?.toolbar}
        sx={{
          ...toolbarStyles.default,
          ...(!disableOffset && offsetTop && toolbarStyles.offset),
          ...slotProps?.toolbar?.sx,
        }}
      >
        <Container
          {...slotProps?.container}
          sx={{
            height: 1,
            display: 'flex',
            alignItems: 'center',
            ...slotProps?.container?.sx,
          }}
        >
          {slots?.leftArea}

          <Box sx={{ display: 'flex', flex: '1 1 auto', justifyContent: 'center' }}>
            {slots?.centerArea}
          </Box>

          {slots?.rightArea}
        </Container>
      </Toolbar>

      {slots?.bottomArea}

      {!disableElevation && offsetTop && <StyledElevation />}
    </AppBar>
  );
}
