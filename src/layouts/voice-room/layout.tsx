// src/layouts/voice-room/voice-room-layout.tsx

import type { SxProps, Theme } from '@mui/material/styles';

import { Scrollbar } from '@/components/scrollbar';
import { Box, Container } from '@mui/material';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  header?: React.ReactNode;
  filter?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
  fixedHeader?: boolean;
  maxWidth?: 'lg' | 'xl' | 'md' | false;
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
        px: { xs: 1 },
        pb: { xs: 0, sm: 1 },
        height: '100vh', // Ensure it takes the full viewport height
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1 },
        position: 'relative',
        overflow: 'hidden', // Prevents outer scrolling
        ...sx,
      }}
    >
      {/* 1. FIXED HEADER: Stays locked at the top */}
      {fixedHeader && header && <Box sx={{ pt: 1, flexShrink: 0 }}>{header}</Box>}

      {/* Scrollable Content Container */}
      <Scrollbar
        sx={{
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: 0,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%', // Ensures content stretches to at least the height of the Scrollbar
            width: '100%'
          }}
        >
          {/* 2. SCROLLABLE HEADER: Scrolls away with the page content */}
          {!fixedHeader && header && (
            <Box sx={{ flexShrink: 0, mb: { xs: 1 } }}>
              {header}
            </Box>
          )}

          {/* Filter */}
          {filter && (
            <Box sx={{ flexShrink: 0, mb: 1 }}>
              {filter}
            </Box>
          )}

          {/* Main Content (Fills available space) */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              minHeight: 0,
              mb: 1
            }}
          >
            {mainContent}
          </Box>

          {/* Footer */}
          {footer && (
            <Box
              sx={{
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' },
                mt: 'auto', // Pushes footer to the bottom if content is short
                height: 40
              }}
            >
              {footer}
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Container>
  );
}