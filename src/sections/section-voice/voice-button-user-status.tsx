// src/sections/section-voice/voice-button-user-status.tsx

import type { ChatUserStatus } from '@/types/type-room';

import { CheckCircle, CircleOff, Clock, Moon, Pause, UserX } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Fade, IconButton, Paper, Slide, Typography, alpha, useTheme } from '@mui/material';
import Portal from '@mui/material/Portal';
import { styled } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

import { varAlpha } from 'src/theme/styles';

// ─── Constants ────────────────────────────────────────────────────────────────

export const STATUS_OPTIONS: ChatUserStatus[] = [
  {
    name: 'online',
    label: 'Online',
    icon: CheckCircle,
    color: 'success.main',
    bgColor: 'success',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'busy',
    label: 'Busy',
    icon: Clock,
    color: 'error.light',
    bgColor: 'error',
    bgColorChannel: 'lightChannel',
  },
  {
    name: 'brb',
    label: 'BRB',
    icon: Pause,
    color: 'yellow.main',
    bgColor: 'yellow',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'afk',
    label: 'AFK',
    icon: UserX,
    color: 'orange.main',
    bgColor: 'orange',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'zzz',
    label: 'Zzz',
    icon: Moon,
    color: 'stone.main',
    bgColor: 'stone',
    bgColorChannel: 'mainChannel',
  },
  {
    name: 'offline',
    label: 'Offline',
    icon: CircleOff,
    color: 'stone.dark',
    bgColor: 'stone',
    bgColorChannel: 'darkChannel',
  },
];

const INITIAL_STATUS = STATUS_OPTIONS[0];
const POPOVER_WIDTH = 290;
const MARGIN = 8;

// ─── Styled ───────────────────────────────────────────────────────────────────

const Backdrop = styled(Box)({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(4px)',
  zIndex: 1299,
  transition: 'opacity 0.2s ease',
});

