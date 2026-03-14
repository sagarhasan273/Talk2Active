import { Box, Stack, Toolbar, Typography, AvatarGroup } from '@mui/material';

import { AvatarUser } from '../avatar-user';

type User = {
  _id: string;
  name: string;
  profilePhoto: string;
  verified?: boolean;
};

type VoiceRoomMessageGroupHeaderProps = {
  roomName: string;
  users: User[];
};

export function VoiceRoomMessageGroupHeader({ roomName, users }: VoiceRoomMessageGroupHeaderProps) {
  return (
    <Toolbar sx={{ minHeight: 64, paddingLeft: '4px !important' }}>
      {/* LEFT */}
      <Stack direction="row" alignItems="center" spacing={1} flex={1} minWidth={0}>
        <AvatarGroup max={3}>
          {users.map((user) => (
            <AvatarUser
              key={user._id}
              avatarUrl={user.profilePhoto}
              name={user.name}
              verified={user.verified}
            />
          ))}
        </AvatarGroup>

        <Box minWidth={0}>
          <Typography fontWeight={600} noWrap>
            {roomName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {users.length} participants
          </Typography>
        </Box>
      </Stack>
    </Toolbar>
  );
}
