import React, { createContext, useContext, useMemo, useState } from 'react';

const context = createContext();

function GlobalContextProvider({ children }) {
  const [user, setUser] = useState({});

  const value = useMemo(() => ({
    user,
    setUser,
  }));

  return <context.Provider value={value}>{children}</context.Provider>;
}

export default GlobalContextProvider;

export const useGlobalContext = () => useContext(context);
