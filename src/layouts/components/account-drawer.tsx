import type { IconButtonProps } from '@mui/material/IconButton';

import { useSelector } from 'react-redux';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { alpha, useTheme, useColorScheme } from '@mui/material/styles';

import { paths } from 'src/routes/route-paths';
import { useRouter, usePathname } from 'src/routes/route-hooks';

import { selectAccount } from 'src/core/slices';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AvatarUser } from 'src/components/avatar-user';
import { useSettingsContext } from 'src/components/settings';
import { BaseOption } from 'src/components/settings/drawer/base-option';
import { NavOptions } from 'src/components/settings/drawer/nav-options';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ─────────────────────────────────────────────

export type AccountDrawerProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
  status?: { label: string; value: string }[];
};

const AccountTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: '#ff1744', bg: 'rgba(255,23,68,0.12)' },
  supporter: { label: 'Supporter', color: '#d500f9', bg: 'rgba(213,0,249,0.12)' },
  vip: { label: 'VIP', color: '#ff8f00', bg: 'rgba(255,143,0,0.12)' },
  moderator: { label: 'Moderator', color: '#00c853', bg: 'rgba(0,200,83,0.12)' },
  member: { label: 'Member', color: '#78909c', bg: 'rgba(120,144,156,0.12)' },
};

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ textAlign: 'center', flex: 1 }}>
    <Typography
      variant="subtitle1"
      fontWeight={800}
      sx={{ color: 'text.primary', lineHeight: 1.2 }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', fontSize: 10, letterSpacing: 0.5 }}
    >
      {label}
    </Typography>
  </Box>
);

// ─────────────────────────────────────────────

