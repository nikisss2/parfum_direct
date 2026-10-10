import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Гарантированно фиксируем оригинальную светлую тему и сбрасываем темный класс
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('maison_arome_theme');
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: 'light',
        isDark: false,
        toggleTheme: () => {},
        setTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
