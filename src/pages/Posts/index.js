import { Box, Grid, Stack, useTheme } from '@mui/material';
import React from 'react';
import { staticPostData } from '../UserDashboard/helper';
import Feeds from './Feeds';
import ProfilePreview from './ProfilePreview';

function Posts() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height: '100%',
        width: {
          xs: '100%',
          sm: '750px',
          md: '880px',
          lg: '1000px',
          xl: '1000px',
        },
        m: 'auto',
      }}
    >
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={0} sm={2.5} md={2.5}>
          <Stack
            sx={{
              mt: '10px',
              p: '10px',
              width: {
                md: '150px', // Show on medium screens and above
                lg: '180px',
              },
              height: '350px',
              background: theme.palette.background.main,
              borderRadius: '10px',
              display: {
                xs: 'none', // Hide on extra small screens
                sm: 'none', // Hide on small screens
                md: 'block', // Show on medium screens and above
              },
              position: 'fixed',
              top: '50px',
            }}
          >
            <ProfilePreview />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={7} md={7}>
          <Stack
            sx={{
              p: '10px',
              height: '95vh',
            }}
          >
            <Feeds feeds={staticPostData} />
          </Stack>
        </Grid>
        <Grid item xs={0} sm={2.5} md={2.5}>
          <Stack
            sx={{
              mt: '10px',
              p: '10px',
              height: '250px',
              // background: theme.palette.background.main,
              borderRadius: '10px',
              display: {
                xs: 'none', // Hide on extra small screens
                sm: 'none', // Hide on small screens
                md: 'block', // Show on medium screens and above
              },
            }}
          ></Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Posts;
