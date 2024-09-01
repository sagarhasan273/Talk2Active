import { Badge, Stack, styled } from '@mui/material';
import React from 'react';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.primary}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      // animation: 'ripple 2.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const CustomStack = styled(Stack)(() => ({
  pt: 1,
  flexDirection: 'row',
  gap: '5px',
  alignItems: 'center',
  position: 'relative',
}));

function ActiveStatus({ status, children }) {
  if (status === 'online') {
    return (
      <CustomStack direction="row" gap="5px" alignItems="center">
        <StyledBadge
          sx={{ color: 'transparent' }}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      </CustomStack>
    );
  }
  if (status === 'offline') {
    return (
      <CustomStack>
        <StyledBadge
          sx={{ '& .MuiBadge-badge': { backgroundColor: 'black', color: 'transparent' } }}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      </CustomStack>
    );
  }
  if (status === 'busy') {
    return (
      <CustomStack>
        <StyledBadge
          sx={{ '& .MuiBadge-badge': { backgroundColor: '#ff8c00', color: 'transparent' } }}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      </CustomStack>
    );
  }
  if (status === 'sleeping') {
    return (
      <CustomStack>
        <StyledBadge
          sx={{ '& .MuiBadge-badge': { backgroundColor: '#9e9e9e', color: 'transparent' } }}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      </CustomStack>
    );
  }
  if (status === 'brb') {
    return (
      <CustomStack>
        <StyledBadge
          sx={{ '& .MuiBadge-badge': { backgroundColor: '#00ffe1', color: 'transparent' } }}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      </CustomStack>
    );
  }
  if (status === 'afk') {
    return (
      <CustomStack>
        <StyledBadge
          sx={{ '& .MuiBadge-badge': { backgroundColor: '#ffeb3b', color: 'transparent' } }}
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
        >
          {children}
        </StyledBadge>
      </CustomStack>
    );
  }

  return (
    <CustomStack direction="row" gap="5px" alignItems="center">
      {children}
    </CustomStack>
  );
}

export default ActiveStatus;
