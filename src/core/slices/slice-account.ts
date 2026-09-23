import type { PayloadAction } from '@reduxjs/toolkit';
import type { AllRelationsType } from 'src/types/type-social';
import type { UserType } from 'src/types/type-user';

import { createSlice } from '@reduxjs/toolkit';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../types';

interface UserState {
  user: UserType;
  friends: AllRelationsType[];
  following: AllRelationsType[];
  followers: AllRelationsType[];
  blockedUserIds: string[];
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserState = {
  user: {} as UserType,
  friends: [],
  following: [],
  followers: [],
  blockedUserIds: [],
  isAuthenticated: false,
  loading: false,
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setAccount: (state, action: PayloadAction<UserState['user']>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },

    setFriends: (state, action: PayloadAction<UserState['friends']>) => {
      state.friends = action.payload || [];
    },

    setFollowing: (state, action: PayloadAction<UserState['following']>) => {
      state.following = action.payload || [];
    },

    setFollowers: (state, action: PayloadAction<UserState['followers']>) => {
      state.followers = action.payload || [];
    },

    setBlockedUserIds: (state, action: PayloadAction<string[]>) => {
      state.blockedUserIds = action.payload || [];
    },

    // ── Incremental Updaters (Follow / Unfollow / Block) ───────────────────
    addFollowing: (state, action: PayloadAction<AllRelationsType>) => {
      const newId =
        action.payload?.accountDetails?.userId || (action.payload as any)?.userId;
      const exists = state.following.some((item) => {
        const id = item?.accountDetails?.userId || (item as any)?.userId;
        return String(id) === String(newId);
      });
      if (!exists) {
        state.following.push(action.payload);
      }
    },

    removeFollowing: (state, action: PayloadAction<string>) => {
      const targetId = String(action.payload);
      state.following = state.following.filter((item) => {
        const id = item?.accountDetails?.userId || (item as any)?.userId;
        return String(id) !== targetId;
      });
      state.friends = state.friends.filter((item) => {
        const id = item?.accountDetails?.userId || (item as any)?.userId;
        return String(id) !== targetId;
      });
    },

    toggleBlockUser: (state, action: PayloadAction<string>) => {
      const targetId = String(action.payload);
      const index = state.blockedUserIds.indexOf(targetId);
      if (index > -1) {
        state.blockedUserIds.splice(index, 1);
      } else {
        state.blockedUserIds.push(targetId);
        // If blocked, automatically strip from following/friends
        state.following = state.following.filter((item) => {
          const id = item?.accountDetails?.userId || (item as any)?.userId;
          return String(id) !== targetId;
        });
        state.friends = state.friends.filter((item) => {
          const id = item?.accountDetails?.userId || (item as any)?.userId;
          return String(id) !== targetId;
        });
      }
    },

    setAccountLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    logout: (state) => {
      state.user = {} as UserType;
      state.friends = [];
      state.following = [];
      state.followers = [];
      state.blockedUserIds = [];
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const {
  setAccount,
  setFollowers,
  setFollowing,
  setFriends,
  setBlockedUserIds,
  addFollowing,
  removeFollowing,
  toggleBlockUser,
  logout,
  setAccountLoading,
} = accountSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────
export const selectAccount = (state: RootState) => state.account.user;
export const selectFollowers = (state: RootState) => state.account.followers;
export const selectFollowing = (state: RootState) => state.account.following;
export const selectFriends = (state: RootState) => state.account.friends;
export const selectBlockedUserIds = (state: RootState) => state.account.blockedUserIds;
export const selectIsAuthenticated = (state: RootState) => state.account.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.account.loading;

// ── useCredentials Hook ───────────────────────────────────────────────────
export const useCredentials = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectAccount);
  const followers = useSelector(selectFollowers);
  const following = useSelector(selectFollowing);
  const friends = useSelector(selectFriends);
  const blockedUserIds = useSelector(selectBlockedUserIds);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const currentUserId = String(user?.userId || (user as any)?._id || '');

  // O(1) Following Lookup Set (includes mutual friends)
  const followingIds = useMemo(() => {
    const set = new Set<string>();

    (following || []).forEach((f) => {
      const id = f?.accountDetails?.userId || (f as any)?.userId || (f as any)?._id;
      if (id) set.add(String(id));
    });

    (friends || []).forEach((f) => {
      const id = f?.accountDetails?.userId || (f as any)?.userId || (f as any)?._id;
      if (id) set.add(String(id));
    });

    return set;
  }, [following, friends]);

  // O(1) Friends Lookup Set
  const friendsIds = useMemo(() => {
    const set = new Set<string>();
    (friends || []).forEach((f) => {
      const id = f?.accountDetails?.userId || (f as any)?.userId || (f as any)?._id;
      if (id) set.add(String(id));
    });
    return set;
  }, [friends]);

  // O(1) Blocked Lookup Set
  const blockedIds = useMemo(() => {
    return new Set<string>((blockedUserIds || []).map((id) => String(id)));
  }, [blockedUserIds]);

  // Fast predicate functions
  const checkIfFollowing = useCallback(
    (targetUserId?: string | null): boolean => {
      if (!targetUserId || !currentUserId) return false;
      const targetId = String(targetUserId);
      return targetId !== currentUserId && followingIds.has(targetId);
    },
    [currentUserId, followingIds]
  );

  const checkIfFriend = useCallback(
    (targetUserId?: string | null): boolean => {
      if (!targetUserId || !currentUserId) return false;
      const targetId = String(targetUserId);
      return targetId !== currentUserId && friendsIds.has(targetId);
    },
    [currentUserId, friendsIds]
  );

  const checkIfBlocked = useCallback(
    (targetUserId?: string | null): boolean => {
      if (!targetUserId || !currentUserId) return false;
      const targetId = String(targetUserId);
      return targetId !== currentUserId && blockedIds.has(targetId);
    },
    [currentUserId, blockedIds]
  );

  return useMemo(
    () => ({
      isAuthenticated,
      authLoading,
      user,
      currentUserId,
      followers,
      following,
      friends,
      blockedUserIds,
      followingIds,
      friendsIds,
      blockedIds,
      checkIfFollowing,
      checkIfFriend,
      checkIfBlocked,
      setAccount: (payload: UserState['user']) => dispatch(setAccount(payload)),
      setFollower: (payload: UserState['followers']) => dispatch(setFollowers(payload)),
      setFollowing: (payload: UserState['following']) => dispatch(setFollowing(payload)),
      setFriends: (payload: UserState['friends']) => dispatch(setFriends(payload)),
      setBlockedUserIds: (payload: string[]) => dispatch(setBlockedUserIds(payload)),
      addFollowing: (payload: AllRelationsType) => dispatch(addFollowing(payload)),
      removeFollowing: (targetUserId: string) => dispatch(removeFollowing(targetUserId)),
      toggleBlockUser: (targetUserId: string) => dispatch(toggleBlockUser(targetUserId)),
      setAccountLoading: (isLoading: boolean) => dispatch(setAccountLoading(isLoading)),
      logout: () => dispatch(logout()),
    }),
    [
      isAuthenticated,
      authLoading,
      user,
      currentUserId,
      followers,
      following,
      friends,
      blockedUserIds,
      followingIds,
      friendsIds,
      blockedIds,
      checkIfFollowing,
      checkIfFriend,
      checkIfBlocked,
      dispatch,
    ]
  );
};