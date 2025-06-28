import type { User } from 'src/types/room';

import React, { useState } from 'react';

import {
  Mic,
  Star,
  Block,
  MicOff,
  MoreVert,
  VolumeOff,
  GraphicEq,
  PersonRemove,
} from '@mui/icons-material';
import {
  Box,
  Menu,
  Chip,
  Card,
  Stack,
  Badge,
  Avatar,
  Tooltip,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { MessageAreaDrawer } from '../message-area-drawer';

interface VoiceRoomParticipantsProps {
  participants: User[];
  currentUserId: string;
  hostId: string;
  onMuteUser?: (userId: string) => void;
  onKickUser?: (userId: string) => void;
  onPromoteUser?: (userId: string) => void;
  mainChatArea?: React.ReactNode;
}

export const VoiceRoomParticipants: React.FC<VoiceRoomParticipantsProps> = ({
  participants,
  currentUserId,
  hostId,
  onMuteUser,
  onKickUser,
  onPromoteUser,
  mainChatArea,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; userId: string } | null>(
    null
  );

  const isHost = currentUserId === hostId;

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setMenuAnchor({ element: event.currentTarget, userId });
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMuteUser = () => {
    if (menuAnchor && onMuteUser) {
      onMuteUser(menuAnchor.userId);
    }
    handleMenuClose();
  };

  const handleKickUser = () => {
    if (menuAnchor && onKickUser) {
      onKickUser(menuAnchor.userId);
    }
    handleMenuClose();
  };

  const handlePromoteUser = () => {
    if (menuAnchor && onPromoteUser) {
      onPromoteUser(menuAnchor.userId);
    }
    handleMenuClose();
  };

  const getVoiceStatusColor = (user: User) => {
    if (user.voiceStatus.isMuted) return 'error';
    if (user.voiceStatus.isSpeaking) return 'success';
    return 'default';
  };

  const getVoiceStatusIcon = (user: User) => {
    if (user.voiceStatus.isMuted) return <MicOff />;
    if (user.voiceStatus.isSpeaking) return <GraphicEq />;
    return <Mic />;
  };

  return (
    <Box sx={{ py: 2 }}>
      <Stack
        sx={{
          mb: 2,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 2,
          py: 1,
        }}
      >
        <Chip
          icon={<Iconify icon="formkit:people" />}
          label={`${participants.length} Voice Perticipants`}
          size="small"
          color="default"
          variant="outlined"
        />
        <MessageAreaDrawer>{mainChatArea}</MessageAreaDrawer>
      </Stack>

      <Box
        sx={{
          gap: 2,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(2, 1fr)' },
        }}
      >
        {participants.map((participant) => (
          <Box key={participant.id}>
            <Card
              sx={{
                border: participant.voiceStatus.isSpeaking ? 2 : 0,
                borderColor: 'success.main',
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
                >
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: participant.isOnline ? 'success.main' : 'grey.400',
                          border: 2,
                          borderColor: 'background.paper',
                        }}
                      />
                    }
                  >
                    <Avatar
                      src={participant.avatar}
                      alt={participant.name}
                      sx={{
                        width: 48,
                        height: 48,
                        border: participant.voiceStatus.isSpeaking ? 3 : 0,
                        borderColor: 'success.main',
                        animation: participant.voiceStatus.isSpeaking
                          ? 'pulse 1s infinite'
                          : 'none',
                      }}
                    />
                  </Badge>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {participant.name}
                      </Typography>
                      {participant.id === hostId && <Star fontSize="small" color="warning" />}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        size="small"
                        label={participant.level}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {participant.nativeLanguages.join(', ')}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip
                        title={
                          participant.voiceStatus.isMuted
                            ? 'Muted'
                            : participant.voiceStatus.isSpeaking
                              ? 'Speaking'
                              : 'Connected'
                        }
                      >
                        <IconButton
                          size="small"
                          color={getVoiceStatusColor(participant)}
                          sx={{ p: 0.5 }}
                        >
                          {getVoiceStatusIcon(participant)}
                        </IconButton>
                      </Tooltip>

                      <Box
                        sx={{
                          flexGrow: 1,
                          height: 4,
                          bgcolor: 'grey.200',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            height: '100%',
                            width: `${participant.voiceStatus.volume * 100}%`,
                            bgcolor: participant.voiceStatus.isSpeaking
                              ? 'success.main'
                              : 'primary.main',
                            transition: 'all 0.3s',
                          }}
                        />
                      </Box>

                      {(isHost || participant.id === currentUserId) && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, participant.id)}
                        >
                          <MoreVert fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor?.element} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {menuAnchor?.userId === currentUserId ? (
          [
            <MenuItem key="mute" onClick={handleMuteUser}>
              <MicOff sx={{ mr: 1 }} />
              {participants.find((p) => p.id === menuAnchor.userId)?.voiceStatus.isMuted
                ? 'Unmute'
                : 'Mute'}
            </MenuItem>,
            <MenuItem key="deafen" onClick={handleMenuClose}>
              <VolumeOff sx={{ mr: 1 }} />
              Deafen
            </MenuItem>,
          ]
        ) : isHost ? (
          [
            <MenuItem key="mute" onClick={handleMuteUser}>
              <MicOff sx={{ mr: 1 }} />
              Mute User
            </MenuItem>,
            <MenuItem key="promote" onClick={handlePromoteUser}>
              <Star sx={{ mr: 1 }} />
              Make Moderator
            </MenuItem>,
            <MenuItem key="kick" onClick={handleKickUser} sx={{ color: 'error.main' }}>
              <PersonRemove sx={{ mr: 1 }} />
              Remove from Room
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={handleMenuClose}>
            <Block sx={{ mr: 1 }} />
            Block User
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};
