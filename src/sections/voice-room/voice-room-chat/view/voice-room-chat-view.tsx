import type { Room } from 'src/types/room';

import React from 'react';

import { SmartToy, ArrowBack } from '@mui/icons-material';
import { Box, Chip, Card, Button, Typography, IconButton } from '@mui/material';

import { mockUsers } from 'src/_mock/data/mockData';
import { getLanguageFlag } from 'src/_mock/data/languages';

import { Iconify } from 'src/components/iconify';

import VoiceRoomMainChatArea from '../voice-room-main-chat-area';
import { VoiceRoomChatSettings } from '../voice-room-chat-settings';
import { VoiceRoomParticipants } from '../../voice-room-participants';

interface ChatRoomProps {
  room: Room;
  onLeaveRoom: () => void;
}

export const VoiceRoomChat: React.FC<ChatRoomProps> = ({ room, onLeaveRoom }) => {
  const currentUser = mockUsers[0];

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Card sx={{ p: 2, borderRadius: 0, flex: '0 0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={onLeaveRoom}>
              <ArrowBack />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{getLanguageFlag(room.language)}</Typography>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {room.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {room.participants.length} participants
                  </Typography>
                  <Chip label={room.skillLevel} size="small" variant="outlined" />
                  {room.aiAssistant.isActive && (
                    <Chip
                      icon={<SmartToy />}
                      label="AI Assistant"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              sx={{
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
              }}
              startIcon={<Iconify icon="pepicons-pop:leave" />}
              disableRipple
            >
              Leave
            </Button>
            <VoiceRoomChatSettings
              isHost={room.hostId === currentUser.id}
              voiceSettings={room.voiceSettings}
              onSettingsChange={() => {}}
            />
          </Box>
        </Box>
      </Card>

      <Box
        sx={{
          flex: '1 1 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <VoiceRoomMainChatArea room={room} />

        {/* Voice Participants Panel */}
        <Box
          sx={{
            width: 400,
            overflow: 'auto',
          }}
        >
          <VoiceRoomParticipants
            participants={room.participants}
            currentUserId={currentUser.id}
            hostId={room.hostId}
            onMuteUser={(userId) => console.log('Mute user:', userId)}
            onKickUser={(userId) => console.log('Kick user:', userId)}
            onPromoteUser={(userId) => console.log('Promote user:', userId)}
          />
        </Box>
      </Box>
    </Box>
  );
};
