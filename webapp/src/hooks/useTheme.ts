import { useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme') as Theme | null;
}

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function useTheme() {
  const setTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;

    // Add transition class for smooth color change
    root.classList.add('theme-transition');

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', theme);

    // Remove transition class after animation
    setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(current === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    const theme = getInitialTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return { toggleTheme, setTheme };
}
