import type { UserType } from 'src/types/type-user';

import { useRef, useState, useEffect, useCallback } from 'react';

import {
  Box,
  List,
  Grid,
  Chip,
  Paper,
  Stack,
  Button,
  Divider,
  SvgIcon,
  ListItem,
  useTheme,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import { useGetRoomByIdQuery } from 'src/core/apis';
import { languages } from 'src/_mock/data/languages';
import { useRoomTools } from 'src/core/slices/slice-room';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

type ParticipantsProps = { user: UserType; joinedAt: Date };

const ROOM_TYPES = {
  conversation: { value: 'conversation', label: 'Conversation Practice' },
  pronunciation: { value: 'pronunciation', label: 'Pronunciation Focus' },
  grammar: { value: 'grammar', label: 'Grammar Workshop' },
  vocabulary: { value: 'vocabulary', label: 'Vocabulary Building' },
  debate: { value: 'debate', label: 'Debate & Discussion' },
  storytelling: { value: 'storytelling', label: 'Storytelling' },
  business: { value: 'business', label: 'Business Language' },
  'exam-prep': { value: 'exam-prep', label: 'Exam Preparation' },
};

export function VoiceRoomEntryView({ onJoinRoom }: { onJoinRoom: () => void }) {
  const theme = useTheme();

  const { on, off } = useSocketContext();

  const { setRoom, room } = useRoomTools();

  const [participants, setParticipants] = useState<ParticipantsProps[]>([]);

  const participantsRef = useRef(false);

  const { data: roomData, refetch } = useGetRoomByIdQuery(room.id!, { skip: !room.id });

  const handleBroadcastNewRoom = useCallback(
    (data: any) => {
      if (room.id === data?.joinInfo?.roomId) {
        setParticipants((prev) => [
          ...(prev || []).filter(
            (participant) => participant?.user?.id === data?.leaveInfo?.participant?.userId
          ),
          { user: data.joinInfo.participant, joinedAt: new Date() },
        ]);
      }
      if (room.id === data?.leaveInfo?.roomId) {
        setParticipants((prev) =>
          prev.filter(
            (participant) => participant?.user?.id === data?.leaveInfo?.participant?.userId
          )
        );
      }
      refetch();
    },
    [room.id, refetch, setParticipants]
  );

  useEffect(() => {
    off('recent-room-updated-with-participant', handleBroadcastNewRoom);
    on('recent-room-updated-with-participant', handleBroadcastNewRoom);

    return () => off('recent-room-updated-with-participant', handleBroadcastNewRoom);
  }, [on, off, handleBroadcastNewRoom]);

  useEffect(() => {
    if (roomData?.status) {
      setParticipants(roomData.data.currentParticipants || []);
      setRoom(roomData.data);
      participantsRef.current = true;
    }
  }, [roomData, participants, setRoom]);

  // Get language name from code
  const getLanguageName = (code: string) => {
    const language = languages.find(
      (lang: { code: string; flag: string; name: string }) => lang.code === code
    );
    return language ? `${language.flag} ${language.name}` : code;
  };

  // Get room type display
  const getRoomType = () => {
    const roomType = room.roomType || 'conversation';
    const type = ROOM_TYPES[roomType as keyof typeof ROOM_TYPES] || ROOM_TYPES.conversation;

    return (
      <Chip
        label={type.label}
        size="small"
        sx={{
          bgcolor:
            theme.palette.mode === 'dark' ? theme.palette.grey['700'] : theme.palette.grey['400'],
          color: 'text.primary',
          borderRadius: 1,
          '& .MuiChip-icon': { ml: 0.5, fontSize: '1rem' },
          '&:hover': {
            bgcolor:
              theme.palette.mode === 'dark' ? theme.palette.grey['700'] : theme.palette.grey['400'],
            color: 'text.primary',
          },
        }}
      />
    );
  };

  // Truncate room name to 3-4 words
  const getTruncatedName = (name: string) => {
    if (!name) return '';
    const words = name.split(' ');
    if (words.length <= 4) return name;
    return `${words.slice(0, 4).join(' ')}...`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
        <Grid container spacing={4}>
          {/* Left Column - Main Content */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Room Header */}
              <Box sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  {getRoomType()}
                  <Chip
                    label={room.level || 'All Levels'}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                  <Chip
                    label={`👥 ${participants.length}/${room.maxParticipants}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </Stack>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    mb: 1,
                    lineHeight: 1.2,
                  }}
                >
                  {getTruncatedName(room.name)}
                </Typography>

                {/* Language Chips */}
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  {room.languages ? (
                    room.languages?.map((language) => (
                      <Chip
                        key={language}
                        label={getLanguageName(language)}
                        size="small"
                        color="primary"
                        variant="filled"
                        sx={{ borderRadius: 1, fontWeight: 500 }}
                      />
                    ))
                  ) : (
                    <Chip
                      label="Multiple Languages"
                      size="small"
                      color="primary"
                      variant="filled"
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Stack>
              </Box>

              {/* Host Info */}
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  mb: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <AvatarUser
                  avatarUrl={room.host?.profilePhoto}
                  name={room.host?.name}
                  sx={{ width: 48, height: 48 }}
                  verified={room.host?.verified}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hosted by
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {room.host?.name || 'Unknown'}
                  </Typography>
                </Box>
              </Paper>

              {/* Room Description */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  flex: 1,
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {room.description}
                </Typography>
              </Paper>

              {/* Join Button */}
              <Button
                startIcon={
                  <SvgIcon sx={{ fontSize: '20px' }}>
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                      fill="currentColor"
                    />
                  </SvgIcon>
                }
                size="large"
                variant="contained"
                onClick={onJoinRoom}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                Join Voice Room
              </Button>
            </Box>
          </Grid>

          {/* Right Column - Participants */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                height: '100%',
                bgcolor: alpha(theme.palette.background.default, 0.6),
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Participants Header */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Participants
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {participants.length} {participants.length === 1 ? 'person' : 'people'} in room
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Participants List */}
                <List sx={{ py: 0, flex: 1, maxHeight: 350, overflow: 'auto' }}>
                  {participants.length > 0 ? (
                    participants.map(({ user, joinedAt }) => (
                      <ListItem
                        key={user.id}
                        sx={{
                          px: 1,
                          py: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ListItemAvatar>
                          <Box sx={{ position: 'relative' }}>
                            <AvatarUser
                              avatarUrl={user.profilePhoto}
                              name={user.name}
                              sx={{ width: 40, height: 40 }}
                              verified={user.verified}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 10,
                                height: 10,
                                bgcolor: 'success.main',
                                borderRadius: '50%',
                                border: '2px solid white',
                              }}
                            />
                          </Box>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={500}>
                              {user.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Joined {fDateTime(joinedAt)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Box
                      sx={{
                        py: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" align="center">
                        No participants yet
                      </Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        Be the first to join!
                      </Typography>
                    </Box>
                  )}
                </List>

                <Divider sx={{ mt: 2, mb: 1 }} />

                {/* Room Info */}
                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {room.roomType === 'private' ? (
                      <>🔒 This is a private room. Join with password.</>
                    ) : (
                      <>🌐 Public voice room - Everyone can join and speak.</>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Paper>
  );
}

// Alpha helper function
function alpha(color: string, value: number): string {
  // Simple hex to rgb conversion for common colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${value})`;
  }
  return color;
}
