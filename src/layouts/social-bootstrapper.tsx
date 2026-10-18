import {
  useGetAllRelationsQuery,
  useGetFollowersQuery,
} from '@/core/apis';
import {
  selectAccount,
  setBlockedUserIds,
  setFollowers,
  setFollowing,
  setFriends,
} from '@/core/slices';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function SocialBootstrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const user = useSelector(selectAccount);

  const currentUserId = user?.userId;

  // 1. Fetch data: Combined endpoint + Followers
  const { data: allRelationsData } = useGetAllRelationsQuery(currentUserId, { skip: !currentUserId });
  const { data: followersData } = useGetFollowersQuery(currentUserId, { skip: !currentUserId });

  // 2. Sync consolidated relations (Friends, Following, Blocked)
  useEffect(() => {
    if (allRelationsData?.data) {
      const { friends = [], followings = [], blockedUsers = [] } = allRelationsData.data;

      // Sync Friends & Following
      dispatch(setFriends(friends));
      dispatch(setFollowing(followings));

      // Extract blocked IDs and sync
      const blockedIds = blockedUsers
        .map((item: any) => item?.accountDetails?.userId?.toString())
        .filter(Boolean);

      dispatch(setBlockedUserIds(blockedIds));
    }
  }, [allRelationsData, dispatch]);

  // 3. Sync Followers separately
  useEffect(() => {
    if (followersData !== undefined) {
      const items = Array.isArray(followersData) ? followersData : followersData?.data ?? [];
      dispatch(setFollowers(items));
    }
  }, [followersData, dispatch]);

  // 4. Reset lists if user logs out (currentUserId becomes falsy)
  useEffect(() => {
    if (!currentUserId) {
      dispatch(setFriends([]));
      dispatch(setFollowers([]));
      dispatch(setFollowing([]));
      dispatch(setBlockedUserIds([]));
    }
  }, [currentUserId, dispatch]);

  return <>{children}</>;
}
