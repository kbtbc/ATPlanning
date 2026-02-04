import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { resupplyPoints } from '../../data/resupply';
import { getContactsByResupplyId, hasContactInfo } from '../../data/contacts';
import { ContactCard } from './ContactCard';
import { cn, formatMile } from '../../lib/utils';
import type { ResupplyPoint } from '../../types';

interface ResupplyDirectoryProps {
  onSelectResupply?: (resupply: ResupplyPoint) => void;
}

export function ResupplyDirectory({ onSelectResupply }: ResupplyDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<string | 'all'>('all');

  // Get unique states in NOBO trail order
  const states = useMemo(() => {
    // NOBO order: GA -> NC -> TN -> VA -> WV -> MD -> PA -> NJ -> NY -> CT -> MA -> VT -> NH -> ME
    const noboOrder = ['GA', 'NC', 'TN', 'VA', 'WV', 'MD', 'PA', 'NJ', 'NY', 'CT', 'MA', 'VT', 'NH', 'ME'];
    const stateSet = new Set(resupplyPoints.map(r => r.state));
    return noboOrder.filter(state => stateSet.has(state));
  }, []);

  // Filter resupply points
  const filteredResupply = useMemo(() => {
    return resupplyPoints.filter(r => {
      const matchesSearch = searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState = filterState === 'all' || r.state === filterState;
      return matchesSearch && matchesState;
    });
  }, [searchQuery, filterState]);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="panel">
        <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-[var(--accent)]" />
          Resupply Directory
        </h3>

        {/* Search and Filter */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 py-1.5 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="py-1.5 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)] shrink-0"
          >
            <option value="all">All</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-[var(--foreground-muted)] mt-2">
          {filteredResupply.length} resupply point{filteredResupply.length !== 1 ? 's' : ''} ·
          {filteredResupply.filter(r => (r.businesses && r.businesses.length > 0) || hasContactInfo(r.id)).length} with contact info
        </p>
      </div>

      {/* Directory List */}
      <div className="space-y-1">
        {filteredResupply.map((resupply, index) => {
          const contacts = resupply.businesses ? { resupplyId: resupply.id, businesses: resupply.businesses } : getContactsByResupplyId(resupply.id);
          const isExpanded = expandedId === resupply.id;
          const hasContacts = (resupply.businesses && resupply.businesses.length > 0) || hasContactInfo(resupply.id);

          return (
            <motion.div
              key={resupply.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg overflow-hidden"
            >
              {/* Resupply Header */}
              <div
                className={cn(
                  'flex items-center justify-between px-3 py-2 cursor-pointer transition-colors',
                  'hover:bg-[var(--background)]',
                  isExpanded && 'bg-[var(--background)]'
                )}
                onClick={() => handleToggle(resupply.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    resupply.resupplyQuality === 'major_town' && 'bg-green-500',
                    resupply.resupplyQuality === 'trail_town' && 'bg-blue-500',
                    resupply.resupplyQuality === 'on_trail' && 'bg-purple-500',
                    resupply.resupplyQuality === 'limited' && 'bg-yellow-500'
                  )} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm truncate">{resupply.name}</h4>
                      {hasContacts && (
                        <Phone className="w-3 h-3 text-[var(--primary)] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Mile {formatMile(resupply.mile)} · {resupply.state}
                      {resupply.distanceFromTrail > 0 && ` · ${resupply.distanceFromTrail} mi ${resupply.directionFromTrail || ''}`.replace(/\s+/g, ' ').trim()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    'px-1.5 py-0.5 text-[10px] font-medium rounded',
                    resupply.resupplyQuality === 'major_town' && 'bg-green-100 text-green-700',
                    resupply.resupplyQuality === 'trail_town' && 'bg-blue-100 text-blue-700',
                    resupply.resupplyQuality === 'on_trail' && 'bg-purple-100 text-purple-700',
                    resupply.resupplyQuality === 'limited' && 'bg-yellow-100 text-yellow-700'
                  )}>
                    {resupply.resupplyQuality}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 pb-3 border-t border-[var(--border)]"
                >
                  {/* Services */}
                  <div className="flex flex-wrap gap-1 mt-2 mb-3">
                    {resupply.hasGrocery && <ServiceTag>Grocery</ServiceTag>}
                    {resupply.hasOutfitter && <ServiceTag>Outfitter</ServiceTag>}
                    {resupply.hasPostOffice && <ServiceTag>Post Office</ServiceTag>}
                    {resupply.hasLodging && <ServiceTag>Lodging</ServiceTag>}
                    {resupply.hasRestaurant && <ServiceTag>Restaurant</ServiceTag>}
                    {resupply.hasLaundry && <ServiceTag>Laundry</ServiceTag>}
                    {resupply.hasShower && <ServiceTag>Shower</ServiceTag>}
                    {resupply.shuttleAvailable && <ServiceTag>Shuttle</ServiceTag>}
                  </div>

                  {/* Notes */}
                  {resupply.notes && (
                    <p className="text-xs text-[var(--foreground-muted)] mb-3 italic">
                      {resupply.notes}
                    </p>
                  )}

                  {/* Contact Cards */}
                  {contacts && contacts.businesses.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
                        Contact Directory
                      </h5>
                      <div className="grid gap-2">
                        {contacts.businesses.map((business, idx) => (
                          <ContactCard key={business.id || `${resupply.id}-biz-${idx}`} business={business} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--foreground-muted)] italic">
                      No contact information available yet.
                    </p>
                  )}

                  {/* Actions */}
                  {onSelectResupply && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--border-light)]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectResupply(resupply);
                        }}
                        className="btn btn-primary py-1 px-2 text-xs"
                      >
                        Start From Here
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredResupply.length === 0 && (
        <div className="text-center py-8 text-[var(--foreground-muted)]">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No resupply points found</p>
          <p className="text-xs">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}

function ServiceTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-1.5 py-0.5 text-[10px] bg-[var(--background)] text-[var(--foreground-muted)] rounded border border-[var(--border-light)]">
      {children}
    </span>
  );
}
