import type { IconButtonProps } from '@mui/material/IconButton';

import { m } from 'framer-motion';
import { useSelector } from 'react-redux';

import { Badge, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';

import AnimatedAvatar from '@/components/avatar-user/animated-avatar';
import { selectAccount } from 'src/core/slices';

// ----------------------------------------------------------------------

export type AccountButtonProps = IconButtonProps & {
  photoURL?: string;
  displayName?: string;
};

export function AccountButton({ photoURL, displayName, sx, ...other }: AccountButtonProps) {
  const theme = useTheme();
  const user = useSelector(selectAccount);

  const isOnline = Boolean(user?.userId);

  // Get the name and truncate it if it exceeds 15 characters
  const rawName = user?.name || displayName || 'User';
  const displayNameText = rawName.length > 15 ? `${rawName.substring(0, 15)}...` : rawName;

  return (
    <IconButton
      component={m.button}
      whileTap="tap"
      sx={{
        p: 0.5,
        mr: 2,
        borderRadius: '50px',
        border: '1px solid',
        borderColor: theme.palette.divider,
        maxWidth: '200px',
        ...sx,
      }}
      {...other}
    >
      <Badge
        variant="dot"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          flexShrink: 0,
          '& .MuiBadge-badge': {
            position: 'absolute',
            bottom: 5,
            right: 5,
            backgroundColor: isOnline ? 'success.main' : 'grey.500',
            boxShadow: `0 0 0 1px ${theme.palette.background.paper}`,
          },
        }}
      >
        <AnimatedAvatar
          accountType={user?.accountType}
          src={user?.profilePhoto || undefined}
          name={user?.name}
          size={32}
          ringGap={3}
          speed={4}
        />
      </Badge>

      <Typography
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 600,
          fontSize: '0.875rem',
          color: 'text.primary',
          ml: 1,
          pr: 1,
        }}
      >
        {displayNameText}
      </Typography>
    </IconButton>
  );
}

export default AccountButton;
