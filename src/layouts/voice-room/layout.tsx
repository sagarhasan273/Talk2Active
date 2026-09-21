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
        height: 1,
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1 },
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {fixedHeader && header && <Box sx={{ pt: 1, flexShrink: 0 }}>{header}</Box>}



      {mainContent}


      {footer && (
        <Box
          sx={{
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
            mt: 'auto',
            height: 30
          }}
        >
          {footer}
        </Box>
      )}

    </Container>
  );
}