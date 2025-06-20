import type { UserProfile as UserProfileType } from 'src/types/post';

import React, { useState } from 'react';
import {
  Bell,
  Share,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  MessageCircle,
  MoreHorizontal,
  Link as LinkIcon,
} from 'lucide-react';

import {
  Box,
  Tab,
  Tabs,
  Link,
  Stack,
  Avatar,
  Button,
  Divider,
  Container,
  Typography,
  IconButton,
} from '@mui/material';

interface UserProfileProps {
  profile: UserProfileType;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ profile }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');

  const formatJoinDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Container sx={{ py: 2 }} maxWidth="md">
      {/* Main */}
      <Box maxWidth="sm" mx="auto">
        {/* Cover */}
        <Box position="relative" height={192} overflow="hidden">
          <img
            src={profile.coverImage}
            alt="Cover"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <Box
            position="absolute"
            sx={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}
          />
        </Box>

        {/* Profile */}
        <Box px={2} pb={4}>
          {/* Avatar + Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mt={-8} mb={2}>
            <Box position="relative">
              <Avatar
                src={profile.avatar}
                alt={profile.name}
                sx={{ width: 128, height: 128, border: '4px solid white' }}
              />
              {profile.verified && (
                <Box
                  position="absolute"
                  bottom={4}
                  right={4}
                  bgcolor="white"
                  borderRadius="50%"
                  p={0.5}
                >
                  <CheckCircle size={20} color="#3b82f6" />
                </Box>
              )}
            </Box>

            <Box mt={2} display="flex" gap={1} flexWrap="wrap">
              {[MoreHorizontal, Share, Bell, MessageCircle].map((Icon, idx) => (
                <IconButton key={idx} sx={{ border: '1px solid #e5e7eb' }}>
                  <Icon size={20} />
                </IconButton>
              ))}
              <Button
                variant={isFollowing ? 'outlined' : 'contained'}
                onClick={() => setIsFollowing(!isFollowing)}
                sx={{
                  bgcolor: isFollowing ? '#f3f4f6' : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                  background: isFollowing
                    ? undefined
                    : 'linear-gradient(to right, #8b5cf6, #ec4899)',
                  color: isFollowing ? 'text.primary' : 'white',
                  '&:hover': {
                    bgcolor: isFollowing ? '#fee2e2' : '#7c3aed',
                    color: isFollowing ? '#dc2626' : 'white',
                  },
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            </Box>
          </Box>

          {/* Info */}
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={700}>
                {profile.name}
              </Typography>
              {profile.verified && <CheckCircle size={20} color="#3b82f6" />}
            </Box>
            <Stack direction="row" alignItems="center" gap={1} mb={1}>
              <Typography color="text.secondary">@{profile.username}</Typography>
              <Divider orientation="vertical" flexItem />
              <Typography variant="body2" color="text.secondary">
                {formatNumber(profile.posts)} posts
              </Typography>
            </Stack>
          </Box>

          <Typography mb={2}>{profile.bio}</Typography>

          <Box display="flex" flexWrap="wrap" gap={2} color="text.secondary" mb={2}>
            {profile.location && (
              <Box display="flex" alignItems="center" gap={1}>
                <MapPin size={16} />
                <span>{profile.location}</span>
              </Box>
            )}
            {profile.website && (
              <Box display="flex" alignItems="center" gap={1}>
                <LinkIcon size={16} />
                <Link
                  href={`https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                  underline="hover"
                >
                  {profile.website}
                </Link>
              </Box>
            )}
            <Box display="flex" alignItems="center" gap={1}>
              <Calendar size={16} />
              <span>Joined {formatJoinDate(profile.joinDate)}</span>
            </Box>
          </Box>

          {/* Stats */}
          <Box display="flex" gap={4} mb={2}>
            <Typography variant="body2">
              <strong>{formatNumber(profile.following)}</strong> Following
            </Typography>
            <Typography variant="body2">
              <strong>{formatNumber(profile.followers)}</strong> Followers
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid #e5e7eb',
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                height: '3px',
              },
            }}
          >
            <Tab label="Posts" value="posts" />
            <Tab label="Replies" value="replies" />
            <Tab label="Media" value="media" />
            <Tab label="Likes" value="likes" />
          </Tabs>

          {/* Tab Content */}
          <Box mt={4} textAlign="center">
            {activeTab === 'posts' && (
              <Box py={6}>
                <Users size={48} color="#d1d5db" />
                <Typography variant="h6" mt={1} fontWeight={600}>
                  No posts yet
                </Typography>
                <Typography color="text.secondary">
                  When {profile.name} posts, they will show up here.
                </Typography>
              </Box>
            )}
            {activeTab === 'replies' && (
              <Box py={6}>
                <MessageCircle size={48} color="#d1d5db" />
                <Typography variant="h6" mt={1} fontWeight={600}>
                  No replies yet
                </Typography>
                <Typography color="text.secondary">Replies will appear here.</Typography>
              </Box>
            )}
            {activeTab === 'media' && (
              <Box py={6}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#e5e7eb',
                    borderRadius: 2,
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  📷
                </Box>
                <Typography variant="h6" mt={1} fontWeight={600}>
                  No media yet
                </Typography>
                <Typography color="text.secondary">Photos and videos will show up here.</Typography>
              </Box>
            )}
            {activeTab === 'likes' && (
              <Box py={6}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: '#fee2e2',
                    borderRadius: '50%',
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: '#ef4444', fontSize: '1.5rem' }}>❤️</span>
                </Box>
                <Typography variant="h6" mt={1} fontWeight={600}>
                  No likes yet
                </Typography>
                <Typography color="text.secondary">Liked posts will appear here.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
