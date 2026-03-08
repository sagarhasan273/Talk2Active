import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Badge } from '@mui/material';
import NoSsr from '@mui/material/NoSsr';
import Avatar from '@mui/material/Avatar';
import SvgIcon from '@mui/material/SvgIcon';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useRoomTools, selectAccount } from 'src/core/slices';
import { useSocketContext } from 'src/core/contexts/socket-context';

import { AvatarUser } from 'src/components/avatar-user';

// ----------------------------------------------------------------------

export type AccountButtonProps = IconButtonProps & {
  photoURL?: string;
  displayName?: string;
};

export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  const theme = useTheme();

  const user = useSelector(selectAccount);

  const { socket, isSocketConnected } = useSocketContext();
  const { currentRooms } = useRoomTools();

  useEffect(() => {
    if (!socket) return undefined;

    const onConnect = () => {
      socket.emit('join-room', {
        userId: user.id,
        roomIds: currentRooms?.map((room) => room?.room?.id),
      });
    };

    const onDisconnect = () => {
      socket.emit('leave-room', { userId: user.id });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
    };
  }, [socket, user.id, currentRooms]);

  const renderFallback = (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        border: `solid 2px ${theme.vars.palette.background.default}`,
      }}
    >
      <SvgIcon>
        <circle cx="12" cy="6" r="4" fill="currentColor" />
        <path
          fill="currentColor"
          d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5"
          opacity="0.5"
        />
      </SvgIcon>
    </Avatar>
  );

  return (
    <IconButton component={m.button} whileTap="tap" sx={{ p: 0, mr: 2, ...sx }} {...other}>
      <Badge
        variant="dot"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          '& .MuiBadge-badge': {
            position: 'absolute',
            bottom: 5,
            right: 5,
            backgroundColor: isSocketConnected ? 'success.main' : 'grey.500',
            boxShadow: `0 0 0 1px ${theme.vars.palette.success.lighter}`,
            transition: 'background-color 0.3s ease',
          },
        }}
      >
        <NoSsr fallback={renderFallback}>
          {/* <AnimateAvatar
            sx={{ width: 40, height: 40 }}
            slotProps={{
              avatar: { src: photoURL, alt: displayName },
              overlay: {
                border: 1,
                spacing: 2,
                color: `conic-gradient(
              ${theme.vars.palette.primary.main},
              ${theme.vars.palette.warning.main},
              ${theme.vars.palette.primary.main}
            )`,
              },
            }}
          >
            {displayName?.charAt(0).toUpperCase()}
          </AnimateAvatar> */}

          <AvatarUser
            avatarUrl={user.profilePhoto}
            name={user.name}
            verified={user.verified}
            accountType={user.accountType}
          />
        </NoSsr>
      </Badge>
    </IconButton>
  );
}
