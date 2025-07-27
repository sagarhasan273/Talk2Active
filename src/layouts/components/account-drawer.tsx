import type { UserType } from 'src/types/user';
import type { IconButtonProps } from '@mui/material/IconButton';

import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import { Button } from '@mui/material';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme, useColorScheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useUserContext } from 'src/routes/components';
import { useRouter, usePathname } from 'src/routes/hooks';

import { varAlpha } from 'src/theme/styles';
import { useUpdateUserStatusMutation } from 'src/services/user-api';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateAvatar } from 'src/components/animate';
import { useSettingsContext } from 'src/components/settings';
import { BaseOption } from 'src/components/settings/drawer/base-option';
import { NavOptions } from 'src/components/settings/drawer/nav-options';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type AccountDrawerProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];

  status?: {
    label: string;
    value: string;
  }[];
};

export function AccountDrawer({ data = [], status = [], sx, ...other }: AccountDrawerProps) {
  const theme = useTheme();

  const settings = useSettingsContext();

  const { mode, setMode } = useColorScheme();

  const router = useRouter();

  const pathname = usePathname();

  const { user, setUser } = useUserContext();

  const [open, setOpen] = useState(false);

  const [updateUser] = useUpdateUserStatusMutation();

  const handleOpenDrawer = useCallback(() => {
    setOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setOpen(false);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleCloseDrawer();
      router.push(path);
    },
    [handleCloseDrawer, router]
  );

  const renderAvatar = (
    <AnimateAvatar
      width={96}
      slotProps={{
        avatar: { src: user?.profilePhoto, alt: user?.name },
        overlay: {
          border: 2,
          spacing: 3,
          color: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0)} 25%, ${theme.vars.palette.primary.main} 100%)`,
        },
      }}
    >
      {user?.name?.charAt(0).toUpperCase()}
    </AnimateAvatar>
  );

  const renderColor = (
    <NavOptions
      value={{
        color: settings.primaryColor,
      }}
      onClickOption={{
        color: (newValue) => settings.onUpdateField('primaryColor', newValue),
      }}
      options={{
        colors: ['blue', 'cyan', 'orange', 'purple', 'red'],
      }}
    />
  );

  return (
    <>
      <AccountButton
        onClick={handleOpenDrawer}
        photoURL={user?.profilePhoto}
        displayName={user?.name}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={handleCloseDrawer}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        <IconButton
          onClick={handleCloseDrawer}
          sx={{ top: 12, left: 12, zIndex: 9, position: 'absolute' }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Stack alignItems="center" sx={{ pt: 5 }}>
            {renderAvatar}

            <Typography variant="subtitle1" noWrap sx={{ mt: 1 }}>
              {user?.name}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {user?.email}
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.5, fontSize: '10px', opacity: 0.6 }}
              noWrap
            >
              Id: {user?.userId}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ p: 3 }}>
            {status.map((option) => (
              <Button
                key={option.label}
                size="small"
                variant={option.value === user?.status ? 'contained' : 'outlined'}
                onClick={async () => {
                  try {
                    setUser((prev) =>
                      prev ? { ...prev, status: option.value as UserType['status'] } : prev
                    );
                    const response = await updateUser({
                      id: user?.id,
                      status: option.value as UserType['status'],
                    });

                    if (response?.data?.status) {
                      toast.success(`Profile status ${option.label}`);
                    }
                  } catch (error) {
                    toast.error(error);
                  }
                }}
              >
                {option.label}
              </Button>
            ))}
          </Stack>

          <Stack
            sx={{
              py: 3,
              px: 2.5,
              borderTop: `dashed 1px ${theme.vars.palette.divider}`,
              borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            {data.map((option) => {
              const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';

              const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

              return (
                <MenuItem
                  key={option.label}
                  onClick={() => handleClickItem(option.label === 'Home' ? rootHref : option.href)}
                  sx={{
                    py: 1,
                    color: 'text.secondary',
                    '& svg': { width: 24, height: 24 },
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {option.icon}

                  <Box component="span" sx={{ ml: 2 }}>
                    {option.label === 'Home' ? rootLabel : option.label}
                  </Box>

                  {option.info && (
                    <Label color="error" sx={{ ml: 1 }}>
                      {option.info}
                    </Label>
                  )}
                </MenuItem>
              );
            })}
          </Stack>

          <Stack sx={{ py: 3, px: 2.5, borderTop: `dashed 1px ${theme.vars.palette.divider}` }}>
            <BaseOption
              label={settings.colorScheme === 'dark' ? 'Dark mode' : 'Light mode'}
              icon={settings.colorScheme === 'dark' ? 'moon' : 'sun'}
              selected={settings.colorScheme === 'dark'}
              onClick={() => {
                settings.onUpdateField('colorScheme', mode === 'light' ? 'dark' : 'light');
                setMode(mode === 'light' ? 'dark' : 'light');
              }}
              sx={{
                height: 1,
              }}
            />
          </Stack>

          <Stack sx={{ py: 3, px: 2.5, borderTop: `dashed 1px ${theme.vars.palette.divider}` }}>
            {renderColor}
          </Stack>

          <Box sx={{ px: 2.5, py: 3 }}>
            <UpgradeBlock />
          </Box>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={handleCloseDrawer} />
        </Box>
      </Drawer>
    </>
  );
}
