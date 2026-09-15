// src/layouts/voice-room/voice-room-layout.tsx

import type { SxProps, Theme } from '@mui/material/styles';

import { useEffect, useRef } from 'react';

import { Box, Container } from '@mui/material';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  header?: React.ReactNode;
  filter?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
  fixedHeader?: boolean; // Determines if header sticks to top or scrolls
};

export function VoiceRoomLayout({
  sx,
  header,
  filter,
  mainContent,
  footer,
  fixedHeader = false,
}: DashboardLayoutProps) {
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
      maxWidth={!fixedHeader ? "xl" : 'lg'}
      disableGutters
      sx={{
        p: { xs: 1 },
        height: { xs: 'calc(100vh - 54px)', sm: 'calc(100vh - 64px)' },
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1 },
        position: 'relative',
        ...sx,
      }}
    >
      {/* 1. FIXED HEADER: Stays locked at the top */}
      {fixedHeader && header}

      {/* Scrollable Content Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 3,
          },
        }}
      >
        {/* 2. SCROLLABLE HEADER: Scrolls away with the page content */}
        {!fixedHeader && header && (
          <Box sx={{ flexShrink: 0, mb: { xs: 1 } }}>
            {header}
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flex: 1,
          }}
        >
          {/* Filter */}
          {filter && (
            <Box sx={{ flexShrink: 0 }}>
              {filter}
            </Box>
          )}

          {/* Main Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {mainContent}
          </Box>

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