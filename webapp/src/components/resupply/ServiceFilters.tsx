import { Store, Mail, Bed, Utensils, ShowerHead, Shirt } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ServiceType = 'all' | 'grocery' | 'post' | 'lodging' | 'restaurant' | 'shower' | 'laundry';

interface ServiceFiltersProps {
  activeFilter: ServiceType;
  onFilterChange: (filter: ServiceType) => void;
  counts?: Record<ServiceType, number>;
}

const filters: { id: ServiceType; label: string; icon: typeof Store }[] = [
  { id: 'all', label: 'All', icon: Store },
  { id: 'grocery', label: 'Grocery', icon: Store },
  { id: 'post', label: 'Post', icon: Mail },
  { id: 'lodging', label: 'Lodging', icon: Bed },
  { id: 'restaurant', label: 'Food', icon: Utensils },
  { id: 'shower', label: 'Shower', icon: ShowerHead },
  { id: 'laundry', label: 'Laundry', icon: Shirt },
];

export function ServiceFilters({ activeFilter, onFilterChange, counts }: ServiceFiltersProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {filters.map(({ id, label, icon: Icon }) => {
        const isActive = activeFilter === id;
        const count = counts?.[id];

        return (
          <button
            key={id}
            onClick={() => onFilterChange(id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              'border',
              isActive
                ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                : 'bg-[var(--background)] text-[var(--foreground-muted)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:text-[var(--foreground)]'
            )}
          >
            {id !== 'all' && <Icon className="w-3 h-3" />}
            <span>{label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-[10px] px-1 rounded-full min-w-[16px] text-center',
                isActive ? 'bg-white/20' : 'bg-[var(--border)]'
              )}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
