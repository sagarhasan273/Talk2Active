import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useSelector } from 'react-redux';

import { Badge } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import NoSsr from '@mui/material/NoSsr';
import SvgIcon from '@mui/material/SvgIcon';
import { useTheme } from '@mui/material/styles';

import { AvatarUser } from 'src/components/avatar-user';
import { selectAccount } from 'src/core/slices';

// ----------------------------------------------------------------------

export type AccountButtonProps = IconButtonProps & {
  photoURL?: string;
  displayName?: string;
};

export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  const theme = useTheme();
  const user = useSelector(selectAccount);

  const isOnline = Boolean(user?.userId || user.userId);

  const renderFallback = (
    <Avatar
      sx={{
        width: 40,
        height: 40,
        border: `solid 2px ${theme.palette.background.default}`,
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
            backgroundColor: isOnline ? 'success.main' : 'grey.500',
            boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
            transition: 'background-color 0.3s ease',
          },
        }}
      >
        <NoSsr fallback={renderFallback}>
          <AvatarUser
            avatarUrl={user.profilePhoto}
            name={user?.name || displayName || ''}
            verified={user?.verified}
            accountType={user?.accountType}
          />
        </NoSsr>
      </Badge>
    </IconButton>
  );
}

export default AccountButton;
