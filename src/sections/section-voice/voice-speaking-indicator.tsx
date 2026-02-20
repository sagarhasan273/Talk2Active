import { useMicLevel } from 'src/hooks/use-mic-level';

export function VoiceSpeakingIndicator({ stream }: { stream: MediaStream | null }) {
  const { micLevel } = useMicLevel(stream);

  const normalized = Math.min(Math.max(micLevel, 0), 50);
  const bars = Math.ceil((normalized / 50) * 5); // 0–5 bars
  const isTalking = normalized > 5;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        position: 'absolute',
        right: 10,
        bottom: 30,
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
