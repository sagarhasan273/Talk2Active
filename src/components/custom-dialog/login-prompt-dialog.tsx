import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import { Close, LockOutlined } from '@mui/icons-material';
import { Box, Dialog, Typography, IconButton, DialogContent } from '@mui/material';

import { GoogleLogInView } from 'src/auth/view';

interface LoginPromptDialogProps {
  openBoolean: UseBooleanReturn;
}

export function LoginPromptDialog({ openBoolean }: LoginPromptDialogProps) {
  return (
    <Dialog
      open={openBoolean.value}
      PaperProps={{
        sx: {
          borderRadius: 1,
          p: 1,
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
        },
      }}
      onClose={openBoolean.onFalse}
    >
      <IconButton
        onClick={openBoolean.onFalse}
        size="small"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'text.secondary',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Close fontSize="small" />
      </IconButton>
      <DialogContent
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
          }}
        >
          <LockOutlined sx={{ color: '#fff', fontSize: 26 }} />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Sign in required!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You need to be logged in to access this. Sign in with Google to continue.
          </Typography>
        </Box>

        <GoogleLogInView onSuccess={openBoolean.onFalse} />

        <Typography variant="caption" color="text.disabled">
          By continuing, you agree to our Terms of Service
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
