import { useCallback, useEffect, useMemo, useState } from 'react';
import { useCredentials } from 'src/core/slices';
import type { UserType } from 'src/types/type-user';

import { useGetMeQuery } from '@/core/apis';
import { AuthContext } from '../auth-context';
import { STORAGE_KEY } from './constant';
import { isValidToken, setSession } from './utils';

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { authLoading, setAccount, setAccountLoading } = useCredentials();

  // 1. Initial token check from sessionStorage
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored && isValidToken(stored) ? stored : null;
  });

  const hasValidToken = Boolean(token && isValidToken(token));

  // 2. Synchronize token with axios / session headers
  useEffect(() => {
    if (hasValidToken && token) {
      setSession(token);
    } else {
      setSession(null);
    }
  }, [hasValidToken, token]);

  // 3. RTK Query Hook
  const {
    data: response,
    isLoading: isQueryLoading,
    isFetching,
    error,
    refetch,
  } = useGetMeQuery(null, {
    skip: !hasValidToken,
  });

  // 4. Load credentials (also accept token to update state instantly on login)
  const loadCredentials = useCallback(
    (user: UserType, newToken?: string) => {
      if (newToken) {
        setToken(newToken);
        setSession(newToken);
      }
      setAccount(user);
    },
    [setAccount]
  );

  const unloadCredentials = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setAccount(null);
    setToken(null);
  }, [setAccount]);

  // 5. Handle response & error from RTK Query safely
  useEffect(() => {
    if (response?.status && response?.data) {
      setAccount(response.data);
    } else if (error) {
      unloadCredentials();
    }
  }, [response, error, setAccount, unloadCredentials]);

  // 6. Manual session refresh helper
  const checkUserSession = useCallback(async () => {
    const currentToken = sessionStorage.getItem(STORAGE_KEY);
    if (currentToken && isValidToken(currentToken)) {
      setToken(currentToken);
      refetch();
    } else {
      unloadCredentials();
    }
  }, [refetch, unloadCredentials]);

  const isLoading = hasValidToken ? (isQueryLoading || isFetching) : false;

  const memoizedValue = useMemo(
    () => ({
      isLoading: authLoading,
      setIsLoading: (value: boolean) => setAccountLoading(value),
      checkUserSession,
      loadCredentials,
      unloadCredentials,
    }),
    [isLoading, checkUserSession, loadCredentials, unloadCredentials, setAccountLoading]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
