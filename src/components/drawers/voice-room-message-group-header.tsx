import { Box, Stack, Avatar, Toolbar, Typography, AvatarGroup } from '@mui/material';

type User = {
  _id: string;
  name: string;
  profilePhoto: string;
};

type VoiceRoomMessageGroupHeaderProps = {
  roomName: string;
  users: User[];
};

export function VoiceRoomMessageGroupHeader({ roomName, users }: VoiceRoomMessageGroupHeaderProps) {
  return (
    <Toolbar sx={{ minHeight: 64, paddingLeft: '4px !important' }}>
      {/* LEFT */}
      <Stack direction="row" alignItems="center" spacing={2} flex={1} minWidth={0}>
        <AvatarGroup max={3}>
          {users.map((user) => (
            <Avatar key={user._id} src={user.profilePhoto} alt={user.name} />
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
