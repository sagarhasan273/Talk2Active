import { useSubmitRatingMutation } from '@/core/apis';
import {
  alpha,
  Box,
  Button,
  CircularProgress,
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

import type { SpeakingProficiencyLevel } from 'src/types/type-rating';

const PROFICIENCY_LEVELS: {
  value: SpeakingProficiencyLevel;
  label: string;
  emoji: string;
}[] = [
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
  onRateSuccess?: (rating: number, levelFeedback: SpeakingProficiencyLevel) => void;
}

export const DialogRateSpeakingLevel: React.FC<DialogRateSpeakingLevelProps> = ({
  open,
  onClose,
  userId,
  userName = 'User',
  onRateSuccess,
}) => {
  const theme = useTheme();

  const [starRating, setStarRating] = useState<number>(4);
  const [ratedLevel, setRatedLevel] = useState<SpeakingProficiencyLevel>('fluent');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // RTK Query Mutation Hook
  const [submitRating, { isLoading }] = useSubmitRatingMutation();

  // Sync stars with proficiency tiers
  const handleRatingChange = (_: React.SyntheticEvent, val: number | null) => {
    const nextVal = val ?? 1;
    setStarRating(nextVal);
    setErrorMessage(null);

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

  const handleLevelChange = (newLevel: SpeakingProficiencyLevel) => {
    setRatedLevel(newLevel);
    setErrorMessage(null);
    const index = PROFICIENCY_LEVELS.findIndex((item) => item.value === newLevel);
    if (index !== -1) {
      setStarRating(index + 1);
    }
  };

  // Submit Rating Handler
  const handleSave = async () => {
    if (!userId) return;
    setErrorMessage(null);

    try {
      await submitRating({
        targetUserId: userId,
        rating: starRating,
        levelFeedback: ratedLevel,
      }).unwrap();

      onRateSuccess?.(starRating, ratedLevel);
      onClose();
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setErrorMessage(err?.data?.message || err?.message || 'Failed to submit rating. Please try again.');
    }
  };

  const currentLevelObj =
    PROFICIENCY_LEVELS.find((l) => l.value === ratedLevel) || PROFICIENCY_LEVELS[2];

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
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
            disabled={isLoading}
            max={5}
            sx={{ fontSize: '2.5rem', mb: 1 }}
          />
          <Typography variant="subtitle2" fontWeight={800} color="primary.main">
            {starRating} of 5 Stars — {currentLevelObj.emoji} {currentLevelObj.label}
          </Typography>
        </Box>

        {/* 5-Tier Select Menu */}
        <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
          <InputLabel id="rate-proficiency-tier-label">Assessed Proficiency</InputLabel>
          <Select
            labelId="rate-proficiency-tier-label"
            value={ratedLevel}
            label="Assessed Proficiency"
            disabled={isLoading}
            onChange={(e) => handleLevelChange(e.target.value as SpeakingProficiencyLevel)}
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

        {/* Error Feedback */}
        {errorMessage && (
          <Typography
            variant="caption"
            color="error.main"
            sx={{ display: 'block', mt: 1.5, textAlign: 'center', fontWeight: 600 }}
          >
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isLoading} sx={{ fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ fontWeight: 700, borderRadius: 1.5, minWidth: 120 }}
        >
          {isLoading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(DialogRateSpeakingLevel);
