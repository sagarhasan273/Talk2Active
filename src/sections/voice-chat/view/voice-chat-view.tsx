import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import { VoiceChatCards } from '../voice-chat-cards';

// ----------------------------------------------------------------------

export function VoiceChatView() {
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Hi, buddy 👋
          </Typography>
          <Typography
            sx={{ color: 'text.secondary' }}
          >{`Let's learn something new today! Find your house.`}</Typography>
        </Box>

        <VoiceChatCards title="Houses" list={_coursesFeatured} />
      </Box>
    </UserContent>
  );
}
