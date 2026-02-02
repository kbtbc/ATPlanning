import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain, Package, Navigation, TrendingUp } from 'lucide-react';
import { getWaypointsInRange, getSheltersInRange, getResupplyInRange, TRAIL_LENGTH, allWaypoints } from '../data';
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
    const waypoints = getWaypointsInRange(startMile, endMile);
    return waypoints.filter(w => w.type === 'feature');
  }, [startMile, endMile]);

  // Generate elevation profile data points
  const elevationProfile = useMemo(() => {
    // Get all waypoints with elevation in range
    const waypointsWithElevation = allWaypoints
      .filter(w => w.mile >= startMile && w.mile <= endMile && w.elevation > 0)
      .sort((a, b) => a.mile - b.mile);

    if (waypointsWithElevation.length === 0) return [];

    // Find min/max elevation for scaling
    const elevations = waypointsWithElevation.map(w => w.elevation);
    const minElev = Math.min(...elevations);
    const maxElev = Math.max(...elevations);
    const elevRange = maxElev - minElev || 1;

    // Create points for the elevation profile
    return waypointsWithElevation.map(w => ({
      mile: w.mile,
      elevation: w.elevation,
      x: ((w.mile - startMile) / totalRange) * 100,
      y: 100 - ((w.elevation - minElev) / elevRange) * 80 - 10, // Leave some margin
      name: w.name,
    }));
  }, [startMile, endMile, totalRange]);

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

  // Generate mile markers (every 10 miles, rounded to nearest 10)
  const mileMarkers = useMemo(() => {
    const markers: number[] = [];
    const firstMarker = Math.ceil(startMile / 10) * 10;
    for (let mile = firstMarker; mile <= endMile; mile += 10) {
      markers.push(mile);
    }
    return markers;
  }, [startMile, endMile]);

  // Create SVG path for elevation profile
  const elevationPath = useMemo(() => {
    if (elevationProfile.length < 2) return '';

    // Start path at bottom left
    let path = `M 0 100`;

    // Add first point at bottom
    path += ` L ${elevationProfile[0].x} 100`;

    // Add elevation points
    elevationProfile.forEach((point, i) => {
      if (i === 0) {
        path += ` L ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });

    // Close path at bottom
    const lastPoint = elevationProfile[elevationProfile.length - 1];
    path += ` L ${lastPoint.x} 100 L 0 100 Z`;

    return path;
  }, [elevationProfile]);

  // Get elevation stats
  const elevationStats = useMemo(() => {
    if (elevationProfile.length === 0) return { min: 0, max: 0, current: 0 };
    const elevations = elevationProfile.map(p => p.elevation);
    const currentPoint = elevationProfile.reduce((closest, p) =>
      Math.abs(p.mile - currentMile) < Math.abs(closest.mile - currentMile) ? p : closest
    );
    return {
      min: Math.min(...elevations),
      max: Math.max(...elevations),
      current: currentPoint?.elevation || 0,
    };
  }, [elevationProfile, currentMile]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--background-secondary)] rounded-xl p-4 border border-[var(--border)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[var(--accent)]" />
          Trail Overview
        </h4>
        <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {elevationStats.min.toLocaleString()}-{elevationStats.max.toLocaleString()} ft
          </span>
          <span>
            Mile {formatMile(startMile)} - {formatMile(endMile)}
          </span>
        </div>
      </div>

      {/* Mini Map Container - Taller */}
      <div className="relative h-40 bg-[var(--background)] rounded-lg border border-[var(--border-light)] overflow-hidden">
        {/* Elevation Profile Background */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id="elevGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="planGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Elevation fill */}
          <path
            d={elevationPath}
            fill="url(#elevGradient)"
            className="transition-all duration-300"
          />

          {/* Elevation line */}
          {elevationProfile.length > 1 && (
            <polyline
              points={elevationProfile.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="0.4"
              strokeOpacity="0.7"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Plan range highlight */}
          <rect
            x={Math.min(currentPosition, planEndPosition)}
            y="0"
            width={Math.abs(planEndPosition - currentPosition)}
            height="100"
            fill="url(#planGradient)"
          />
        </svg>

        {/* Mile Markers */}
        {mileMarkers.map((mile) => (
          <div
            key={mile}
            className="absolute top-0 bottom-0 flex flex-col justify-end items-center"
            style={{ left: `${getPosition(mile)}%` }}
          >
            <div className="w-px h-full bg-[var(--border)] opacity-20" />
            <span className="absolute bottom-1 text-[9px] text-[var(--foreground-muted)] bg-[var(--background)]/80 px-1 rounded transform -translate-x-1/2 left-1/2">
              {mile}
            </span>
          </div>
        ))}

        {/* Features */}
        {features.slice(0, 8).map((feature) => (
          <div
            key={feature.id}
            className="absolute transform -translate-x-1/2 group z-10"
            style={{ left: `${getPosition(feature.mile)}%`, top: '75%' }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600 shadow-sm" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs whitespace-nowrap shadow-lg">
                <div className="font-medium">{feature.name}</div>
                <span className="text-[var(--foreground-muted)]">mi {formatMile(feature.mile)}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Shelters */}
        {shelters.map((shelter) => (
          <div
            key={shelter.id}
            className="absolute transform -translate-x-1/2 group z-10"
            style={{ left: `${getPosition(shelter.mile)}%`, top: '50%' }}
          >
            <div className={cn(
              'w-4 h-4 rounded flex items-center justify-center shadow-sm',
              'bg-[var(--shelter-color)] text-white'
            )}>
              <Mountain className="w-2.5 h-2.5" />
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs whitespace-nowrap shadow-lg">
                <div className="font-medium">{shelter.name}</div>
                <div className="text-[var(--foreground-muted)] flex items-center gap-2">
                  <span>mi {formatMile(shelter.mile)}</span>
                  <span>·</span>
                  <span>{shelter.elevation.toLocaleString()} ft</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Resupply Points */}
        {resupplyPoints.map((resupply) => (
          <div
            key={resupply.id}
            className="absolute transform -translate-x-1/2 group z-10"
            style={{ left: `${getPosition(resupply.mile)}%`, top: '25%' }}
          >
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center shadow-sm border-2 border-white',
              resupply.resupplyQuality === 'full' && 'bg-green-500 text-white',
              resupply.resupplyQuality === 'limited' && 'bg-yellow-500 text-white',
              resupply.resupplyQuality === 'minimal' && 'bg-orange-500 text-white'
            )}>
              <Package className="w-2.5 h-2.5" />
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
              <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs whitespace-nowrap shadow-lg">
                <div className="font-medium">{resupply.name}</div>
                <div className="text-[var(--foreground-muted)] flex items-center gap-2">
                  <span>mi {formatMile(resupply.mile)}</span>
                  <span className={cn(
                    'px-1 rounded text-[10px]',
                    resupply.resupplyQuality === 'full' && 'bg-green-100 text-green-700',
                    resupply.resupplyQuality === 'limited' && 'bg-yellow-100 text-yellow-700',
                    resupply.resupplyQuality === 'minimal' && 'bg-orange-100 text-orange-700'
                  )}>
                    {resupply.resupplyQuality}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Current Position Marker */}
        <div
          className="absolute z-20 transform -translate-x-1/2"
          style={{ left: `${currentPosition}%`, top: '40%' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            {/* Vertical line from marker to bottom */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-[var(--primary)] opacity-60" style={{ top: '100%', height: '60%' }} />
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] border-2 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full bg-[var(--primary)]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Current elevation indicator */}
        <div className="absolute top-2 left-2 bg-[var(--background)]/90 rounded px-2 py-1 text-xs border border-[var(--border-light)]">
          <span className="text-[var(--foreground-muted)]">Elev: </span>
          <span className="font-medium">{elevationStats.current.toLocaleString()} ft</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--primary)] border border-white" />
          You
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--shelter-color)]" />
          Shelter
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Resupply
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          Feature
        </span>
        <span className="flex items-center gap-1">
          <div className="w-4 h-2 bg-[var(--accent)]/30 rounded-sm" />
          Elevation
        </span>
      </div>
    </motion.div>
  );
}
