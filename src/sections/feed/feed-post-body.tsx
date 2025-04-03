import React, { useRef } from 'react';

import { Fab, Box, Card, Stack, Button, InputBase } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { _coursesFeatured } from 'src/_mock';
import { UserContent } from 'src/layouts/user';

import { Iconify } from 'src/components/iconify';

import FeedPostList from './feed-post-list';

export default function FeedPostBody() {
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
      maxWidth="md"
      sx={{
        p: { xs: 1, sm: 1, md: 3 },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { sm: '1fr', md: '30% 1fr' },
          columnGap: { xs: 1, sm: 1, md: 2 },
          rowGap: { xs: 1, sm: 1, md: 2 },
        }}
      >
        <Stack>
          <Card sx={{ p: 3 }} />
        </Stack>

        <Stack gap={2}>
          {renderPostInput}
          <FeedPostList list={_coursesFeatured} />
        </Stack>
      </Box>
    </UserContent>
  );
}
