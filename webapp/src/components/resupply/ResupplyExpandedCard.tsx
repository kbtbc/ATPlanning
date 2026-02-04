import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { cn, formatMile } from '../../lib/utils';
import { BusinessListCard } from './BusinessListCard';
import { BusinessDetailModal } from './BusinessDetailModal';
import { CategoryFilterTabs } from './CategoryFilterTabs';
import { ViewToggle } from './ViewToggle';
import { getCategoryForType } from './businessCategories';
import type { CategoryFilter } from './CategoryFilterTabs';
import type { ViewMode } from './ViewToggle';
import type { ResupplyPoint, Business } from '../../types';

interface ResupplyExpandedCardProps {
  resupply: ResupplyPoint;
  businesses: Business[];
  currentMile: number;
  onBack: () => void;
}

// Parse direction from notes (e.g., "Located 1.3W from trail" -> "W")
function parseDirectionFromNotes(notes?: string): string | null {
  if (!notes) return null;
  // Match patterns like "1.3W", "2.0E", "Located 1.3W"
  const match = notes.match(/(\d+\.?\d*)\s*(E|W)\s*(from trail|off trail)?/i);
  return match ? match[2].toUpperCase() : null;
}

// Build distance info string with direction
function buildDistanceInfo(business: Business): string | undefined {
  const direction = parseDirectionFromNotes(business.notes);

  // Try to extract distance from notes
  const distMatch = business.notes?.match(/(\d+\.?\d*)\s*(mi|miles?)?\s*(E|W|from trail|off)/i);
  if (distMatch) {
    const dist = distMatch[1];
    const dir = direction || '';
    return `${dist} mi ${dir}`.trim();
  }

  // Check for "In town" or similar
  if (business.notes?.toLowerCase().includes('in town')) {
    return 'In town';
  }

  if (business.notes?.toLowerCase().includes('on trail') || business.notes?.toLowerCase().includes('on-trail')) {
    return 'On trail';
  }

  return undefined;
}

export function ResupplyExpandedCard({
  resupply,
  businesses,
  currentMile,
  onBack
}: ResupplyExpandedCardProps) {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: businesses.length,
      lodging: 0,
      food: 0,
      shuttles: 0,
      services: 0,
    };

    businesses.forEach((b) => {
      const category = getCategoryForType(b.type) as CategoryFilter;
      if (category in counts && category !== 'all') {
        counts[category]++;
      }
    });

    return counts;
  }, [businesses]);

  // Filter and sort businesses by category order: lodging, food, shuttles, services
  const filteredBusinesses = useMemo(() => {
    const categoryOrder = ['lodging', 'food', 'shuttles', 'services'];
    const filtered = filter === 'all' ? businesses : businesses.filter((b) => getCategoryForType(b.type) === filter);

    // Sort by category order
    return filtered.sort((a, b) => {
      const catA = getCategoryForType(a.type);
      const catB = getCategoryForType(b.type);
      return categoryOrder.indexOf(catA) - categoryOrder.indexOf(catB);
    });
  }, [businesses, filter]);

  const qualityConfig = {
    full: { color: 'text-emerald-500', label: 'Full Resupply' },
    limited: { color: 'text-amber-500', label: 'Limited' },
    minimal: { color: 'text-rose-500', label: 'Minimal' },
  };

  const quality = qualityConfig[resupply.resupplyQuality];
  const distanceAhead = Math.abs(resupply.mile - currentMile);

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
  };

  const handleCloseModal = () => {
    setSelectedBusiness(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-4"
      >
        {/* Header with back button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-medium', quality.color)}>
                {quality.label.toLowerCase()}
              </span>
            </div>
            <h2 className="font-semibold text-lg truncate">{resupply.name}</h2>
            <p className="text-xs text-[var(--foreground-muted)]">
              {distanceAhead.toFixed(1)} mi ahead (mile {formatMile(resupply.mile)})
            </p>
          </div>
        </div>

        {/* Filter tabs and view toggle */}
        <div className="flex items-center justify-between gap-3">
          <CategoryFilterTabs
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={categoryCounts}
          />
          <ViewToggle mode={viewMode} onModeChange={setViewMode} />
        </div>

        {/* Business list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'
            )}
          >
            {filteredBusinesses.map((business, idx) => (
              <motion.div
                key={business.id || `biz-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden"
              >
                <div className="px-5">
                  <BusinessListCard
                    business={business}
                    distanceInfo={buildDistanceInfo(business)}
                    onViewDetails={() => handleBusinessClick(business)}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <p className="text-sm">No {filter} options at this location</p>
            <button
              onClick={() => setFilter('all')}
              className="text-xs text-[var(--primary)] mt-2 hover:underline"
            >
              View all businesses
            </button>
          </div>
        )}
      </motion.div>

      {/* Business Detail Modal */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          distanceInfo={buildDistanceInfo(selectedBusiness)}
          onClose={handleCloseModal}
          onBackToResupply={handleCloseModal}
        />
      )}
    </>
  );
}
