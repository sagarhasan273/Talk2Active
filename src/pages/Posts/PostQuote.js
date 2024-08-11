import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { Stack, TextField, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    background: theme.palette.input.main,
    borderRadius: '10px',
    padding: '10px',
    paddingBottom: '20px',
  },
  '& .MuiInputBase-input': {
    background: theme.palette.input.main,
    color: theme.palette.background.main, // Change text color
    scrollbarWidth: 'none',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.text.main, // Change border color
    },
    '&:hover fieldset': {
      borderColor: theme.palette.text.main, // Change border color on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.text.main, // Change border color when focused
    },
  },
  '& .MuiInputLabel-root': {
    color: 'gray', // Change label color
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.text.main, // Change label color when focused
  },
}));

function PostQuote() {
  const theme = useTheme();

  return (
    <Stack direction="row" gap={2}>
      <Stack
        sx={{ width: '50px', height: '50px', border: `1px solid ${theme.palette.text.main}`, borderRadius: '50px' }}
        justifyContent="center"
        alignItems="center"
      >
        <FormatQuoteIcon sx={{ color: theme.palette.text.main }} />
      </Stack>
      <Stack flex={1}>
        <CustomTextField placeholder="Write your quote..." multiline maxRows={6} />
      </Stack>
    </Stack>
  );
}

export default PostQuote;
