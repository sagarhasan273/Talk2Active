import MicIcon from '@mui/icons-material/Mic';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Stack,
  AppBar,
  Avatar,
  Toolbar,
  IconButton,
  Typography,
  AvatarGroup,
} from '@mui/material';

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
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(6px)',
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
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

        {/* RIGHT */}
        <Stack direction="row" spacing={1}>
          <IconButton>
            <SearchIcon />
          </IconButton>

          <IconButton color="primary">
            <MicIcon />
          </IconButton>

          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
