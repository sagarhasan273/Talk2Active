import { useState } from 'react';

import Box from '@mui/material/Box';
import { Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import { VoiceChatBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VoiceChatCards } from '../voice-chat-cards';

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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <VoiceChatBreadcrumbs
            heading={
              <Box sx={{ mb: 2 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Hi, buddy 👋
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary' }}
                >{`Let's learn something new today! Find your chat spot.`}</Typography>
              </Box>
            }
            links={[
              { name: 'Chats', href: 'chats' },
              { name: 'Chat spot', href: 'chat-spot' },
            ]}
            slotProps={{
              breadcrumbs: {
                color: 'primary.main',
              },
              onClick: (href: string) => {
                switch (href) {
                  case 'chats':
                    setSection('chats');
                    break;
                  case 'chat-spot':
                    setSection('chat-spot');
                    break;
                  default:
                    setSection('chats');
                    break;
                }
              },
            }}
          />
        </Box>
        {section === 'chats' && <VoiceChatCards list={_coursesFeatured} />}
        {section === 'chat-spot' && <VoiceChatCards list={_coursesFeatured} />}
      </Box>
    </UserContent>
  );
}
