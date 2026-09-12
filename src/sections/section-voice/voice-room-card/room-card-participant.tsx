import React from 'react';

import { Box, alpha, useTheme, Typography } from '@mui/material';

import { AvatarUser } from 'src/components/avatar-user';

import { supporterSheen } from './styles';

import type { ParticipantUser } from './types';

type RoomCardParticipantProps = {
  user: ParticipantUser;
  isHost?: boolean;
  onImageClick: (src: string, name: string) => void;
};

/** Single participant tile inside the participants dialog. */
export const RoomCardParticipant = ({ user, isHost, onImageClick }: RoomCardParticipantProps) => {
  const theme = useTheme();
  const isSupporter = user.accountType === 'supporter';
  const hasPhoto = user.verified ? Boolean(user.profilePhoto) : false;
  const displayName = isSupporter ? user.name : user.name?.split(' ')[0];

  return (
    <Box
      onClick={() => hasPhoto && onImageClick(user.profilePhoto!, user.name)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        p: 1,
        borderRadius: 1.5,
        cursor: hasPhoto ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease',
        '&:hover': hasPhoto
          ? { bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.06) : alpha('#000', 0.05) }
          : undefined,
      }}
    >
      <AvatarUser
        avatarUrl={user.profilePhoto}
        name={user.name}
        verified={user.verified}
        accountType={user.accountType}
        sx={{
          width: 64,
          height: 64,
          ...(isHost && {
            outline: `2px solid ${theme.palette.warning.main}`,
            outlineOffset: 2,
          }),
        }}
      />

      <Typography
        variant="caption"
        fontWeight={700}
        noWrap
        sx={{
          maxWidth: 84,
          textAlign: 'center',
          ...(isSupporter
            ? {
                backgroundImage: `linear-gradient(100deg, ${theme.palette.text.primary} 42%, ${theme.palette.primary.main} 50%, ${theme.palette.text.primary} 58%)`,
                backgroundSize: '250% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${supporterSheen} 3.5s ease-in-out infinite`,
              }
            : { color: 'text.primary' }),
        }}
      >
        {displayName}
      </Typography>

      {isHost && (
        <Typography
          variant="caption"
          sx={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, color: 'warning.main' }}
        >
          Host
        </Typography>
      )}
    </Box>
  );
};
