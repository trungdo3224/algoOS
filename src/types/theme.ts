export type ThemeId = 'zinc-light' | 'warm-paper' | 'midnight' | 'nordic-navy';

export const DEFAULT_THEME_ID: ThemeId = 'midnight';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: 'light' | 'dark';
  description: string;
  accentColor: string;
  swatch: {
    bg: string;
    surface: string;
    border: string;
    text: string;
    accent: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'zinc-light',
    name: 'Zinc Light',
    category: 'light',
    description: 'Crisp neutral monochrome with high-contrast typography',
    accentColor: '#18181b',
    swatch: {
      bg: '#fafafa',
      surface: '#ffffff',
      border: '#e4e4e7',
      text: '#18181b',
      accent: '#18181b',
    },
  },
  {
    id: 'warm-paper',
    name: 'Warm Paper',
    category: 'light',
    description: 'Editorial cream parchment inspired by book print & reading devices',
    accentColor: '#d97706',
    swatch: {
      bg: '#f6f3eb',
      surface: '#fdfbf7',
      border: '#e2dbcd',
      text: '#292524',
      accent: '#d97706',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight Obsidian',
    category: 'dark',
    description: 'Deep neutral dark workbench with focused contrast',
    accentColor: '#fafafa',
    swatch: {
      bg: '#09090b',
      surface: '#121215',
      border: '#27272a',
      text: '#fafafa',
      accent: '#fafafa',
    },
  },
  {
    id: 'nordic-navy',
    name: 'Nordic Navy',
    category: 'dark',
    description: 'Deep oceanic slate with electric cyan telemetry accents',
    accentColor: '#38bdf8',
    swatch: {
      bg: '#0b0f19',
      surface: '#111827',
      border: '#1e293b',
      text: '#f8fafc',
      accent: '#38bdf8',
    },
  },
];
