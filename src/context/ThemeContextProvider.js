import { createContext, useContext, useMemo, useState } from 'react';

const Context = createContext();

export default function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState('light');
  const value = useMemo(
    () => ({
      mode,
      setMode,
    }),
    [mode]
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export const useThemeContext = () => useContext(Context);
