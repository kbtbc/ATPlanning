import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Flag, Mail, ArrowRight } from 'lucide-react';
import { resupplyPoints } from '../data';
import { getContactsByResupplyId } from '../data/contacts';
import { ResupplyDirectory, ResupplyTimeline, ResupplyCard, ServiceFilters } from './resupply';
import type { ServiceType } from './resupply';
import { formatMile } from '../lib/utils';
import type { ResupplyPoint } from '../types';

type ResupplyView = 'upcoming' | 'directory';

interface ResupplyPlannerProps {
  currentMile?: number;
  direction?: 'NOBO' | 'SOBO';
}

function filterByService(points: ResupplyPoint[], filter: ServiceType): ResupplyPoint[] {
  if (filter === 'all') return points;

  return points.filter((r) => {
    switch (filter) {
      case 'grocery': return r.hasGrocery;
      case 'post': return r.hasPostOffice;
      case 'lodging': return r.hasLodging;
      case 'restaurant': return r.hasRestaurant;
      case 'shower': return r.hasShower;
      case 'laundry': return r.hasLaundry;
      default: return true;
    }
  });
}

export function ResupplyPlanner({ currentMile = 0, direction = 'NOBO' }: ResupplyPlannerProps) {
  const [view, setView] = useState<ResupplyView>('upcoming');
  const [serviceFilter, setServiceFilter] = useState<ServiceType>('all');
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);

  // Get next several resupply points from current position
  const upcomingResupply = useMemo(() => {
    return resupplyPoints
      .filter(r => direction === 'NOBO' ? r.mile > currentMile : r.mile < currentMile)
      .sort((a, b) => direction === 'NOBO' ? a.mile - b.mile : b.mile - a.mile)
      .slice(0, 12);
  }, [currentMile, direction]);

  // Filter by service
  const filteredResupply = useMemo(() => {
    return filterByService(upcomingResupply, serviceFilter);
  }, [upcomingResupply, serviceFilter]);

  // Calculate service counts for filter badges
  const serviceCounts = useMemo(() => {
    return {
      all: upcomingResupply.length,
      grocery: upcomingResupply.filter(r => r.hasGrocery).length,
      post: upcomingResupply.filter(r => r.hasPostOffice).length,
      lodging: upcomingResupply.filter(r => r.hasLodging).length,
      restaurant: upcomingResupply.filter(r => r.hasRestaurant).length,
      shower: upcomingResupply.filter(r => r.hasShower).length,
      laundry: upcomingResupply.filter(r => r.hasLaundry).length,
    };
  }, [upcomingResupply]);

  const nextResupply = filteredResupply[0];
  const remainingResupply = filteredResupply.slice(1);

  // Get contacts for a resupply point
  const getContacts = (resupply: ResupplyPoint) => {
    return resupply.businesses
      ? { resupplyId: resupply.id, businesses: resupply.businesses }
      : getContactsByResupplyId(resupply.id) || null;
  };

  // Directory view
  if (view === 'directory') {
    return (
      <div className="space-y-4">
        {/* View Toggle */}
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

      {/* Journey Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel pb-10"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold">
            Your Journey
          </span>
          <span className="text-[10px] text-[var(--foreground-muted)]">
            Mile {formatMile(currentMile)} → {nextResupply ? formatMile(nextResupply.mile) : 'End'}
          </span>
        </div>
        <ResupplyTimeline
          currentMile={currentMile}
          resupplyPoints={upcomingResupply}
          activeId={selectedTimelineId}
          onSelect={setSelectedTimelineId}
        />
      </motion.div>

      {/* Service Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <ServiceFilters
          activeFilter={serviceFilter}
          onFilterChange={setServiceFilter}
          counts={serviceCounts}
        />
      </motion.div>

      {/* Next Resupply - Prominent Card */}
      {nextResupply && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2 pl-1">
            Next Stop
          </h3>
          <ResupplyCard
            resupply={nextResupply}
            currentMile={currentMile}
            contacts={getContacts(nextResupply)}
            isNext
            defaultExpanded
            onViewDirectory={() => setView('directory')}
          />
        </motion.div>
      )}

      {/* Upcoming List - Compact */}
      {remainingResupply.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h3 className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2 pl-1">
            Coming Up ({remainingResupply.length})
          </h3>
          <div className="space-y-1.5">
            {remainingResupply.map((resupply, index) => (
              <motion.div
                key={resupply.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * index }}
              >
                <ResupplyCard
                  resupply={resupply}
                  currentMile={currentMile}
                  contacts={getContacts(resupply)}
                  onViewDirectory={() => setView('directory')}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {filteredResupply.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Flag className="w-8 h-8" />
          </div>
          <p className="empty-state-title">
            {serviceFilter === 'all' ? "You've made it!" : "No matches"}
          </p>
          <p className="empty-state-description">
            {serviceFilter === 'all'
              ? "No more resupply points ahead. You're near the end!"
              : `No upcoming stops with ${serviceFilter} service. Try a different filter.`}
          </p>
          {serviceFilter !== 'all' && (
            <button
              onClick={() => setServiceFilter('all')}
              className="btn btn-secondary mt-3 text-sm"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}

      {/* Mail Drop Tips - More subtle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
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
