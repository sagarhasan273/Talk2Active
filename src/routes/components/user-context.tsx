import type { ReactNode } from 'react';
import type { UserType, UserContextTypes } from 'src/types/user';

import { useMemo, useState, useContext, createContext } from 'react';

const UserContext = createContext<UserContextTypes | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const memoValues = useMemo(
    () => ({ user, loading, setUser, setLoading }),
    [user, loading, setLoading, setUser]
  );

  return <UserContext.Provider value={memoValues}>{children}</UserContext.Provider>;
}

// Custom hook to use the UserContext
export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
