import { cn } from '../../lib/utils';
import { categoryColors } from './businessCategories';

export type CategoryFilter = 'all' | 'lodging' | 'food' | 'shuttles' | 'services';

interface CategoryFilterTabsProps {
  activeFilter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  counts: Record<CategoryFilter, number>;
}

const filters: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'lodging', label: 'Lodging' },
  { id: 'food', label: 'Food' },
  { id: 'shuttles', label: 'Shuttles' },
  { id: 'services', label: 'Services' },
];

export function CategoryFilterTabs({ activeFilter, onFilterChange, counts }: CategoryFilterTabsProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {filters.map(({ id, label }) => {
        const isActive = activeFilter === id;
        const count = counts[id] || 0;
        const colors = id !== 'all' ? categoryColors[id] : null;

        return (
          <button
            key={id}
            onClick={() => onFilterChange(id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap',
              isActive
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
            )}
          >
            {colors && (
              <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            )}
            <span>{label}</span>
            <span className={cn(
              'text-[10px] px-1 rounded min-w-[18px] text-center',
              isActive ? 'bg-[var(--background)]/20' : 'bg-[var(--border)]'
            )}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
