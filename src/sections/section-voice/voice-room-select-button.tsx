import type { RoomResponse } from 'src/types/type-chat';

import React from 'react';

import LockIcon from '@mui/icons-material/Lock';
import { Box, Badge, Tooltip, useTheme, Typography, ButtonBase, AvatarGroup } from '@mui/material';

import { AvatarUser } from 'src/components/avatar-user';

type VoiceRoomSelectButtonProps = {
  selected?: boolean;
  isJoined?: boolean;
  room: RoomResponse;
  onClick: (room: RoomResponse) => void;
};

const VoiceRoomSelectButton = ({
  selected = false,
  isJoined = false,
  room,
  onClick,
}: VoiceRoomSelectButtonProps) => {
  const theme = useTheme();

  if (!room?.id) return null;

  // Color configurations using theme tokens
  const colors = {
    // Background colors
    defaultBg: theme.palette.background.default,
    selectedBg: theme.palette.background.paper,
    hoverBg: theme.palette.action.hover,

    // Joined states using primary.main with opacity
    joinedBg: isJoined ? `${theme.palette.primary.main}40` : 'transparent', // 8% opacity
    joinedHoverBg: isJoined ? `${theme.palette.primary.light}80` : theme.palette.action.hover, // 16% opacity
    joinedSelectedBg:
      isJoined && selected ? `${theme.palette.primary.main}28` : theme.palette.background.paper,

    // Text colors
    primaryText: theme.palette.text.primary,
    secondaryText: theme.palette.text.secondary,
    joinedText: isJoined ? theme.palette.primary.main : theme.palette.text.primary,

    // Border colors
    borderDefault: theme.palette.divider,
    borderSelected: theme.palette.primary.main,
    borderJoined: isJoined ? theme.palette.primary.main : 'transparent',

    // Badge colors
    badgeBg: theme.palette.background.default,
    badgeSelectedBg: theme.palette.background.paper,

    // Icon colors
    lockIcon: theme.palette.text.disabled,

    // Live indicator
    liveIndicator: theme.palette.success.main,
  };

  const getBgColor = () => {
    if (isJoined && selected) return colors.joinedSelectedBg;
    if (isJoined) return colors.joinedBg;
    if (selected) return colors.selectedBg;
    return colors.defaultBg;
  };

  const getHoverBgColor = () => {
    if (isJoined) return colors.joinedHoverBg;
    return colors.hoverBg;
  };

  const getTextColor = () => {
    if (isJoined) return colors.joinedText;
    return colors.primaryText;
  };

  const getBorderColor = () => {
    if (selected) return colors.borderSelected;
    if (isJoined) return colors.borderJoined;
    return 'transparent';
  };

  return (
    <ButtonBase
      onClick={() => onClick(room)}
      sx={{
        width: 1,
        height: 60,
        bgcolor: getBgColor(),
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        mb: 1,
        px: 1.5,
        gap: 1.5,
        textAlign: 'left',
        transition: 'all 0.2s ease',
        border: `1px solid ${getBorderColor()}`,
        '&:hover': {
          bgcolor: getHoverBgColor(),
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      {/* Host Avatar with Language Badge */}
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <Tooltip title={room.languages?.map((lang) => lang.toUpperCase()).join(', ')} arrow>
            <Box
              sx={{
                bgcolor: selected ? colors.badgeSelectedBg : colors.badgeBg,
                borderRadius: '12px',
                p: 0.1,
                px: 0.5,
                display: 'flex',
                border: selected
                  ? `1.5px solid ${colors.borderSelected}`
                  : `1.5px solid ${colors.borderDefault}`,
                maxWidth: '70px',
                cursor: 'default',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  color: isJoined ? colors.joinedText : colors.secondaryText,
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {room.languages?.length > 2
                  ? `${room.languages
                      .slice(0, 2)
                      .map((lang) => lang.toUpperCase())
                      .join(', ')} +${room.languages.length - 2}`
                  : room.languages?.map((lang) => lang.toUpperCase()).join(', ')}
              </Typography>
            </Box>
          </Tooltip>
        }
      >
        <AvatarUser
          avatarUrl={room.host?.profilePhoto}
          verified={room.host?.verified}
          name={room.host?.name}
          accountType={room.host?.accountType}
        />
      </Badge>

      {/* Room Text Info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{
              color: getTextColor(),
              fontWeight: 700,
              fontSize: '0.875rem',
            }}
          >
            {room.name}
          </Typography>
          <LockIcon sx={{ fontSize: 12, color: colors.lockIcon }} />
        </Box>

        {/* Participants Sub-text */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.2 }}>
          <AvatarGroup
            max={3}
            sx={{
              '& .MuiAvatar-root': {
                width: 16,
                height: 16,
                fontSize: 8,
                border: `1px solid ${colors.borderDefault}`,
              },
            }}
          >
            {room?.currentParticipants?.map((participant, index) => (
              <AvatarUser
                key={`${participant.user.id}+${index}`}
                avatarUrl={participant.user.profilePhoto}
                name={participant.user.name}
                verified={participant.user?.verified}
                shouldSpin={false}
              />
            ))}
          </AvatarGroup>
          <Typography
            sx={{
              color: isJoined ? colors.joinedText : colors.secondaryText,
              fontSize: '0.75rem',
              ml: 1,
            }}
          >
            +{room?.currentParticipants?.length || 0} online
          </Typography>
        </Box>
      </Box>

      {/* Live Indicator Dot */}
      {isJoined ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            border: `1px solid ${theme.palette.success.main}`,
            borderRadius: '10px',
            px: 0.5,
          }}
        >
          <Box
            sx={{
              width: 5,
              height: 5,
              bgcolor: theme.palette.success.main,
              borderRadius: '50%',
              boxShadow: `0 0 8px ${theme.palette.success.main}`,
            }}
          />
          <Typography
            sx={{
              fontSize: '0.6rem',
              fontWeight: 600,
              color: theme.palette.success.main,
            }}
          >
            LIVE
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            minWidth: 8,
            bgcolor: colors.liveIndicator,
            borderRadius: '50%',
            boxShadow: `0 0 8px ${colors.liveIndicator}`,
          }}
        />
      )}
    </ButtonBase>
  );
};

export default VoiceRoomSelectButton;
