// src/sections/section-voice/voice-room-user-controller/dialog-rate-speaking-level.tsx

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
    { value: 'intermediate', label: 'B1-B2 Intermediate', emoji: '🌿' },
    { value: 'advanced', label: 'C1 Advanced', emoji: '🌳' },
    { value: 'fluent', label: 'C2 Fluent / Proficient', emoji: '🔥' },
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
  const isDark = theme.palette.mode === 'dark';

  const [starRating, setStarRating] = useState<number>(4);
  const [ratedLevel, setRatedLevel] =
    useState<SpeakingProficiencyLevel>('fluent');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submitRating, { isLoading }] = useSubmitRatingMutation();

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
      setErrorMessage(
        err?.data?.message ||
        err?.message ||
        'Failed to submit rating. Please try again.'
      );
    }
  };

  const currentLevelObj =
    PROFICIENCY_LEVELS.find((l) => l.value === ratedLevel) ??
    PROFICIENCY_LEVELS[0];

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        zIndex: theme.zIndex.modal + 20,
        '& .MuiBackdrop-root': {
          backdropFilter: 'blur(10px)',
          backgroundColor: alpha(theme.palette.common.black, 0.55),
        },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 2.5,
          p: 0.5,
          bgcolor: isDark ? '#1a1f2b' : theme.palette.background.paper,
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
          boxShadow: isDark
            ? '0 24px 48px -12px rgba(0, 0, 0, 0.65)'
            : `0 24px 48px -12px ${alpha(theme.palette.common.black, 0.25)}`,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
          fontSize: '1.125rem',
          pb: 0.75,
          letterSpacing: '-0.01em',
        }}
      >
        Rate Speaking Level
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.5 }}
        >
          How well is{' '}
          <Box component="strong" sx={{ color: 'text.primary' }}>
            {userName}
          </Box>{' '}
          communicating and expressing ideas?
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 2,
            px: 1.5,
            my: 1.5,
            borderRadius: 2,
            bgcolor: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
          }}
        >
          <Rating
            size="large"
            value={starRating}
            onChange={handleRatingChange}
            disabled={isLoading}
            max={5}
            sx={{ fontSize: '2.4rem', mb: 1 }}
          />
          <Typography
            variant="caption"
            fontWeight={800}
            sx={{
              color: 'primary.main',
              px: 1.25,
              py: 0.4,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            }}
          >
            {starRating} of 5 Stars • {currentLevelObj.emoji}{' '}
            {currentLevelObj.label}
          </Typography>
        </Box>

        <FormControl fullWidth size="small" sx={{ mt: 2 }}>
          <InputLabel id="rate-proficiency-tier-label">
            Assessed Proficiency
          </InputLabel>
          <Select
            labelId="rate-proficiency-tier-label"
            value={ratedLevel}
            label="Assessed Proficiency"
            disabled={isLoading}
            onChange={(e) =>
              handleLevelChange(e.target.value as SpeakingProficiencyLevel)
            }
            sx={{
              borderRadius: 0.5,
              bgcolor: isDark ? alpha('#fff', 0.02) : 'transparent',
            }}
            MenuProps={{
              sx: { zIndex: theme.zIndex.modal + 30 },
              PaperProps: {
                sx: {
                  borderRadius: 0.5,
                  bgcolor: isDark ? '#1a1f2b' : 'background.paper',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
                },
              },
            }}
          >
            {PROFICIENCY_LEVELS.map((tier) => (
              <MenuItem
                key={tier.value}
                value={tier.value}
                sx={{ borderRadius: 0.5, mx: 0.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <span>{tier.emoji}</span>
                  <Typography variant="body2" fontWeight={600}>
                    {tier.label}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {errorMessage && (
          <Typography
            variant="caption"
            color="error.main"
            sx={{
              display: 'block',
              mt: 1.5,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {errorMessage}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          disabled={isLoading}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 0.5,
            color: 'text.secondary',
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 0.5,
            minWidth: 130,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DialogRateSpeakingLevel;
