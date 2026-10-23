import { Mic, PhoneCall } from 'lucide-react';
import React from 'react';

import { alpha, Avatar, Badge, Box, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';

import { ButtonRelationshipToggle, ButtonUnfollowIcon } from '@/components/buttons';
import { useCredentials } from '@/core/slices';
import type { AllRelationsType, SocialChatTabKey } from '@/types/type-social';
import { fToNow } from '@/utils/format-time';
import { getInitials } from '@/utils/social-chat-helper';

interface DirectoryListItemProps {
  item: AllRelationsType;
  tab: SocialChatTabKey;
  canChat: boolean;
  unreadCount: number;
  roomId: string | false;
  onOpenChat: (item: AllRelationsType) => void;
  onJoinRoom?: (roomId: string) => void;
  onUnfollow?: (e: React.MouseEvent, item: AllRelationsType) => void;
}

export const DirectoryListItem: React.FC<DirectoryListItemProps> = ({
  item,
  tab,
  canChat,
  unreadCount,
  roomId,
  onOpenChat,
  onJoinRoom,
  onUnfollow,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { checkIfFollowing, checkIfBlocked } = useCredentials();

  const person = item.accountDetails;
  const isInRoom = Boolean(roomId);
  const latestText = item.latestMessage?.text || `Last seen: ${fToNow(person.lastActive)} ago`;

  return (
    <Box
      onClick={() => {
        if (canChat) onOpenChat(item);
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.25,
        py: 0.9,
        borderRadius: 0.5,
        cursor: canChat ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease, transform 0.12s ease',
        '&:hover': canChat ? { bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc' } : undefined,
      }}
    >
      {/* Avatar + Badge + Voice Indicator */}
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0} overlap="circular">
          <Avatar
            src={person.profilePhoto}
            sx={{
              width: 38,
              height: 38,
              fontSize: 13,
              fontWeight: 800,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
              color: 'primary.main',
              border: '1px solid',
              borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
            }}
          >
            {getInitials(person.name)}
          </Avatar>
        </Badge>
        {isInRoom && (
          <Box
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: 'success.main',
              border: `2px solid ${isDark ? '#181c26' : '#ffffff'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
              '@keyframes voicePulse': {
                '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
                '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
              },
              animation: 'voicePulse 2s infinite ease-in-out',
            }}
          >
            <Mic size={9} strokeWidth={3} />
          </Box>
        )}
      </Box>

      {/* Name and Text */}
      <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
        <Typography
          sx={{
            fontSize: 12.5,
            fontWeight: unreadCount > 0 ? 800 : 700,
            lineHeight: 1.2,
            color: canChat ? 'primary.main' : 'text.primary',
          }}
          noWrap
        >
          {person.name}
        </Typography>
        {(canChat || (!canChat && isInRoom)) && (
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: 11,
              color: unreadCount > 0 ? 'text.primary' : isInRoom ? 'success.main' : isDark ? 'text.secondary' : '#64748b',
              fontWeight: unreadCount > 0 ? 700 : 500,
              mt: 0.2,
            }}
            noWrap
          >
            {unreadCount > 0 ? `${unreadCount} unread messages` : isInRoom ? '🎙️ In a voice room' : latestText}
          </Typography>
        )}
      </Box>

      {/* Actions */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
        {isInRoom && (
          <Tooltip title={`Join ${person.name}'s room`} arrow>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                if (roomId && onJoinRoom) onJoinRoom(roomId);
              }}
              sx={{
                color: '#fff',
                bgcolor: 'success.main',
                borderRadius: 0.5,
                width: 30,
                height: 30,
                boxShadow: `0 3px 10px ${alpha(theme.palette.success.main, 0.35)}`,
                '&:hover': { bgcolor: 'success.dark' },
              }}
            >
              <PhoneCall size={14} />
            </IconButton>
          </Tooltip>
        )}

        {tab === 'following' && onUnfollow && (
          <ButtonUnfollowIcon
            targetUserId={item.accountDetails.userId}
            onSuccess={(e) => onUnfollow(e, item)}
            sx={{
              height: 30,
              borderRadius: 0.5,
              px: 1.25,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 'auto',
              border: '1px solid',
              borderColor: alpha(theme.palette.error.main, 0.25),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, isDark ? 0.14 : 0.08),
              },
            }}
          />
        )}
        {tab === 'followers' && onUnfollow && (
          <ButtonRelationshipToggle
            targetUser={{ id: item.accountDetails.userId, name: String(item.accountDetails.name) }}
            variant='icon'
            sx={{
              height: 30,
              borderRadius: 0.5,
              px: 1.25,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'none',
              minWidth: 'auto',
            }}
          />
        )}
      </Stack>
    </Box>
  );
};
