import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetFriendsQuery,
} from '@/core/apis';
import {
  selectAccount,
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

  // 1. Fetch relations only when an authenticated user ID exists
  const { data: friendsData } = useGetFriendsQuery(currentUserId, { skip: !currentUserId });
  const { data: followersData } = useGetFollowersQuery(currentUserId, { skip: !currentUserId });
  const { data: followingData } = useGetFollowingQuery(currentUserId, { skip: !currentUserId });
  // const { data: blockedData } = useGetBlockedUsersQuery(currentUserId, { skip: !currentUserId });

  // 2. Sync to Redux slice safely
  useEffect(() => {
    if (friendsData !== undefined) {
      const items = Array.isArray(friendsData) ? friendsData : friendsData?.data ?? [];
      dispatch(setFriends(items));
    }
  }, [friendsData, dispatch]);

  useEffect(() => {
    if (followersData !== undefined) {
      const items = Array.isArray(followersData) ? followersData : followersData?.data ?? [];
      dispatch(setFollowers(items));
    }
  }, [followersData, dispatch]);

  useEffect(() => {
    if (followingData !== undefined) {
      const items = Array.isArray(followingData) ? followingData : followingData?.data ?? [];
      dispatch(setFollowing(items));
    }
  }, [followingData, dispatch]);

  /* 
  useEffect(() => {
    if (blockedData !== undefined) {
      const items = Array.isArray(blockedData) ? blockedData : blockedData?.data ?? [];
      dispatch(setBlockedUserIds(items));
    }
  }, [blockedData, dispatch]);
  */

  // 3. Reset lists if user logs out (currentUserId becomes falsy)
  useEffect(() => {
    if (!currentUserId) {
      dispatch(setFriends([]));
      dispatch(setFollowers([]));
      dispatch(setFollowing([]));
      // dispatch(setBlockedUserIds([]));
    }
  }, [currentUserId, dispatch]);

  return <>{children}</>;
}