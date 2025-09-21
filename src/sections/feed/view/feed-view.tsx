import Box from '@mui/material/Box';

import { varAlpha } from 'src/theme/styles';
import { UserContent } from 'src/layouts/user';

import { FeedPostsView } from '../feed-posts';

// ----------------------------------------------------------------------

export function FeedView() {
  return (
    <UserContent
      maxWidth="xl"
      sx={{
        borderTop: (theme) => ({
          lg: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        }),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
        }}
      >
        <FeedPostsView />
      </Box>
    </UserContent>
  );
}
