import { useRef } from 'react';

import Box from '@mui/material/Box';
import { Fab, Card, Grid, Stack, Button, InputBase } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';

import { TopQuotes } from '../top-quotes';

// ----------------------------------------------------------------------

export function UserFeedView() {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAttach = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const renderPostInput = (
    <Card sx={{ p: 3 }}>
      <InputBase
        multiline
        fullWidth
        rows={3}
        placeholder="Share what you are thinking here..."
        sx={{
          p: 1,
          mb: 2,
          borderRadius: 1,
          border: (theme) => `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
        }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
          <Fab size="small" color="inherit" variant="softExtended" onClick={handleAttach}>
            <Iconify icon="solar:gallery-wide-bold" width={24} sx={{ color: 'success.main' }} />
            Image
          </Fab>
        </Stack>

        <Button variant="contained">Post</Button>
      </Stack>

      <input ref={fileRef} type="file" style={{ display: 'none' }} />
    </Card>
  );

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
            flex: { lg: '1 1 auto' },
            px: { xs: 2, sm: 3, xl: 5 },
          }}
        >
          <TopQuotes title="Most Liked Quotes" list={_coursesFeatured} />
        </Box>
      </Box>
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
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Stack spacing={3} />
          </Grid>

          <Grid xs={12} md={8}>
            <Stack spacing={3}>{renderPostInput}</Stack>
          </Grid>
        </Grid>
      </Box>
    </UserContent>
  );
}
