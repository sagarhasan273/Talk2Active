import type { AllRelationsType, SocialChatSystemType } from '@/types/type-social';
import type { Theme } from '@mui/material/styles';

export const SOCIAL_QUICK_REACTIONS: string[] = ['👍', '🎉', '❤️', '😂', '🔥', '👀'];

export const getInitials = (name?: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const isOnline = (lastActive?: Date | string): boolean => {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
};

export const formatMessageTime = (isoString?: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getActiveRoomId = (item?: AllRelationsType | null): string | null => {
  if (!item) return null;
  const details = item.accountDetails as any;
  return (
    details?.currentRoomId ||
    details?.activeRoomId ||
    details?.roomId ||
    (item as any)?.currentRoomId ||
    (item as any)?.roomId ||
    null
  );
};

export const systemColorMap = (t: Theme): Record<SocialChatSystemType, string> => ({
  info: t.palette.info.main,
  success: '#10B981',
  warning: t.palette.warning.main,
  error: t.palette.error.main,
});
