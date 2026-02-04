import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Phone, BookOpen, Flag, Mail } from 'lucide-react';
import { resupplyPoints, getNearestResupply } from '../data';
import { getContactsByResupplyId, hasContactInfo } from '../data/contacts';
import { ResupplyDirectory, ResupplyExpandedCard } from './resupply';
import { cn, formatMile, formatDistance } from '../lib/utils';
import type { ResupplyPoint, Business } from '../types';

type ResupplyView = 'upcoming' | 'directory' | 'expanded';

interface ResupplyPlannerProps {
  currentMile?: number;
  direction?: 'NOBO' | 'SOBO';
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
      full: { bg: 'bg-emerald-500', text: 'text-emerald-500', label: 'full' },
      limited: { bg: 'bg-amber-500', text: 'text-amber-500', label: 'limited' },
      minimal: { bg: 'bg-rose-500', text: 'text-rose-500', label: 'minimal' },
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
        className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-xl p-4 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Current Position</p>
            <p className="text-2xl font-bold">Mile {formatMile(currentMile)}</p>
          </div>
          {nearestResupply && (
            <div className="text-right">
              <p className="text-xs opacity-80">Next Resupply</p>
              <p className="text-sm font-semibold">{nearestResupply.name}</p>
              <p className="text-xs opacity-80">
                {formatDistance(Math.abs(nearestResupply.mile - currentMile))} ahead
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Upcoming Resupply List */}
      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2 pl-1">
          Upcoming Resupply
        </h3>

        <div className="space-y-1.5">
          {upcomingResupply.map((resupply, index) => {
            const hasContacts = (resupply.businesses && resupply.businesses.length > 0) || hasContactInfo(resupply.id);
            const quality = getQualityConfig(resupply.resupplyQuality);
            const distanceAhead = Math.abs(resupply.mile - currentMile);

            return (
              <motion.div
                key={resupply.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <button
                  onClick={() => handleResupplyClick(resupply)}
                  className="w-full text-left bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--primary)]/40 hover:bg-[var(--background)] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {/* Quality indicator dot */}
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', quality.bg)} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn('text-[10px] font-medium', quality.text)}>
                          {quality.label}
                        </span>
                        <h4 className="font-medium text-sm truncate">{resupply.name}</h4>
                        {hasContacts && (
                          <Phone className="w-3 h-3 text-[var(--primary)] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Mile {formatMile(resupply.mile)} · {distanceAhead.toFixed(1)} mi ahead
                      </p>
                    </div>
                  </div>
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
