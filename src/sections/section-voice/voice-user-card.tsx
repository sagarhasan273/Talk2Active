import type { UserType } from 'src/types/type-user';

import { Box, Badge, styled, Avatar, keyframes, Typography } from '@mui/material';

import type { AudioQuality } from '../section-chat-room/type';

// Animation for the active speaker
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0px rgba(0, 255, 204, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(0, 255, 204, 0); }
  100% { box-shadow: 0 0 0 0px rgba(0, 255, 204, 0); }
`;

const ActiveAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid #00ffcc',
  animation: `${pulse} 2s infinite`,
}));

type VoiceUserCardProps = {
  user: {
    id: string;
    name: string;
    avatar: string;
    status: UserType['status'];
    isSpeaking: boolean;
    isMuted: boolean;
    volume?: number;
    audioQuality?: AudioQuality;
    userType?: string;
    verified?: boolean;
  };
};

export function VoiceUserCard({ user }: VoiceUserCardProps) {
  return (
    <Box sx={{ display: 'inline-block', position: 'relative' }}>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Box
            sx={{
              bgcolor: '#5865f2',
              p: 0.5,
              borderRadius: '50%',
              display: 'flex',
              border: '2px solid #0f172a',
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', color: '#f2f3f5', fontWeight: 'bold', px: 0.3 }}>
              Owner
            </Typography>
          </Box>
        }
      >
        <ActiveAvatar src={user.avatar} />
      </Badge>
      <Typography variant="h6" sx={{ my: 1, color: 'primary.main', fontWeight: 600 }}>
        {user.name}
      </Typography>
    </Box>
  );
}
