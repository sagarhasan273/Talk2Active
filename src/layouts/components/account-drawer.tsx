// src/layouts/components/account-drawer.tsx

import type { IconButtonProps } from '@mui/material/IconButton';

import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import { alpha, useColorScheme, useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

import { selectAccount } from 'src/core/slices';

import { AvatarUser } from 'src/components/avatar-user';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { BaseOption } from 'src/components/settings/drawer/base-option';
import { NavOptions } from 'src/components/settings/drawer/nav-options';

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

export const AccountTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: 'Admin', color: '#ff1744', bg: 'rgba(255,23,68,0.12)' },
  supporter: { label: 'Supporter', color: '#d500f9', bg: 'rgba(213,0,249,0.12)' },
  vip: { label: 'VIP', color: '#ff8f00', bg: 'rgba(255,143,0,0.12)' },
  moderator: { label: 'Moderator', color: '#00c853', bg: 'rgba(0,200,83,0.12)' },
  member: { label: 'Member', color: '#78909c', bg: 'rgba(120,144,156,0.12)' },
};

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ textAlign: 'center', flex: 1, py: 0.5 }}>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 800, color: 'text.primary', fontSize: 13.5, lineHeight: 1.2 }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ─────────────────────────────────────────────

export function AccountDrawer({ data = [], status = [], sx, ...other }: AccountDrawerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const user = useSelector(selectAccount);
  const settings = useSettingsContext();
  const { mode, setMode } = useColorScheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const [copiedId, setCopiedId] = useState(false);

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleCopyUserId = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!user?.genUserId) return;

      navigator.clipboard.writeText(String(user.genUserId));
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    },
    [user?.genUserId]
  );

  const accountCfg = AccountTypeConfig[user?.accountType ?? 'member'] ?? AccountTypeConfig.member;

  // ── Coverless Profile Identity Section ────────────────────────────────
  const renderIdentity = (
    <Box sx={{ p: 2, pb: 1.5, position: 'relative' }}>
      {/* Top Close Button */}
      <IconButton
        onClick={handleClose}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: 'text.secondary',
          borderRadius: 0.5,
          bgcolor: isDark ? alpha('#fff', 0.04) : '#f8fafc',
          border: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
          '&:hover': {
            bgcolor: alpha(theme.palette.error.main, 0.08),
            color: 'error.main',
            borderColor: alpha(theme.palette.error.main, 0.2),
          },
        }}
      >
        <Iconify icon="mingcute:close-line" width={15} />
      </IconButton>

      {/* Avatar + Name + Email Row */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pr: 4 }}>
        <AvatarUser
          avatarUrl={user?.profilePhoto ?? null}
          name={user?.name ?? ''}
          verified={true}
          accountType={user?.accountType}
          sx={{
            width: 54,
            height: 54,
            fontSize: '1.2rem',
            fontWeight: 800,
            flexShrink: 0,
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.12) : '#e2e8f0',
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
            <Typography
              variant="subtitle2"
              noWrap
              sx={{
                fontWeight: 800,
                fontSize: 14.5,
                color: isDark ? 'text.primary' : '#0f172a',
              }}
            >
              {user?.name}
            </Typography>
            {user?.verified && (
              <Iconify
                icon="material-symbols:verified-rounded"
                width={15}
                sx={{ color: 'primary.main', flexShrink: 0 }}
              />
            )}
          </Stack>

          <Typography
            variant="caption"
            noWrap
            sx={{ color: 'text.secondary', display: 'block', fontWeight: 500, fontSize: 11.5 }}
          >
            {user?.email}
          </Typography>
        </Box>
      </Stack>

      {/* Role Chip & Copyable User ID Pill */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
        <Chip
          label={accountCfg.label}
          size="small"
          sx={{
            height: 22,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.4,
            bgcolor: accountCfg.bg,
            color: accountCfg.color,
            border: '1px solid',
            borderColor: alpha(accountCfg.color, 0.3),
            borderRadius: 0.5,
          }}
        />

        {user?.genUserId && (
          <Tooltip title={copiedId ? 'Copied ID!' : 'Click to copy ID'} arrow placement="top">
            <Box
              onClick={handleCopyUserId}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                height: 22,
                px: 1,
                cursor: 'pointer',
                borderRadius: 0.5,
                bgcolor: copiedId
                  ? alpha(theme.palette.success.main, 0.12)
                  : isDark
                    ? alpha('#fff', 0.04)
                    : '#f8fafc',
                border: '1px solid',
                borderColor: copiedId
                  ? alpha(theme.palette.success.main, 0.3)
                  : isDark
                    ? alpha('#fff', 0.08)
                    : '#e2e8f0',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: copiedId ? 'success.main' : 'text.secondary',
                }}
              >
                ID: {user.genUserId}
              </Typography>
              <Iconify
                icon={copiedId ? 'mingcute:check-line' : 'solar:copy-bold-duotone'}
                width={12}
                sx={{ color: copiedId ? 'success.main' : 'text.disabled' }}
              />
            </Box>
          </Tooltip>
        )}
      </Stack>

      {/* Bio */}
      {user?.bio && (
        <Typography
          variant="body2"
          sx={{
            mt: 1.25,
            p: 1,
            borderRadius: 0.5,
            bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.05) : '#f1f5f9',
            color: 'text.secondary',
            fontSize: 11.5,
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {user.bio}
        </Typography>
      )}
    </Box>
  );

  // ── Clean Stats Container ─────────────────────────────────────────────
  const renderStats = (
    <Box
      sx={{
        mx: 2,
        mb: 2,
        p: 0.75,
        borderRadius: 0.5,
        bgcolor: isDark ? alpha('#fff', 0.025) : '#f8fafc',
        border: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.07) : '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <StatItem label="Followers" value={user?.follower_count ?? 0} />
      <Divider
        orientation="vertical"
        flexItem
        sx={{ my: 0.5, borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0' }}
      />
      <StatItem label="Friends" value={user?.friend_count ?? 0} />
      <Divider
        orientation="vertical"
        flexItem
        sx={{ my: 0.5, borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0' }}
      />
      <StatItem label="Following" value={user?.following_count ?? 0} />
    </Box>
  );

  // ── Redesigned Appearance & Theme Section ─────────────────────────────
  const renderTheme = (
    <Box
      sx={{
        px: 2,
        py: 1.75,
        borderTop: '1px solid',
        borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
        bgcolor: isDark ? alpha('#fff', 0.01) : '#fcfcfd',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 1,
          fontWeight: 800,
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: 'text.disabled',
        }}
      >
        Appearance
      </Typography>

      <Stack spacing={1.25}>
        <BaseOption
          label={settings.colorScheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          icon={settings.colorScheme === 'dark' ? 'moon' : 'sun'}
          selected={settings.colorScheme === 'dark'}
          onClick={() => {
            const nextMode = mode === 'light' ? 'dark' : 'light';
            settings.onUpdateField('colorScheme', nextMode);
            setMode(nextMode);
          }}
        />

        <Box
          sx={{
            p: 1.25,
            borderRadius: 0.5,
            bgcolor: isDark ? alpha('#fff', 0.025) : '#ffffff',
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.07) : '#e2e8f0',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
              Accent Color
            </Typography>
            <Typography
              sx={{
                fontSize: 10.5,
                fontWeight: 800,
                textTransform: 'capitalize',
                color: 'primary.main',
              }}
            >
              {settings.primaryColor}
            </Typography>
          </Stack>

          <NavOptions
            value={{ color: settings.primaryColor }}
            onClickOption={{ color: (v) => settings.onUpdateField('primaryColor', v) }}
            options={{ colors: ['blue', 'cyan', 'orange', 'purple', 'red'] }}
          />
        </Box>
      </Stack>
    </Box>
  );

  // ── Main Content Wrapper ──────────────────────────────────────────────
  const renderContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: isMobile ? '100vh' : '82vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Scrollbar sx={{ flex: 1 }}>
        {renderIdentity}
        {renderStats}
        {renderTheme}
      </Scrollbar>

      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid',
          borderColor: isDark ? alpha('#fff', 0.06) : '#e2e8f0',
        }}
      >
        <SignOutButton onClose={handleClose} />
      </Box>
    </Box>
  );

  return (
    <>
      <AccountButton
        onClick={handleOpen}
        photoURL={user?.profilePhoto}
        displayName={user?.name}
        sx={sx}
        {...other}
      />

      {isMobile ? (
        <Drawer
          open={open}
          onClose={handleClose}
          anchor="right"
          slotProps={{ backdrop: { invisible: true } }}
          PaperProps={{
            sx: {
              width: 310,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: isDark ? '#181c26' : '#ffffff',
            },
          }}
        >
          {renderContent}
        </Drawer>
      ) : (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                p: 0,
                width: 320,
                mt: 1.2,
                borderRadius: 0.5,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: isDark ? alpha('#fff', 0.08) : '#e2e8f0',
                boxShadow: isDark
                  ? `0 6px 14px -2px ${alpha(theme.palette.common.white, 0.5)}`
                  : `0 6px 14px -2px ${alpha(theme.palette.common.black, 1)}`,
              },
            },
          }}
        >
          {renderContent}
        </Popover>
      )}
    </>
  );
}

export default AccountDrawer;
