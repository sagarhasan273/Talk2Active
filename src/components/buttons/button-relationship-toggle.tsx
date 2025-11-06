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
};

export function ButtonRelationshipToggle({ targetUser }: ButtonRelationshipToggleProps) {
  const user = useSelector(selectAccount);

  const [follow, setFollow] = useState<boolean>(true);

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
        />
      )}
    </>
  );
}
