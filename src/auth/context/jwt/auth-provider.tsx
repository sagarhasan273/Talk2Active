import { useDispatch } from 'react-redux';
import { useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import axios, { endpoints } from 'src/utils/axios';

import { setUsers } from 'src/core/slices';
import { setAccount } from 'src/core/slices/slice-account';

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
  const dispatch = useDispatch();

  const { state, setState } = useSetState<AuthState>({
    authUser: {} as AuthState['authUser'],
    loading: true,
  });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);

        const res = await axios.get(endpoints.auth.me);

        const { data } = res.data;
        setState({ authUser: { ...data, accessToken }, loading: false });

        dispatch(setAccount(data));
        dispatch(
          setUsers([
            {
              ...data,
              relationShip: {
                relationship: 'none',
                following: false,
                followers: false,
                friends: false,
                blocked: false,
                pending: false,
              },
            },
          ])
        );
      } else {
        setState({ authUser: {} as AuthState['authUser'], loading: false });
      }
    } catch (error) {
      console.error(error);
      setState({ authUser: {} as AuthState['authUser'], loading: false });
    }
  }, [setState, dispatch]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.authUser ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      authUser: state.authUser
        ? {
            ...state.authUser,
          }
        : ({} as AuthState['authUser']),
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.authUser, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
