import type { UserType } from 'src/types/type-user';
import type { ChatUserStatus } from 'src/types/type-chat';

import React, { useRef, useState, useEffect } from 'react';
import { Moon, Clock, Pause, UserX, CircleOff, CheckCircle } from 'lucide-react';

import {
  Box,
  Fade,
  Paper,
  Stack,
  alpha,
  Button,
  useTheme,
  Typography,
  IconButton,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

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

interface ChatStatusButtonProps {
  onStatusChange?: (status: UserType['status']) => void;
}

export const ChatStatusButton: React.FC<ChatStatusButtonProps> = ({ onStatusChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [currentStatus, setCurrentStatus] = useState<ChatUserStatus>(INITIAL_STATUS);
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleStatusChange = (status: ChatUserStatus) => {
    setCurrentStatus(status);
    setIsOpen(false);
    onStatusChange?.(status.name);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getChannelValue = (status: ChatUserStatus): string => {
    const palette = theme.vars.palette[status.bgColor] as unknown as Record<string, string>;
    return palette?.[status.bgColorChannel] ?? '';
  };

  const PrimaryIcon = currentStatus.icon;
  const currentChannel = getChannelValue(currentStatus);

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {/* ── Status picker popover ────────────────────────────────────── */}
      <Fade in={isOpen}>
        <Paper
          ref={dropdownRef}
          sx={{
            position: 'absolute',
            zIndex: theme.zIndex.tooltip,
            bottom: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 290,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            boxShadow: `0 8px 28px ${alpha('#000', isDark ? 0.5 : 0.14)}`,
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
                borderColor: 'divider',
                mb: 0.75,
                display: 'block',
              }}
            >
              Set Your Status
            </Typography>

            <Stack direction="row" flexWrap="wrap" sx={{ gap: 0.25 }}>
              {STATUS_OPTIONS.map((status) => {
                const Icon = status.icon;
                const isSelected = status.name === currentStatus.name;
                const channel = getChannelValue(status);

                return (
                  <Button
                    key={status.name}
                    onClick={() => handleStatusChange(status)}
                    sx={{
                      minWidth: 'calc(33.333% - 3px)',
                      width: 'calc(33.333% - 3px)',
                      borderRadius: 1.5,
                      flexDirection: 'column',
                      gap: 0.3,
                      py: 0.85,
                      px: 0.5,
                      color: status.color,
                      // ── Restored selected state ────────────────────────────
                      bgcolor: isSelected && channel ? varAlpha(channel, 0.16) : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected && channel ? varAlpha(channel, 0.35) : 'transparent',
                      transition: 'all 0.14s',
                      '&:hover': channel
                        ? { bgcolor: varAlpha(channel, 0.2), borderColor: varAlpha(channel, 0.38) }
                        : {},
                    }}
                  >
                    <Icon style={{ width: 17, height: 17 }} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isSelected ? 800 : 500,
                        fontSize: '0.63rem',
                        letterSpacing: 0.2,
                        color: 'inherit',
                      }}
                    >
                      {status.label}
                    </Typography>
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Paper>
      </Fade>

      {/* ── Trigger button ───────────────────────────────────────────── */}
      <IconButton
        ref={buttonRef}
        size="small"
        onClick={() => setIsOpen((p) => !p)}
        sx={{
          borderRadius: '10px',
          p: 0.75,
          // ── Fix: theme color, not hardcoded white ─────────────────────
          color: currentStatus.color,
          border: '1px solid',
          borderColor: isOpen && currentChannel ? varAlpha(currentChannel, 0.4) : 'transparent',
          bgcolor: isOpen && currentChannel ? varAlpha(currentChannel, 0.12) : 'transparent',
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
    </Box>
  );
};
