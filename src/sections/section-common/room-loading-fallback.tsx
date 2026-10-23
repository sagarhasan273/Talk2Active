// src/sections/section-voice/components/room-loading-fallback.tsx

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  SxProps,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { useVoiceRoomStorage } from '@/core/contexts';
import { useLiveKitSession } from '@/core/contexts/app-context/context-livekit';
import { useRoomTools } from '@/core/slices';

interface RoomLoadingFallbackProps {
  error?: Error | string | boolean | null;
  onRetry?: () => void;
  sx?: SxProps
}

export function RoomLoadingFallback({ error: propError, onRetry, sx }: RoomLoadingFallbackProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { selectedRoom } = useVoiceRoomStorage();
  const { room } = useRoomTools();
  const liveKitSession = useLiveKitSession() as any;

  // Detect error from props or from LiveKit session context
  const livekitError =
    propError ||
    liveKitSession?.error ||
    liveKitSession?.connectionError ||
    liveKitSession?.roomError ||
    (liveKitSession?.connectionState === 'disconnected' && liveKitSession?.hasError);

  const hasError = Boolean(livekitError);

  const targetRoom = selectedRoom || room;
  const roomTopic = targetRoom?.topic;
  const welcomeMessage = targetRoom?.welcome_message?.trim();

  const handleManualReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
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
        ...sx
      }}
    >
      {/* Top Status Icon: Spinner while connecting, Warning icon on error */}
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: hasError
            ? alpha(theme.palette.warning.main, 0.12)
            : alpha(theme.palette.primary.main, 0.12),
          color: hasError ? 'warning.main' : 'primary.main',
          mb: 2,
        }}
      >
        {hasError ? (
          <ErrorOutlineRoundedIcon sx={{ fontSize: 32 }} />
        ) : (
          <CircularProgress size={26} thickness={4.5} color="primary" disableShrink />
        )}
      </Box>

      {/* Main Heading */}
      <Typography variant="h6" fontWeight={800} gutterBottom color="text.primary">
        {hasError
          ? 'Connection Failed'
          : roomTopic
            ? `Connecting to "${roomTopic}"...`
            : 'Connecting to Voice Room...'}
      </Typography>

      {/* Description / Welcome Message */}
      {hasError ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mb: 3 }}>
          {typeof livekitError === 'string'
            ? livekitError
            : livekitError instanceof Error
              ? livekitError.message
              : 'We ran into an issue establishing a secure connection to the voice server. Please reload to try again.'}
        </Typography>
      ) : welcomeMessage ? (
        <Box
          sx={{
            maxWidth: 420,
            mt: 0.5,
            px: 2,
            py: 1.25,
            borderRadius: 0.5,
            bgcolor: isDark ? alpha('#fff', 0.03) : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <FormatQuoteRoundedIcon
            sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0, opacity: 0.8 }}
          />
          <Typography
            variant="body2"
            sx={{
              color: isDark ? 'text.secondary' : '#475569',
              fontStyle: 'italic',
              fontWeight: 500,
              textAlign: 'left',
            }}
          >
            {welcomeMessage}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
          Setting up your audio stage and establishing a secure connection. Just a moment!
        </Typography>
      )}

      {/* Reload Button: Shown ONLY when there is a LiveKit connection error */}
      {hasError && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshRoundedIcon />}
          onClick={handleManualReload}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 0.5,
            px: 3,
            py: 1,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.28)}`,
          }}
        >
          Reload Now
        </Button>
      )}
    </Container>
  );
}

export default RoomLoadingFallback;
