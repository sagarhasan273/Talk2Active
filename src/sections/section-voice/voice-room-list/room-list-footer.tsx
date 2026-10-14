// src/sections/section-voice/voice-room-card/room-list-footer.tsx

import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

type RoomListFooterProps = {
  onCreateRoom?: () => void;
};

export const RoomListFooter = ({ onCreateRoom }: RoomListFooterProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const currentYear = new Date().getFullYear();

  const featurePills = [
    { icon: <MicRoundedIcon sx={{ fontSize: 13 }} />, label: 'Live Audio Stages' },
    { icon: <LanguageRoundedIcon sx={{ fontSize: 13 }} />, label: 'Global Language Exchange' },
    { icon: <RecordVoiceOverRoundedIcon sx={{ fontSize: 13 }} />, label: 'Peer Fluency Feedback' },
  ];

  return (
    <Paper
      component="footer"
      elevation={0}
      sx={{
        width: '100%',
        mt: 4,
        mb: 4,
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: isDark ? '#181c26' : '#ffffff',
        backgroundImage: isDark
          ? `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.12)} 0%, transparent 50%)`
          : `radial-gradient(circle at 0% 0%, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 50%)`,
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
        boxShadow: isDark
          ? '0 4px 20px -2px rgba(0, 0, 0, 0.4)'
          : '0 4px 16px -2px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Top Main Grid: About App (Left) & Solo Developer Spotlight (Right) */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={3}
      >
        {/* Left Column: About the Application */}
        <Box sx={{ maxWidth: 560 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MicRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                color: isDark ? 'text.primary' : '#0f172a',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              Talk2Active
            </Typography>
            <Box
              sx={{
                px: 0.75,
                py: 0.2,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                color: 'primary.main',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              Voice Hub
            </Box>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: isDark ? 'text.secondary' : '#475569',
              lineHeight: 1.6,
              mb: 2,
              fontSize: '0.85rem',
            }}
          >
            A real-time voice practice community built for language learners. Create your own
            speaking stage or jump into live rooms to practice pronunciation, build confidence, and
            connect with peers worldwide.
          </Typography>

          {/* Feature Highlight Pills */}
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {featurePills.map((pill) => (
              <Box
                key={pill.label}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.1,
                  py: 0.45,
                  borderRadius: 1,
                  bgcolor: isDark ? alpha('#fff', 0.035) : '#f8fafc',
                  border: '1px solid',
                  borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                  color: isDark ? 'text.secondary' : '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                <Box component="span" sx={{ color: 'primary.main', display: 'flex' }}>
                  {pill.icon}
                </Box>
                {pill.label}
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Right Column: Solo Developer Card (Sagar Hasan) */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            minWidth: { xs: '100%', md: 340 },
            maxWidth: { xs: '100%', md: 380 },
            bgcolor: isDark ? alpha('#fff', 0.03) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
              {/* Developer Avatar with Gradient Border */}
              <Box
                sx={{
                  p: '2px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                  flexShrink: 0,
                }}
              >
                <Avatar
                  alt="Sagar Hasan"
                  sx={{
                    width: 44,
                    height: 44,
                    fontSize: 15,
                    fontWeight: 800,
                    bgcolor: isDark ? '#181c26' : '#ffffff',
                    color: 'primary.main',
                    border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
                  }}
                >
                  SH
                </Avatar>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    noWrap
                    sx={{ color: isDark ? 'text.primary' : '#0f172a', fontSize: '0.9rem' }}
                  >
                    Sagar Hasan
                  </Typography>
                  <VerifiedRoundedIcon sx={{ fontSize: 15, color: 'info.main' }} />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.2 }}>
                  <CodeRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  >
                    Solo Developer & Creator
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            {/* Social Links (Replace hrefs with your actual profile URLs) */}
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="GitHub" arrow>
                <IconButton
                  size="small"
                  component="a"
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1,
                    bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                    color: isDark ? 'text.secondary' : '#475569',
                    '&:hover': {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <GitHubIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="LinkedIn" arrow>
                <IconButton
                  size="small"
                  component="a"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1,
                    bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                    color: isDark ? 'text.secondary' : '#475569',
                    '&:hover': {
                      color: 'primary.main',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <LinkedInIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Typography
            variant="caption"
            sx={{
              color: isDark ? 'text.secondary' : '#64748b',
              lineHeight: 1.45,
              display: 'block',
            }}
          >
            Designed, architected, and built from scratch by Sagar Hasan to make daily speaking
            practice accessible and fun for everyone.
          </Typography>
        </Box>
      </Stack>

      <Divider
        sx={{
          my: 2.25,
          borderColor: isDark ? alpha('#fff', 0.07) : '#e2e8f0',
        }}
      />

      {/* Bottom Bar: Copyright + Built with Love + Optional CTA */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
      >
        <Typography
          variant="caption"
          sx={{
            color: isDark ? 'text.disabled' : '#64748b',
            fontWeight: 500,
          }}
        >
          © {currentYear} Talk2Active. All rights reserved.
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'text.secondary' : '#64748b', fontWeight: 600 }}
            >
              Crafted with
            </Typography>
            <FavoriteRoundedIcon sx={{ fontSize: 13, color: 'error.main' }} />
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'text.secondary' : '#64748b', fontWeight: 600 }}
            >
              by{' '}
              <Box component="span" sx={{ color: isDark ? 'text.primary' : '#0f172a', fontWeight: 800 }}>
                Sagar Hasan
              </Box>
            </Typography>
          </Stack>

          {onCreateRoom && (
            <Button
              size="small"
              variant="outlined"
              onClick={onCreateRoom}
              sx={{
                height: 26,
                px: 1.25,
                borderRadius: 1,
                textTransform: 'none',
                fontSize: 11,
                fontWeight: 700,
                borderColor: alpha(theme.palette.primary.main, 0.35),
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              + Host a Room
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default RoomListFooter;
