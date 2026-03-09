import React, { useRef, useState, useEffect } from 'react';

import StopIcon from '@mui/icons-material/Stop';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import { Box, Fade, alpha, useTheme, keyframes, IconButton, Typography } from '@mui/material';

import { ScreenShareFullscreenModal } from './screen-share-full-screen-modal';

// ─────────────────────────────────────────────────────────────────────────────
// Animations
// ─────────────────────────────────────────────────────────────────────────────

const liveDot = keyframes`
  0%,100% { opacity:1; transform:scale(1); }
  50%      { opacity:0.4; transform:scale(0.7); }
`;

const screenSharePulse = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.5); }
  50%      { box-shadow: 0 0 0 6px rgba(76,175,80,0); }
`;

// ─────────────────────────────────────────────────────────────────────────────
// ScreenSharePreviewPanel
//
// Inline preview card shown in the voice room body.
// Includes a fullscreen button that opens ScreenShareFullscreenModal.
//
// Props:
//   stream        - the MediaStream to display (local or remote)
//   isLocal       - true when the current user is the sharer
//   sharerName    - display name of the sharer (shown to remote viewers)
//   onStop        - called when the local user clicks "Stop sharing"
// ─────────────────────────────────────────────────────────────────────────────

interface ScreenSharePreviewPanelProps {
  stream: MediaStream | null;
  isLocal?: boolean;
  sharerName?: string;
  onStop?: () => void;
}

export function ScreenSharePreviewPanel({
  stream,
  isLocal = false,
  sharerName = 'Someone',
  onStop,
}: ScreenSharePreviewPanelProps) {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return undefined;
    video.srcObject = stream;
    video.play().catch(() => {});
    return () => {
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <>
      <Fade in timeout={300}>
        <Box
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: '#000',
            border: `2px solid ${theme.palette.success.main}`,
            animation: `${screenSharePulse} 2.5s ease-in-out infinite`,
            aspectRatio: { xs: '4/3', sm: '16/9' },
          }}
        >
          <video
            ref={videoRef}
            muted={isLocal}
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          >
            <track kind="captions" srcLang="en" label="English" />
          </video>

          {/* Live label */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
              bgcolor: alpha('#000', 0.6),
              px: 1,
              py: 0.4,
              borderRadius: '8px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                animation: `${liveDot} 1.5s ease-in-out infinite`,
              }}
            />
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>
              {isLocal ? 'You are sharing your screen' : `${sharerName} is sharing`}
            </Typography>
          </Box>

          {/* Action buttons */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 0.5,
            }}
          >
            {/* Fullscreen button — always visible */}
            <IconButton
              size="small"
              onClick={() => setFullscreenOpen(true)}
              sx={{
                bgcolor: alpha('#000', 0.55),
                color: '#fff',
                backdropFilter: 'blur(6px)',
                '&:hover': { bgcolor: alpha('#000', 0.8) },
              }}
            >
              <OpenInFullIcon sx={{ fontSize: 15 }} />
            </IconButton>

            {/* Stop button — only shown to the local sharer */}
            {isLocal && onStop && (
              <IconButton
                size="small"
                onClick={onStop}
                sx={{
                  bgcolor: alpha('#ff4d4d', 0.85),
                  color: '#fff',
                  backdropFilter: 'blur(6px)',
                  '&:hover': { bgcolor: '#ff4d4d' },
                }}
              >
                <StopIcon sx={{ fontSize: 15 }} />
              </IconButton>
            )}
          </Box>

          {/* Click-to-expand overlay hint */}
          <Box
            onClick={() => setFullscreenOpen(true)}
            sx={{
              position: 'absolute',
              inset: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0,
              transition: 'opacity 0.2s',
              bgcolor: alpha('#000', 0.3),
              '&:hover': { opacity: 1 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: alpha('#000', 0.65),
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                backdropFilter: 'blur(8px)',
              }}
            >
              <ScreenShareIcon sx={{ fontSize: 16, color: '#fff' }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>
                Click to expand
              </Typography>
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Fullscreen modal */}
      <ScreenShareFullscreenModal
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        stream={stream}
        sharerName={sharerName}
        isLocal={isLocal}
      />
    </>
  );
}
