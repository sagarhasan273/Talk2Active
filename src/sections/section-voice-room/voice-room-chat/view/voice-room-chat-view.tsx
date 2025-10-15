import type { Room } from 'src/types/room';

import React from 'react';

import { SmartToy, ArrowBack } from '@mui/icons-material';
import { Box, Chip, Card, Stack, Button, Typography, IconButton } from '@mui/material';

import { mockUsers } from 'src/_mock/data/mockData';
import { getLanguageFlag } from 'src/_mock/data/languages';

import { Iconify } from 'src/components/iconify';

import { VoiceRoomControls } from '../../voice-room-controls';
import VoiceRoomMainChatArea from '../voice-room-main-chat-area';
import { VoiceRoomChatSettings } from '../voice-room-chat-settings';
import { VoiceRoomParticipants } from '../../voice-room-participants';

interface ChatRoomProps {
  room: Room;
  onLeaveRoom: () => void;
}

export const VoiceRoomChat: React.FC<ChatRoomProps> = ({ room, onLeaveRoom }) => {
  const currentUser = mockUsers[0];

  interface GoBackProps {
    display: React.CSSProperties['display'] | { [key: string]: React.CSSProperties['display'] };
  }

  const goBack = (display: GoBackProps['display']): JSX.Element => (
    <IconButton onClick={onLeaveRoom} sx={{ display }}>
      <ArrowBack />
    </IconButton>
  );

  return (
    <Box
      sx={{
        height: 'calc(100vh - 65px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Card sx={{ p: { xs: 1, md: 2 }, borderRadius: 0, flex: '0 0 auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
            }}
          >
            {goBack({ xs: 'none', sm: 'inline-flex' })}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{getLanguageFlag(room.language)}</Typography>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {room.name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 1,
                  }}
                >
                  <Chip
                    icon={<Iconify icon="formkit:people" />}
                    label={`${room.participants.length}`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />

                  <Stack
                    sx={{
                      flexDirection: { xs: 'row' },
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
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
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: { xs: 2, sm: 0 },
              gap: 1,
              width: '100%',
            }}
          >
            {goBack({ xs: 'inline-flex', sm: 'none' })}
            <Stack direction="row" ml="auto" alignItems="center">
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
            </Stack>
          </Box>
        </Box>
      </Card>

      <Box
        sx={{
          flex: '1 1 auto',
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' },
          height: '100%',
          overflow: 'hidden',
          p: { xs: 1, sm: 0 },
          gap: 1,
        }}
      >
        <Stack
          sx={{
            display: { xs: 'none', md: 'flex' },
            gridColumn: '1 / -2',
            height: '100%',
            flexDirection: 'column',
            minHeight: 0,
            pt: 2,
          }}
          gap={2}
        >
          {/* Voice Controls - Fixed height */}
          <Box sx={{ flex: '0 0 auto', p: 0 }}>
            <VoiceRoomControls
              currentUser={currentUser}
              isHost={room.hostId === currentUser.id}
              voiceSettings={room.voiceSettings}
              onMuteToggle={() => {}}
              onDeafenToggle={() => {}}
              onVolumeChange={() => {}}
              onSettingsChange={() => {}}
            />
          </Box>
          <VoiceRoomMainChatArea room={room} />
        </Stack>

        {/* Voice Participants Panel */}
        <Box
          sx={{
            width: 1,
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
            mainChatArea={<VoiceRoomMainChatArea room={room} />}
          />
        </Box>
      </Box>
    </Box>
  );
};
