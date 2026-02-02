import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain, Package, Star, Navigation } from 'lucide-react';
import { getWaypointsInRange, getSheltersInRange, getResupplyInRange, TRAIL_LENGTH } from '../data';
import { cn, formatMile } from '../lib/utils';
import type { Direction } from '../types';

interface MiniMapProps {
  currentMile: number;
  rangeAhead?: number;
  direction?: Direction;
}

export function MiniMap({ currentMile, rangeAhead = 50, direction = 'NOBO' }: MiniMapProps) {
  // Calculate the visible range (show some context before and after)
  const rangeBehind = 10;
  const startMile = Math.max(0, currentMile - rangeBehind);
  const endMile = Math.min(TRAIL_LENGTH, currentMile + rangeAhead + 10);
  const totalRange = endMile - startMile;

  // Get waypoints in range
  const shelters = useMemo(() => getSheltersInRange(startMile, endMile), [startMile, endMile]);
  const resupplyPoints = useMemo(() => getResupplyInRange(startMile, endMile), [startMile, endMile]);
  const features = useMemo(() => {
    const allWaypoints = getWaypointsInRange(startMile, endMile);
    return allWaypoints.filter(w => w.type === 'feature');
  }, [startMile, endMile]);

  // Calculate position percentage for a given mile
  const getPosition = (mile: number) => {
    return ((mile - startMile) / totalRange) * 100;
  };

  // Current position marker
  const currentPosition = getPosition(currentMile);

  // Plan end position
  const planEndMile = direction === 'NOBO'
    ? Math.min(currentMile + rangeAhead, TRAIL_LENGTH)
    : Math.max(currentMile - rangeAhead, 0);
  const planEndPosition = getPosition(planEndMile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--background-secondary)] rounded-xl p-4 border border-[var(--border)]"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[var(--accent)]" />
          Trail Overview
        </h4>
        <span className="text-xs text-[var(--foreground-muted)]">
          Mile {formatMile(startMile)} - {formatMile(endMile)}
        </span>
      </div>

      {/* Mini Map Container */}
      <div className="relative h-24 bg-[var(--background)] rounded-lg border border-[var(--border-light)] overflow-hidden">
        {/* Trail line */}
        <div className="absolute top-1/2 left-2 right-2 h-1 bg-[var(--border)] rounded-full transform -translate-y-1/2" />

        {/* Plan range highlight */}
        <div
          className="absolute top-1/2 h-2 bg-[var(--primary)]/20 rounded-full transform -translate-y-1/2"
          style={{
            left: `calc(${Math.min(currentPosition, planEndPosition)}% + 8px)`,
            width: `calc(${Math.abs(planEndPosition - currentPosition)}% - 16px)`,
          }}
        />

        {/* Features (bottom layer) */}
        {features.slice(0, 5).map((feature) => (
          <div
            key={feature.id}
            className="absolute transform -translate-x-1/2 group"
            style={{ left: `calc(${getPosition(feature.mile)}% + 8px)`, top: '70%' }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--feature-color)] opacity-60" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                <Star className="w-3 h-3 inline mr-1 text-[var(--feature-color)]" />
                {feature.name}
              </div>
            </div>
          </div>
        ))}

        {/* Shelters */}
        {shelters.map((shelter) => (
          <div
            key={shelter.id}
            className="absolute transform -translate-x-1/2 group"
            style={{ left: `calc(${getPosition(shelter.mile)}% + 8px)`, top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className={cn(
              'w-3 h-3 rounded-sm flex items-center justify-center',
              'bg-[var(--shelter-color)] text-white'
            )}>
              <Mountain className="w-2 h-2" />
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                <Mountain className="w-3 h-3 inline mr-1 text-[var(--shelter-color)]" />
                {shelter.name}
                <span className="text-[var(--foreground-muted)] ml-1">mi {formatMile(shelter.mile)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Resupply Points */}
        {resupplyPoints.map((resupply) => (
          <div
            key={resupply.id}
            className="absolute transform -translate-x-1/2 group"
            style={{ left: `calc(${getPosition(resupply.mile)}% + 8px)`, top: '30%' }}
          >
            <div className={cn(
              'w-4 h-4 rounded-full flex items-center justify-center',
              resupply.resupplyQuality === 'full' && 'bg-green-500 text-white',
              resupply.resupplyQuality === 'limited' && 'bg-yellow-500 text-white',
              resupply.resupplyQuality === 'minimal' && 'bg-orange-500 text-white'
            )}>
              <Package className="w-2.5 h-2.5" />
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                <Package className="w-3 h-3 inline mr-1 text-[var(--resupply-color)]" />
                {resupply.name}
                <span className={cn(
                  'ml-1 px-1 rounded text-[10px]',
                  resupply.resupplyQuality === 'full' && 'bg-green-100 text-green-700',
                  resupply.resupplyQuality === 'limited' && 'bg-yellow-100 text-yellow-700',
                  resupply.resupplyQuality === 'minimal' && 'bg-orange-100 text-orange-700'
                )}>
                  {resupply.resupplyQuality}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Current Position Marker */}
        <div
          className="absolute transform -translate-x-1/2 z-10"
          style={{ left: `calc(${currentPosition}% + 8px)`, top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="w-5 h-5 rounded-full bg-[var(--primary)] border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full bg-[var(--primary)]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
          You
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-[var(--shelter-color)]" />
          Shelter
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Resupply
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[var(--feature-color)]" />
          Feature
        </span>
      </div>
    </motion.div>
  );
}
