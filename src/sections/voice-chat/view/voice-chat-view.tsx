import { useState } from 'react';

import Box from '@mui/material/Box';

import { varAlpha } from 'src/theme/styles';
import { UserContent } from 'src/layouts/user';

import RoomManager from '../RoomManager';

// ----------------------------------------------------------------------

export function VoiceChatView() {
  const [section, setSection] = useState('chats');
  return (
    <UserContent
      maxWidth="lg"
      sx={{
        borderTop: (theme) => ({
          lg: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        }),
      }}
    >
      <Box
        sx={{
          gap: 3,
          display: 'flex',
          minWidth: { lg: 0 },
          py: { lg: 3, xl: 5 },
          flexDirection: 'column',
          flex: { lg: '1 1 auto' },
          px: { xs: 2, sm: 3, xl: 5 },
        }}
      >
        {section === 'chats' && <RoomManager />}
      </Box>
    </UserContent>
  );
}
