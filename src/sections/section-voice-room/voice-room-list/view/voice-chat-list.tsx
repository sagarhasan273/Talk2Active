import React, { useState, useEffect } from 'react';

import { Add, Mic, Search, People, Language, Schedule } from '@mui/icons-material';
import {
  Box,
  Grid,
  Chip,
  Card,
  Alert,
  Button,
  Avatar,
  Container,
  TextField,
  Typography,
  CardContent,
  CardActions,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { CreateRoomModal } from '../../voice-room-create-modal';
import { type Room, initialRooms } from '../../voice-room-chat/type';

export const RoomList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const roomsData = initialRooms;
      setRooms(roomsData);
      setError(null);
    } catch (err) {
      setError('Failed to load rooms. Please try again.');
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom color="primary.main">
          Voice Learning Rooms
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Join live conversations and practice with native speakers worldwide
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search and Create */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search rooms by name, language, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1,
            }}
          >
            Create Room
          </Button>
        </Box>
      </Box>

      {/* Rooms Grid */}
      <Grid container spacing={3}>
        {filteredRooms.map((room) => (
          <Grid item xs={12} sm={6} md={4} key={room._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px -4px rgb(0 0 0 / 0.1)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                {/* Room Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {room.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                      <Chip
                        label={room.level}
                        color={getLevelColor(room.level) as any}
                        size="small"
                      />
                      <Chip
                        icon={<Language />}
                        label={room.language}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {room.host.username.charAt(0).toUpperCase()}
                  </Avatar>
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
                  {room.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                  {room.tags.length > 3 && (
                    <Chip label={`+${room.tags.length - 3}`} size="small" variant="outlined" />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {room.currentParticipants.length}/{room.maxParticipants}
                    </Typography>
                    <Schedule fontSize="small" color="action" sx={{ ml: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {formatTimeAgo(room.updatedAt)}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<Mic />}
                    onClick={() => {
                      window.location.href = `/room/${room._id}`;
                    }}
                    size="small"
                    disabled={room.currentParticipants.length >= room.maxParticipants}
                  >
                    Join
                  </Button>
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredRooms.length === 0 && !loading && (
        <Box textAlign="center" sx={{ py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No rooms found. Create the first one!
          </Typography>
        </Box>
      )}

      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateRoom={() => {}}
      />
    </Container>
  );
};
