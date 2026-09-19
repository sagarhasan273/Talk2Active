import { Edit } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import { CheckCircle } from '@mui/icons-material';
import { Avatar, Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';

import { useRouter } from 'src/routes/route-hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { selectAccount } from 'src/core/slices';
import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import { ImageViewer } from 'src/components/image';

function UserProfileInfo() {
  const router = useRouter();

  const user = useSelector(selectAccount);

  const openImage = useBoolean(false);

  const [isFollowing, setIsFollowing] = useState(false);

  const handleEdit = () => {
    router.push('/user/settings');
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      {/* Avatar and Actions */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mt: -12,
        }}
      >
        <Avatar
          src={user?.profilePhoto}
          alt={user?.name}
          onClick={openImage.onTrue}
          sx={{
            width: 140,
            height: 140,
            border: '6px solid white',
            bgcolor: '#0066cc',
            fontSize: '3rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
        >
          {user?.name}
        </Avatar>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Tooltip title="Edit Profile">
            <IconButton
              onClick={handleEdit}
              sx={{
                border: 1,
                height: 40,
                width: 40,
                borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.28),
                color: 'grey.500',
                backgroundColor: 'background.paper',
                '&:hover': {
                  color: 'grey.500',
                  backgroundColor: 'background.neutral',
                },
              }}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Message">
            <IconButton
              sx={{
                border: 1,
                height: 40,
                width: 40,
                borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.28),
                color: 'grey.500',
                backgroundColor: 'background.paper',
                '&:hover': {
                  color: 'grey.500',
                  backgroundColor: 'background.neutral',
                },
              }}
            >
              <Iconify icon="ant-design:message-filled" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFollowing ? 'Unfollow' : 'Follow'}>
            <IconButton
              onClick={() => setIsFollowing(!isFollowing)}
              sx={{
                border: 1,
                height: 40,
                width: 40,
                ...(isFollowing
                  ? { borderColor: 'error.dark', color: 'error.main' }
                  : {
                    borderColor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.28),
                    color: 'grey.500',
                  }),
                backgroundColor: 'background.paper',
                '&:hover': {
                  ...(isFollowing
                    ? {
                      borderColor: 'error.dark',
                      color: 'error.main',
                    }
                    : {
                      color: 'grey.500',
                    }),
                  backgroundColor: 'background.neutral',
                },
              }}
            >
              <Iconify icon={isFollowing ? 'ri:user-unfollow-fill' : 'ri:user-follow-fill'} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* User Info */}
      <Stack spacing={1}>
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

        {/* Stats */}
        <Stack direction="row" sx={{ gap: { xs: 1, sm: 2 }, alignItems: 'center' }}>
          <Box>
            <Typography component="span" fontWeight="bold" color="text.primary">
              {user?.follower_count}
            </Typography>
            <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              Followers
            </Typography>
          </Box>
          <Box>
            <Typography component="span" fontWeight="bold" color="text.primary">
              {user?.friend_count}
            </Typography>
            <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              Friends
            </Typography>
          </Box>
          <Box>
            <Typography component="span" fontWeight="bold" color="text.primary">
              {user?.following_count}
            </Typography>
            <Typography component="span" color="text.secondary" sx={{ ml: 0.5 }}>
              Following
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <ImageViewer
        open={openImage.value}
        onClose={() => openImage.onFalse()}
        imageUrl={user?.profilePhoto}
      />
    </Paper>
  );
}

export default UserProfileInfo;
