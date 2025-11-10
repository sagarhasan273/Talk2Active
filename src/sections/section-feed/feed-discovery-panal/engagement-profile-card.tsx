import type { UsersType } from 'src/types/user';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { PersonAdd, PersonAddDisabled } from '@mui/icons-material';
import { Box, Card, Avatar, Button, Typography, CardContent } from '@mui/material';

import { useCounter } from 'src/hooks/use-counter';

import { selectUsers, selectAccount } from 'src/core/slices';

import EngagementProfileShift from './engagement-profile-shift';

interface ProfileCardProps {
  onFollow?: (profileId: string) => void;
}

export default function EngagementProfileCard({ onFollow }: ProfileCardProps) {
  const user = useSelector(selectAccount);
  const users = useSelector(selectUsers);

  const counter = useCounter(users.length > 0 ? users.length - 1 : 0);

  const [profile, setProfile] = useState<UsersType>(users[0] as UsersType);

  const handleFollow = () => {
    const newFollowing = !profile.relationShip?.following;
    setProfile((prev) => ({
      ...prev,
      relationShip: { ...prev.relationShip, following: newFollowing },
      followerCount: prev.followerCount + (newFollowing ? 1 : -1),
    }));
    onFollow?.(profile.id);
  };

  const isFollowing = profile.relationShip.following ?? false;
  const followersCount = profile.followerCount ?? 0;
  const isSelfProfile = profile.id === user.id;
  useEffect(() => {
    if (users.length === 0) return;
    if (counter.value < users.length) {
      setProfile(users[counter.value % users.length]);
    }
  }, [counter.value, users]);

  return (
    <Card
      sx={{
        borderRadius: { xs: 0, sm: 1 },
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
      }}
    >
      {/* Cover Image */}
      <Box
        sx={{
          height: 100,
          background: profile.coverPhoto
            ? `url(${profile.coverPhoto}) center/cover no-repeat`
            : 'linear-gradient(45deg, #9333ea, #ec4899, #9333ea)',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
          },
        }}
      />

      {/* Card Content */}
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
            src={profile.profilePhoto}
            alt={profile.name}
            sx={{
              width: 96,
              height: 96,
              border: '4px solid white',
              boxShadow: 2,
            }}
          />

          {!isSelfProfile && (
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
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }),
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </Box>

        {/* Profile Info */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.900' }}>
            {profile.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            @{profile.username}
          </Typography>
        </Box>

        {profile.bio && (
          <Typography variant="body2" sx={{ color: 'grey.700', lineHeight: 1.6, mb: 1.5 }}>
            {profile.bio}
          </Typography>
        )}

        {/* Follower Counts */}
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
              {profile.followingCount}
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
