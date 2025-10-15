import { useState } from 'react';

import { PersonAdd, PersonAddDisabled } from '@mui/icons-material';
import { Box, Card, Avatar, Button, Typography, CardContent } from '@mui/material';

import { useCounter } from 'src/hooks/use-counter';

import EngagementProfileShift from './engagement-profile-shift';

export interface Profile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  isFollowing?: boolean;
}

interface ProfileCardProps {
  onFollow?: (profileId: string) => void;
}

export default function EngagementProfileCard({ onFollow }: ProfileCardProps) {
  const counter = useCounter();
  const profile: Profile = {
    id: 'user123',
    name: 'John Doe',
    username: 'johndoe',
    avatar: '/static/mock-images/avatars/avatar_1.jpg',
    bio: 'Passionate about sharing wisdom and inspiring others.',
    followers: 1200,
    following: 300,
    isFollowing: false,
  };
  const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(profile.followers);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    onFollow?.(profile.id);
  };

  return (
    <Card
      sx={{
        borderRadius: { xs: 0, sm: 1 },
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      }}
    >
      <Box
        sx={{
          height: 96,
          background: 'linear-gradient(to right, #e2e8f0, #cbd5e1)',
        }}
      />

      <CardContent sx={{ px: 2.5, pb: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            mt: -8,
            mb: 2,
          }}
        >
          <Avatar
            src={profile.avatar}
            alt={profile.name}
            sx={{
              width: 96,
              height: 96,
              border: '4px solid white',
              boxShadow: 2,
            }}
          />

          <Button
            variant={isFollowing ? 'outlined' : 'contained'}
            startIcon={isFollowing ? <PersonAddDisabled /> : <PersonAdd />}
            onClick={handleFollow}
            sx={{
              mt: 7,
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
              ...(isFollowing
                ? {
                    color: 'text.secondary',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                      backgroundColor: 'background.neutral',
                      borderColor: 'divider',
                    },
                  }
                : {
                    color: 'white !important',
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }),
            }}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Button>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.900' }}>
            {profile.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            @{profile.username}
          </Typography>
        </Box>

        {profile.bio && (
          <Typography
            variant="body2"
            sx={{
              color: 'grey.700',
              lineHeight: 1.6,
              mb: 1.5,
            }}
          >
            {profile.bio}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'grey.900' }}>
              {followersCount}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Followers
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'grey.900' }}>
              {profile.following}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Following
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <EngagementProfileShift counter={counter} />
    </Card>
  );
}
