import { Box } from '@mui/material';
import { Mic } from '@mui/icons-material';

export function VoiceRoomIsSpeaking({ statusColor }: { statusColor: any }) {
  return (
    <>
      {/* Option 1: Voice Wave Visualization */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          borderRadius: 1,
          pointerEvents: 'none',
        }}
      >
        {/* Animated sound waves */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: '38%',
              left: '50%',
              width: '100%',
              height: '100%',
              borderRight: `1px solid ${statusColor}`,
              borderLeft: `1px solid ${statusColor}`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `soundWave ${2 + index * 0.5}s ease-out infinite`,
              animationDelay: `${index * 0.3}s`,
              opacity: 0,
              '@keyframes soundWave': {
                '0%': {
                  width: '0%',
                  height: '0%',
                  opacity: 0.8,
                  borderWidth: '2px',
                },
                '50%': {
                  opacity: 0.4,
                },
                '100%': {
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  borderWidth: '0px',
                },
              },
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: 3,
          right: 3,
          width: 18,
          height: 18,
          borderRadius: 1,
          backgroundColor: statusColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'micActive 1.5s ease-in-out infinite',
          border: '2px solid',
          borderColor: 'background.paper',
          '@keyframes micActive': {
            '0%, 100%': {
              transform: 'scale(1)',
              boxShadow: `0 0 0 0 ${statusColor}40`,
            },
            '50%': {
              transform: 'scale(1.2)',
              boxShadow: `0 0 0 4px ${statusColor}40`,
            },
          },
        }}
      >
        <Mic sx={{ fontSize: 12, color: 'white' }} />
      </Box>
    </>
  );
}
