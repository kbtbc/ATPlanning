import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Mountain, Package, MapPin, Droplets, Tent, Star, Compass } from 'lucide-react';
import { useWaypointFilters } from '../hooks/useWaypointFilters';
import { cn, formatMile, formatElevation, getWaypointTypeColor } from '../lib/utils';
import type { WaypointType, Waypoint, Shelter } from '../types';
import { TRAIL_LENGTH } from '../data';

const waypointTypes: { type: WaypointType; label: string; icon: React.ReactNode }[] = [
  { type: 'shelter', label: 'Shelters', icon: <Mountain className="w-4 h-4" /> },
  { type: 'resupply', label: 'Resupply', icon: <Package className="w-4 h-4" /> },
  { type: 'town', label: 'Towns', icon: <MapPin className="w-4 h-4" /> },
  { type: 'feature', label: 'Features', icon: <Star className="w-4 h-4" /> },
  { type: 'water', label: 'Water', icon: <Droplets className="w-4 h-4" /> },
  { type: 'campsite', label: 'Campsites', icon: <Tent className="w-4 h-4" /> },
];

// Quick filter presets
const quickFilters = [
  { label: 'First 100 mi', minMile: 0, maxMile: 100 },
  { label: 'Mid-Atlantic', minMile: 800, maxMile: 1200 },
  { label: 'Last 100 mi', minMile: TRAIL_LENGTH - 100, maxMile: TRAIL_LENGTH },
];

interface WaypointListProps {
  onWaypointSelect?: (waypoint: Waypoint) => void;
  initialMileRange?: [number, number];
}

