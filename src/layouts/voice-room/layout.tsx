import type { Theme, SxProps } from '@mui/material/styles';
import type { NavSectionProps } from 'src/components/nav-section';

import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  header?: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  mainContent?: React.ReactNode;
  footer?: React.ReactNode;
  data?: {
    nav?: NavSectionProps['data'];
  };
};

export function VoiceRoomLayout({
  sx,
  header,
  leftSidebar,
  rightSidebar,
  mainContent,
  footer,
  data,
}: DashboardLayoutProps) {
  return (
    <Box
      sx={{
        height: { xs: 'calc(100vh - 55px)', lg: 'calc(100vh - 65px)' },
        maxHeight: { xs: 'calc(100vh - 55px)', lg: 'calc(100vh - 65px)' },
        display: 'grid',
        gridTemplateColumns: {
          xs: '100px 1fr',
          sm: '220px 1fr 60px',
          md: '250px 1fr 60px',
          lg: '250px 1fr 60px',
        },
        gridTemplateRows: {
          xs: '150px 1fr 20px',
          sm: '120px 1fr 30px',
          md: '120px 1fr 30px',
          lg: '120px 1fr 20px',
        },
        gap: 1,
      }}
    >
      <Box sx={{ gridArea: '1 / 1 / 2 / 4', mt: 1 }}>{header}</Box>
      <Box sx={{ gridArea: '2 / 1 / 3 / 2' }}>{leftSidebar}</Box>
      <Box
        sx={{
          gridArea: '2 / 2 / 3 / 3',
          overflow: 'hidden',
        }}
      >
        {mainContent}
      </Box>
      <Box
        sx={{
          gridArea: '2 / 3 / 3 / 4',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {rightSidebar}
      </Box>
      <Box sx={{ gridArea: '3 / 1 / 4 / 4' }}>{footer}</Box>
    </Box>
  );
}
