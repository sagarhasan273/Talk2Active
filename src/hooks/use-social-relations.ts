// src/hooks/use-social-relations.ts
import { selectAccount, selectBlockedUserIds, selectFollowing, selectFriends } from '@/core/slices';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useSocialRelations = () => {
    const currentUser = useSelector(selectAccount);
    const following = useSelector(selectFollowing);
    const friends = useSelector(selectFriends);
    const blockedUserIds = useSelector(selectBlockedUserIds);

    const followingIdSet = useMemo(() => {
        const set = new Set<string>();
        following.forEach((f) => {
            const id = f?.accountDetails?.userId || (f as any)?.userId;
            if (id) set.add(String(id));
        });
        friends.forEach((f) => {
            const id = f?.accountDetails?.userId || (f as any)?.userId;
            if (id) set.add(String(id));
        });
        return set;
    }, [following, friends]);

    const blockedIdSet = useMemo(() => {
        return new Set<string>(blockedUserIds.map((id) => String(id)));
    }, [blockedUserIds]);

    const currentUserId = String(currentUser?.userId || '');

    const isFollowing = useCallback(
        (targetUserId?: string | null): boolean => {
            if (!targetUserId) return false;
            const targetId = String(targetUserId);
            return targetId !== currentUserId && followingIdSet.has(targetId);
        },
        [currentUserId, followingIdSet]
    );

    const isBlocked = useCallback(
        (targetUserId?: string | null): boolean => {
            if (!targetUserId) return false;
            const targetId = String(targetUserId);
            return targetId !== currentUserId && blockedIdSet.has(targetId);
        },
        [currentUserId, blockedIdSet]
    );

    return { isFollowing, isBlocked, currentUserId };
};