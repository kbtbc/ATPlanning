import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Store, Mail, Bed, Utensils, ShowerHead, Shirt, ArrowRight, Phone, BookOpen } from 'lucide-react';
import { resupplyPoints, getNearestResupply } from '../data';
import { getContactsByResupplyId, hasContactInfo } from '../data/contacts';
import { ResupplyDirectory } from './resupply/ResupplyDirectory';
import { ContactCard } from './resupply/ContactCard';
import { cn, formatMile, formatDistance } from '../lib/utils';
import type { ResupplyPoint } from '../types';

type ResupplyView = 'upcoming' | 'directory';

interface ResupplyPlannerProps {
  currentMile?: number;
  direction?: 'NOBO' | 'SOBO';
}

export function ResupplyPlanner({ currentMile = 0, direction = 'NOBO' }: ResupplyPlannerProps) {
  const [view, setView] = useState<ResupplyView>('upcoming');
  const [expandedResupply, setExpandedResupply] = useState<string | null>(null);

  // Get next several resupply points from current position
  const upcomingResupply = resupplyPoints
    .filter(r => direction === 'NOBO' ? r.mile > currentMile : r.mile < currentMile)
    .sort((a, b) => direction === 'NOBO' ? a.mile - b.mile : b.mile - a.mile)
    .slice(0, 10);

  const nearestResupply = getNearestResupply(currentMile, 'ahead');

  const getQualityBadge = (quality: ResupplyPoint['resupplyQuality']) => {
    const styles = {
      full: 'bg-green-500 text-white',
      limited: 'bg-yellow-500 text-white',
      minimal: 'bg-red-500 text-white',
    };
    return styles[quality] || 'bg-gray-500 text-white';
  };

  const ServiceIcon = ({ has, icon: Icon, label }: { has: boolean; icon: typeof Store; label: string }) => (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
      has ? 'bg-[var(--accent)] bg-opacity-15 text-[var(--primary)]' : 'bg-[var(--border-light)] text-[var(--foreground-muted)]'
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );

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
            Contact Directory
          </button>
        </div>

        <ResupplyDirectory />
      </div>
    );
  }

  return (
    <div className="space-y-5">
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
          Contact Directory
        </button>
      </div>

      {/* Current Position Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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

      {/* Resupply Strategy Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="panel"
      >
        <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-[var(--accent)]" />
          Resupply Strategy
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-[var(--background)]">
            <p className="text-xl font-bold text-green-600">{resupplyPoints.filter(r => r.resupplyQuality === 'full').length}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">Full Resupply</p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--background)]">
            <p className="text-xl font-bold text-yellow-600">{resupplyPoints.filter(r => r.resupplyQuality === 'limited').length}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">Limited</p>
          </div>
          <div className="p-2 rounded-lg bg-[var(--background)]">
            <p className="text-xl font-bold text-red-600">{resupplyPoints.filter(r => r.resupplyQuality === 'minimal').length}</p>
            <p className="text-[10px] text-[var(--foreground-muted)]">Minimal</p>
          </div>
        </div>
        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          Stock up at "Full Resupply" towns before limited sections.
        </p>
      </motion.div>

      {/* Upcoming Resupply Points */}
      <div>
        <h3 className="text-base font-semibold mb-2 flex items-center gap-2 pl-1">
          <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
          Upcoming Resupply
        </h3>

        <div className="space-y-1">
          {upcomingResupply.map((resupply, index) => {
            const contacts = getContactsByResupplyId(resupply.id);
            const hasContacts = hasContactInfo(resupply.id);
            const isExpanded = expandedResupply === resupply.id;

            return (
              <motion.div
                key={resupply.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg overflow-hidden"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--background)] transition-colors"
                  onClick={() => setExpandedResupply(isExpanded ? null : resupply.id)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0',
                      getQualityBadge(resupply.resupplyQuality)
                    )}>
                      {resupply.resupplyQuality}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-medium text-sm truncate">{resupply.name}</h4>
                        {hasContacts && (
                          <Phone className="w-3 h-3 text-[var(--primary)] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--foreground-muted)]">
                        Mile {formatMile(resupply.mile)} · {formatDistance(Math.abs(resupply.mile - currentMile))}
                        {resupply.distanceFromTrail > 0 && ` · ${resupply.distanceFromTrail} mi off`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-3 pb-3 border-t border-[var(--border)]"
                  >
                    {/* Services Grid */}
                    <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                      <ServiceIcon has={resupply.hasGrocery} icon={Store} label="Grocery" />
                      <ServiceIcon has={resupply.hasPostOffice} icon={Mail} label="Post Office" />
                      <ServiceIcon has={resupply.hasLodging} icon={Bed} label="Lodging" />
                      <ServiceIcon has={resupply.hasRestaurant} icon={Utensils} label="Restaurant" />
                      <ServiceIcon has={resupply.hasShower} icon={ShowerHead} label="Shower" />
                      <ServiceIcon has={resupply.hasLaundry} icon={Shirt} label="Laundry" />
                    </div>

                    {resupply.notes && (
                      <p className="text-xs text-[var(--foreground-muted)] mb-2 italic">
                        {resupply.notes}
                      </p>
                    )}

                    {resupply.shuttleAvailable && (
                      <p className="text-xs text-[var(--accent)] mb-2">
                        Shuttle service available
                      </p>
                    )}

                    {/* Contact Cards */}
                    {contacts && contacts.businesses.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[var(--border-light)]">
                        <h5 className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
                          Contact Directory
                        </h5>
                        <div className="grid gap-2">
                          {contacts.businesses.slice(0, 3).map((business) => (
                            <ContactCard key={business.id} business={business} compact />
                          ))}
                          {contacts.businesses.length > 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setView('directory');
                              }}
                              className="text-xs text-[var(--primary)] hover:underline text-left"
                            >
                              +{contacts.businesses.length - 3} more contacts...
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {upcomingResupply.length === 0 && (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No more resupply points ahead</p>
            <p className="text-xs">You're near the end of the trail!</p>
          </div>
        )}
      </div>

      {/* Mail Drop Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--info)]/10 rounded-lg p-3 border border-[var(--info)]/30"
      >
        <h4 className="font-medium text-[var(--info)] text-sm mb-1.5 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Mail Drop Tips
        </h4>
        <ul className="text-xs text-[var(--foreground-muted)] space-y-0.5 list-disc list-inside">
          <li>Send mail drops to towns with "Minimal" resupply</li>
          <li>Use General Delivery at post offices (hold 30 days)</li>
          <li>Hostels often accept packages for a small fee</li>
        </ul>
      </motion.div>
    </div>
  );
}
