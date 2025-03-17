import Box from '@mui/material/Box';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import { TopQuotes } from '../top-quotes';

// ----------------------------------------------------------------------

export function UserFeedView() {
  return (
    <UserContent
      maxWidth={false}
      disablePadding
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
            flex: { lg: '1 1 auto' },
            px: { xs: 2, sm: 3, xl: 5 },
          }}
        >
          <TopQuotes title="Most Liked Quotes" list={_coursesFeatured} />
        </Box>
      </Box>
    </UserContent>
  );
}
