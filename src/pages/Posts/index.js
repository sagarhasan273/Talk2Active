import { Box, Grid, Stack, useTheme } from '@mui/material';
import React from 'react';
import { staticPostData } from '../UserDashboard/helper';
import Feeds from './Feeds';

function Posts() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: '100%',
        width: {
          xs: '100%',
          sm: '600px',
          md: '750px',
          lg: '1000px',
          xl: '1000px',
        },
        m: 'auto',
      }}
    >
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={2.5}>
          <Stack
            sx={{
              mt: '10px',
              p: '10px',
              height: '350px',
              background: theme.palette.background.main,
              borderRadius: '10px',
            }}
          >
            hello
          </Stack>
        </Grid>
        <Grid item xs={7}>
          <Stack
            sx={{
              p: '10px',
              height: '95vh',
            }}
          >
            <Feeds feeds={staticPostData} />
          </Stack>
        </Grid>
        <Grid item xs={2.5}>
          <Stack
            sx={{
              mt: '10px',
              p: '10px',
              height: '250px',
              // background: theme.palette.background.main,
              borderRadius: '10px',
            }}
          ></Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Posts;
