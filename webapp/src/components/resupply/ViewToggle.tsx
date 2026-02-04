import { LayoutList, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ViewMode = 'list' | 'grid';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-[var(--background)] rounded-md p-0.5 border border-[var(--border)]">
      <button
        onClick={() => onModeChange('list')}
        className={cn(
          'p-1.5 rounded transition-all',
          mode === 'list'
            ? 'bg-[var(--foreground)] text-[var(--background)]'
            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
        )}
        aria-label="List view"
      >
        <LayoutList className="w-4 h-4" />
      </button>
      <button
        onClick={() => onModeChange('grid')}
        className={cn(
          'p-1.5 rounded transition-all',
          mode === 'grid'
            ? 'bg-[var(--foreground)] text-[var(--background)]'
            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
        )}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
    </div>
  );
}