const Sheet = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 1300,
  backgroundColor: theme.palette.mode === 'dark' ? '#181c26' : '#ffffff',
  borderRadius: '12px 12px 0 0',
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : '#e2e8f0'}`,
  paddingBottom: 10,
}));

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChatStatusButtonProps {
  onStatusChange?: (status: string) => void;
}

// ─── Status grid ──────────────────────────────────────────────────────────────

function StatusGrid({
  currentStatus,
  getChannelValue,
  onSelect,
  isMobile,
}: {
  currentStatus: ChatUserStatus;
  getChannelValue: (s: ChatUserStatus) => string;
  onSelect: (s: ChatUserStatus) => void;
  isMobile: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0.5,
      }}
    >
      {STATUS_OPTIONS.map((status) => {
        const Icon = status.icon;
        const isSelected = status.name === currentStatus.name;
        const channel = getChannelValue(status);

        return (
          <Box
            key={status.name}
            onClick={() => onSelect(status)}
            sx={{
              width: '100%',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.6,
              py: isMobile ? 1.25 : 0.85,
              px: 0.75,
              cursor: 'pointer',
              color: status.color,
              bgcolor: isSelected && channel ? varAlpha(channel, 0.16) : 'transparent',
              border: '1px solid',
              borderColor: isSelected && channel ? varAlpha(channel, 0.35) : 'transparent',
              transition: 'all 0.14s',
              '&:hover': channel
                ? {
                  bgcolor: varAlpha(channel, 0.2),
                  borderColor: varAlpha(channel, 0.38),
                }
                : {},
            }}
          >
            <Icon
              style={{ width: isMobile ? 16 : 14, height: isMobile ? 16 : 14, flexShrink: 0 }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: isSelected ? 800 : 600,
                fontSize: isMobile ? '0.72rem' : '0.64rem',
                letterSpacing: 0.2,
                color: 'inherit',
                lineHeight: 1,
              }}
            >
              {status.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export const VoiceButtonUserStatus: React.FC<ChatStatusButtonProps> = ({ onStatusChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useResponsive('down', 'sm');

  const [currentStatus, setCurrentStatus] = useState<ChatUserStatus>(INITIAL_STATUS);
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const computePos = useCallback((paperHeight = 0) => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
    left = Math.max(MARGIN, Math.min(left, vw - POPOVER_WIDTH - MARGIN));

    const spaceAbove = rect.top - MARGIN;
    const spaceBelow = vh - rect.bottom - MARGIN;
    let top: number;

    if (paperHeight > 0) {
      if (paperHeight <= spaceAbove) {
        top = rect.top - paperHeight - 8;
      } else if (paperHeight <= spaceBelow) {
        top = rect.bottom + 8;
      } else {
        top =
          spaceAbove >= spaceBelow ? Math.max(MARGIN, rect.top - paperHeight - 8) : rect.bottom + 8;
      }
    } else {
      top = rect.top - 8;
    }

    top = Math.max(MARGIN, Math.min(top, vh - (paperHeight || 200) - MARGIN));

    return { top, left };
  }, []);

  const handleOpen = () => {
    if (isMobile) {
      setIsOpen(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      const pos = computePos(0);
      if (pos) setPopoverPos(pos);
      setIsOpen((p) => !p);
    }
  };

  const handleClose = useCallback(() => {
    if (isMobile) {
      setVisible(false);
      setTimeout(() => setIsOpen(false), 280);
    } else {
      setIsOpen(false);
    }
  }, [isMobile]);

  const handleStatusChange = (status: ChatUserStatus) => {
    setCurrentStatus(status);
    handleClose();
    onStatusChange?.(status.name);
  };

  useEffect(() => {
    if (!isOpen || isMobile || !dropdownRef.current) return;
    const paperHeight = dropdownRef.current.getBoundingClientRect().height;
    const pos = computePos(paperHeight);
    if (pos) setPopoverPos(pos);
  }, [isOpen, isMobile, computePos]);

  useEffect(() => {
    if (!isOpen || isMobile) return undefined;
    const update = () => {
      const paperHeight = dropdownRef.current?.getBoundingClientRect().height ?? 0;
      const pos = computePos(paperHeight);
      if (pos) setPopoverPos(pos);
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [isOpen, isMobile, computePos]);

  useEffect(() => {
    if (isMobile) return undefined;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMobile]);

  const getChannelValue = useCallback(
    (status: ChatUserStatus): string => {
      const palette = theme.vars.palette[status.bgColor] as unknown as Record<string, string>;
      return palette?.[status.bgColorChannel] ?? '';
    },
    [theme]
  );

  const PrimaryIcon = currentStatus.icon;
  const primaryName = currentStatus.name;
  const currentChannel = getChannelValue(currentStatus);

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Trigger ── */}
      <IconButton
        ref={buttonRef}
        size="small"
        onClick={handleOpen}
        sx={{
          borderRadius: 1,
          color: currentStatus.color,
          border:
            primaryName !== 'online' ? `1px solid ${varAlpha(currentChannel, 0.4)}` : '1px solid',
          borderColor:
            primaryName !== 'online'
              ? varAlpha(currentChannel, 0.4)
              : isOpen && currentChannel
                ? varAlpha(currentChannel, 0.4)
                : 'transparent',
          bgcolor:
            primaryName !== 'online'
              ? varAlpha(currentChannel, 0.14)
              : isOpen && currentChannel
                ? varAlpha(currentChannel, 0.12)
                : 'transparent',
          transition: 'all 0.18s',
          '&:hover': currentChannel
            ? {
              bgcolor: varAlpha(currentChannel, 0.18),
              borderColor: varAlpha(currentChannel, 0.35),
            }
            : {},
        }}
      >
        <PrimaryIcon style={{ width: 18, height: 18 }} />
      </IconButton>

      {isOpen && (
        <Portal>
          {isMobile ? (
            <>
              <Backdrop onClick={handleClose} sx={{ opacity: visible ? 1 : 0 }} />
              <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
                <Sheet ref={dropdownRef}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.25, pb: 0.5 }}>
                    <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
                  </Box>

                  <Box sx={{ px: 1.5, pb: 2.5, pt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        fontSize: '0.65rem',
                        px: 0.5,
                        py: 0.5,
                        borderBottom: '1px solid',
                        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                        mb: 1,
                        display: 'block',
                      }}
                    >
                      Set Your Status
                    </Typography>
                    <StatusGrid
                      currentStatus={currentStatus}
                      getChannelValue={getChannelValue}
                      onSelect={handleStatusChange}
                      isMobile
                    />
                  </Box>
                </Sheet>
              </Slide>
            </>
          ) : (
            popoverPos && (
              <Fade in={isOpen}>
                <Paper
                  ref={dropdownRef}
                  sx={{
                    position: 'fixed',
                    top: popoverPos.top,
                    left: popoverPos.left,
                    width: POPOVER_WIDTH,
                    zIndex: 9999,
                    bgcolor: isDark ? '#181c26' : '#ffffff',
                    border: '1px solid',
                    borderColor: isDark ? alpha('#fff', 0.1) : '#e2e8f0',
                    borderRadius: 1,
                    boxShadow: isDark
                      ? '0 12px 28px rgba(0, 0, 0, 0.55)'
                      : '0 12px 28px rgba(15, 23, 42, 0.14)',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: 0.8,
                        fontSize: '0.6rem',
                        px: 1,
                        py: 0.5,
                        borderBottom: '1px solid',
                        borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                        mb: 0.75,
                        display: 'block',
                      }}
                    >
                      Set Your Status
                    </Typography>
                    <StatusGrid
                      currentStatus={currentStatus}
                      getChannelValue={getChannelValue}
                      onSelect={handleStatusChange}
                      isMobile={false}
                    />
                  </Box>
                </Paper>
              </Fade>
            )
          )}
        </Portal>
      )}
    </Box>
  );
};
