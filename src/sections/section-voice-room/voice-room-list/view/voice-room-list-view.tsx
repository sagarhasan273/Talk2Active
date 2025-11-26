import type { RoomResponse } from 'src/types/type-chat';

import React, { useRef, useState, useEffect } from 'react';

import { Add, Lock, Search, Public, RecordVoiceOver } from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  Chip,
  Paper,
  Badge,
  Button,
  Select,
  Avatar,
  MenuItem,
  useTheme,
  Container,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { useGetRoomsQuery } from 'src/core/apis/api-chat';
import { getLanguageFlag } from 'src/_mock/data/languages';

import { Iconify } from 'src/components/iconify';

import { CreateRoomModal } from '../../voice-room-create-modal';

interface RoomListProps {
  onJoinRoom: (room: RoomResponse) => void;
}

export const VoiceRoomList: React.FC<RoomListProps> = ({ onJoinRoom }) => {
  const theme = useTheme();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5); // Initial number of avatars to show

  const containerRef = useRef<HTMLDivElement>(null);

  const { data: rooms } = useGetRoomsQuery(null);

  // const formatLastActivity = (date: Date) => {
  //   const now = new Date();
  //   const diff = now.getTime() - date.getTime();
  //   const minutes = Math.floor(diff / 60000);

  //   if (minutes < 1) return 'Just now';
  //   if (minutes < 60) return `${minutes}m ago`;
  //   const hours = Math.floor(minutes / 60);
  //   if (hours < 24) return `${hours}h ago`;
  //   const days = Math.floor(hours / 24);
  //   return `${days}d ago`;
  // };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'primary';
    }
  };

  useEffect(() => {
    const calculateVisibleCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Assuming each avatar + gap takes about 48px (40px avatar + 8px gap)
        const count = Math.floor(containerWidth / 48);
        setVisibleCount(Math.max(1, count - 1)); // Leave space for "See More" button
      }
    };

    calculateVisibleCount();
    window.addEventListener('resize', calculateVisibleCount);
    return () => window.removeEventListener('resize', calculateVisibleCount);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ p: 1, py: 2, pb: { xs: 10, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Voice Learning Rooms
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Join live conversations and practice with native speakers worldwide
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowCreateModal(true)}
          size="large"
          sx={{ borderRadius: 3, width: '180px', alignSelf: 'flex-end' }}
        >
          Create Room
        </Button>
      </Box>

      {/* Filters */}
      <Card
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 2,
          backgroundColor: 'background.neutral',
          border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.1)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={selectedLanguage}
                label="Language"
                size="small"
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <MenuItem value="all">All Languages</MenuItem>
                <MenuItem value="en">🇺🇸 English</MenuItem>
                <MenuItem value="es">🇪🇸 Spanish</MenuItem>
                <MenuItem value="fr">🇫🇷 French</MenuItem>
                <MenuItem value="de">🇩🇪 German</MenuItem>
                <MenuItem value="ja">🇯🇵 Japanese</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Skill Level"
                size="small"
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      {/* Room Grid */}
      <Grid container spacing={2}>
        {rooms?.data.map((room) => {
          const isFull = room.currentParticipants.length >= room.maxParticipants;

          return (
            <Grid item xs={12} md={6} lg={4} key={room.id}>
              <Card
                sx={{
                  height: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'background.neutral',
                  border: () =>
                    `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.18)}`,
                  boxShadow: () =>
                    `0px 2px 8px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.28)}`,
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="h4">{getLanguageFlag(room.language)}</Typography>
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ mb: 1, fontWeight: 600, lineHeight: 1.2 }}
                        >
                          {room.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={room.level}
                            size="small"
                            color={getSkillLevelColor(room.level) as any}
                            variant="outlined"
                          />

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {room.public ? (
                              <Lock fontSize="small" color="warning" />
                            ) : (
                              <Public fontSize="small" color="success" />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {room.description}
                  </Typography>

                  {/* Tags */}
                  {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {room.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {room.tags.length > 3 && (
                      <Chip
                        label={`+${room.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box> */}

                  {/* Host */}
                  <Card
                    sx={{
                      p: 1,
                      mb: 2,
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                      borderRadius: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={room.host.profilePhoto}
                        alt={room.host.name}
                        sx={{ width: 40, height: 40 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body1" fontWeight="medium" color="primary.darker">
                            {room.host.name}
                          </Typography>
                          <Iconify
                            icon="solar:crown-bold"
                            color="primary.darker"
                            sx={{ width: 14, height: 14 }}
                          />
                        </Box>
                        <Typography variant="body2" color="primary.darker">
                          Host
                        </Typography>
                      </Box>
                    </Box>
                  </Card>

                  {/* Stats */}
                  {/* <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {room.currentParticipants.length}/{room.maxParticipants}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatLastActivity(room.lastActivity)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box> */}

                  {/* Participants Preview */}
                  <Box
                    ref={containerRef}
                    sx={{
                      overflowX: 'auto',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      py: 1,
                    }}
                  >
                    {!!room.currentParticipants.length && (
                      <Box
                        sx={{
                          mb: 1,
                          display: 'flex',
                          gap: 1,
                          alignItems: 'center',
                          width: 'max-content',
                        }}
                      >
                        {room.currentParticipants
                          .slice(0, showAll ? room.currentParticipants.length : visibleCount)
                          .map((participant, index) => (
                            <Badge
                              key={index}
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              // badgeContent={
                              //   participant.voiceStatus.isSpeaking ? (
                              //     <GraphicEq sx={{ fontSize: 12, color: 'success.main' }} />
                              //   ) : participant.voiceStatus.isMuted ? (
                              //     <MicOff sx={{ fontSize: 12, color: 'error.main' }} />
                              //   ) : (
                              //     <Mic sx={{ fontSize: 12, color: 'primary.main' }} />
                              //   )
                              // }
                            >
                              <Avatar
                                src={participant.user.profilePhoto}
                                alt={participant.user.name}
                              />
                            </Badge>
                          ))}

                        {!showAll && room.currentParticipants.length > visibleCount && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowAll(true)}
                            sx={{
                              minWidth: 'auto',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              fontSize: '0.75rem',
                            }}
                          >
                            +{room.currentParticipants.length - visibleCount}
                          </Button>
                        )}
                      </Box>
                    )}
                    {room.currentParticipants.length === 0 && (
                      <Box
                        sx={{
                          border: `1px dashed ${theme.palette.divider}`,
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography variant="body2" textAlign="center">
                          No participants.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>

                {/* Join Button */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isFull ? 'outlined' : 'contained'}
                    disabled={isFull}
                    onClick={() => onJoinRoom(room)}
                    startIcon={<RecordVoiceOver />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                    }}
                  >
                    {isFull ? 'Room Full' : 'Join Voice Room'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {rooms?.data.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            bgcolor: 'grey.50',
            borderRadius: 3,
          }}
        >
          <RecordVoiceOver sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No rooms found
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Try adjusting your filters or create a new voice room
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setShowCreateModal(true)}
            sx={{ mt: 2 }}
          >
            Create Your First Room
          </Button>
        </Paper>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateRoom={(roomData) => {
          console.log('Creating room:', roomData);
          setShowCreateModal(false);
        }}
      />
    </Container>
  );
};
