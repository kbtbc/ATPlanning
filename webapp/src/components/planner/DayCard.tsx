import { motion } from 'framer-motion';
import { TrendingUp, Home, Package, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { formatMile, formatDate, addDays } from '../../lib/utils';
import { ItineraryItem, type ItineraryItemType } from './ItineraryItem';
import type { Shelter, ResupplyPoint, Waypoint, Direction } from '../../types';

interface DayPlan {
  day: number;
  startMile: number;
  endMile: number;
  shelters: Shelter[];
  resupply: ResupplyPoint[];
  features: Waypoint[];
}

interface DayCardProps {
  day: DayPlan;
  startDate: Date;
  direction: Direction;
  isExpanded: boolean;
  index: number;
  onToggle: () => void;
  onSetStart: (mile: number, date: Date) => void;
}

export function DayCard({
  day,
  startDate,
  direction,
  isExpanded,
  index,
  onToggle,
  onSetStart,
}: DayCardProps) {
  const dayDate = addDays(startDate, day.day - 1);
  const dailyMiles = Math.abs(day.endMile - day.startMile);

  // Combine and sort all items by mileage
  const allItems: ItineraryItemType[] = [
    ...day.shelters.map(s => ({ type: 'shelter' as const, data: s })),
    ...day.resupply.map(r => ({ type: 'resupply' as const, data: r })),
    ...day.features.map(f => ({ type: 'feature' as const, data: f })),
  ].sort((a, b) => {
    const mileA = a.data.mile;
    const mileB = b.data.mile;
    return direction === 'NOBO' ? mileA - mileB : mileB - mileA;
  });

  const handleSetStartFromItem = (mile: number) => {
    onSetStart(mile, dayDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="panel p-0 overflow-hidden"
    >
      {/* Day Header */}
      <div
        className="flex items-center justify-between px-3 py-2 hover:bg-[var(--background)] transition-colors cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[var(--primary)] text-white flex items-center justify-center font-bold font-sans text-sm">
            {day.day}
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">{formatDate(dayDate)}</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Mile {formatMile(day.startMile)} → {formatMile(day.endMile)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Set as Start Button */}
          {day.day > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetStart(day.startMile, dayDate);
              }}
              className="btn-ghost p-1.5 rounded"
              title="Set as new starting point"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
              {dailyMiles.toFixed(1)} mi
            </span>
            {day.shelters.length > 0 && (
              <span className="flex items-center gap-0.5 text-[var(--shelter-color)]">
                <Home className="w-3.5 h-3.5" />
                {day.shelters.length}
              </span>
            )}
            {day.resupply.length > 0 && (
              <span className="flex items-center gap-0.5 text-[var(--resupply-color)]">
                <Package className="w-3.5 h-3.5" />
                {day.resupply.length}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="p-0.5"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
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
          className="px-3 pb-3 border-t border-[var(--border)]"
        >
          {allItems.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {allItems.map((item) => (
                <ItineraryItem
                  key={item.data.id}
                  item={item}
                  onSetStart={handleSetStartFromItem}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--foreground-muted)] mt-3 italic">
              No shelters, resupply, or notable features in this section.
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
