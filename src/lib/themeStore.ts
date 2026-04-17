import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initialize: () => void;
}

export const useThemeStore = create<ThemeStore>()((set, get) => ({
  theme: 'dark', // Default industrial theme
  initialize: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('intuit-theme') as Theme | null;
      if (stored) {
        set({ theme: stored });
        document.documentElement.className = stored;
        document.documentElement.setAttribute('data-theme', stored);
      } else {
        // Apply default
        document.documentElement.className = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  },
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('intuit-theme', newTheme);
      document.documentElement.className = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  },
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      localStorage.setItem('intuit-theme', theme);
      document.documentElement.className = theme;
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}));
