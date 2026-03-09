import React, { useRef, useEffect, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Box, alpha, Dialog, Tooltip, useTheme, IconButton, Typography } from '@mui/material';

interface ScreenShareFullscreenModalProps {
  open: boolean;
  onClose: () => void;
  stream: MediaStream | null;
  sharerName?: string;
  isLocal?: boolean;
}

export function ScreenShareFullscreenModal({
  open,
  onClose,
  stream,
  sharerName = 'Someone',
  isLocal = false,
}: ScreenShareFullscreenModalProps) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = React.useState(false);

  // ── Core fix ───────────────────────────────────────────────────────────────
  // The Dialog uses a CSS transition on mount. If we call video.play() before
  // the transition completes the video element may not be visible yet, causing
  // a black frame. We defer play() with rAF so the browser has painted at least
  // one frame, and we guard against stale closures with a cancelled flag.
  const attachAndPlay = useCallback((video: HTMLVideoElement, mediaStream: MediaStream) => {
    // Only reassign srcObject when the stream actually changed — prevents
    // unnecessary restart which produces a black flash.
    if (video.srcObject !== mediaStream) {
      video.srcObject = mediaStream;
    }

    let cancelled = false;

    // Double rAF: first frame queues layout, second frame guarantees paint.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled || video.srcObject !== mediaStream) return;
        video.play().catch((err) => {
          // AbortError  = a subsequent play() call cancelled this one — safe to ignore
          // NotAllowedError = autoplay policy (muted video should never hit this)
          if (err?.name !== 'AbortError' && err?.name !== 'NotAllowedError') {
            console.warn('[ScreenShareModal] play() error:', err);
          }
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Re-attach whenever the dialog opens or the stream reference changes
  useEffect(() => {
    const video = videoRef.current;
    if (!open || !video || !stream) return undefined;
    return attachAndPlay(video, stream);
  }, [open, stream, attachAndPlay]);

  // Clean up srcObject when dialog closes so the browser releases the track
  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [open]);

  // ── Callback ref: handles the case where Dialog lazy-mounts the video node ──
  // When open=true and the <video> mounts for the first time, this fires
  // immediately so we don't depend solely on the useEffect above.
  const videoCallbackRef = useCallback(
    (node: HTMLVideoElement | null) => {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = node;
      if (node && stream && open) {
        attachAndPlay(node, stream);
      }
    },
    [stream, open, attachAndPlay]
  );

  // ── Fullscreen ────────────────────────────────────────────────────────────

  useEffect(() => {
    const handler = () => setIsBrowserFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleToggleBrowserFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen API not available or denied — silently ignore
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      // keepMounted={false} ensures the video element is unmounted on close,
      // which cleanly releases the srcObject reference.
      keepMounted={false}
      PaperProps={{
        sx: {
          bgcolor: '#000',
          width: '92vw',
          maxWidth: '92vw',
          height: '90vh',
          maxHeight: '90vh',
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        },
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.75,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)',
        }}
      >
        <Typography
          sx={{
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: theme.palette.success.main,
              boxShadow: `0 0 6px ${theme.palette.success.main}`,
            }}
          />
          {isLocal ? 'You are sharing your screen' : `${sharerName} is sharing their screen`}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={isBrowserFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} arrow>
            <IconButton
              size="small"
              onClick={handleToggleBrowserFullscreen}
              sx={{
                color: '#fff',
                bgcolor: alpha('#fff', 0.12),
                '&:hover': { bgcolor: alpha('#fff', 0.22) },
              }}
            >
              {isBrowserFullscreen ? (
                <FullscreenExitIcon sx={{ fontSize: 18 }} />
              ) : (
                <OpenInFullIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Close" arrow>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: '#fff',
                bgcolor: alpha('#ff4d4d', 0.25),
                '&:hover': { bgcolor: alpha('#ff4d4d', 0.5) },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Video */}
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#000',
        }}
      >
        <video
          ref={videoCallbackRef}
          muted={isLocal}
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
        >
          <track kind="captions" srcLang="en" label="English" />
        </video>
        {!stream && (
          <Typography sx={{ color: alpha('#fff', 0.4), position: 'absolute' }}>
            No stream available
          </Typography>
        )}
      </Box>
    </Dialog>
  );
}
