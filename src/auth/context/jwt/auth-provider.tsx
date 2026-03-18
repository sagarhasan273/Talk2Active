import type { UserType } from 'src/types/type-user';
import type { RecentRoomResponse } from 'src/types/type-chat';

import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { useRoomTools, useCredentials } from 'src/core/slices';

import { STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

import type { AuthState } from '../../types';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { setSelectedUser, setAccount } = useCredentials();

  const { currentRooms, setCurrentRooms } = useRoomTools();

  const { state, setState } = useSetState<AuthState>({
    authUser: {} as AuthState['authUser'],
    loading: true,
  });

  const loadCredentials = useCallback(
    (user: UserType, recentRooms: RecentRoomResponse) => {
      if (recentRooms && recentRooms?.length > 0 && !currentRooms.length) {
        setCurrentRooms(recentRooms);
      }

      setState({ authUser: user, loading: false });

      setAccount(user);

      setSelectedUser({
        ...user,
        relationShip: {
          relationship: 'none',
          following: false,
          followers: false,
          friends: false,
          blocked: false,
          pending: false,
        },
      });
      sessionStorage.setItem('userId', user.id);
      sessionStorage.setItem('username', user.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentRooms.length, setCurrentRooms]
  );

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);
        const { data, status } = res.data;
        if (status) {
          loadCredentials(data, data.recentRooms);
        }
      } else {
        setState({ authUser: {} as AuthState['authUser'], loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ authUser: {} as AuthState['authUser'], loading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setState]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // ----------------------------------------------------------------------

  const checkAuthenticated =
    state.authUser && state.authUser?.id ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      authUser: state.authUser
        ? {
            ...state.authUser,
          }
        : ({} as AuthState['authUser']),
      checkUserSession,
      loadCredentials,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, loadCredentials, state.authUser, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
