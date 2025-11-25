import type { UserType } from 'src/types/user';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Box,
  Grid,
  List,
  Button,
  Avatar,
  Divider,
  SvgIcon,
  ListItem,
  useTheme,
  Container,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';

import { useParams } from 'src/routes/route-hooks';

import { fDateTime } from 'src/utils/format-time';

import { useGetRoomByIdQuery } from 'src/core/apis';
import { setRoom, selectRoom } from 'src/core/slices/slice-room';

type ParticipantsProps = { user: UserType; joinedAt: Date };

export function JoinConversationCard({ onJoinRoom }: { onJoinRoom: () => void }) {
  const theme = useTheme();

  const { roomId } = useParams();

  const dispatch = useDispatch();

  const room = useSelector(selectRoom);

  const [participants, setParticipants] = useState<ParticipantsProps[]>([]);

  const { data: roomData } = useGetRoomByIdQuery(roomId!, { skip: !!room.id });

  useEffect(() => {
    if (roomData?.status) {
      setParticipants(roomData.data.currentParticipants || []);
      dispatch(setRoom(roomData.data));
    } else {
      setParticipants(room.currentParticipants || []);
    }
  }, [roomData, room, dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, backgroundColor: 'transparent' }}>
      <CardContent sx={{ p: { xs: 1, sm: 4 } }}>
        <Grid container spacing={4}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="h1"
                gutterBottom
                sx={{ fontWeight: 'bold', color: 'primary.main' }}
              >
                Talk
                <Box
                  component="span"
                  sx={{
                    ml: 0.5,
                    transform: 'scale(1.3)',
                    display: 'inline-block',
                    color:
                      theme.palette.mode === 'dark'
                        ? theme.palette.grey['400']
                        : theme.palette.grey['700'],
                  }}
                >
                  2
                </Box>
                Active
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Join the conversation
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {participants.length === 0
                  ? 'Room is empty now. Be the first to join!'
                  : participants.length < room.maxParticipants
                    ? `${participants.length} people are waiting for you to get started. Join now and be part of the conversation!`
                    : `Room is full with ${participants.length} participants.`}
              </Typography>

              <Button
                startIcon={
                  <SvgIcon sx={{ fontSize: '16px!important' }}>
                    <g
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    >
                      <path strokeWidth="3" d="M12.005 11h.008M8.01 11h.009" />
                      <path
                        strokeWidth="2.5"
                        d="M12 3c-1.48 0-2.905.03-4.244.088c-2.44.105-3.66.157-4.626 1.13c-.965.972-1.007 2.159-1.09 4.532a64 64 0 0 0 0 4.5c.083 2.373.125 3.56 1.09 4.532c.965.973 2.186 1.025 4.626 1.13l.244.01v2.348a.73.73 0 0 0 1.205.554l2.18-1.869c.547-.47.821-.704 1.147-.828s.696-.131 1.437-.145q1.171-.023 2.275-.07c2.44-.105 3.66-.157 4.626-1.13c.965-.972 1.007-2.159 1.09-4.532a64 64 0 0 0 .032-3.25"
                      />
                      <path strokeWidth="2.5" d="M19 2s3 2.21 3 3s-3 3-3 3m2.5-3H15" />
                    </g>
                  </SvgIcon>
                }
                size="large"
                variant="contained"
                onClick={onJoinRoom}
                sx={{
                  bgcolor: 'primary',
                  color: 'white',
                  py: 1.5,
                  px: 4,
                  borderRadius: 1,
                  width: 'fit-content',
                  textTransform: 'none',
                  fontWeight: 'semibold',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Join Now
              </Button>
            </Box>
          </Grid>

          {/* Right Column - Participants */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 2,
                  }}
                >
                  Participants Online
                </Typography>

                <List sx={{ py: 0 }}>
                  {participants.map(({ user, joinedAt }) => (
                    <ListItem key={user.id} sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={user.profilePhoto}
                            alt={user.username}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 12,
                              height: 12,
                              bgcolor: 'success.main',
                              borderRadius: '50%',
                              border: '2px solid white',
                            }}
                          />
                        </Box>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {typeof joinedAt === 'string'
                              ? fDateTime(joinedAt)
                              : joinedAt.toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                {participants.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    No participants are currently online.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ pt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  This is a live collaboration room. Everyone here can see, hear, and interact with
                  each other in real-time.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Container>
  );
}
