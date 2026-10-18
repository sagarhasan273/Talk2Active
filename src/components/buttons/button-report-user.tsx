// src/components/button-report-user/button-report-user.tsx

import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material';
import React, { useState } from 'react';

import { useReportUserMutation } from '@/core/apis/api-social'; // Adjust path
import { useCredentials } from '@/core/slices';
import { toast } from 'sonner';

export type ReportButtonVariant = 'icon' | 'soft' | 'outlined' | 'button';

export type ButtonReportUserProps = {
  targetUserId: string;
  onSuccess?: () => void;
  variant?: ReportButtonVariant;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
};

export const ButtonReportUser = ({
  targetUserId,
  onSuccess,
  variant = 'icon',
  size = 'small',
  fullWidth = false,
  sx,
}: ButtonReportUserProps) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const { user } = useCredentials();
  const currentUserId = user?.userId;

  const [reportUser, { isLoading }] = useReportUserMutation();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReason('');
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !currentUserId || !targetUserId) return;
    try {
      const response = await reportUser({ requesterId: currentUserId, targetUserId, reason }).unwrap();
      if (response?.status) {
        onSuccess?.();
        toast.success(response?.message)
      };
      handleClose();
    } catch (error) {
      console.error('Failed to report user:', error);
    }
  };

  const renderDialog = () => (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      onClick={(e) => e.stopPropagation()}
      sx={{
        zIndex: 3200
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>Report User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={3}
          margin="dense"
          label="Reason for reporting"
          placeholder="Please describe why you are reporting this user..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="warning" disabled={isLoading || !reason.trim()}>
          {isLoading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // ── 1. Variant: ICON ──────────────────────────────────────────────
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title="Report user" arrow placement="top">
          <IconButton
            size={size}
            onClick={handleOpen}
            sx={{
              p: size === 'small' ? '5px' : '7px',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
              color: 'warning.main',
              bgcolor: alpha(theme.palette.warning.main, 0.08),
              transition: 'all 0.18s ease',
              '&:hover': {
                borderColor: 'warning.main',
                bgcolor: alpha(theme.palette.warning.main, 0.16),
              },
              ...sx,
            }}
          >
            <FlagRoundedIcon sx={{ fontSize: size === 'small' ? 17 : 19 }} />
          </IconButton>
        </Tooltip>
        {renderDialog()}
      </>
    );
  }

  // ── 2. Variant: SOFT ──────────────────────────────────────────────
  if (variant === 'soft') {
    return (
      <>
        <Button
          fullWidth={fullWidth}
          size={size}
          onClick={handleOpen}
          startIcon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: 1,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            color: 'warning.main',
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.25)}`,
            '&:hover': {
              bgcolor: alpha(theme.palette.warning.main, 0.16),
              borderColor: 'warning.main',
            },
            ...sx,
          }}
        >
          Report
        </Button>
        {renderDialog()}
      </>
    );
  }

  // ── 3. Variant: OUTLINED ──────────────────────────────────────────
  if (variant === 'outlined') {
    return (
      <>
        <Button
          fullWidth={fullWidth}
          size={size}
          variant="outlined"
          color="warning"
          onClick={handleOpen}
          startIcon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: 1,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: size === 'small' ? 12 : 13,
            ...sx,
          }}
        >
          Report
        </Button>
        {renderDialog()}
      </>
    );
  }

  // ── 4. Variant: BUTTON (Contained) ────────────────────────────────
  return (
    <>
      <Button
        fullWidth={fullWidth}
        size={size}
        variant="contained"
        color="warning"
        onClick={handleOpen}
        startIcon={<FlagRoundedIcon sx={{ fontSize: 16 }} />}
        sx={{
          height: size === 'small' ? 36 : 40, // Height matching
          borderRadius: 1.25,
          fontWeight: 700,
          textTransform: 'none',
          fontSize: size === 'small' ? 12 : 13,
          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.28)}`,
          ...sx,
        }}
      >
        Report
      </Button>
      {renderDialog()}
    </>
  );
};

export default ButtonReportUser;
