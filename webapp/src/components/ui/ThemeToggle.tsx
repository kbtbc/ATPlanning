import { Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleTheme } = useTheme();

  // Check current theme for icon display
  const isDark = typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-lg transition-colors',
        'bg-[var(--background-secondary)] border border-[var(--border)]',
        'hover:border-[var(--accent)] hover:bg-[var(--background)]',
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun
          className={cn(
            'w-4 h-4 absolute inset-0 transition-all duration-300',
            isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
          )}
          aria-hidden="true"
        />
        <Moon
          className={cn(
            'w-4 h-4 absolute inset-0 transition-all duration-300',
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
          )}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
