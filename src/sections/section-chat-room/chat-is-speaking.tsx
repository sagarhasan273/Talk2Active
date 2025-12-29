import { Box } from '@mui/material';

import { useMicLevel } from 'src/hooks/use-mic-level';

export function VoiceRoomIsSpeaking({
  statusColor,
  stream,
}: {
  statusColor: any;
  stream: MediaStream | null;
}) {
  const { micLevel } = useMicLevel(stream);
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
          right: 35,
          bottom: 15,
        }}
      >
        <MicLevelIndicator micLevel={micLevel} />
      </Box>
    </>
  );
}

type MicLevelProps = {
  micLevel: number; // 0–50
};

export function MicLevelIndicator({ micLevel }: MicLevelProps) {
  const normalized = Math.min(Math.max(micLevel, 0), 50);
  const bars = Math.ceil((normalized / 50) * 5); // 0–5 bars
  const isTalking = normalized > 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'absolute' }}>
      {/* <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: isTalking ? '#22c55e' : '#9ca3af',
        }}
      >
        {isTalking ? 'Talking' : 'Silent'}
      </span> */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: 3,
              height: i * 2.5,
              borderRadius: 3,
              backgroundColor:
                i <= bars
                  ? isTalking
                    ? '#22c55e' // green
                    : '#9ca3af'
                  : '#e5e7eb',
              transition: 'all 120ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
