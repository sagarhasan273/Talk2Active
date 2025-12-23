import type { UserType } from 'src/types/type-user';

import React, { useRef, useState, useEffect } from 'react';
import { Moon, Clock, Pause, UserX, CircleOff, CheckCircle } from 'lucide-react';

import { Box, Fade, Paper, Stack, Button, useTheme, Typography, IconButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import type { ChatUserStatus } from './type';

// 2. Strongly Typed Status Options Array
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

const INITIAL_STATUS: ChatUserStatus = STATUS_OPTIONS[0];

interface ChatStatusButtonProps {
  onStatusChange: (status: UserType['status']) => void;
}

export const ChatStatusButton: React.FC<ChatStatusButtonProps> = ({ onStatusChange }) => {
  const theme = useTheme();

  const [currentStatus, setCurrentStatus] = useState<ChatUserStatus>(INITIAL_STATUS);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleStatusChange = async (status: ChatUserStatus) => {
    setCurrentStatus(status);
    setIsOpen(false);
    onStatusChange?.(status.name);
  };

  const PrimaryIcon = currentStatus.icon;

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
              {STATUS_OPTIONS.map((status: ChatUserStatus) => {
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
                        ? varAlpha(theme.vars.palette[status.bgColor][status.bgColorChannel], 0.28)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: varAlpha(
                          theme.vars.palette[status.bgColor][status.bgColorChannel],
                          0.28
                        ),
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
                      {status.label}
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
          background: varAlpha(
            theme.vars.palette[currentStatus.bgColor][currentStatus.bgColorChannel],
            0.28
          ),
          '&:hover': {
            color: currentStatus.color,
            background: varAlpha(
              theme.vars.palette[currentStatus.bgColor][currentStatus.bgColorChannel],
              0.5
            ),
          },
        }}
      >
        <PrimaryIcon style={{ width: 20 }} />
      </IconButton>
    </Box>
  );
};
