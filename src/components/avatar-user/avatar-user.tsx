import { Avatar } from '@mui/material';

function getAvatarText(fullName: string): string {
  if (!fullName) return '';

  const parts = fullName.trim().split(/\s+/);

  if (parts.length >= 2) {
    // Has first and last name
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[1].charAt(0).toUpperCase();
    return first + last;
  }
  // Only first name → take first two chars
  return fullName.substring(0, 2).toUpperCase();
}

export const AvatarUser = ({
  name,
  avatarUrl,
  statusColor,
  verified,
  sx,
}: {
  name: string;
  avatarUrl: string | null;
  statusColor?: string;
  verified: boolean;
  sx?: Record<string, any>;
}) => (
  <Avatar
    src={verified ? (avatarUrl ?? undefined) : 'TS'}
    alt={name}
    sx={{
      ...sx,
    }}
  >
    {getAvatarText(name)}
  </Avatar>
);
