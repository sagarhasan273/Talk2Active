// src/sections/section-voice/components/room-loading-fallback.tsx

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Box, Button, Container, Typography, alpha, useTheme } from '@mui/material';

export function RoomLoadingFallback() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleManualReload = () => {
    window.location.reload();
  };

  return (
    <Container
      sx={{
        width: '100%',
        my: 'auto',
        height: 400,
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
        bgcolor: isDark ? '#141824' : '#f8fafc',
        borderRadius: 2,
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.warning.main, 0.12),
          color: 'warning.main',
          mb: 2,
        }}
      >
        <ErrorOutlineRoundedIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography variant="h6" fontWeight={800} gutterBottom color="text.primary">
        Connecting to Voice Room...
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mb: 3 }}>
        We are taking a bit longer than usual to establish a secure connection. Apologies for the delay!
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshRoundedIcon />}
        onClick={handleManualReload}
        sx={{
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 1.25,
          px: 3,
          py: 1,
          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
        }}
      >
        Reload Now
      </Button>
    </Container>
  );
}

export default RoomLoadingFallback;
