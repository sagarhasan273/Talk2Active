import React from 'react';
import { Users, Clock, Calendar, CheckCircle } from 'lucide-react';

import {
  Box,
  Card,
  Chip,
  List,
  Paper,
  Button,
  Avatar,
  Divider,
  ListItem,
  useTheme,
  CardHeader,
  IconButton,
  Typography,
  CardContent,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';

import EngagementProfileCard from '../engagement-profile-card';

export const DiscoveryPanel: React.FC = () => {
  const theme = useTheme();

  const suggestedUsers = [
    {
      name: 'Maya Chen',
      username: 'mayachen',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Life coach & motivational speaker',
      followers: '12.5K',
      verified: true,
    },
    {
      name: 'David Rodriguez',
      username: 'davidr',
      avatar:
        'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Entrepreneur & thought leader',
      followers: '8.9K',
      verified: false,
    },
    {
      name: 'Sarah Kim',
      username: 'sarahkim',
      avatar:
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Author & wisdom curator',
      followers: '15.2K',
      verified: true,
    },
  ];

  const upcomingEvents = [
    {
      title: 'Wisdom Wednesday Live',
      time: 'Today, 3:00 PM',
      participants: 234,
      type: 'live',
    },
    {
      title: 'Quote of the Week Contest',
      time: 'Ends in 2 days',
      participants: 89,
      type: 'contest',
    },
  ];

  return (
    <Box
      sx={{
        position: 'sticky',
        top: '80px',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(3),
      }}
    >
      {/* Engagement Profile Card */}
      <EngagementProfileCard />

      {/* Suggested Users */}
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: { xs: 0, sm: 1 } }}>
        <CardHeader
          avatar={<Iconify icon="foundation:social-myspace" width={24} height={24} />}
          title="Who to Follow"
          subheader="Discover new voices"
          titleTypographyProps={{ fontWeight: 'bold' }}
        />
        <Divider />
        <CardContent sx={{ p: 1 }}>
          <List disablePadding>
            {suggestedUsers.map((user) => (
              <ListItem key={user.username} disablePadding sx={{ p: 0 }}>
                <ListItemButton sx={{ borderRadius: 2, p: 1 }}>
                  <ListItemAvatar>
                    <Avatar src={user.avatar} alt={user.name}>
                      {!user.avatar && user.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography fontWeight="medium">{user.name}</Typography>
                      {user.verified && (
                        <CheckCircle size={14} color={theme.palette.primary.main} />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      @{user.username}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {user.followers} followers
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      color: 'common.white',
                      borderRadius: 6,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      },
                    }}
                  >
                    Follow
                  </Button>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card sx={{ backgroundColor: 'background.neutral' }}>
        <CardHeader
          avatar={
            <IconButton
              sx={{
                background: `linear-gradient(to right, ${theme.palette.info.main}, ${theme.palette.primary.main})`,
                color: 'common.white',
              }}
            >
              <Calendar size={20} />
            </IconButton>
          }
          title="Upcoming Events"
          subheader="Don't miss out"
          titleTypographyProps={{ fontWeight: 'bold' }}
        />
        <Divider />
        <CardContent sx={{ p: 1 }}>
          <List disablePadding>
            {upcomingEvents.map((event, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 2 }}>
                <Paper
                  elevation={0}
                  sx={{
                    width: '100%',
                    p: 2,
                    background: `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                    border: `1px solid ${theme.palette.primary.lighter}`,
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography fontWeight="medium">{event.title}</Typography>
                    <Chip
                      label={event.type === 'live' ? 'LIVE' : 'CONTEST'}
                      size="small"
                      sx={{
                        backgroundColor: event.type === 'live' ? 'error.light' : 'info.light',
                        color: event.type === 'live' ? 'error.main' : 'info.main',
                        fontWeight: 'medium',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {event.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {event.participants}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};
