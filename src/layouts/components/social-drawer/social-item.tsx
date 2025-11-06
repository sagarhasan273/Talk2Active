import type { AllRelationsType } from 'src/types/social';

import { useSelector } from 'react-redux';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { SvgIcon, Typography } from '@mui/material';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';

import { fToNow } from 'src/utils/format-time';

import { RelationshipTypeEnum } from 'src/enums/enum-social';
import { selectAccount } from 'src/core/slices/slice-account';
import { useUnfollowMutation } from 'src/core/apis/api-social';

import { ButtonUnfollowIcon } from 'src/components/buttons';

// ----------------------------------------------------------------------

export type SocialItemProps = {
  id: string;
  type: string;
  title: string;
  category: string;
  isUnRead: boolean;
  avatarUrl: string | null;
  createdAt: string | number | null;
};

export function SocialItem({
  relation,
  onClick,
}: {
  relation: AllRelationsType;
  onClick: () => void;
}) {
  const user = useSelector(selectAccount);

  const [unfollowMutate] = useUnfollowMutation();

  const renderAvatar = (
    <ListItemAvatar
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 0.5,
      }}
    >
      <Avatar src={relation.accountDetails.profilePhoto} sx={{ bgcolor: 'background.neutral' }} />
      <Typography variant="body1" sx={{ color: 'primary.main', fontSize: 8 }}>
        {relation.accountDetails.verified ? 'VERIFIED' : 'UNVERIFIED'}
      </Typography>
    </ListItemAvatar>
  );

  const friendAction = (
    <Stack spacing={1} direction="row" sx={{ mt: 0.5 }}>
      <Button
        startIcon={
          <SvgIcon sx={{ fontSize: '16px!important' }}>
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path strokeWidth="3" d="M12.005 11h.008M8.01 11h.009" />
              <path
                strokeWidth="2.5"
                d="M12 3c-1.48 0-2.905.03-4.244.088c-2.44.105-3.66.157-4.626 1.13c-.965.972-1.007 2.159-1.09 4.532a64 64 0 0 0 0 4.5c.083 2.373.125 3.56 1.09 4.532c.965.973 2.186 1.025 4.626 1.13l.244.01v2.348a.73.73 0 0 0 1.205.554l2.18-1.869c.547-.47.821-.704 1.147-.828s.696-.131 1.437-.145q1.171-.023 2.275-.07c2.44-.105 3.66-.157 4.626-1.13c.965-.972 1.007-2.159 1.09-4.532a64 64 0 0 0 .032-3.25"
              />
              <path strokeWidth="2.5" d="M19 2s3 2.21 3 3s-3 3-3 3m2.5-3H15" />
            </g>
          </SvgIcon>
        }
        size="small"
        variant="contained"
      >
        Join chat
      </Button>
      <Button size="small" variant="outlined">
        Decline
      </Button>
    </Stack>
  );

  const renderText = (
    <Stack>
      <Stack direction="row">
        <Typography
          variant="body1"
          sx={{ color: relation.relation === 'friend' ? 'primary.main' : 'text.secondary' }}
        >
          {relation.accountDetails.name}
        </Typography>

        <ButtonUnfollowIcon
          title={`Are you sure to remove ${relation.accountDetails.name}?`}
          onConfirm={() => {
            unfollowMutate({
              requester: user.id,
              recipient: relation?.accountDetails?.id,
              type: RelationshipTypeEnum.FOLLOW,
            });
          }}
        />
      </Stack>
      {relation.relation !== 'friend' ? (
        friendAction
      ) : (
        <>
          <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.7, mt: -0.5 }}>
            last seen {fToNow(relation.accountDetails.lastActive)} ago
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {relation.accountDetails.bio}
          </Typography>
        </>
      )}
    </Stack>
  );

  return (
    <ListItemButton
      disableRipple
      sx={{
        px: 2,
        py: 1,
        alignItems: 'flex-start',
        borderBottom: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (relation.relation === 'friend') {
          onClick();
        }
      }}
    >
      {renderAvatar}

      <Stack sx={{ flexGrow: 1, justifyContent: 'center', height: 1 }}>{renderText}</Stack>
    </ListItemButton>
  );
}
