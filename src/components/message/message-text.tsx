import type { Message } from 'src/types/type-room';

import { Box, Paper, Tooltip, SvgIcon, useTheme, Typography } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { MessageMention } from './message-mention';
import { MessageReplyInfo } from './message-reply-info';

import type { MessageTextProps } from './type';

export function MessageText({ message, onReaction }: MessageTextProps) {
  const theme = useTheme();

  const reactionCounts =
    message.reactions?.reduce((acc: Record<string, number>, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {}) || {};

  return (
    <Paper
      sx={{
        p: 1.25,
        px: 2,
        pb: 0.75,
        backgroundColor:
          message.sender === 'me'
            ? varAlpha(
                theme.vars.palette.grey[
                  theme.palette.mode === 'light' ? '400Channel' : '800Channel'
                ],
                1
              )
            : varAlpha(
                theme.vars.palette.grey[
                  theme.palette.mode === 'light' ? '400Channel' : '800Channel'
                ],
                0.6
              ),
        borderRadius: message.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 8px',
        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
        border: message.isPrivate
          ? `1px dashed ${varAlpha(theme.vars.palette.error.mainChannel, 1)}`
          : message.type === 'system'
            ? `1px solid ${varAlpha(theme.vars.palette.info.mainChannel, 1)}`
            : 'none',
        position: 'relative',
        minWidth: message.sender === 'them' ? 180 : 100,
      }}
    >
      {message?.messageRepliedOf && (
        <MessageReplyInfo
          replyMessage={message.messageRepliedOf}
          sx={{
            mb: 2,
            backgroundColor: theme.palette.mode === 'light' ? 'grey.300' : 'grey.900',
          }}
        />
      )}

      {message?.parentMessage && (
        <MessageReplyInfo
          replyMessage={message.parentMessage as Message}
          sx={{
            mb: 2,
            backgroundColor: theme.palette.mode === 'light' ? 'grey.300' : 'grey.900',
          }}
        />
      )}

      <GetTextFromMessage message={message} />

      <MessageMention message={message} />

      {/* Display existing reactions with counts */}
      {Object.keys(reactionCounts).length > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexWrap: 'wrap',
            pt: 1,
            pb: 0.5,
          }}
        >
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <Tooltip key={emoji} title={`${count} reaction${count > 1 ? 's' : ''}`}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.25,
                  cursor: 'pointer',
                  backgroundColor: 'action.hover',
                  borderRadius: 1,
                  px: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={(event) => {
                  event.preventDefault();
                  onReaction?.(message, emoji);
                }}
              >
                <Typography sx={{ fontSize: 14 }}>{emoji}</Typography>
                {count > 1 && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      color: 'text.secondary',
                      fontWeight: 600,
                    }}
                  >
                    {count}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mt: 0.25,
          mr: 1,
          gap: 0.5,
        }}
      >
        {message.sender === 'them' && (
          <Typography
            variant="caption"
            className="message-time"
            sx={{
              userSelect: 'text',
              color: varAlpha(
                theme.vars.palette.primary[
                  theme.palette.mode === 'dark' ? 'lightChannel' : 'mainChannel'
                ],
                message.isUnread && message.sender === 'them' ? 1 : 0.8
              ),
              fontWeight: message.isUnread && message.sender === 'them' ? 'bold' : 'normal',
              mr: 'auto',
            }}
          >
            {message.type === 'system' ? (
              <Box component="span" sx={{ color: 'info.main' }}>
                Talk2Active System
              </Box>
            ) : (
              message.senderInfo?.name
            )}
          </Typography>
        )}

        <Typography
          variant="caption"
          className="message-time"
          sx={{
            ml: 0.5,
            color: 'text.primary',
            fontSize: '0.5rem',
            opacity: message.isUnread && message.sender === 'them' ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {message.isEdited && (
          <Box
            sx={{
              ml: 0.25,
              width: 'fit-content',
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.25,
            }}
          >
            <SvgIcon sx={{ fontSize: 12, color: 'info.main' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M6.414 15.89L16.556 5.748l-1.414-1.414L5 14.476v1.414zm.829 2H3v-4.243L14.435 2.212a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414zM3 19.89h18v2H3z"
                />
              </svg>
            </SvgIcon>
            <Typography
              variant="caption"
              sx={{
                color: 'info.main',
                fontSize: '0.6rem',
              }}
            >
              Edited
            </Typography>
          </Box>
        )}
        {message.sender === 'me' && (
          <Box
            sx={{
              width: 12,
              height: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'info.main',
                fontSize: '0.6rem',
              }}
            >
              ✓✓
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

function GetTextFromMessage({ message }: { message: Message }) {
  if (message.type === 'system') {
    if (message.systemMessageType === 'user-joined') {
      return (
        <Box sx={{ typography: 'body1' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>
            {message?.senderInfo?.name}
          </Box>{' '}
          has joined in the voice room.
        </Box>
      );
    }
    if (message.systemMessageType === 'user-left') {
      return (
        <Box sx={{ typography: 'body1' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>
            {message?.senderInfo?.name}
          </Box>{' '}
          has left the chat.
        </Box>
      );
    }
  }

  if (message.isDeleted) {
    return (
      <Typography
        variant="body1"
        sx={{
          wordBreak: 'break-word',
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          userSelect: 'text',
          fontStyle: 'italic',
          color: 'text.secondary',
        }}
      >
        [This message was deleted]
      </Typography>
    );
  }

  return (
    <Typography
      variant="body1"
      sx={{
        wordBreak: 'break-word',
        lineHeight: 1.4,
        whiteSpace: 'pre-wrap',
        userSelect: 'text',
      }}
    >
      {message.text}
    </Typography>
  );
}
