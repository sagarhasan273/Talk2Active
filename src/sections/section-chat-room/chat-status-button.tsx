import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import React, { useRef, useState, useEffect } from 'react';
import { Moon, Clock, Pause, UserX, CircleOff, CheckCircle } from 'lucide-react';

import { Box, Fade, Paper, Stack, Button, useTheme, Typography, IconButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { setAccount, selectAccount } from 'src/core/slices';
import { useUpdateUserStatusMutation } from 'src/core/apis';

import type { ChatUserStatus } from './type';

// 2. Strongly Typed Status Options Array
export const STATUS_OPTIONS: ChatUserStatus[] = [
  {
    name: 'online',
    label: 'Online',
    icon: CheckCircle,
    color: 'success.main',
    bgColor: 'success.mainChannel',
  },
  {
    name: 'busy',
    label: 'Busy',
    icon: Clock,
    color: 'error.light',
    bgColor: 'error.lightChannel',
  },
  {
    name: 'brb',
    label: 'BRB',
    icon: Pause,
    color: 'yellow.main',
    bgColor: 'yellow.mainChannel',
  },
  {
    name: 'afk',
    label: 'AFK',
    icon: UserX,
    color: 'orange.main',
    bgColor: 'orange.mainChannel',
  },
  {
    name: 'zzz',
    label: 'Zzz',
    icon: Moon,
    color: 'stone.main',
    bgColor: 'stone.mainChannel',
  },
  {
    name: 'offline',
    label: 'Offline',
    icon: CircleOff,
    color: 'stone.dark',
    bgColor: 'stone.darkChannel',
  },
];

const INITIAL_STATUS: ChatUserStatus = STATUS_OPTIONS[0];

interface ChatStatusButtonProps {
  onStatusChange: (status: string) => void;
}

export const ChatStatusButton: React.FC<ChatStatusButtonProps> = ({ onStatusChange }) => {
  const [currentStatus, setCurrentStatus] = useState<ChatUserStatus>(INITIAL_STATUS);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const theme = useTheme();

  const dispatch = useDispatch();
  const user = useSelector(selectAccount);

  const [updateUser] = useUpdateUserStatusMutation();

  const handleStatusChange = async (status: ChatUserStatus) => {
    setCurrentStatus(status);
    setIsOpen(false);
    onStatusChange?.(status.name);
    try {
      dispatch(setAccount({ ...user, status: status.name }));
      const response = await updateUser({
        id: user.id,
        status: status.name,
      });

      if (response.data?.status) {
        toast.success(`Profile status ${status.label}`);
      }
    } catch (error) {
      toast.error(error);
    }
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
