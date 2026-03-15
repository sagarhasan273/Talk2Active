import type { SxProps } from '@mui/material';

import { useState } from 'react';
import { useSelector } from 'react-redux';

import { selectAccount } from 'src/core/slices';
import { RelationshipTypeEnum } from 'src/enums/enum-social';
import { useFollowMutation, useUnfollowMutation } from 'src/core/apis';

import { ButtonFollowIcon } from './button-follow-icon';
import { ButtonUnfollowIcon } from './button-unfollow-icon';

type ButtonRelationshipToggleProps = {
  targetUser: {
    name: string;
    id: string;
  };
  isFollow?: boolean;
  followSx?: SxProps;
  unfollowSx?: SxProps;
};

export function ButtonRelationshipToggle({
  targetUser,
  isFollow = false,
  followSx,
  unfollowSx,
}: ButtonRelationshipToggleProps) {
  const user = useSelector(selectAccount);

  const [follow, setFollow] = useState<boolean>(!isFollow);

  const [followMutate] = useFollowMutation();
  const [unfollowMutate] = useUnfollowMutation();

  return (
    <>
      {follow ? (
        <ButtonFollowIcon
          title={`Are you sure to add ${targetUser.name}?`}
          onConfirm={() => {
            followMutate({
              requester: user.id,
              recipient: targetUser.id,
              type: RelationshipTypeEnum.FOLLOW,
            });
            setFollow(false);
          }}
          onPopover={false}
          sx={unfollowSx}
        />
      ) : (
        <ButtonUnfollowIcon
          title={`Are you sure to remove ${targetUser.name}?`}
          onConfirm={() => {
            unfollowMutate({
              requester: user.id,
              recipient: targetUser.id,
              type: RelationshipTypeEnum.FOLLOW,
            });
            setFollow(true);
          }}
          sx={followSx}
        />
      )}
    </>
  );
}
