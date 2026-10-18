// src/sections/section-voice/voice-room-card/voice-room-scroll-buttons.tsx

import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { Box, IconButton, alpha, useTheme } from '@mui/material';

interface VoiceRoomScrollButtonsProps {
  onScrollTop: () => void;
  onScrollBottom: () => void;
  showUp?: boolean;
  showDown?: boolean;
}

export const VoiceRoomScrollButtons = ({
  onScrollTop,
  onScrollBottom,
  showUp = true,
  showDown = true
}: VoiceRoomScrollButtonsProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 68, md: 76 },
        right: { xs: 16, sm: 20 },
        zIndex: theme.zIndex.appBar + 9,
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 0.75, md: 1 },
        pointerEvents: 'none',
      }}
    >
      {showUp && (
        <IconButton
          onClick={onScrollTop}
          sx={{
            pointerEvents: 'auto',
            bgcolor: isDark ? alpha('#181c26', 0.9) : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
            boxShadow: theme.customShadows?.z8 || '0 4px 14px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: isDark ? '#252b3b' : '#f8fafc',
              transform: 'translateY(-2px)'
            },
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
          }}
        >
          <KeyboardArrowUpRoundedIcon
            sx={{ fontSize: { xs: 24, md: 28 } }}
          />
        </IconButton>
      )}

      {showDown && (
        <IconButton
          onClick={onScrollBottom}
          sx={{
            pointerEvents: 'auto',
            bgcolor: isDark ? alpha('#181c26', 0.9) : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
            boxShadow: theme.customShadows?.z8 || '0 4px 14px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: isDark ? '#252b3b' : '#f8fafc',
              transform: 'translateY(-2px)'
            },
            width: { xs: 40, md: 48 },
            height: { xs: 40, md: 48 },
          }}
        >
          <KeyboardArrowDownRoundedIcon
            sx={{ fontSize: { xs: 24, md: 28 } }}
          />
        </IconButton>
      )}
    </Box>
  );
};

export default VoiceRoomScrollButtons;
