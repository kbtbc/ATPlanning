import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Mountain, Package, ChevronDown, ChevronUp, CalendarDays, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useHikePlanner } from '../hooks/useHikePlanner';
import { cn, formatMile, addDays, formatDate } from '../lib/utils';
import { TRAIL_LENGTH } from '../data';
import { MiniMap } from './MiniMap';

interface HikePlannerProps {
  initialMile?: number;
  expanded?: boolean;
}

// Helper to format date for input
function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function HikePlanner({ initialMile = 0, expanded = false }: HikePlannerProps) {
  const {
    startMile,
    targetMilesPerDay,
    daysAhead,
    direction,
    startDate,
    plan,
    setStartMile,
    setTargetMiles,
    setDaysAhead,
    setDirection,
    setStartDate,
    totalMiles,
    endMile,
    resupplyCount,
    shelterCount,
  } = useHikePlanner({ startMile: initialMile });

  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const mileagePresets = [10, 12, 15, 18, 20, 22];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newDate.getTime())) {
      setStartDate(newDate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mini Map */}
      <MiniMap currentMile={startMile} rangeAhead={totalMiles} direction={direction} expanded={expanded} />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--background-secondary)] rounded-xl p-5 border border-[var(--border)]"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
          Plan Your Hike
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Starting Mile */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Starting Mile <span className="text-xs opacity-70">(-8.5 = Amicalola Falls)</span>
            </label>
            <input
              type="number"
              value={startMile}
              onChange={(e) => setStartMile(Number(e.target.value))}
              min={-8.5}
              max={TRAIL_LENGTH}
              step={0.1}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
              <span className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Start Date
              </span>
            </label>
            <input
              type="date"
              value={formatDateForInput(startDate)}
              onChange={handleDateChange}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Direction */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Direction
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('NOBO')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
                  direction === 'NOBO'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--accent)]'
                )}
              >
                NOBO
              </button>
              <button
                onClick={() => setDirection('SOBO')}
                className={cn(
                  'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
                  direction === 'SOBO'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--accent)]'
                )}
              >
                SOBO
              </button>
            </div>
          </div>

          {/* Days Ahead */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Days to Plan: <span className="font-bold text-[var(--foreground)]">{daysAhead}</span>
            </label>
            <input
              type="range"
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              min={1}
              max={14}
              step={1}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-1">
              <span>1 day</span>
              <span>14 days</span>
            </div>
          </div>

          {/* Miles Per Day - Full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Miles Per Day: <span className="font-bold text-[var(--foreground)]">{targetMilesPerDay}</span>
            </label>
            <input
              type="range"
              value={targetMilesPerDay}
              onChange={(e) => setTargetMiles(Number(e.target.value))}
              min={8}
              max={25}
              step={1}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-1">
              <span>8</span>
              <span>25</span>
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {mileagePresets.map((miles) => (
                <button
                  key={miles}
                  onClick={() => setTargetMiles(miles)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-all',
                    targetMilesPerDay === miles
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--background)] border border-[var(--border)] hover:border-[var(--accent)]'
                  )}
                >
                  {miles} mi
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-[var(--border)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--primary)]">{totalMiles.toFixed(1)}</p>
            <p className="text-xs text-[var(--foreground-muted)]">Total Miles</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">{shelterCount}</p>
            <p className="text-xs text-[var(--foreground-muted)]">Shelters</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--secondary)]">{resupplyCount}</p>
            <p className="text-xs text-[var(--foreground-muted)]">Resupply</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatMile(endMile)}</p>
            <p className="text-xs text-[var(--foreground-muted)]">End Mile</p>
          </div>
        </div>
      </motion.div>

      {/* Daily Plan */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--accent)]" />
          Daily Itinerary
        </h3>

        {plan.map((day, index) => {
          const dayDate = addDays(startDate, day.day - 1);
          const isExpanded = expandedDay === day.day;
          const dailyMiles = Math.abs(day.endMile - day.startMile);

          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] overflow-hidden"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between p-4 hover:bg-[var(--background)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                    {day.day}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{formatDate(dayDate)}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Mile {formatMile(day.startMile)} → {formatMile(day.endMile)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Set as Start Button */}
                  {day.day > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStartMile(day.startMile);
                        setStartDate(dayDate);
                      }}
                      className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                      title="Set as new starting point"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
                      {dailyMiles.toFixed(1)} mi
                    </span>
                    {day.shelters.length > 0 && (
                      <span className="flex items-center gap-1 text-[var(--shelter-color)]">
                        <Mountain className="w-4 h-4" />
                        {day.shelters.length}
                      </span>
                    )}
                    {day.resupply.length > 0 && (
                      <span className="flex items-center gap-1 text-[var(--resupply-color)]">
                        <Package className="w-4 h-4" />
                        {day.resupply.length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[var(--foreground-muted)]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--foreground-muted)]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 border-t border-[var(--border)]"
                >
                  {/* Shelters */}
                  {day.shelters.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-2 flex items-center gap-2">
                        <Mountain className="w-4 h-4" />
                        Shelters ({day.shelters.length})
                      </h4>
                      <div className="space-y-2">
                        {day.shelters.map((shelter) => (
                          <div
                            key={shelter.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-[var(--background)] border border-[var(--border-light)]"
                          >
                            <div>
                              <p className="font-medium text-sm">{shelter.name}</p>
                              <p className="text-xs text-[var(--foreground-muted)]">
                                Mile {formatMile(shelter.mile)} · {shelter.elevation.toLocaleString()} ft
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {shelter.hasWater && (
                                <span className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">Water</span>
                              )}
                              {shelter.hasPrivy && (
                                <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">Privy</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resupply */}
                  {day.resupply.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Resupply Options ({day.resupply.length})
                      </h4>
                      <div className="space-y-2">
                        {day.resupply.map((resupply) => (
                          <div
                            key={resupply.id}
                            className="p-3 rounded-lg bg-[var(--background)] border border-[var(--border-light)]"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-sm">{resupply.name}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">
                                  Mile {formatMile(resupply.mile)}
                                  {resupply.distanceFromTrail > 0 && ` · ${resupply.distanceFromTrail} mi off trail`}
                                </p>
                              </div>
                              <span className={cn(
                                'px-2 py-0.5 text-xs rounded font-medium',
                                resupply.resupplyQuality === 'full' && 'bg-green-100 text-green-700',
                                resupply.resupplyQuality === 'limited' && 'bg-yellow-100 text-yellow-700',
                                resupply.resupplyQuality === 'minimal' && 'bg-red-100 text-red-700'
                              )}>
                                {resupply.resupplyQuality}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {resupply.hasGrocery && (
                                <span className="px-2 py-0.5 text-xs rounded bg-[var(--border-light)]">Grocery</span>
                              )}
                              {resupply.hasPostOffice && (
                                <span className="px-2 py-0.5 text-xs rounded bg-[var(--border-light)]">Post Office</span>
                              )}
                              {resupply.hasLodging && (
                                <span className="px-2 py-0.5 text-xs rounded bg-[var(--border-light)]">Lodging</span>
                              )}
                              {resupply.hasRestaurant && (
                                <span className="px-2 py-0.5 text-xs rounded bg-[var(--border-light)]">Food</span>
                              )}
                              {resupply.hasShower && (
                                <span className="px-2 py-0.5 text-xs rounded bg-[var(--border-light)]">Shower</span>
                              )}
                            </div>
                            {resupply.notes && (
                              <p className="text-xs text-[var(--foreground-muted)] mt-2 italic">{resupply.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {day.features.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
                        Notable Features ({day.features.length})
                      </h4>
                      <div className="space-y-1">
                        {day.features.map((feature) => (
                          <div
                            key={feature.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-[var(--background)] border border-[var(--border-light)]"
                          >
                            <span className="text-sm">{feature.name}</span>
                            <span className="text-xs text-[var(--foreground-muted)]">
                              Mile {formatMile(feature.mile)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {day.shelters.length === 0 && day.resupply.length === 0 && day.features.length === 0 && (
                    <p className="text-sm text-[var(--foreground-muted)] mt-4 italic">
                      No shelters, resupply, or notable features in this section.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
