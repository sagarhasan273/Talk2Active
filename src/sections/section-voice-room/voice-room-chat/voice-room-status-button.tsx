import type { LucideIcon } from 'lucide-react';

import React, { useRef, useState, useEffect } from 'react';
import { Moon, Clock, Pause, UserX, CircleOff, CheckCircle } from 'lucide-react';

import { Box, Fade, Paper, Stack, Button, useTheme, Typography, IconButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

// 1. TypeScript Interface for Status Object
interface Status {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  hoverBg: string;
}

// 2. Strongly Typed Status Options Array
const STATUS_OPTIONS: Status[] = [
  {
    name: 'Online',
    icon: CheckCircle,
    color: 'success.main',
    bgColor: 'success.mainChannel',
    hoverBg: 'hover:bg-green-200',
  },
  {
    name: 'Busy',
    icon: Clock,
    color: 'error.light',
    bgColor: 'error.lightChannel',
    hoverBg: 'hover:bg-red-200',
  },
  {
    name: 'BRB',
    icon: Pause,
    color: 'yellow.main',
    bgColor: 'yellow.mainChannel',
    hoverBg: 'hover:bg-yellow-200',
  },
  {
    name: 'AFK',
    icon: UserX,
    color: 'orange.main',
    bgColor: 'orange.mainChannel',
    hoverBg: 'hover:bg-orange-200',
  },
  {
    name: 'Zzz',
    icon: Moon,
    color: 'stone.main',
    bgColor: 'stone.mainChannel',
    hoverBg: 'hover:bg-indigo-200',
  },
  {
    name: 'Offline',
    icon: CircleOff,
    color: 'stone.dark',
    bgColor: 'stone.darkChannel',
    hoverBg: 'hover:bg-slate-200',
  },
];

const INITIAL_STATUS: Status = STATUS_OPTIONS[0];

interface VoiceRoomStatusButtonProps {
  onStatusChange?: (status: Status) => void;
}

export const VoiceRoomStatusButton: React.FC<VoiceRoomStatusButtonProps> = ({ onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState<Status>(INITIAL_STATUS);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (status: Status) => {
    setCurrentStatus(status);
    setIsOpen(false);
    onStatusChange?.(status);
  };

  const PrimaryIcon = currentStatus.icon;

  // Safely resolve palette tokens like 'success.mainChannel' to a concrete value
  const palette = theme.vars.palette as unknown as Record<string, any>;

  const bgColorValue = (bgColorToken: string) => {
    if (!bgColorToken || typeof bgColorToken !== 'string') return undefined;
    const parts = bgColorToken.split('.');
    if (parts.length === 2) {
      const [group, shade] = parts;
      return palette[group]?.[shade];
    }
    // fallback to direct key access if token is a single segment
    return palette[bgColorToken];
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      {/* Popover */}
      <Fade in={isOpen}>
        <Paper
          ref={dropdownRef}
          sx={{
            position: 'absolute',
            zIndex: theme.zIndex.tooltip,
            mb: 2,
            width: 300,
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: 8,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                px: 1,
                py: 0.5,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 1,
                display: 'block',
              }}
            >
              Set Your Status
            </Typography>

            <Stack direction="row" flexWrap="wrap">
              {STATUS_OPTIONS.map((status: Status) => {
                const Icon = status.icon;
                const isSelected: boolean = status.name === currentStatus.name;

                return (
                  <Button
                    key={status.name}
                    onClick={() => handleStatusChange(status)}
                    title={status.name}
                    sx={{
                      minWidth: 'calc(33.333% - 8px)',
                      width: 'calc(33.333% - 8px)',
                      m: 0.5,
                      borderRadius: 1,
                      color: isSelected ? status.color : status.color,
                      backgroundColor: isSelected
                        ? varAlpha(bgColorValue(status.bgColor), 0.28)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: varAlpha(bgColorValue(status.bgColor), 0.28),
                      },
                    }}
                    startIcon={<Icon style={{ width: 20 }} />}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: isSelected ? 'bold' : 'medium',
                        fontSize: '0.7rem',
                      }}
                    >
                      {status.name}
                    </Typography>
                  </Button>
                );
              })}
            </Stack>
          </Box>
        </Paper>
      </Fade>

      {/* Main Button */}

      <IconButton
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          p: 1,
          borderRadius: 1,
          border: `2px solid`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: currentStatus.color,
          background: varAlpha(bgColorValue(currentStatus.bgColor), 0.28),
          '&:hover': {
            color: currentStatus.color,
            background: varAlpha(bgColorValue(currentStatus.bgColor), 0.5),
          },
        }}
      >
        <PrimaryIcon style={{ width: 20 }} />
      </IconButton>
    </Box>
  );
};
