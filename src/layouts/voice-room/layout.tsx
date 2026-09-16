// src/layouts/voice-room/voice-room-layout.tsx

import type { SxProps, Theme } from '@mui/material/styles';

import { Box, Container } from '@mui/material';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  header?: React.ReactNode;
  filter?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
  fixedHeader?: boolean;
  maxWidth?: 'lg' | 'xl' | 'md';
};

export function VoiceRoomLayout({
  sx,
  header,
  filter,
  mainContent,
  footer,
  fixedHeader = false,
  maxWidth = 'lg',
}: DashboardLayoutProps) {
  return (
    <Container
      maxWidth={maxWidth}
      disableGutters
      sx={{
        p: { xs: 1 },
        pb: { xs: 0, sm: 1 },
        height: '100%',
        maxHeight: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1 },
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* 1. FIXED HEADER: Stays locked at the top */}
      {fixedHeader && header && <Box sx={{ flexShrink: 0 }}>{header}</Box>}

      {/* Scrollable Content Container */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
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
            minHeight: 0,
          }}
        >
          {/* Filter */}
          {filter && (
            <Box sx={{ flexShrink: 0 }}>
              {filter}
            </Box>
          )}

          {/* Main Content */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {mainContent}
          </Box>

          {/* Footer */}
          {footer && (
            <Box
              sx={{
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' },
                mt: 'auto',
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
