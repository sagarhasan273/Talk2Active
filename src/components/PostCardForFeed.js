/* eslint-disable max-len */
import { useTheme } from '@emotion/react';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import TurnedInNotIcon from '@mui/icons-material/TurnedInNot';
import { Avatar, Box, Button, Stack, styled, Typography } from '@mui/material';
import React from 'react';

const CustomBox = styled(Box)(({ theme }) => ({
  background: `${theme.palette.background.main}`,
  width: '100%',
  borderRadius: '10px',
  minWidth: '100%',
  maxWidth: '100%',
}));

const CustomButton = styled(Button)(({ theme }) => ({
  color: theme.palette.text.main,
  '&: hover': {
    color: theme.palette.hover.main,
  },
}));

function PostCardForFeed({ postItem }) {
  const theme = useTheme();

  return (
    <CustomBox>
      <Stack direction="row" justifyContent="space-between">
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
        <Stack sx={{ pr: 2 }} justifyContent="center">
          <Button
            startIcon={<AddIcon sx={{ m: 0 }} />}
            sx={{
              color: theme.palette.follow.main,
              '& .MuiButton-startIcon': {
                m: 0,
              },
              '& .MuiSvgIcon-root': {
                fontSize: '20px',
              },
            }}
            size="mid"
            disableRipple
          >
            Follow
          </Button>
        </Stack>
      </Stack>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img src={postItem?.image} alt="Preview" style={{ width: '100%', height: 'auto' }} />
      </Box>
      <Stack direction="row" sx={{ height: 40, p: '2px 25px' }} justifyContent="space-between" alignItems="center">
        <Stack direction="row" gap="25px">
          <CustomButton sx={{ flex: 0, color: theme.palette.text.main }} disableRipple>
            {!postItem?.likes ? <ThumbUpOffAltIcon /> : <ThumbUpAltIcon />}
            <Typography>{postItem?.likes}</Typography>
          </CustomButton>
          <CustomButton sx={{ flex: 0, color: theme.palette.text.main }} disableRipple>
            <CommentIcon />
            <Typography>{postItem?.comments}</Typography>
          </CustomButton>
        </Stack>
        <Stack>
          <CustomButton sx={{ flex: 0, color: theme.palette.text.main }} disableRipple>
            {postItem?.comments ? <TurnedInNotIcon /> : <TurnedInIcon />}
          </CustomButton>
        </Stack>
      </Stack>
    </CustomBox>
  );
}

export default React.memo(PostCardForFeed);
