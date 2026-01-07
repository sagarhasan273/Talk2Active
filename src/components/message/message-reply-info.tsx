import { Box, SvgIcon, useTheme, Typography, IconButton } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import type { MessageReplyInfoProps } from './type';

export function MessageReplyInfo({ replyMessage, cancelReplyMessage, sx }: MessageReplyInfoProps) {
  const theme = useTheme();

  const handleClose = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    cancelReplyMessage?.();
  };

  return (
    <Box
      sx={{
        pl: 0.5,
        pr: 1,
        borderLeft: `4px solid ${theme.palette.primary.main}`,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Box sx={{ px: 1 }}>
        <Typography
          variant="caption"
          className="message-time"
          sx={{
            color: varAlpha(
              theme.vars.palette.primary[
                theme.palette.mode === 'dark' ? 'lightChannel' : 'mainChannel'
              ],
              1
            ),
          }}
        >
          {replyMessage?.userInfo?.name}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {replyMessage?.text}
        </Typography>
      </Box>
      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
        <SvgIcon>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
            <path
              fill="currentColor"
              d="M5.921 11.9L1.353 8.62a.72.72 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8c-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"
            />
          </svg>
        </SvgIcon>
        {cancelReplyMessage && (
          <IconButton
            onClick={handleClose}
            sx={{
              px: 1,
              borderRadius: 1,
              backgroundColor: varAlpha(theme.vars.palette.background.paperChannel, 1),
              '&:hover': {
                backgroundColor: 'active.hover',
                color: `${theme.vars.palette.error.mainChannel} !important`,
              },
            }}
          >
            <SvgIcon>
              <path
                fill="currentColor"
                d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4"
              />
            </SvgIcon>
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
