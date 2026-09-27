import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'A1-A2 Beginner', emoji: '🌱' },
  { value: 'intermediate', label: 'B1-B2 Intermediate', emoji: '📈' },
  { value: 'advanced', label: 'C1 Advanced', emoji: '🏆' },
  { value: 'fluent', label: 'C2 Fluent / Proficient', emoji: '💎' },
  { value: 'native', label: 'Native / Bilingual Mastery', emoji: '👑' },
];

interface DialogRateSpeakingLevelProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  onRateUser?: (userId: string, rating: number, levelFeedback: string) => void;
}

export const DialogRateSpeakingLevel: React.FC<DialogRateSpeakingLevelProps> = ({
  open,
  onClose,
  userId,
  userName = 'User',
  onRateUser,
}) => {
  const theme = useTheme();

  const [starRating, setStarRating] = useState<number>(4);
  const [ratedLevel, setRatedLevel] = useState<string>('fluent');

  // Direct 1-to-1 sync between 1–5 stars and the 5 proficiency tiers
  const handleRatingChange = (_: React.SyntheticEvent, val: number | null) => {
    const nextVal = val ?? 1;
    setStarRating(nextVal);

    switch (nextVal) {
      case 1:
        setRatedLevel('beginner');
        break;
      case 2:
        setRatedLevel('intermediate');
        break;
      case 3:
        setRatedLevel('advanced');
        break;
      case 4:
        setRatedLevel('fluent');
        break;
      case 5:
        setRatedLevel('native');
        break;
      default:
        setRatedLevel('intermediate');
    }
  };

  const handleLevelChange = (newLevel: string) => {
    setRatedLevel(newLevel);
    const index = PROFICIENCY_LEVELS.findIndex((item) => item.value === newLevel);
    if (index !== -1) {
      setStarRating(index + 1);
    }
  };

  const handleSave = () => {
    if (userId && starRating) {
      onRateUser?.(userId, starRating, ratedLevel);
    }
    onClose();
  };

  const currentLevelObj =
    PROFICIENCY_LEVELS.find((l) => l.value === ratedLevel) || PROFICIENCY_LEVELS[2];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        zIndex: theme.zIndex.modal + 20,
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(theme.palette.common.black, 0.45),
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
          backgroundColor: theme.palette.background.paper,
          boxShadow: `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.4)}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Rate Speaking Level</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          How well is <strong>{userName}</strong> communicating and expressing ideas?
        </Typography>

        {/* 1 to 5 Star Rating */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
          <Rating
            size="large"
            value={starRating}
            onChange={handleRatingChange}
            max={5}
            sx={{ fontSize: '2.5rem', mb: 1 }}
          />
          <Typography variant="subtitle2" fontWeight={800} color="primary.main">
            {starRating} of 5 Stars — {currentLevelObj.emoji} {currentLevelObj.label}
          </Typography>
        </Box>

        {/* 5-Tier Select Menu with Elevated Z-Index */}
        <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
          <InputLabel id="rate-proficiency-tier-label">Assessed Proficiency</InputLabel>
          <Select
            labelId="rate-proficiency-tier-label"
            value={ratedLevel}
            label="Assessed Proficiency"
            onChange={(e) => handleLevelChange(e.target.value)}
            MenuProps={{
              sx: {
                zIndex: theme.zIndex.modal + 30,
              },
            }}
          >
            {PROFICIENCY_LEVELS.map((tier) => (
              <MenuItem key={tier.value} value={tier.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{tier.emoji}</span>
                  <Typography variant="body2" fontWeight={600}>
                    {tier.label}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        >
          Submit Rating
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DialogRateSpeakingLevel);
