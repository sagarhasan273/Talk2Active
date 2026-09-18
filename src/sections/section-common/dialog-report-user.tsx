// src/sections/section-voice/voice-room-card/dialog-report-user.tsx

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';

const SUGGESTED_REASONS = [
  'Inappropriate language or harassment',
  'Mic spamming / disruptive audio',
  'Impersonation or fake account',
  'Spamming links / advertising',
  'Hate speech or discrimination',
];

type DialogReportUserProps = {
  open: boolean;
  userName: string;
  userId: string;
  onClose: () => void;
  onSubmitReport: (userId: string, reason: string) => void;
};

export function DialogReportUser({
  open,
  userName,
  userId,
  onClose,
  onSubmitReport,
}: DialogReportUserProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [reason, setReason] = useState('');

  const handleSelectPreText = (text: string) => {
    setReason((prev) => (prev ? `${prev.trim()}, ${text.toLowerCase()}` : text));
  };

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmitReport(userId, reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          bgcolor: isDark ? alpha(theme.palette.background.paper, 0.96) : '#ffffff',
          backdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08),
          boxShadow: theme.shadows[24],
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: 'error.main',
            }}
          >
            <FlagRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" fontWeight={800}>
            Report User
          </Typography>
        </Stack>

        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5, pt: 0 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
          Reporting <strong>{userName}</strong>. Select a reason or describe the violation below:
        </Typography>

        {/* Suggested Quick Pre-texts */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
          {SUGGESTED_REASONS.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              onClick={() => handleSelectPreText(item)}
              sx={{
                fontSize: 11.5,
                fontWeight: 600,
                borderRadius: 1,
                bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                border: '1px solid',
                borderColor: theme.palette.divider,
                '&:hover': {
                  borderColor: theme.palette.error.main,
                  color: 'error.main',
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            />
          ))}
        </Box>

        {/* Reason Text Input */}
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Provide additional details..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize: '0.875rem',
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 2.5 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ borderRadius: 1.25 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!reason.trim()}
          onClick={handleSubmit}
          sx={{
            borderRadius: 1.25,
            fontWeight: 700,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.35)}`,
          }}
        >
          Submit Report
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogReportUser;