export function WaypointList({ onWaypointSelect, initialMileRange }: WaypointListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);

  const {
    filters,
    filteredWaypoints,
    toggleType,
    toggleState,
    setMileRange,
    setSearchQuery,
    resetFilters,
    availableStates,
    filteredCount,
    totalCount,
  } = useWaypointFilters(
    initialMileRange
      ? { minMile: initialMileRange[0], maxMile: initialMileRange[1] }
      : undefined
  );

  const handleWaypointClick = (waypoint: Waypoint) => {
    setSelectedWaypoint(waypoint);
    onWaypointSelect?.(waypoint);
  };

  // Count active filters for badge
  const activeFilterCount = filters.types.length + filters.states.length +
    (filters.searchQuery ? 1 : 0) +
    (filters.minMile > 0 || filters.maxMile < TRAIL_LENGTH ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-[var(--background)] pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
          <input
            type="text"
            placeholder="Search waypoints..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-16 py-3 rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--accent)] focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors flex items-center gap-1',
              showFilters ? 'bg-[var(--accent)] text-white' : 'hover:bg-[var(--border)]'
            )}
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
            aria-expanded={showFilters}
          >
            <Filter className="w-5 h-5" aria-hidden="true" />
            {activeFilterCount > 0 && (
              <span className={cn(
                'min-w-[1.25rem] h-5 rounded-full text-xs font-medium flex items-center justify-center',
                showFilters ? 'bg-white/20 text-white' : 'bg-[var(--accent)] text-white'
              )}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filters Row */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {quickFilters.map((qf) => (
            <button
              key={qf.label}
              onClick={() => setMileRange(qf.minMile, qf.maxMile)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                filters.minMile === qf.minMile && filters.maxMile === qf.maxMile
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--accent)]'
              )}
            >
              {qf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--background-secondary)] rounded-xl p-4 border border-[var(--border)] space-y-4">
              {/* Type Filters */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                  Waypoint Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {waypointTypes.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        filters.types.includes(type)
                          ? `${getWaypointTypeColor(type)} text-white`
                          : 'bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]'
                      )}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mile Range */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                  Mile Range: {formatMile(filters.minMile)} - {formatMile(filters.maxMile)}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={filters.minMile}
                    onChange={(e) => setMileRange(Number(e.target.value), filters.maxMile)}
                    min={0}
                    max={TRAIL_LENGTH}
                    className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  />
                  <span className="text-[var(--foreground-muted)]">to</span>
                  <input
                    type="number"
                    value={filters.maxMile}
                    onChange={(e) => setMileRange(filters.minMile, Number(e.target.value))}
                    min={0}
                    max={TRAIL_LENGTH}
                    className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
                  />
                </div>
              </div>

              {/* State Filters */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
                  States
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableStates.map((state) => (
                    <button
                      key={state}
                      onClick={() => toggleState(state)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-sm font-medium transition-all',
                        filters.states.includes(state)
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]'
                      )}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={resetFilters}
                className="text-sm text-[var(--accent)] hover:underline"
              >
                Reset all filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-[var(--foreground-muted)]">
        <span>
          Showing <span className="font-medium text-[var(--foreground)]">{filteredCount}</span> of {totalCount} waypoints
        </span>
        {(filters.types.length > 0 || filters.states.length > 0 || filters.searchQuery) && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 hover:text-[var(--foreground)]"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Waypoint List */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {filteredWaypoints.map((waypoint, index) => (
          <motion.button
            key={waypoint.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.5) }}
            onClick={() => handleWaypointClick(waypoint)}
            className={cn(
              'w-full text-left p-4 rounded-xl border transition-all',
              selectedWaypoint?.id === waypoint.id
                ? 'bg-[var(--accent)] bg-opacity-10 border-[var(--accent)]'
                : 'bg-[var(--background-secondary)] border-[var(--border)] hover:border-[var(--accent)]'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium text-white',
                    getWaypointTypeColor(waypoint.type)
                  )}>
                    {waypoint.type}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)]">{waypoint.state}</span>
                </div>
                <h4 className="font-medium truncate">{waypoint.name}</h4>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Mile {formatMile(waypoint.mile)} · {formatElevation(waypoint.elevation)}
                </p>
                {waypoint.notes && (
                  <p className="text-xs text-[var(--foreground-muted)] mt-1 line-clamp-2">
                    {waypoint.notes}
                  </p>
                )}
              </div>
            </div>
          </motion.button>
        ))}

        {filteredWaypoints.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Compass className="w-8 h-8" />
            </div>
            <p className="empty-state-title">No waypoints found</p>
            <p className="empty-state-description">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={resetFilters}
              className="btn btn-primary mt-4 text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Waypoint Detail Modal */}
      <AnimatePresence>
        {selectedWaypoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedWaypoint(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[var(--background)] rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium text-white',
                    getWaypointTypeColor(selectedWaypoint.type)
                  )}>
                    {selectedWaypoint.type}
                  </span>
                  <h3 className="text-xl font-semibold mt-2">{selectedWaypoint.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedWaypoint(null)}
                  className="p-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                  aria-label="Close details"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
                  <p className="text-sm text-[var(--foreground-muted)]">Mile Marker</p>
                  <p className="text-lg font-semibold">{formatMile(selectedWaypoint.mile)}</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
                  <p className="text-sm text-[var(--foreground-muted)]">Elevation</p>
                  <p className="text-lg font-semibold">{formatElevation(selectedWaypoint.elevation)}</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
                  <p className="text-sm text-[var(--foreground-muted)]">State</p>
                  <p className="text-lg font-semibold">{selectedWaypoint.state}</p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--background-secondary)]">
                  <p className="text-sm text-[var(--foreground-muted)]">Coordinates</p>
                  <p className="text-sm font-mono">{selectedWaypoint.lat.toFixed(4)}, {selectedWaypoint.lng.toFixed(4)}</p>
                </div>
              </div>

              {selectedWaypoint.type === 'shelter' && (() => {
                const shelter = selectedWaypoint as Shelter;
                const amenities: { label: string; show: boolean; colorClass: string }[] = [
                  { label: shelter.waterDistance ? `Water (${shelter.waterDistance} ft)` : 'Water', show: shelter.hasWater, colorClass: 'bg-blue-100 text-blue-800 border-blue-200' },
                  { label: 'Seasonal Water', show: !!shelter.hasSeasonalWater, colorClass: 'bg-sky-100 text-sky-800 border-sky-200' },
                  { label: 'Privy', show: shelter.hasPrivy, colorClass: 'bg-slate-100 text-slate-800 border-slate-200' },
                  { label: 'Tenting', show: shelter.isTenting, colorClass: 'bg-green-100 text-green-800 border-green-200' },
                  { label: 'Hammock Friendly', show: !!shelter.isHammockFriendly, colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
                  { label: 'Bear Cables', show: !!shelter.hasBearCables, colorClass: 'bg-amber-100 text-amber-800 border-amber-200' },
                  { label: 'Bear Box', show: !!shelter.hasBearBoxes, colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  { label: 'Showers', show: !!shelter.hasShowers, colorClass: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
                  { label: 'Restroom', show: !!shelter.hasRestroom, colorClass: 'bg-slate-100 text-slate-800 border-slate-200' },
                  { label: 'Views East', show: !!shelter.hasViewsEast, colorClass: 'bg-purple-100 text-purple-800 border-purple-200' },
                  { label: 'Views West', show: !!shelter.hasViewsWest, colorClass: 'bg-violet-100 text-violet-800 border-violet-200' },
                  { label: 'Views', show: !!shelter.hasViews, colorClass: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
                  { label: 'Trail Junction', show: !!shelter.hasJunction, colorClass: 'bg-slate-100 text-slate-800 border-slate-200' },
                  { label: 'Summit', show: !!shelter.hasSummit, colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
                  { label: 'Warning', show: !!shelter.hasWarning, colorClass: 'bg-red-100 text-red-800 border-red-200' },
                ];
                if (shelter.capacity) {
                  amenities.push({ label: `Capacity: ${shelter.capacity}`, show: true, colorClass: 'bg-slate-100 text-slate-800 border-slate-200' });
                }
                const visibleAmenities = amenities.filter((a) => a.show);
                return visibleAmenities.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm text-[var(--foreground-muted)] mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {visibleAmenities.map((amenity) => (
                        <span
                          key={amenity.label}
                          className={cn(
                            'px-2.5 py-1 rounded-full text-xs font-medium border',
                            amenity.colorClass
                          )}
                        >
                          {amenity.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {selectedWaypoint.notes && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">Notes</p>
                  <p>{selectedWaypoint.notes}</p>
                </div>
              )}

              {selectedWaypoint.services && selectedWaypoint.services.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-[var(--foreground-muted)] mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedWaypoint.services.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 rounded-lg bg-[var(--background-secondary)] text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={`https://www.google.com/maps?q=${selectedWaypoint.lat},${selectedWaypoint.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 rounded-lg bg-[var(--primary)] text-white text-center font-medium hover:bg-[var(--primary-light)] transition-colors"
              >
                Open in Google Maps
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
