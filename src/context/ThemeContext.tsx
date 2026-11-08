import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeConfig, THEMES, DEFAULT_THEME_ID } from '../types/theme';

interface ThemeContextType {
  theme: ThemeId;
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeId) => void;
  cycleTheme: () => void;
  isDark: boolean;
  themes: ThemeConfig[];
}

const STORAGE_KEY = 'algoOS-theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME_ID;
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
    return DEFAULT_THEME_ID;
  });

  const currentTheme = THEMES.find(t => t.id === theme) || THEMES.find(t => t.id === DEFAULT_THEME_ID) || THEMES[0];
  const isDark = currentTheme.category === 'dark';

  const applyTheme = (targetTheme: ThemeId) => {
    const config = THEMES.find(t => t.id === targetTheme) || THEMES[0];
    const root = document.documentElement;
    
    // Set data-theme attribute
    root.setAttribute('data-theme', targetTheme);
    
    // Set or remove dark class for Tailwind dark: variants
    if (config.category === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Storage unavailable fallback
    }
    applyTheme(newTheme);
  };

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].id);
  };

  // Sync on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, setTheme, cycleTheme, isDark, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
