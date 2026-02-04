import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Flag, Mail, ChevronRight } from 'lucide-react';
import { resupplyPoints, getNearestResupply } from '../data';
import { getContactsByResupplyId } from '../data/contacts';
import { ResupplyDirectory, ResupplyExpandedCard } from './resupply';
import { getCategoryForType } from './resupply/businessCategories';
import { cn, formatMile, formatDistance } from '../lib/utils';
import type { ResupplyPoint, Business } from '../types';

type ResupplyView = 'upcoming' | 'directory' | 'expanded';

interface ResupplyPlannerProps {
  currentMile?: number;
  direction?: 'NOBO' | 'SOBO';
}

// Count businesses by category
function getServiceCounts(businesses: Business[]) {
  const counts = { lodging: 0, food: 0, shuttles: 0, services: 0 };
  businesses.forEach((b) => {
    const category = getCategoryForType(b.type);
    if (category in counts) {
      counts[category as keyof typeof counts]++;
    }
  });
  return counts;
}

// Format service count summary
function formatServiceSummary(counts: ReturnType<typeof getServiceCounts>): string {
  const parts: string[] = [];
  if (counts.lodging > 0) parts.push(`Lodging (${counts.lodging})`);
  if (counts.food > 0) parts.push(`Food (${counts.food})`);
  if (counts.shuttles > 0) parts.push(`Shuttles (${counts.shuttles})`);
  if (counts.services > 0) parts.push(`Services (${counts.services})`);
  return parts.join(', ');
}

export function ResupplyPlanner({ currentMile = 0, direction = 'NOBO' }: ResupplyPlannerProps) {
  const [view, setView] = useState<ResupplyView>('upcoming');
  const [selectedResupply, setSelectedResupply] = useState<ResupplyPoint | null>(null);

  // Get next several resupply points from current position
  const upcomingResupply = resupplyPoints
    .filter(r => direction === 'NOBO' ? r.mile > currentMile : r.mile < currentMile)
    .sort((a, b) => direction === 'NOBO' ? a.mile - b.mile : b.mile - a.mile)
    .slice(0, 10);

  const nearestResupply = getNearestResupply(currentMile, 'ahead');

  const getQualityConfig = (quality: ResupplyPoint['resupplyQuality']) => {
    const config = {
      full: { bg: 'bg-emerald-500' },
      limited: { bg: 'bg-amber-500' },
      minimal: { bg: 'bg-rose-500' },
    };
    return config[quality] || config.minimal;
  };

  // Get businesses for a resupply point
  const getBusinesses = (resupply: ResupplyPoint): Business[] => {
    if (resupply.businesses && resupply.businesses.length > 0) {
      return resupply.businesses;
    }
    const contacts = getContactsByResupplyId(resupply.id);
    return contacts?.businesses || [];
  };

  const handleResupplyClick = (resupply: ResupplyPoint) => {
    setSelectedResupply(resupply);
    setView('expanded');
  };

  const handleBackFromExpanded = () => {
    setSelectedResupply(null);
    setView('upcoming');
  };

  // Directory view
  if (view === 'directory') {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setView('upcoming')}
            className="btn btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Upcoming
          </button>
          <button
            onClick={() => setView('directory')}
            className="btn btn-primary py-1.5 px-3 text-sm flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            Directory
          </button>
        </div>
        <ResupplyDirectory />
      </div>
    );
  }

  // Expanded resupply view
  if (view === 'expanded' && selectedResupply) {
    const businesses = getBusinesses(selectedResupply);
    return (
      <AnimatePresence mode="wait">
        <ResupplyExpandedCard
          key={selectedResupply.id}
          resupply={selectedResupply}
          businesses={businesses}
          currentMile={currentMile}
          onBack={handleBackFromExpanded}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('upcoming')}
          className="btn btn-primary py-1.5 px-3 text-sm flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          Upcoming
        </button>
        <button
          onClick={() => setView('directory')}
          className="btn btn-secondary py-1.5 px-3 text-sm flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Directory
        </button>
      </div>

      {/* Current Position Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Current Position</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">Mile {formatMile(currentMile)}</p>
          </div>
          {nearestResupply && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Next Resupply</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{nearestResupply.name}</p>
              <p className="text-xs text-[var(--foreground-muted)]">
                {formatDistance(Math.abs(nearestResupply.mile - currentMile))} ahead
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upcoming Resupply List */}
      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2 px-3 py-1.5">
          Upcoming Resupply
        </h3>

        <div className="space-y-2">
          {upcomingResupply.map((resupply, index) => {
            const quality = getQualityConfig(resupply.resupplyQuality);
            const businesses = getBusinesses(resupply);
            const serviceCounts = getServiceCounts(businesses);
            const serviceSummary = formatServiceSummary(serviceCounts);

            // Format mile info for display - include direction if off trail
            const offTrailText = resupply.distanceFromTrail > 0
              ? ` · ${resupply.distanceFromTrail} mi ${resupply.directionFromTrail || ''}`.replace(/\s+/g, ' ').trim()
              : '';
            const mileInfo = `Mile ${formatMile(resupply.mile)}${offTrailText}`;

            return (
              <motion.div
                key={resupply.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => handleResupplyClick(resupply)}
                  className="w-full text-left px-4 py-3 hover:bg-[var(--background)] transition-colors flex items-center gap-3"
                >
                  {/* Dot indicator */}
                  <div className={cn('w-2 h-2 rounded-full shrink-0', quality.bg)} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* First line: name and mile info */}
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[var(--foreground)]">{resupply.name}</span>
                      <span className="text-xs text-[var(--foreground-muted)]">{mileInfo}</span>
                    </div>
                    {/* Second line: service summary only */}
                    {serviceSummary && (
                      <div className="text-xs text-[var(--foreground-muted)] mt-0.5 truncate">
                        {serviceSummary}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] shrink-0" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {upcomingResupply.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Flag className="w-8 h-8" />
            </div>
            <p className="empty-state-title">You've made it!</p>
            <p className="empty-state-description">
              No more resupply points ahead. You're near the end of your adventure!
            </p>
          </div>
        )}
      </div>

      {/* Mail Drop Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--background-secondary)] rounded-lg p-3 border border-[var(--border)]"
      >
        <h4 className="font-medium text-xs mb-1.5 flex items-center gap-2 text-[var(--foreground-muted)]">
          <Mail className="w-3.5 h-3.5" />
          Mail Drop Tips
        </h4>
        <ul className="text-[11px] text-[var(--foreground-muted)] space-y-0.5 list-disc list-inside opacity-80">
          <li>Send mail drops to "Minimal" resupply towns</li>
          <li>General Delivery at post offices holds 30 days</li>
          <li>Hostels often accept packages for a small fee</li>
        </ul>
      </motion.div>
    </div>
  );
}
