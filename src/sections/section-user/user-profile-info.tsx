import React, { useState } from 'react';

import { Link, Share, LocationOn, CheckCircle, CalendarToday } from '@mui/icons-material';
import {
  Box,
  Paper,
  Stack,
  Avatar,
  Tooltip,
  useTheme,
  Typography,
  IconButton,
  Link as MuiLink,
} from '@mui/material';

import { useUserContext } from 'src/routes/route-components';

import { fDate } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

function UserProfileInfo() {
  const { user } = useUserContext();

  const theme = useTheme();

  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <Paper sx={{ p: 3, backgroundColor: 'background.neutral', borderRadius: 3, mb: 3 }}>
      {/* Avatar and Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mt: -10,
          mb: 3,
        }}
      >
        <Box sx={{ position: 'relative', width: 128, height: 128 }}>
          <Avatar
            src={user?.profilePhoto ? user.profilePhoto.toString() : undefined}
            alt={user?.name ? user.name.toString() : undefined}
            sx={{
              width: 128,
              height: 128,
              border: '4px solid white',
              boxShadow: theme.shadows[4],
            }}
          />
          {user?.verified && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                bgcolor: 'background.paper',
                borderRadius: '50%',
                p: 0.5,
                height: 20,
                widht: 20,
              }}
            >
              <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
          )}
        </Box>

        <Stack direction="row" sx={{ mt: 8, gap: { xs: 0.8, md: 1 } }}>
          <IconButton
            sx={{
              border: 1,
              height: 40,
              width: 40,
              borderColor: 'primary.dark',
              color: 'primary.main',
            }}
          >
            <Share />
          </IconButton>
          <IconButton
            sx={{
              border: 1,
              height: 40,
              width: 40,
              borderColor: 'primary.dark',
              color: 'primary.main',
            }}
          >
            <Iconify icon="ant-design:message-filled" />
          </IconButton>
          <IconButton
            onClick={() => setIsFollowing(!isFollowing)}
            sx={{
              border: 1,
              height: 40,
              width: 40,
              ...(isFollowing
                ? { borderColor: 'error.dark', color: 'error.main' }
                : { borderColor: 'primary.dark', color: 'primary.main' }),

              '&:hover': {
                borderColor: 'inherit',
                color: 'inherit',
                backgroundColor: 'transparent',
              },
            }}
          >
            <Tooltip title={isFollowing ? 'Unfollow' : 'Follow'}>
              {isFollowing ? (
                <Iconify icon="ri:user-unfollow-fill" />
              ) : (
                <Iconify icon="ri:user-follow-fill" />
              )}
            </Tooltip>
          </IconButton>
        </Stack>
      </Box>

      {/* User Info */}
      <Stack spacing={2}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" fontWeight="bold">
              {user?.name}
            </Typography>
            {user?.verified && <CheckCircle sx={{ color: 'primary.main', fontSize: 20 }} />}
          </Stack>
          <Typography variant="body1" color="text.secondary">
            @{user?.username}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          {user?.bio}
        </Typography>

        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {user?.location && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {user?.location}
              </Typography>
            </Stack>
          )}
          {user?.website && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Link sx={{ fontSize: 16, color: 'text.secondary' }} />
              <MuiLink
                href={`https://${user?.website}`}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                underline="hover"
                variant="body2"
              >
                {user?.website}
              </MuiLink>
            </Stack>
          )}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Joined {user?.joinDate ? fDate(user.joinDate) : ''}
            </Typography>
          </Stack>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography component="span" fontWeight="bold" color="text.primary">
              {user?.followersCount}
            </Typography>
            <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              Following
            </Typography>
          </Box>
          <Box>
            <Typography component="span" fontWeight="bold" color="text.primary">
              {user?.followingCount}
            </Typography>
            <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              Followers
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default UserProfileInfo;
