import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { Button, CircularProgress } from '@mui/material';
import { useKrispNoiseFilter } from './voice-room-user-controller/hook-krisp-noice-filter';

export const KrispNoiseFilterToggle = () => {
  const {
    isNoiseFilterPending,
    isNoiseFilterEnabled,
    setNoiseFilterEnabled,
    isSupported,
  } = useKrispNoiseFilter();

  if (!isSupported) return null;

  return (
    <Button
      variant={isNoiseFilterEnabled ? 'contained' : 'outlined'}
      color={isNoiseFilterEnabled ? 'primary' : 'inherit'}
      size="small"
      disabled={isNoiseFilterPending}
      startIcon={
        isNoiseFilterPending ? (
          <CircularProgress size={14} color="inherit" />
        ) : (
          <GraphicEqIcon fontSize="small" />
        )
      }
      onClick={() => setNoiseFilterEnabled(!isNoiseFilterEnabled)}
      sx={{
        textTransform: 'none',
        borderRadius: 1,
        fontSize: 11,
        fontWeight: 700,
        py: 0.25,
        px: 1,
        height: 28,
        whiteSpace: 'nowrap',
      }}
    >
      {isNoiseFilterPending
        ? 'Loading...'
        : isNoiseFilterEnabled
          ? 'Krisp Active'
          : 'Noise Cancel'}
    </Button>
  );
};
