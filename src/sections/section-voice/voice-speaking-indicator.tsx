import MicOffIcon from '@mui/icons-material/MicOff';
import { Box, Tooltip, useTheme, useMediaQuery } from '@mui/material';

import { useMicLevel } from 'src/hooks/use-mic-level';

export function VoiceSpeakingIndicator({
  stream,
  size = 'small',
  isMuted = false,
}: {
  stream: MediaStream | null;
  size?: 'small' | 'medium' | 'large';
  isMuted: boolean;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { micLevel } = useMicLevel(stream);

  const normalized = Math.min(Math.max(micLevel, 0), 50);
  const bars = Math.ceil((normalized / 50) * 5); // 0–5 bars
  const isTalking = normalized > 5;

  const selectedSize = {
    small: {
      top: 'calc(100% - 8px)',
      left: '100%',
    },
    medium: {
      top: 'calc(100% - 5px)',
      left: 'calc(100% - 5px)',
    },
    large: {
      top: 'calc(100% - 12px)',
      left: 'calc(100% - 5px)',
    },
  }[size];

  return (
    <Box
      style={{
        position: 'absolute',
        ...selectedSize,
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing(0.5),
        zIndex: 10,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {isMuted ? (
        <Tooltip title="Muted" arrow placement="top">
          <Box
            sx={{
              bgcolor: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              borderRadius: '50%',
              width: isMobile ? 24 : 28,
              height: isMobile ? 24 : 28,
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[2],
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: `0 0 0 0 rgba(244, 67, 54, 0.7)` },
                '70%': { boxShadow: `0 0 0 6px rgba(244, 67, 54, 0)` },
                '100%': { boxShadow: `0 0 0 0 rgba(244, 67, 54, 0)` },
              },
            }}
          >
            <MicOffIcon
              sx={{
                fontSize: isMobile ? 14 : 18,
                color: '#fff',
              }}
            />
          </Box>
        </Tooltip>
      ) : (
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: size === 'small' ? 3 : size === 'medium' ? 3.5 : 3.5,
                height: i * (size === 'small' ? 2.5 : size === 'medium' ? 2.5 : 3),
                borderRadius: 3,
                backgroundColor:
                  i <= bars
                    ? isTalking
                      ? '#22c55e' // green
                      : '#5865f2' // Discord blue instead of grey when not talking
                    : '#7a7a7a', // Darker grey for inactive
                transition: 'all 120ms ease',
              }}
            />
          ))}
        </div>
      )}
    </Box>
  );
}
