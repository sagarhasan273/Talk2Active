import type { Theme, SxProps } from '@mui/material/styles';

import { useRef, useEffect } from 'react';

import { Box, Container } from '@mui/material';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  header?: React.ReactNode;
  filter?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
};

export function VoiceRoomLayout({ sx, header, filter, mainContent, footer }: DashboardLayoutProps) {
  const dragConstraints = useRef({ min: 10, max: window.innerHeight - 100 });

  useEffect(() => {
    const handleResize = () => {
      dragConstraints.current.max = window.innerHeight - 100;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        p: { xs: 1 },
        height: { xs: 'calc(100vh - 54px)', sm: 'calc(100vh - 64px)' },
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: { xs: 1, sm: 2 },
        position: 'relative',
        ...sx,
      }}
    >
      {header}

      {/* Scrollable Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 3,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Filter */}
          {filter && (
            <Box
              sx={{
                flexShrink: 0,
              }}
            >
              {filter}
            </Box>
          )}

          {mainContent}

          {/* Footer */}
          {footer && (
            <Box
              sx={{
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' },
                mt: 1,
              }}
            >
              {footer}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
