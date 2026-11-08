import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, BookOpen, Sparkles, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeId, ThemeConfig } from '../../types/theme';

interface ThemeSelectorProps {
  compact?: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { theme, setTheme, themes, currentTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getThemeIcon = (id: ThemeId, className: string = 'h-4 w-4') => {
    switch (id) {
      case 'zinc-light':
        return <Sun className={className} />;
      case 'warm-paper':
        return <BookOpen className={className} />;
      case 'midnight':
        return <Moon className={className} />;
      case 'nordic-navy':
        return <Sparkles className={className} />;
    }
  };

  const lightThemes = themes.filter(t => t.category === 'light');
  const darkThemes = themes.filter(t => t.category === 'dark');

  const renderThemeItem = (t: ThemeConfig) => {
    const isActive = t.id === theme;
    return (
      <button
        key={t.id}
        onClick={() => {
          setTheme(t.id);
          setIsOpen(false);
        }}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors text-left ${
          isActive
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold'
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex -space-x-1 flex-shrink-0">
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 shadow-xs"
              style={{ backgroundColor: t.swatch.bg }}
            />
            <span
              className="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10 shadow-xs"
              style={{ backgroundColor: t.swatch.accent }}
            />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span>{t.name}</span>
            </div>
          </div>
        </div>
        {isActive && (
          <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0 ml-2" />
        )}
      </button>
    );
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 text-xs font-medium transition-colors shadow-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900"
        title={`Current Theme: ${currentTheme.name}`}
      >
        <span className="text-zinc-500 dark:text-zinc-400">
          {getThemeIcon(theme, 'h-3.5 w-3.5')}
        </span>
        {!compact && (
          <span className="hidden sm:inline font-mono text-[11px]">
            {currentTheme.name}
          </span>
        )}
        <ChevronDown className="h-3 w-3 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200/90 dark:border-zinc-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 mb-1 border-b border-zinc-100 dark:border-zinc-800/80">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Select Theme (4)
            </span>
          </div>

          <div className="px-1.5 py-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Light Modes
            </div>
            {lightThemes.map(renderThemeItem)}
          </div>

          <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />

          <div className="px-1.5 py-1">
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Dark Modes
            </div>
            {darkThemes.map(renderThemeItem)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
