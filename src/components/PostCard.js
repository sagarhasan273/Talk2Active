/* eslint-disable max-len */
import { useTheme } from '@emotion/react';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import { Avatar, Box, Button, Stack, styled, Typography } from '@mui/material';
import React from 'react';

const CustomBox = styled(Box)(({ theme }) => ({
  background: `${theme.palette.background.main}`,
  width: '450px',
  height: '350px',
  borderRadius: '10px',
  minWidth: '450px',
  maxWidth: '450px',
}));

function PostCard({ postItem }) {
  const theme = useTheme();

  return (
    <CustomBox>
      <Button disableRipple>
        <Stack direction="row" sx={{ pl: 2, height: 60, gap: '10px' }} alignItems="center">
          <Avatar sx={{ height: 45, width: 45 }} src={postItem?.image} alt={postItem?.userName}>
            {postItem?.userName}
          </Avatar>
          <Stack gap="5px">
            <Typography variant="h4" sx={{ color: theme.palette.text.main, textAlign: 'left' }}>
              {postItem?.userName}
            </Typography>
            <Typography variant="h5" sx={{ color: theme.palette.text.main, textAlign: 'left' }}>
              {postItem?.postDuration}
            </Typography>
          </Stack>
        </Stack>
      </Button>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '245px',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            backgroundImage: `url(${postItem?.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            filter: 'blur(40px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${postItem?.image})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </Box>
      <Stack direction="row" sx={{ height: 40, p: '4px 25px' }} justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap="25px">
          <Button sx={{ flex: 0, color: theme.palette.text.main }} disableRipple>
            {!postItem?.likes ? <ThumbUpOffAltIcon /> : <ThumbUpAltIcon />}
            <Typography>{postItem?.likes}</Typography>
          </Button>
          <Button sx={{ flex: 0, color: theme.palette.text.main }} disableRipple>
            <CommentIcon />
            <Typography>{postItem?.comments}</Typography>
          </Button>
        </Stack>
        <Stack>
          <Button sx={{ flex: 0, color: theme.palette.text.main }} disableRipple>
            {postItem?.comments ? <TurnedInNotIcon /> : <TurnedInIcon />}
          </Button>
        </Stack>
      </Stack>
    </CustomBox>
  );
}

export default PostCard;
