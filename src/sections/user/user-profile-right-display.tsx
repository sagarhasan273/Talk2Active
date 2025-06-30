import React from 'react';
import { Crown, Trophy } from 'lucide-react';

import {
  Box,
  Grid,
  Chip,
  Card,
  Paper,
  Stack,
  alpha,
  Button,
  Avatar,
  Typography,
  CardContent,
} from '@mui/material';
import {
  Star,
  Bolt,
  Code,
  People,
  Repeat,
  Flight,
  Palette,
  Favorite,
  MenuBook,
  Timeline,
  Whatshot,
  PersonAdd,
  TrendingUp,
  MyLocation,
  EmojiEvents,
  FormatQuote,
  AutoAwesome,
  ChevronRight,
  ChatBubbleOutline,
} from '@mui/icons-material';

function UserProfileRightDisplay() {
  // Sample data for additional features
  const achievements = [
    {
      icon: Crown,
      title: 'Top Contributor',
      description: 'Most liked posts this month',
      color: '#f59e0b',
    },
    {
      icon: Whatshot,
      title: 'Streak Master',
      description: '30 days posting streak',
      color: '#ef4444',
    },
    {
      icon: Favorite,
      title: 'Community Favorite',
      description: '1000+ total likes received',
      color: '#ec4899',
    },
    {
      icon: Star,
      title: 'Wisdom Curator',
      description: 'Featured in weekly highlights',
      color: '#8b5cf6',
    },
  ];

  const interests = [
    { name: 'Motivation', icon: Bolt, color: '#d97706' },
    { name: 'Philosophy', icon: MenuBook, color: '#2563eb' },
    { name: 'Success', icon: MyLocation, color: '#059669' },
    { name: 'Creativity', icon: Palette, color: '#db2777' },
    { name: 'Technology', icon: Code, color: '#0891b2' },
    { name: 'Travel', icon: Flight, color: '#4f46e5' },
  ];

  const recentActivity = [
    {
      type: 'like',
      content: 'Liked a post about "Success mindset"',
      time: '2h ago',
      icon: Favorite,
    },
    { type: 'post', content: 'Shared a new wisdom quote', time: '5h ago', icon: FormatQuote },
    {
      type: 'follow',
      content: 'Started following @wisdom_seeker',
      time: '1d ago',
      icon: PersonAdd,
    },
    {
      type: 'comment',
      content: 'Commented on "Life lessons"',
      time: '2d ago',
      icon: ChatBubbleOutline,
    },
  ];

  const topPosts = [
    { content: 'The only way to do great work is to love what you do...', likes: 234, reposts: 67 },
    {
      content: 'Innovation distinguishes between a leader and a follower...',
      likes: 189,
      reposts: 45,
    },
    { content: 'Success is not final, failure is not fatal...', likes: 156, reposts: 38 },
  ];

  const mutualConnections = [
    {
      name: 'Sarah Kim',
      avatar:
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'David Chen',
      avatar:
        'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    {
      name: 'Emma Wilson',
      avatar:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
  ];
  return (
    <Stack spacing={3}>
      {/* Achievements */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #f59e0b, #f97316)',
              }}
            >
              <Trophy style={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Achievements
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent accomplishments
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'action.hover' },
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(achievement.color, 0.1),
                    }}
                  >
                    <Icon sx={{ fontSize: 18, color: achievement.color }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" noWrap>
                      {achievement.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {achievement.description}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* Interests */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #9333ea, #ec4899)',
              }}
            >
              <AutoAwesome sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Interests
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Topics they love
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {interests.map((interest, index) => {
              const Icon = interest.icon;
              return (
                <Grid item xs={6} key={index}>
                  <Chip
                    icon={<Icon sx={{ fontSize: 16, color: interest.color }} />}
                    label={interest.name}
                    variant="outlined"
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      bgcolor: alpha(interest.color, 0.1),
                      borderColor: alpha(interest.color, 0.3),
                      '&:hover': {
                        transform: 'scale(1.05)',
                        bgcolor: alpha(interest.color, 0.2),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </Paper>

      {/* Top Posts */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #059669, #0d9488)',
              }}
            >
              <TrendingUp sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Top Posts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Most popular content
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {topPosts.map((post, index) => (
              <Card
                key={index}
                variant="outlined"
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                  cursor: 'pointer',
                }}
              >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {post.content}
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Favorite sx={{ fontSize: 12, color: 'error.main' }} />
                      <Typography variant="caption">{post.likes}</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Repeat sx={{ fontSize: 12, color: 'success.main' }} />
                      <Typography variant="caption">{post.reposts}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Paper>

      {/* Recent Activity */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #2563eb, #4f46e5)',
              }}
            >
              <Timeline sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Latest actions
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 1,
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: '50%',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Icon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {activity.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Paper>

      {/* Mutual Connections */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #4f46e5, #9333ea)',
                }}
              >
                <People sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Mutual Connections
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  People you both follow
                </Typography>
              </Box>
            </Stack>
            <ChevronRight sx={{ color: 'text.disabled' }} />
          </Stack>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            {mutualConnections.map((connection, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                  cursor: 'pointer',
                }}
              >
                <Avatar
                  src={connection.avatar}
                  alt={connection.name}
                  sx={{ width: 32, height: 32 }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {connection.name}
                </Typography>
              </Box>
            ))}
            <Button
              variant="text"
              color="primary"
              fullWidth
              sx={{ textTransform: 'none', fontWeight: 'medium' }}
            >
              View all connections
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Profile Stats */}
      <Paper
        sx={{
          borderRadius: 3,
          background: 'linear-gradient(45deg, #9333ea, #ec4899)',
          color: 'white',
          p: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <EmojiEvents sx={{ fontSize: 24 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Profile Insights
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Your impact
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                4.8K
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Profile Views
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                92%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Engagement Rate
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                156
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Posts Shared
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight="bold">
                2.1K
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total Reactions
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}

export default UserProfileRightDisplay;
