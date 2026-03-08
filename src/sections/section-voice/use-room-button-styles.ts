import { alpha, useTheme } from '@mui/material/styles';

type RoomButtonState = {
  selected: boolean;
  isJoined: boolean;
};

/**
 * Centralised style tokens for VoiceRoomSelectButton.
 * Keeps the component clean — all theme/state derivations live here.
 */
export function useRoomButtonStyles({ selected, isJoined }: RoomButtonState) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;
  const success = theme.palette.success.main;

  // ── Background ────────────────────────────────────────────────────────
  const getBg = () => {
    if (isJoined && selected) return alpha(primary, 0.14);
    if (isJoined) return alpha(primary, 0.08);
    if (selected) return theme.palette.background.paper;
    return 'transparent';
  };

  const getHoverBg = () => {
    if (isJoined) return alpha(primary, 0.16);
    if (selected) return theme.palette.background.paper;
    return alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04);
  };

  // ── Border ────────────────────────────────────────────────────────────
  const getBorder = () => {
    if (selected) return `1px solid ${alpha(primary, 0.6)}`;
    if (isJoined) return `1px solid ${alpha(primary, 0.3)}`;
    return '1px solid transparent';
  };

  // ── Text color ────────────────────────────────────────────────────────
  const nameColor = isJoined ? primary : theme.palette.text.primary;
  const metaColor = isJoined ? alpha(primary, 0.8) : theme.palette.text.secondary;

  // ── Left accent bar (selected) ────────────────────────────────────────
  const accentBar = selected
    ? {
        content: '""',
        position: 'absolute' as const,
        left: 0,
        top: '18%',
        height: '64%',
        width: 3,
        borderRadius: '0 3px 3px 0',
        bgcolor: primary,
        boxShadow: `0 0 8px ${alpha(primary, 0.55)}`,
      }
    : {};

  // ── Language badge ────────────────────────────────────────────────────
  const badgeBg = selected
    ? alpha(primary, 0.1)
    : alpha(theme.palette.text.primary, isDark ? 0.08 : 0.06);
  const badgeBorder = selected ? alpha(primary, 0.4) : alpha(theme.palette.text.primary, 0.15);
  const badgeColor = isJoined ? primary : theme.palette.text.secondary;

  // ── Icon box (host avatar container) ─────────────────────────────────
  const iconBoxBg = isJoined
    ? alpha(primary, isDark ? 0.15 : 0.1)
    : alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04);

  return {
    bg: getBg(),
    hoverBg: getHoverBg(),
    border: getBorder(),
    accentBar,
    nameColor,
    metaColor,
    badgeBg,
    badgeBorder,
    badgeColor,
    iconBoxBg,
    primary,
    success,
  };
}
