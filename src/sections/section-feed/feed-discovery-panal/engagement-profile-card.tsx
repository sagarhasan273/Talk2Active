import { useTheme } from '@mui/material/styles';
import PersonAdd from '@mui/icons-material/PersonAdd';
import VerifiedIcon from '@mui/icons-material/Verified';
import PersonAddDisabled from '@mui/icons-material/PersonAddDisabled';
import {
  Box,
  Card,
  Chip,
  alpha,
  Button,
  Divider,
  Tooltip,
  Typography,
  CardContent,
} from '@mui/material';

import { useCredentials } from 'src/core/slices';
import { RelationshipTypeEnum } from 'src/enums/enum-social';
import { useFollowMutation, useUnfollowMutation } from 'src/core/apis';

import { AvatarUser } from 'src/components/avatar-user';

// ── tiny stat cell ────────────────────────────────────────────────────
const Stat = ({ value, label }: { value: number; label: string }) => (
  <Box sx={{ textAlign: 'center', flex: 1 }}>
    <Typography
      variant="subtitle2"
      fontWeight={800}
      sx={{ color: 'text.primary', lineHeight: 1.1, fontSize: '1rem' }}
    >
      {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: 'text.disabled',
        fontSize: '0.65rem',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ─────────────────────────────────────────────────────────────────────

interface ProfileCardProps {
  onFollow?: (profileId: string) => void;
}

export default function EngagementProfileCard({ onFollow }: ProfileCardProps) {
  const theme = useTheme();

  const { user, selectedUser, setSelectedUser } = useCredentials();

  const [followMutate] = useFollowMutation();
  const [unfollowMutate] = useUnfollowMutation();

  const handleFollow = () => {
    const newFollowing = !selectedUser.relationShip?.following;
    setSelectedUser({
      ...selectedUser,
      relationShip: { ...selectedUser.relationShip, following: newFollowing },
      followerCount: selectedUser.followerCount + (newFollowing ? 1 : -1),
    });

    if (!newFollowing) {
      unfollowMutate({
        requester: user.id,
        recipient: selectedUser.id,
        type: RelationshipTypeEnum.FOLLOW,
      });
    } else {
      followMutate({
        requester: user.id,
        recipient: selectedUser.id,
        type: RelationshipTypeEnum.FOLLOW,
      });
    }
  };

  const isFollowing = selectedUser.relationShip?.following ?? false;
  const isSelfProfile = selectedUser.id === user.id;
  const followersCount = selectedUser.followerCount ?? 0;

  const accountType = selectedUser.accountType ?? 'member';
  const AccountTypeColors: Record<string, { label: string; color: string; bg: string }> = {
    admin: { label: 'Admin', color: '#ff1744', bg: alpha('#ff1744', 0.1) },
    supporter: { label: 'Supporter', color: '#d500f9', bg: alpha('#d500f9', 0.1) },
    vip: { label: 'VIP', color: '#ff8f00', bg: alpha('#ff8f00', 0.1) },
    moderator: { label: 'Moderator', color: '#00c853', bg: alpha('#00c853', 0.1) },
    member: { label: 'Member', color: '#78909c', bg: alpha('#78909c', 0.1) },
  };
  const acCfg = AccountTypeColors[accountType] ?? AccountTypeColors.member;

  return (
    <Card
      sx={{
        borderRadius: { xs: 0, sm: 1 },
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: 'box-shadow 0.25s',
      }}
    >
      {/* ── Cover ──────────────────────────────────────────────── */}
      <Box
        sx={{
          height: 108,
          position: 'relative',
          overflow: 'hidden',
          background: selectedUser.coverPhoto
            ? `url(${selectedUser.coverPhoto}) center/cover no-repeat`
            : [
                `radial-gradient(ellipse at 25% 65%, ${alpha(theme.palette.primary.main, 0.65)} 0%, transparent 55%)`,
                `radial-gradient(ellipse at 78% 25%, ${alpha(acCfg.color, 0.5)} 0%, transparent 50%)`,
                `radial-gradient(ellipse at 55% 95%, ${alpha('#ec4899', 0.35)} 0%, transparent 45%)`,
                theme.palette.mode === 'dark' ? '#0d0e14' : '#eef0f8',
              ].join(', '),
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%)',
          },
        }}
      />

      {/* ── Card body ──────────────────────────────────────────── */}
      <CardContent
        sx={{
          px: 2.5,
          pt: 0,
          pb: '0 !important',
        }}
      >
        {/* ── Avatar row ─────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            mt: '-44px',
            mb: 1.5,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Avatar */}
          <AvatarUser
            avatarUrl={selectedUser.profilePhoto ?? null}
            name={selectedUser.name}
            verified={selectedUser.verified}
            accountType={accountType}
            sx={{
              width: 82,
              height: 82,
              fontSize: '1.6rem',
              fontWeight: 800,
              border: '3.5px solid',
              borderColor: 'background.paper',
              boxShadow: `0 6px 20px ${alpha('#000', 0.22)}`,
            }}
          />

          {/* Follow button */}
          {!isSelfProfile && (
            <Button
              variant={isFollowing ? 'outlined' : 'contained'}
              size="small"
              startIcon={
                isFollowing ? (
                  <PersonAddDisabled sx={{ fontSize: '14px !important' }} />
                ) : (
                  <PersonAdd sx={{ fontSize: '14px !important' }} />
                )
              }
              onClick={handleFollow}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: 12,
                px: 1.75,
                py: 0.6,
                minWidth: 0,
                transition: 'all 0.18s ease',
                ...(isFollowing
                  ? {
                      color: 'text.secondary',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      '&:hover': {
                        bgcolor: alpha('#ff4444', 0.06),
                        borderColor: alpha('#ff4444', 0.4),
                        color: '#ff4444',
                      },
                    }
                  : {
                      color: '#fff',
                      bgcolor: theme.palette.primary.main,
                      border: 'none',
                      boxShadow: `0 3px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
                      '&:hover': {
                        bgcolor: theme.palette.primary.dark,
                        boxShadow: `0 5px 14px ${alpha(theme.palette.primary.main, 0.5)}`,
                        transform: 'translateY(-1px)',
                      },
                    }),
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </Box>

        {/* ── Name + badges ──────────────────────────────────── */}
        <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography
            variant="subtitle1"
            fontWeight={800}
            sx={{ color: 'text.primary', lineHeight: 1.25, letterSpacing: -0.3 }}
          >
            {selectedUser.name}
          </Typography>

          {selectedUser.verified && (
            <Tooltip title="Verified" arrow>
              <VerifiedIcon sx={{ fontSize: 16, color: '#2979ff', flexShrink: 0 }} />
            </Tooltip>
          )}

          <Chip
            label={acCfg.label}
            size="small"
            sx={{
              height: 18,
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: 0.7,
              border: '1px solid',
              bgcolor: acCfg.bg,
              color: acCfg.color,
              borderColor: alpha(acCfg.color, 0.3),
              px: 0.25,
              '& .MuiChip-label': { px: 0.75 },
              '&:hover': {
                bgcolor: acCfg.bg,
              },
            }}
          />
        </Box>

        {/* ── Username ───────────────────────────────────────── */}
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', display: 'block', mb: selectedUser.bio ? 1 : 1.5 }}
        >
          @{selectedUser.username}
        </Typography>

        {/* ── Bio ────────────────────────────────────────────── */}
        {selectedUser.bio && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              lineHeight: 1.65,
              fontSize: '0.8rem',
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {selectedUser.bio}
          </Typography>
        )}

        {/* ── Stats strip ────────────────────────────────────── */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.25,
            mb: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stat value={followersCount} label="Followers" />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Stat value={selectedUser.followingCount ?? 0} label="Following" />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Stat value={selectedUser.friendCount ?? 0} label="Friends" />
        </Box>
      </CardContent>
    </Card>
  );
}
