import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone, MapPin, Store, Mail, Bed, Utensils, ShowerHead, Shirt, Check, X, Navigation } from 'lucide-react';
import { cn, formatMile, formatDistance } from '../../lib/utils';
import { ContactCard } from './ContactCard';
import type { ResupplyPoint, Business } from '../../types';

interface ResupplyCardProps {
  resupply: ResupplyPoint;
  currentMile: number;
  contacts?: { resupplyId: string; businesses: Business[] } | null;
  isNext?: boolean;
  defaultExpanded?: boolean;
  onViewDirectory?: () => void;
}

export function ResupplyCard({
  resupply,
  currentMile,
  contacts,
  isNext = false,
  defaultExpanded = false,
  onViewDirectory
}: ResupplyCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const qualityConfig = {
    full: { color: 'bg-emerald-500', text: 'text-emerald-600', label: 'Full Resupply', ring: 'ring-emerald-500/20' },
    limited: { color: 'bg-amber-500', text: 'text-amber-600', label: 'Limited', ring: 'ring-amber-500/20' },
    minimal: { color: 'bg-rose-500', text: 'text-rose-600', label: 'Minimal', ring: 'ring-rose-500/20' },
  };

  const quality = qualityConfig[resupply.resupplyQuality];
  const distanceAhead = Math.abs(resupply.mile - currentMile);
  const hasContacts = contacts && contacts.businesses.length > 0;

  const services = [
    { key: 'grocery', has: resupply.hasGrocery, icon: Store, label: 'Grocery' },
    { key: 'post', has: resupply.hasPostOffice, icon: Mail, label: 'Post Office' },
    { key: 'lodging', has: resupply.hasLodging, icon: Bed, label: 'Lodging' },
    { key: 'restaurant', has: resupply.hasRestaurant, icon: Utensils, label: 'Restaurant' },
    { key: 'shower', has: resupply.hasShower, icon: ShowerHead, label: 'Shower' },
    { key: 'laundry', has: resupply.hasLaundry, icon: Shirt, label: 'Laundry' },
  ];

  const availableServices = services.filter(s => s.has);

  return (
    <motion.div
      layout
      className={cn(
        'rounded-xl border overflow-hidden transition-all',
        isNext
          ? 'bg-gradient-to-br from-[var(--background-secondary)] to-[var(--background)] border-[var(--primary)]/30 shadow-lg'
          : 'bg-[var(--background-secondary)] border-[var(--border)]'
      )}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-3 flex items-start gap-3 hover:bg-[var(--background)]/50 transition-colors"
      >
        {/* Quality indicator */}
        <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', quality.color)} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={cn('font-semibold truncate', isNext ? 'text-base' : 'text-sm')}>
              {resupply.name}
            </h4>
            {hasContacts && (
              <Phone className="w-3 h-3 text-[var(--primary)] shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <span>Mile {formatMile(resupply.mile)}</span>
            <span className="opacity-50">·</span>
            <span className={cn(isNext && 'text-[var(--primary)] font-medium')}>
              {formatDistance(distanceAhead)}
            </span>
            {resupply.distanceFromTrail > 0 && (
              <>
                <span className="opacity-50">·</span>
                <span className="flex items-center gap-0.5">
                  <Navigation className="w-3 h-3" />
                  {resupply.distanceFromTrail} mi off
                </span>
              </>
            )}
          </div>

          {/* Compact service icons */}
          {!isExpanded && availableServices.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {availableServices.slice(0, 4).map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="w-5 h-5 rounded bg-[var(--accent)]/10 flex items-center justify-center"
                >
                  <Icon className="w-3 h-3 text-[var(--accent)]" />
                </div>
              ))}
              {availableServices.length > 4 && (
                <span className="text-[10px] text-[var(--foreground-muted)]">
                  +{availableServices.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--foreground-muted)] transition-transform shrink-0 mt-1',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-[var(--border)]/50">
              {/* Quality badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold text-white',
                  quality.color
                )}>
                  {quality.label}
                </span>
                {resupply.shuttleAvailable && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--info)]/20 text-[var(--info)]">
                    Shuttle Available
                  </span>
                )}
              </div>

              {/* Services grid - cleaner layout */}
              <div className="mb-3">
                <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)] mb-2">
                  Services
                </h5>
                <div className="grid grid-cols-2 gap-1.5">
                  {services.map(({ key, has, icon: Icon, label }) => (
                    <div
                      key={key}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs',
                        has
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-[var(--background)] text-[var(--foreground-muted)] opacity-50'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="flex-1">{label}</span>
                      {has ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <X className="w-3 h-3 opacity-50" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {resupply.notes && (
                <p className="text-xs text-[var(--foreground-muted)] italic mb-3 leading-relaxed">
                  {resupply.notes}
                </p>
              )}

              {/* Contacts section */}
              {hasContacts && (
                <div className="pt-2 border-t border-[var(--border)]/50">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                      Contacts ({contacts.businesses.length})
                    </h5>
                    {contacts.businesses.length > 2 && onViewDirectory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDirectory();
                        }}
                        className="text-[10px] text-[var(--primary)] hover:underline"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {contacts.businesses.slice(0, 2).map((business, idx) => (
                      <ContactCard
                        key={business.id || `${resupply.id}-biz-${idx}`}
                        business={business}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Get directions button for "next" card */}
              {isNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const query = encodeURIComponent(resupply.name);
                    window.open(`https://maps.google.com/?q=${query}`, '_blank');
                  }}
                  className="w-full mt-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <MapPin className="w-4 h-4" />
                  Get Directions
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
