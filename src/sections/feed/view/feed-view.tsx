import Box from '@mui/material/Box';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import FeedPostBody from '../feed-post-body';
import FeedTopQuotes from '../feed-top-quotes';

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
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        <Box
          sx={{
            gap: 3,
            display: 'flex',
            minWidth: { lg: 0 },
            py: { lg: 3, xl: 5 },
            flexDirection: 'column',
            px: { xs: 0.5, sm: 0.5, md: 1, xl: 5 },
          }}
        >
          <FeedTopQuotes title="Most Liked Quotes" list={_coursesFeatured} />
        </Box>
      </Box>
      <FeedPostBody />
    </UserContent>
  );
}
