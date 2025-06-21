import type { Room } from 'src/types/room';

import React, { useState } from 'react';

import {
  Add,
  Mic,
  Lock,
  Search,
  People,
  Public,
  MicOff,
  SmartToy,
  GraphicEq,
  FilterList,
  AccessTime,
  RecordVoiceOver,
} from '@mui/icons-material';
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
  Container,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  FormControl,
  AvatarGroup,
} from '@mui/material';

import CreateRoomModal from './CreateRoomModal';
import { mockRooms } from '../../_mock/data/mockData';
import { getLanguageFlag } from '../../_mock/data/languages';

interface RoomListProps {
  onJoinRoom: (room: Room) => void;
}

const RoomList: React.FC<RoomListProps> = ({ onJoinRoom }) => {
  const [rooms] = useState<Room[]>(mockRooms);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || room.language === selectedLanguage;
    const matchesLevel = selectedLevel === 'all' || room.skillLevel === selectedLevel;

    return matchesSearch && matchesLanguage && matchesLevel;
  });

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

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

  const getActiveVoiceParticipants = (room: Room) =>
    room.participants.filter((p) => p.isOnline && !p.voiceStatus.isMuted);

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: { xs: 10, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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
          sx={{ borderRadius: 3 }}
        >
          Create Room
        </Button>
      </Box>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={selectedLanguage}
                label="Language"
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

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Skill Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Skill Level"
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

          <Grid item xs={12} md={2}>
            <Button variant="outlined" startIcon={<FilterList />} fullWidth sx={{ height: 56 }}>
              More Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Room Grid */}
      <Grid container spacing={3}>
        {filteredRooms.map((room) => {
          const activeVoiceUsers = getActiveVoiceParticipants(room);
          const isFull = room.participants.length >= room.maxParticipants;

          return (
            <Grid item xs={12} md={6} lg={4} key={room.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s',
                  '&:hover': {
                    elevation: 8,
                    transform: 'translateY(-4px)',
                  },
                  border: activeVoiceUsers.length > 0 ? 2 : 0,
                  borderColor: 'success.main',
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
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
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {room.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={room.skillLevel}
                            size="small"
                            color={getSkillLevelColor(room.skillLevel) as any}
                            variant="outlined"
                          />
                          {room.aiAssistant.isActive && (
                            <Chip
                              icon={<SmartToy />}
                              label="AI"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {room.isPrivate ? (
                        <Lock fontSize="small" color="warning" />
                      ) : (
                        <Public fontSize="small" color="success" />
                      )}
                      {activeVoiceUsers.length > 0 && (
                        <Badge badgeContent={activeVoiceUsers.length} color="success">
                          <RecordVoiceOver color="success" />
                        </Badge>
                      )}
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
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
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
                  </Box>

                  {/* Voice Activity */}
                  {activeVoiceUsers.length > 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 2,
                        bgcolor: 'success.light',
                        borderRadius: 2,
                        border: 1,
                        borderColor: 'success.main',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <GraphicEq color="success" fontSize="small" />
                        <Typography variant="caption" color="success.dark" sx={{ fontWeight: 600 }}>
                          Live Voice Activity
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AvatarGroup
                          max={3}
                          sx={{ '& .MuiAvatar-root': { width: 24, height: 24 } }}
                        >
                          {activeVoiceUsers.map((user) => (
                            <Avatar key={user.id} src={user.avatar} alt={user.name} />
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="success.dark">
                          {activeVoiceUsers.length} speaking now
                        </Typography>
                      </Box>
                    </Paper>
                  )}

                  {/* Stats */}
                  <Box
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
                          {room.participants.length}/{room.maxParticipants}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {formatLastActivity(room.lastActivity)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Participants Preview */}
                  {room.participants.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                        {room.participants.map((participant) => (
                          <Badge
                            key={participant.id}
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              participant.voiceStatus.isSpeaking ? (
                                <GraphicEq sx={{ fontSize: 12, color: 'success.main' }} />
                              ) : participant.voiceStatus.isMuted ? (
                                <MicOff sx={{ fontSize: 12, color: 'error.main' }} />
                              ) : (
                                <Mic sx={{ fontSize: 12, color: 'primary.main' }} />
                              )
                            }
                          >
                            <Avatar src={participant.avatar} alt={participant.name} />
                          </Badge>
                        ))}
                      </AvatarGroup>
                      <Typography variant="caption" color="text.secondary">
                        {room.participants.filter((p) => p.isOnline).length} online
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                {/* Join Button */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={isFull ? 'outlined' : 'contained'}
                    disabled={isFull}
                    onClick={() => onJoinRoom(room)}
                    startIcon={<RecordVoiceOver />}
                    sx={{ borderRadius: 2, py: 1.5 }}
                  >
                    {isFull ? 'Room Full' : 'Join Voice Room'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {filteredRooms.length === 0 && (
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

export default RoomList;
