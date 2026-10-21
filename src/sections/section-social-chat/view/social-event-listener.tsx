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

  const { refetch: refetchAllRelations } = useGetAllRelationsQuery(currentUserId, { skip: !currentUserId });
  const { refetch: refetchFollowers } = useGetFollowersQuery(currentUserId, { skip: !currentUserId });

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
