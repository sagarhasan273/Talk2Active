import type { User } from 'src/types/room';

import React, { useState } from 'react';

import {
  Mic,
  Star,
  Block,
  MicOff,
  MoreVert,
  VolumeOff,
  VoiceChat,
  GraphicEq,
  PersonRemove,
} from '@mui/icons-material';
import {
  Box,
  Menu,
  Chip,
  Card,
  Grid,
  Badge,
  Avatar,
  Tooltip,
  MenuItem,
  Typography,
  IconButton,
  CardContent,
} from '@mui/material';

interface VoiceParticipantsProps {
  participants: User[];
  currentUserId: string;
  hostId: string;
  onMuteUser?: (userId: string) => void;
  onKickUser?: (userId: string) => void;
  onPromoteUser?: (userId: string) => void;
}

const VoiceParticipants: React.FC<VoiceParticipantsProps> = ({
  participants,
  currentUserId,
  hostId,
  onMuteUser,
  onKickUser,
  onPromoteUser,
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Voice Participants ({participants.length})
      </Typography>

      <Grid container spacing={2}>
        {participants.map((participant) => (
          <Grid item xs={12} sm={6} md={4} key={participant.id}>
            <Card
              elevation={participant.voiceStatus.isSpeaking ? 4 : 1}
              sx={{
                transition: 'all 0.3s',
                border: participant.voiceStatus.isSpeaking ? 2 : 0,
                borderColor: 'success.main',
                transform: participant.voiceStatus.isSpeaking ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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

                {participant.voiceStatus.isSpeaking && (
                  <Box
                    sx={{
                      mt: 1,
                      p: 1,
                      bgcolor: 'success.light',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <VoiceChat fontSize="small" color="success" />
                    <Typography variant="caption" color="success.dark" sx={{ fontWeight: 500 }}>
                      Currently speaking
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default VoiceParticipants;
