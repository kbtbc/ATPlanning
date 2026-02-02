import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Package, Navigation, TrendingUp, Info, Home } from 'lucide-react';
import { getSheltersInRange, getResupplyInRange, getFeaturesInRange, TRAIL_LENGTH } from '../data';
import { elevationProfile, getElevationAtMile, APPROACH_TRAIL_START } from '../data/elevation';
import { cn, formatMile } from '../lib/utils';
import type { Direction } from '../types';

interface MiniMapProps {
  currentMile: number;
  rangeAhead?: number;
  direction?: Direction;
  dayMarkers?: { mile: number; day: number }[];
}

export function MiniMap({ currentMile, rangeAhead = 50, direction = 'NOBO', dayMarkers = [] }: MiniMapProps) {
  // Calculate the visible range (show some context before and after)
  // Allow negative miles for approach trail
  const rangeBehind = 10;
  const startMile = Math.max(APPROACH_TRAIL_START, currentMile - rangeBehind);
  const endMile = Math.min(TRAIL_LENGTH, currentMile + rangeAhead + 10);
  const totalRange = endMile - startMile;

  // Get waypoints in range
  const shelters = useMemo(() => getSheltersInRange(startMile, endMile), [startMile, endMile]);
  const resupplyPoints = useMemo(() => getResupplyInRange(startMile, endMile), [startMile, endMile]);
  const featurePoints = useMemo(() => getFeaturesInRange(startMile, endMile), [startMile, endMile]);

  // Get detailed elevation profile for this range
  const rangeElevation = useMemo(() => {
    const points = elevationProfile.filter(p => p.mile >= startMile && p.mile <= endMile);
    if (points.length === 0) return { min: 1000, max: 6000, points: [] };

    const elevations = points.map(p => p.elevation);
    return {
      min: Math.min(...elevations),
      max: Math.max(...elevations),
      points,
    };
  }, [startMile, endMile]);

  // Calculate position percentage for a given mile
  const getXPosition = (mile: number) => {
    return ((mile - startMile) / totalRange) * 100;
  };

  // Calculate Y position based on elevation (0 = top, 100 = bottom)
  const getYPosition = (elevation: number) => {
    const elevRange = rangeElevation.max - rangeElevation.min || 1;
    // Leave 15% margin top and bottom
    return 15 + (1 - (elevation - rangeElevation.min) / elevRange) * 70;
  };

  // Current position
  const currentPosition = getXPosition(currentMile);
  const currentElevation = getElevationAtMile(currentMile);
  const currentYPosition = getYPosition(currentElevation);

  // Plan end position
  const planEndMile = direction === 'NOBO'
    ? Math.min(currentMile + rangeAhead, TRAIL_LENGTH)
    : Math.max(currentMile - rangeAhead, 0);
  const planEndPosition = getXPosition(planEndMile);

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
    if (rangeElevation.points.length < 2) return '';

    const elevRange = rangeElevation.max - rangeElevation.min || 1;
    const points = rangeElevation.points.map(p => ({
      x: ((p.mile - startMile) / totalRange) * 100,
      y: 15 + (1 - (p.elevation - rangeElevation.min) / elevRange) * 70,
    }));

    // Start path at bottom left
    let path = `M 0 100`;

    // Line to first point at bottom
    path += ` L ${points[0].x} 100`;

    // Add all elevation points
    points.forEach((point) => {
      path += ` L ${point.x} ${point.y}`;
    });

    // Close path at bottom
    const lastPoint = points[points.length - 1];
    path += ` L ${lastPoint.x} 100 L 0 100 Z`;

    return path;
  }, [rangeElevation, startMile, totalRange]);

  // Create elevation line path (just the top line, no fill)
  const elevationLinePath = useMemo(() => {
    if (rangeElevation.points.length < 2) return '';

    const elevRange = rangeElevation.max - rangeElevation.min || 1;
    return rangeElevation.points
      .map((p, i) => {
        const x = ((p.mile - startMile) / totalRange) * 100;
        const y = 15 + (1 - (p.elevation - rangeElevation.min) / elevRange) * 70;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [rangeElevation, startMile, totalRange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel"
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
            {rangeElevation.min.toLocaleString()}-{rangeElevation.max.toLocaleString()} ft
          </span>
          <span>
            Mile {formatMile(startMile)} - {formatMile(endMile)}
          </span>
        </div>
      </div>

      {/* Mini Map Container */}
      <div className="relative bg-[var(--background)] rounded-lg border border-[var(--border-light)] overflow-hidden h-48">
        {/* Elevation Profile Background */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="elevGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="planGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
            </linearGradient>
          </defs>

          {/* Plan range highlight */}
          <rect
            x={Math.min(currentPosition, planEndPosition)}
            y="0"
            width={Math.abs(planEndPosition - currentPosition)}
            height="100"
            fill="url(#planGradient)"
          />

          {/* Elevation fill */}
          <path
            d={elevationPath}
            fill="url(#elevGradient)"
          />

          {/* Elevation line */}
          <path
            d={elevationLinePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="0.5"
            strokeOpacity="0.8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Day Markers - vertical dashed lines showing day boundaries */}
        {dayMarkers.map((marker) => {
          const xPos = getXPosition(marker.mile);
          if (xPos < 0 || xPos > 100) return null;

          return (
            <div
              key={`day-${marker.day}`}
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{ left: `${xPos}%`, transform: 'translateX(-50%)' }}
            >
              <svg className="absolute inset-0 h-full" style={{ width: '1px', left: '50%' }}>
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                  stroke="var(--primary)"
                  strokeWidth="1"
                  strokeOpacity="0.5"
                  strokeDasharray="4 3"
                />
              </svg>
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] font-medium text-[var(--primary)] bg-[var(--background)]/90 px-1 rounded whitespace-nowrap">
                Day {marker.day}
              </span>
            </div>
          );
        })}

        {/* Mile Markers */}
        {mileMarkers.map((mile) => (
          <div
            key={mile}
            className="absolute top-0 bottom-0 flex flex-col justify-end items-center pointer-events-none"
            style={{ left: `${getXPosition(mile)}%` }}
          >
            <div className="w-px h-full bg-[var(--border)] opacity-20" />
            <span className="absolute bottom-1 text-[9px] text-[var(--foreground-muted)] bg-[var(--background)]/90 px-1 rounded transform -translate-x-1/2 left-1/2">
              {mile}
            </span>
          </div>
        ))}

        {/* Shelters - positioned on the elevation line using GPX data */}
        {shelters.map((shelter) => {
          const xPos = getXPosition(shelter.mile);
          // Use GPX elevation data so icon sits exactly on the line
          const elevation = getElevationAtMile(shelter.mile);
          const yPos = getYPosition(elevation);

          return (
            <div
              key={shelter.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ left: `${xPos}%`, top: `${yPos}%` }}
            >
              <div className={cn(
                'w-4 h-4 rounded flex items-center justify-center shadow-sm',
                'bg-[var(--shelter-color)] text-white border border-white/50'
              )}>
                <Home className="w-2.5 h-2.5" />
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
          );
        })}

        {/* Resupply Points - positioned on the elevation line using GPX data */}
        {resupplyPoints.map((resupply) => {
          const xPos = getXPosition(resupply.mile);
          // Use GPX elevation data so icon sits exactly on the line
          const elevation = getElevationAtMile(resupply.mile);
          const yPos = getYPosition(elevation);

          return (
            <div
              key={resupply.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ left: `${xPos}%`, top: `${yPos}%` }}
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
          );
        })}

        {/* Features/Landmarks - positioned on the elevation line using GPX data */}
        {featurePoints.map((feature) => {
          const xPos = getXPosition(feature.mile);
          // Use GPX elevation data so icon sits exactly on the line
          const elevation = getElevationAtMile(feature.mile);
          const yPos = getYPosition(elevation);

          return (
            <div
              key={feature.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ left: `${xPos}%`, top: `${yPos}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-sm bg-[var(--feature-color)] text-white border border-white/50">
                <Info className="w-2 h-2" />
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs whitespace-nowrap shadow-lg max-w-[200px]">
                  <div className="font-medium truncate">{feature.name}</div>
                  <div className="text-[var(--foreground-muted)] flex items-center gap-2">
                    <span>mi {formatMile(feature.mile)}</span>
                    <span>·</span>
                    <span>{feature.elevation.toLocaleString()} ft</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Current Position Marker - positioned at elevation */}
        <div
          className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${currentPosition}%`, top: `${currentYPosition}%` }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
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

        {/* Elevation stats overlay */}
        <div className="absolute top-2 left-2 bg-[var(--background)]/90 rounded px-2 py-1 text-xs border border-[var(--border-light)]">
          <span className="text-[var(--foreground-muted)]">Elev: </span>
          <span className="font-medium">{currentElevation.toLocaleString()} ft</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--primary)] border border-white" />
          You
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-[var(--shelter-color)] flex items-center justify-center">
            <Home className="w-2 h-2 text-white" />
          </div>
          Shelter
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          Resupply
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[var(--feature-color)] flex items-center justify-center">
            <Info className="w-2 h-2 text-white" />
          </div>
          Info
        </span>
      </div>
    </motion.div>
  );
}