export function AccountDrawer({ data = [], status = [], sx, ...other }: AccountDrawerProps) {
  const theme = useTheme();
  const user = useSelector(selectAccount);
  const settings = useSettingsContext();
  const { mode, setMode } = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleOpenDrawer = useCallback(() => setOpen(true), []);
  const handleCloseDrawer = useCallback(() => setOpen(false), []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleCloseDrawer();
      router.push(path);
    },
    [handleCloseDrawer, router]
  );

  const accountCfg = AccountTypeConfig[user?.accountType ?? 'member'] ?? AccountTypeConfig.member;

  // ── Cover banner with mesh gradient ──────────────────────────────────
  const renderCover = (
    <Box
      sx={{
        height: 110,
        position: 'relative',
        background: `
          radial-gradient(ellipse at 20% 50%, ${alpha(theme.palette.primary.main, 0.55)} 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, ${alpha(theme.palette.secondary?.main ?? '#7c4dff', 0.45)} 0%, transparent 55%),
          radial-gradient(ellipse at 60% 90%, ${alpha(accountCfg.color, 0.35)} 0%, transparent 50%),
          ${theme.palette.mode === 'dark' ? '#0f0f14' : '#f0f2f8'}
        `,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Noise texture overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />
      <IconButton
        onClick={handleCloseDrawer}
        size="small"
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 9,
          color: 'white',
          bgcolor: 'rgba(0,0,0,0.28)',
          backdropFilter: 'blur(6px)',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.45)' },
        }}
      >
        <Iconify icon="mingcute:close-line" width={18} />
      </IconButton>
    </Box>
  );

  // ── Avatar + identity ─────────────────────────────────────────────────
  const renderIdentity = (
    <Box
      sx={{
        px: 2.5,
        pb: 2,
        mt: '-48px', // overlap the cover
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Avatar */}
      <Box sx={{ mb: 1.5 }}>
        <AvatarUser
          avatarUrl={user?.profilePhoto ?? null}
          name={user?.name ?? ''}
          verified={user?.verified}
          accountType={user?.accountType}
          sx={{ width: 88, height: 88, fontSize: '1.75rem', fontWeight: 800 }}
        />
      </Box>

      {/* Name + account type badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
          {user?.name}
        </Typography>
        {user?.verified && (
          <Iconify
            icon="material-symbols:verified-rounded"
            width={18}
            sx={{ color: '#2979ff', flexShrink: 0 }}
          />
        )}
        <Chip
          label={accountCfg.label}
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.6,
            bgcolor: accountCfg.bg,
            color: accountCfg.color,
            border: '1px solid',
            borderColor: alpha(accountCfg.color, 0.35),
            px: 0.5,
          }}
        />
      </Box>

      {/* Username */}
      {user?.username && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
          @{user.username}
        </Typography>
      )}

      {/* Email */}
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        {user?.email}
      </Typography>

      {/* Bio */}
      {user?.bio && (
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            color: 'text.secondary',
            fontSize: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {user.bio}
        </Typography>
      )}

      {/* Status dot */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: user?.status === 'online' ? '#43e97b' : '#aaa',
            boxShadow: user?.status === 'online' ? '0 0 6px #43e97b' : 'none',
          }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
          {user?.status ?? 'offline'}
        </Typography>
      </Box>
    </Box>
  );

  // ── Mini stats row ────────────────────────────────────────────────────
  const renderStats = (
    <Box
      sx={{
        mx: 2.5,
        mb: 2,
        p: 1.5,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.04) : alpha('#000', 0.03),
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <StatItem label="FOLLOWERS" value={user?.followerCount ?? 0} />
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <StatItem label="FRIENDS" value={user?.friendCount ?? 0} />
      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
      <StatItem label="FOLLOWING" value={user?.followingCount ?? 0} />
    </Box>
  );

  // ── User ID chip ──────────────────────────────────────────────────────
  const renderUserId = (
    <Box sx={{ px: 2.5, mb: 2 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          px: 1.25,
          py: 0.5,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.primary.main, 0.07),
          border: '1px dashed',
          borderColor: alpha(theme.palette.primary.main, 0.25),
        }}
      >
        <Iconify icon="mdi:identifier" width={14} sx={{ color: 'text.disabled' }} />
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontSize: 10, fontFamily: 'monospace' }}
        >
          {user?.userId}
        </Typography>
      </Box>
    </Box>
  );

  // ── Navigation items ──────────────────────────────────────────────────
  const renderNav = (
    <Stack
      sx={{
        py: 1,
        mx: 1,
        borderTop: `1px dashed ${theme.vars.palette.divider}`,
        borderBottom: `1px dashed ${theme.vars.palette.divider}`,
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
              px: 1.5,
              borderRadius: 1.5,
              color: 'text.secondary',
              '& svg': { width: 22, height: 22 },
              '&:hover': {
                color: 'text.primary',
                bgcolor: alpha(theme.palette.primary.main, 0.07),
              },
              transition: 'all 0.15s',
            }}
          >
            {option.icon}
            <Box component="span" sx={{ ml: 1.5, fontWeight: 500, fontSize: 14 }}>
              {option.label === 'Home' ? rootLabel : option.label}
            </Box>
            {option.info && (
              <Label color="error" sx={{ ml: 'auto' }}>
                {option.info}
              </Label>
            )}
          </MenuItem>
        );
      })}
    </Stack>
  );

  // ── Theme controls ────────────────────────────────────────────────────
  const renderTheme = (
    <Stack sx={{ py: 2, px: 2.5, gap: 2 }}>
      <BaseOption
        label={settings.colorScheme === 'dark' ? 'Dark mode' : 'Light mode'}
        icon={settings.colorScheme === 'dark' ? 'moon' : 'sun'}
        selected={settings.colorScheme === 'dark'}
        onClick={() => {
          settings.onUpdateField('colorScheme', mode === 'light' ? 'dark' : 'light');
          setMode(mode === 'light' ? 'dark' : 'light');
        }}
        sx={{ height: 1 }}
      />
      <NavOptions
        value={{ color: settings.primaryColor }}
        onClickOption={{ color: (v) => settings.onUpdateField('primaryColor', v) }}
        options={{ colors: ['blue', 'cyan', 'orange', 'purple', 'red'] }}
      />
    </Stack>
  );

  // ─────────────────────────────────────────────────────────────────────

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
        PaperProps={{
          sx: {
            width: 320,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Scrollbar sx={{ flex: 1 }}>
          {renderCover}
          {renderIdentity}
          {renderStats}
          {renderUserId}
          {renderNav}
          <Stack sx={{ py: 2, px: 2.5, borderTop: `1px dashed ${theme.vars.palette.divider}` }}>
            {renderTheme}
          </Stack>
          <Box sx={{ px: 2.5, pb: 3 }}>
            <UpgradeBlock />
          </Box>
        </Scrollbar>

        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.vars.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <SignOutButton onClose={handleCloseDrawer} />
        </Box>
      </Drawer>
    </>
  );
}
