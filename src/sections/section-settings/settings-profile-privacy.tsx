import type { UserType } from 'src/types/user';
import type { UserPrivacySettingUpdateType } from 'src/types/settings';

import { toast } from 'sonner';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import { Block, Public } from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Stack,
  Paper,
  Radio,
  Switch,
  Avatar,
  Button,
  TextField,
  IconButton,
  Typography,
  RadioGroup,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import { useUpdateUserPrivacyMutation } from 'src/core/apis';
import { selectAccount, selectAuthLoading } from 'src/core/slices';

import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

const getFormData = (user: UserType | null) => ({
  id: user?.id || '',
  profileVisibility: user?.profileVisibility || 'public',
  allowMessagesFrom: user?.allowMessagesFrom || 'everyone',
  showActivityStatus: user?.showActivityStatus || true,
  showReadReceipts: user?.showReadReceipts || true,
  showLastSeen: user?.showLastSeen || true,
});

function SettingsProfilePrivacy() {
  const user = useSelector(selectAccount);
  const loading = useSelector(selectAuthLoading);

  const [privacy, setPrivacy] = useState<UserPrivacySettingUpdateType>(getFormData(user));

  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: '1',
      name: 'Spam User',
      username: 'spammer123',
      avatar:
        'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
  ]);

  const [mutedWords, setMutedWords] = useState(['spam', 'promotion']);
  const [newMutedWord, setNewMutedWord] = useState('');

  const [updateUser] = useUpdateUserPrivacyMutation();

  const addMutedWord = () => {
    if (newMutedWord.trim() && !mutedWords.includes(newMutedWord.trim())) {
      setMutedWords((prev) => [...prev, newMutedWord.trim()]);
      setNewMutedWord('');
    }
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers((prev) => prev.filter((blockedUser) => blockedUser.id !== userId));
  };

  const removeMutedWord = (word: string) => {
    setMutedWords((prev) => prev.filter((w) => w !== word));
  };

  const onSubmit = async (data: any) => {
    try {
      if (!user?.id) {
        toast.error('User ID is required for updating privacy settings');
        return;
      }
      const response = await updateUser({ ...privacy, ...data, id: user.id });
      if (response.data?.status) {
        toast.success(response.data?.message || 'Privacy setting updated successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Card sx={{ p: { xs: 1, sm: 2 }, borderRadius: 1, backgroundColor: 'background.neutral' }}>
      <Box>
        <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>
            Privacy & Safety
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Control who can see your content and interact with you
          </Typography>
        </Box>

        <Stack spacing={2}>
          {/* Profile Privacy */}
          <Card sx={{ backgroundColor: 'background.default', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
              Profile Visibility
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}
              >
                Who can see your profile?
              </Typography>
              <RadioGroup
                value={privacy.profileVisibility}
                onChange={(e) => {
                  setPrivacy((prev) => ({
                    ...prev,
                    profileVisibility: e.target.value as typeof prev.profileVisibility,
                  }));
                  onSubmit({
                    profileVisibility: e.target.value as typeof privacy.profileVisibility,
                  });
                }}
              >
                <FormControlLabel
                  value="public"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Public color="success" />
                      <Box>
                        <Typography fontWeight="medium">Public</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Anyone can see your profile and posts
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': { bgcolor: 'background.neutral' },
                    width: '100%',
                    m: 0,
                    mb: 1,
                  }}
                />
                <FormControlLabel
                  value="friends-only"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="mingcute:user-follow-line" color="primary.main" />
                      <Box>
                        <Typography fontWeight="medium">Friends Only</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Only your friends can see your posts
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': { bgcolor: 'background.neutral' },
                    width: '100%',
                    m: 0,
                    mb: 1,
                  }}
                />
                <FormControlLabel
                  value="private"
                  control={<Radio color="primary" />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="material-symbols:lock-outline" color="error.main" />
                      <Box>
                        <Typography fontWeight="medium">Private</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Only you can see your profile
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': { bgcolor: 'background.neutral' },
                    width: '100%',
                    m: 0,
                  }}
                />
              </RadioGroup>
            </Box>
          </Card>

          {/* Communication Settings */}
          <Paper sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
              Communication
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}
              >
                Who can message you?
              </Typography>
              <RadioGroup
                value={privacy.allowMessagesFrom}
                onChange={(e) => {
                  setPrivacy((prev) => ({
                    ...prev,
                    allowMessagesFrom: e.target.value as typeof prev.allowMessagesFrom,
                  }));
                  onSubmit({
                    allowMessagesFrom: e.target.value as typeof privacy.allowMessagesFrom,
                  });
                }}
              >
                <FormControlLabel
                  value="everyone"
                  control={<Radio color="primary" />}
                  label="Everyone"
                  sx={{
                    p: 1.5,
                    py: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    width: '100%',
                    m: 0,
                    mb: 1,
                  }}
                />
                <FormControlLabel
                  value="friends"
                  control={<Radio color="primary" />}
                  label="Friends Only"
                  sx={{
                    p: 1.5,
                    py: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    width: '100%',
                    m: 0,
                    mb: 1,
                  }}
                />
                <FormControlLabel
                  value="no-one"
                  control={<Radio color="primary" />}
                  label="No one"
                  sx={{
                    p: 1.5,
                    py: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    width: '100%',
                    m: 0,
                  }}
                />
              </RadioGroup>
            </Box>
          </Paper>

          {/* Activity & Status */}
          <Card sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}>
              Activity & Status
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  key: 'showActivityStatus',
                  label: 'Show Activity Status',
                  description: "Let others see when you're online",
                },
                {
                  key: 'showReadReceipts',
                  label: 'Read Receipts',
                  description: "Let others know when you've read their messages",
                },
                {
                  key: 'showLastSeen',
                  label: 'Last Seen',
                  description: 'Show when you were last active',
                },
              ].map((setting) => (
                <Paper
                  key={setting.key}
                  elevation={0}
                  sx={{
                    p: 2,
                    py: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography fontWeight="semibold">{setting.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {setting.description}
                    </Typography>
                  </Box>
                  <Switch
                    checked={!!privacy[setting.key as keyof typeof privacy]}
                    onChange={() => {
                      setPrivacy((prev) => ({
                        ...prev,
                        [setting.key]: !prev[setting.key as keyof typeof prev],
                      }));
                      onSubmit({ [setting.key]: !privacy[setting.key as keyof typeof privacy] });
                    }}
                    color="primary"
                  />
                </Paper>
              ))}
            </Stack>
          </Card>

          {/* Blocked Users */}
          <Paper elevation={0} sx={{ backgroundColor: 'grey.500', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}>
              Blocked Users
            </Typography>
            <Stack spacing={1}>
              {blockedUsers.map((blockedUser) => (
                <Paper
                  key={blockedUser.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    py: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={blockedUser.avatar} alt={blockedUser.name} />
                    <Box>
                      <Typography fontWeight="semibold">{blockedUser.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{blockedUser.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    onClick={() => unblockUser(blockedUser.id)}
                    variant="contained"
                    color="error"
                    sx={{
                      bgcolor: 'error.light',
                      color: 'error.main',
                      '&:hover': { bgcolor: 'error.lighter' },
                    }}
                  >
                    Unblock
                  </Button>
                </Paper>
              ))}
              {blockedUsers.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <Block color="disabled" sx={{ fontSize: 48, mx: 'auto', mb: 2 }} />
                  <Typography>No blocked users</Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          {/* Muted Words */}
          <Paper elevation={0} sx={{ backgroundColor: 'background.paper', borderRadius: 2, p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'semibold', color: 'text.primary', mb: 2 }}>
              Muted Words
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={newMutedWord}
                  onChange={(e) => setNewMutedWord(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMutedWord()}
                  placeholder="Add a word to mute..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      borderWidth: 2,
                      '& fieldset': {
                        borderWidth: 2,
                        borderColor: 'grey.200',
                      },
                      '&:hover fieldset': {
                        borderColor: 'grey.300',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                        boxShadow: '0 0 0 2px rgba(103, 58, 183, 0.2)',
                      },
                    },
                  }}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={addMutedWord} edge="end">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z"
                            />
                          </svg>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {mutedWords.map((word) => (
                  <Chip
                    key={word}
                    label={word}
                    onDelete={() => removeMutedWord(word)}
                    sx={{
                      bgcolor: 'error.light',
                      color: 'error.main',
                      '& .MuiChip-deleteIcon': {
                        color: 'error.main',
                        '&:hover': { color: 'error.dark' },
                      },
                    }}
                  />
                ))}
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Card>
  );
}

export default SettingsProfilePrivacy;
