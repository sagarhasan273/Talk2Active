import { useTheme } from '@mui/material';

import { useMicLevel } from 'src/hooks/use-mic-level';

export function VoiceSpeakingIndicator({
  stream,
  size = 'small',
}: {
  stream: MediaStream | null;
  size?: 'small' | 'medium' | 'large';
}) {
  const theme = useTheme();

  const { micLevel } = useMicLevel(stream);

  const normalized = Math.min(Math.max(micLevel, 0), 50);
  const bars = Math.ceil((normalized / 50) * 5); // 0–5 bars
  const isTalking = normalized > 5;

  const selectedSize = {
    small: {
      top: 'calc(100% - 10px)',
      left: '100%',
    },
    medium: {
      top: 'calc(100% - 5px)',
      left: 'calc(100% - 10px)',
    },
    large: {
      top: 'calc(100% - 12px)',
      left: 'calc(100% - 5px)',
    },
  }[size];

  return (
    <div
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
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: i * 3,
              borderRadius: 3,
              backgroundColor:
                i <= bars
                  ? isTalking
                    ? '#22c55e' // green
                    : '#7e8da7'
                  : '#d1d1d1',
              transition: 'all 120ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
