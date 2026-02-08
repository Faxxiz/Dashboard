import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const storageKey = 'dashboard-theme';

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system';

    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;

    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    theme === 'system' ? getSystemTheme() : theme,
  );

  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystem = () => setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');

    applySystem();
    mediaQuery.addEventListener('change', applySystem);
    return () => mediaQuery.removeEventListener('change', applySystem);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedTheme === 'dark');
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const effective = current === 'system' ? getSystemTheme() : current;
      return effective === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
    }),
    [theme, resolvedTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
