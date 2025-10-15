import React from 'react';
import {
  Users,
  Award,
  Clock,
  Sparkles,
  Calendar,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

import {
  Box,
  Card,
  Chip,
  Grid,
  List,
  Stack,
  Paper,
  Button,
  Avatar,
  styled,
  Divider,
  ListItem,
  useTheme,
  CardHeader,
  IconButton,
  Typography,
  CardContent,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
} from '@mui/material';

const GradientBox = styled(Box)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: 'none',
}));

export const DiscoveryPanel: React.FC = () => {
  const theme = useTheme();

  const trendingTopics = [
    { tag: '#MondayMotivation', posts: '2.4K', growth: '+12%' },
    { tag: '#WisdomWednesday', posts: '1.8K', growth: '+8%' },
    { tag: '#ThoughtfulThursday', posts: '1.2K', growth: '+15%' },
    { tag: '#SuccessStories', posts: '956', growth: '+5%' },
    { tag: '#LifeLessons', posts: '743', growth: '+22%' },
  ];

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

  const todaysStats = {
    totalPosts: '1,247',
    activeUsers: '892',
    newQuotes: '156',
    engagement: '94%',
  };

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
      {/* Today's Stats */}
      <Card sx={{ backgroundColor: 'background.neutral' }}>
        <CardHeader
          avatar={
            <IconButton
              sx={{
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
                color: 'common.white',
              }}
            >
              <TrendingUp size={20} />
            </IconButton>
          }
          title="Today's Activity"
          subheader="Live community stats"
          titleTypographyProps={{ fontWeight: 'bold' }}
        />
        <Divider />
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatCard
                sx={{
                  background: `linear-gradient(to bottom right, ${theme.palette.secondary.main}, ${theme.palette.secondary.light})`,
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="secondary.darker">
                  {todaysStats.totalPosts}
                </Typography>
                <Typography variant="caption" color="common.black">
                  Posts Today
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6}>
              <StatCard
                sx={{
                  background: `linear-gradient(to bottom right, ${theme.palette.cyan.main}, ${theme.palette.cyan.light})`,
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="info.dark">
                  {todaysStats.activeUsers}
                </Typography>
                <Typography variant="caption" color="common.black">
                  Active Users
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6}>
              <StatCard
                sx={{
                  background: `linear-gradient(to bottom right, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="success.darker">
                  {todaysStats.newQuotes}
                </Typography>
                <Typography variant="caption" color="common.black">
                  New Quotes
                </Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6}>
              <StatCard
                sx={{
                  background: `linear-gradient(to bottom right, ${theme.palette.warning.light}, ${theme.palette.warning.lighter})`,
                }}
              >
                <Typography variant="h5" fontWeight="bold" color="warning.dark">
                  {todaysStats.engagement}
                </Typography>
                <Typography variant="caption" color="common.black">
                  Engagement
                </Typography>
              </StatCard>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card sx={{ backgroundColor: 'background.neutral' }}>
        <CardHeader
          avatar={
            <IconButton
              sx={{
                background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                color: 'common.white',
              }}
            >
              <Sparkles size={20} />
            </IconButton>
          }
          action={
            <Button color="primary" size="small">
              View all
            </Button>
          }
          title="Trending Now"
          subheader="Popular topics"
          titleTypographyProps={{ fontWeight: 'bold' }}
        />
        <Divider />
        <CardContent sx={{ p: 1 }}>
          <List disablePadding>
            {trendingTopics.map((topic, index) => (
              <ListItemButton key={topic.tag} sx={{ borderRadius: 2 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.darker})`,
                      color: 'common.white',
                      fontSize: theme.typography.body2.fontSize,
                      fontWeight: 'bold',
                    }}
                  >
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={topic.tag}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {topic.posts} posts
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">
                        {topic.growth}
                      </Typography>
                    </Stack>
                  }
                  primaryTypographyProps={{ fontWeight: 'medium' }}
                  secondaryTypographyProps={{ component: "div" }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ArrowRight size={16} color={theme.palette.action.active} />
                </Box>
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card sx={{ backgroundColor: 'background.neutral' }}>
        <CardHeader
          avatar={
            <IconButton
              sx={{
                background: `linear-gradient(to right, ${theme.palette.success.main}, ${theme.palette.info.main})`,
                color: 'common.white',
              }}
            >
              <Users size={20} />
            </IconButton>
          }
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

      {/* Quick Actions */}
      <GradientBox>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Award size={24} color="inherit" />
          <Box>
            <Typography fontWeight="bold">Share Your Wisdom</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Inspire others today
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            color: 'common.white',
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              transform: 'scale(1.05)',
            },
          }}
        >
          Create Post
        </Button>
      </GradientBox>
    </Box>
  );
};
