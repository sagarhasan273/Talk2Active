import {
  useGetAllRelationsQuery,
  useGetFollowersQuery,
} from '@/core/apis';
import { useSocket } from '@/core/contexts/app-context/context-socket';
import {
  selectAccount,
  setBlockedUserIds,
  setFollowers,
  setFollowing,
  setFriends,
} from '@/core/slices';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function SocialEventListener() {
  const dispatch = useDispatch();
  const user = useSelector(selectAccount);
  const { socket } = useSocket();

  const currentUserId = user?.userId;

  const { data: allRelationsData, refetch: refetchAllRelations } = useGetAllRelationsQuery(currentUserId, { skip: !currentUserId });
  const { data: followersData, refetch: refetchFollowers } = useGetFollowersQuery(currentUserId, { skip: !currentUserId });

  useEffect(() => {
    if (allRelationsData?.data) {
      const { friends = [], followings = [], blockedUsers = [] } = allRelationsData.data;

      dispatch(setFriends(friends));
      dispatch(setFollowing(followings));

      const blockedIds = blockedUsers
        .map((item: any) => item?.accountDetails?.userId?.toString())
        .filter(Boolean);

      dispatch(setBlockedUserIds(blockedIds));
    }
  }, [allRelationsData, dispatch]);

  useEffect(() => {
    if (followersData !== undefined) {
      const items = Array.isArray(followersData) ? followersData : followersData?.data ?? [];
      dispatch(setFollowers(items));
    }
  }, [followersData, dispatch]);

  useEffect(() => {
    if (!currentUserId) {
      dispatch(setFriends([]));
      dispatch(setFollowers([]));
      dispatch(setFollowing([]));
      dispatch(setBlockedUserIds([]));
    }
  }, [currentUserId, dispatch]);

  useEffect(() => {
    if (!socket || !currentUserId) return;

    const handleRelationshipChanged = (data?: any) => {
      refetchAllRelations();
      refetchFollowers();
    };

    socket.on('update_social', handleRelationshipChanged);

    return () => {
      socket.off('update_social', handleRelationshipChanged);
    };
  }, [socket, currentUserId, refetchAllRelations, refetchFollowers]);

  return null;
}