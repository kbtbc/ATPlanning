import { useMemo, useState } from 'react';
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
  onWaypointClick?: (mile: number) => void;
}

type WaypointVisibility = {
  shelters: boolean;
  resupply: boolean;
  features: boolean;
};

export function MiniMap({ currentMile, rangeAhead = 50, direction = 'NOBO', dayMarkers = [], onWaypointClick }: MiniMapProps) {
  const [visibility, setVisibility] = useState<WaypointVisibility>({
    shelters: true,
    resupply: true,
    features: true,
  });

  // Track active tooltip for mobile tap support
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleVisibility = (type: keyof WaypointVisibility) => {
    setVisibility(prev => ({ ...prev, [type]: !prev[type] }));
  };
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
      {/* Header - inside panel */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[var(--accent)]" />
          Trail Overview
        </h3>
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
      <div
        className="relative bg-[var(--background)] rounded-lg border border-[var(--border-light)] overflow-hidden h-48"
        onClick={() => setActiveTooltip(null)}
      >
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
          {visibility.shelters && shelters.map((shelter) => {
            const xPos = getXPosition(shelter.mile);
            const elevation = getElevationAtMile(shelter.mile);
            const yPos = getYPosition(elevation);
            const isActive = activeTooltip === `shelter-${shelter.id}`;

            // Smart tooltip positioning: left-align near left edge, right-align near right edge
            const tooltipAlign = xPos < 20 ? 'left' : xPos > 80 ? 'right' : 'center';
            const tooltipTransform = tooltipAlign === 'left' ? 'translateX(0)' : tooltipAlign === 'right' ? 'translateX(-100%)' : 'translateX(-50%)';
            const tooltipLeft = tooltipAlign === 'left' ? '0' : tooltipAlign === 'right' ? '100%' : '50%';

            // Vertical positioning: show below if near top of map
            const showBelow = yPos < 35;

            // Check if shelter is closed
            const isClosed = shelter.capacity === 0 || shelter.notes?.includes('REMOVED') || shelter.notes?.includes('Closed');

            return (
              <div
                key={shelter.id}
                className={cn("absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer", isClosed && "opacity-50")}
                style={{ left: `${xPos}%`, top: `${yPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(isActive ? null : `shelter-${shelter.id}`);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onWaypointClick?.(shelter.mile);
                }}
              >
                <Home className={cn("w-4 h-4 drop-shadow-sm", isClosed ? "text-[var(--foreground-muted)]" : "text-[var(--shelter-color)]")} />
                <div className={cn(
                  "absolute transition-opacity z-30 pointer-events-none",
                  showBelow ? "top-full mt-2" : "bottom-full mb-2",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )} style={{ left: tooltipLeft, transform: tooltipTransform }}>
                  <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs shadow-lg min-w-[180px] max-w-[280px]">
                    <div className={cn("font-medium", isClosed && "line-through")}>{shelter.name}</div>
                    <div className="text-[var(--foreground-muted)] flex items-center gap-2">
                      <span>mi {formatMile(shelter.mile)}</span>
                      <span>·</span>
                      <span>{shelter.elevation.toLocaleString()} ft</span>
                      {shelter.capacity ? <><span>·</span><span>{shelter.capacity} spots</span></> : null}
                    </div>
                    {(shelter.hasWater || shelter.hasSeasonalWater || shelter.hasPrivy || shelter.hasBearProtection || shelter.hasShowers || shelter.hasViews || shelter.isHammockFriendly || shelter.hasSummit || shelter.hasFee || shelter.hasWarning) ? (
                      <div className="flex flex-wrap items-center gap-1 mt-1 pt-1 border-t border-[var(--border-light)]">
                        {shelter.hasWater ? (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--water-color)]/15 text-[var(--water-color)] text-[10px]">Water</span>
                        ) : null}
                        {shelter.hasSeasonalWater ? (
                          <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 text-[10px]">Seasonal</span>
                        ) : null}
                        {shelter.hasPrivy ? (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--stone-light)]/30 text-[var(--stone)] text-[10px]">Privy</span>
                        ) : null}
                        {shelter.hasBearProtection ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 text-[10px]">Bear</span>
                        ) : null}
                        {shelter.hasShowers ? (
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 text-[10px]">Shower</span>
                        ) : null}
                        {shelter.hasViews ? (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 text-[10px]">Views</span>
                        ) : null}
                        {shelter.isHammockFriendly ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 text-[10px]">Hammock</span>
                        ) : null}
                        {shelter.hasFee ? (
                          <span className="px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 text-[10px]">Fee</span>
                        ) : null}
                        {shelter.hasWarning ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 text-[10px]">⚠️</span>
                        ) : null}
                      </div>
                    ) : null}
                    {/* Show truncated notes in tooltip */}
                    {shelter.notes && (
                      <p className="text-[10px] text-[var(--foreground-muted)] mt-1 pt-1 border-t border-[var(--border-light)] line-clamp-2 italic">
                        {shelter.notes}
                      </p>
                    )}
                    {onWaypointClick && (
                      <p className="text-[9px] text-[var(--primary)] mt-1 pt-1 border-t border-[var(--border-light)] text-center">
                        Double-click to view in itinerary
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Resupply Points - positioned on the elevation line using GPX data */}
          {visibility.resupply && resupplyPoints.map((resupply) => {
            const xPos = getXPosition(resupply.mile);
            const elevation = getElevationAtMile(resupply.mile);
            const yPos = getYPosition(elevation);
            const isActive = activeTooltip === `resupply-${resupply.id}`;

            // Smart tooltip positioning: left-align near left edge, right-align near right edge
            const tooltipAlign = xPos < 20 ? 'left' : xPos > 80 ? 'right' : 'center';
            const tooltipTransform = tooltipAlign === 'left' ? 'translateX(0)' : tooltipAlign === 'right' ? 'translateX(-100%)' : 'translateX(-50%)';
            const tooltipLeft = tooltipAlign === 'left' ? '0' : tooltipAlign === 'right' ? '100%' : '50%';

            // Vertical positioning: show below if near top of map
            const showBelow = yPos < 35;

            return (
              <div
                key={resupply.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
                style={{ left: `${xPos}%`, top: `${yPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(isActive ? null : `resupply-${resupply.id}`);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onWaypointClick?.(resupply.mile);
                }}
              >
                <Package className="w-4 h-4 text-[var(--resupply-color)] drop-shadow-sm" />
                <div className={cn(
                  "absolute transition-opacity z-30 pointer-events-none",
                  showBelow ? "top-full mt-2" : "bottom-full mb-2",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )} style={{ left: tooltipLeft, transform: tooltipTransform }}>
                  <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs shadow-lg min-w-[150px]">
                    <div className="font-medium">{resupply.name}</div>
                    <div className="text-[var(--foreground-muted)] flex items-center gap-2">
                      <span>mi {formatMile(resupply.mile)}</span>
                      <span className={cn(
                        'px-1 rounded text-[10px]',
                        resupply.resupplyQuality === 'major_town' && 'bg-[var(--category-major-town-bg)] text-[var(--category-major-town)]',
                        resupply.resupplyQuality === 'trail_town' && 'bg-[var(--category-trail-town-bg)] text-[var(--category-trail-town)]',
                        resupply.resupplyQuality === 'on_trail' && 'bg-[var(--category-on-trail-bg)] text-[var(--category-on-trail)]',
                        resupply.resupplyQuality === 'limited' && 'bg-[var(--category-limited-bg)] text-[var(--category-limited)]'
                      )}>
                        {resupply.resupplyQuality.replace('_', ' ')}
                      </span>
                    </div>
                    {onWaypointClick && (
                      <p className="text-[9px] text-[var(--primary)] mt-1 pt-1 border-t border-[var(--border-light)] text-center">
                        Double-click to view in itinerary
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Features/Landmarks - positioned on the elevation line using GPX data */}
          {visibility.features && featurePoints.map((feature) => {
            const xPos = getXPosition(feature.mile);
            const elevation = getElevationAtMile(feature.mile);
            const yPos = getYPosition(elevation);
            const isActive = activeTooltip === `feature-${feature.id}`;

            // Smart tooltip positioning: left-align near left edge, right-align near right edge
            const tooltipAlign = xPos < 20 ? 'left' : xPos > 80 ? 'right' : 'center';
            const tooltipTransform = tooltipAlign === 'left' ? 'translateX(0)' : tooltipAlign === 'right' ? 'translateX(-100%)' : 'translateX(-50%)';
            const tooltipLeft = tooltipAlign === 'left' ? '0' : tooltipAlign === 'right' ? '100%' : '50%';

            // Vertical positioning: show below if near top of map
            const showBelow = yPos < 35;

            return (
              <div
                key={feature.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10 cursor-pointer"
                style={{ left: `${xPos}%`, top: `${yPos}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTooltip(isActive ? null : `feature-${feature.id}`);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onWaypointClick?.(feature.mile);
                }}
              >
                <Info className="w-3.5 h-3.5 text-[var(--category-limited)] drop-shadow-sm" />
                <div className={cn(
                  "absolute transition-opacity z-30 pointer-events-none",
                  showBelow ? "top-full mt-2" : "bottom-full mb-2",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )} style={{ left: tooltipLeft, transform: tooltipTransform }}>
                  <div className="bg-[var(--background)] border border-[var(--border)] rounded px-2 py-1.5 text-xs shadow-lg max-w-[200px]">
                    <div className="font-medium truncate">{feature.name}</div>
                    <div className="text-[var(--foreground-muted)] flex items-center gap-2">
                      <span>mi {formatMile(feature.mile)}</span>
                      <span>·</span>
                      <span>{feature.elevation.toLocaleString()} ft</span>
                    </div>
                    {onWaypointClick && (
                      <p className="text-[9px] text-[var(--primary)] mt-1 pt-1 border-t border-[var(--border-light)] text-center">
                        Double-click to view in itinerary
                      </p>
                    )}
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
              className="relative flex items-center justify-center"
            >
              {/* Pulsing ring - behind the icon */}
              <motion.div
                className="absolute w-4 h-4 rounded-full bg-[var(--primary)]"
                animate={{ scale: [1, 2], opacity: [0.4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", repeatDelay: 0.3 }}
              />
              {/* Icon container */}
              <div className="relative w-4 h-4 rounded-full bg-[var(--primary)] border border-white shadow-sm flex items-center justify-center">
                <MapPin className="w-2.5 h-2.5 text-white" />
              </div>
            </motion.div>
          </div>

          {/* Elevation stats overlay */}
          <div className="absolute top-2 left-2 bg-[var(--background)]/90 rounded px-2 py-1 text-xs border border-[var(--border-light)]">
            <span className="text-[var(--foreground-muted)]">Elev: </span>
            <span className="font-medium">{currentElevation.toLocaleString()} ft</span>
          </div>
        </div>

        {/* Legend with toggles */}
        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[var(--primary)] border border-white" />
            You
          </span>
          <button
            onClick={() => toggleVisibility('shelters')}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded transition-all',
              visibility.shelters ? 'opacity-100' : 'opacity-50'
            )}
          >
            <Home className="w-3 h-3 text-[var(--shelter-color)]" />
            Shelter
          </button>
          <button
            onClick={() => toggleVisibility('resupply')}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded transition-all',
              visibility.resupply ? 'opacity-100' : 'opacity-50'
            )}
          >
            <Package className="w-3 h-3 text-[var(--resupply-color)]" />
            Resupply
          </button>
          <button
            onClick={() => toggleVisibility('features')}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded transition-all',
              visibility.features ? 'opacity-100' : 'opacity-50'
            )}
          >
            <Info className="w-3 h-3 text-[var(--category-limited)]" />
            Info
          </button>
        </div>
    </motion.div>
  );
}
