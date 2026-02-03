import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mountain, Compass, Navigation, Edit3, Check, X } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useIsMobile } from '../hooks/use-mobile';
import { cn, formatMile, formatDistance } from '../lib/utils';
import { TRAIL_LENGTH, getNearestWaypoint } from '../data';

interface LocationPanelProps {
  onLocationFound?: (mile: number) => void;
}

export function LocationPanel({ onLocationFound }: LocationPanelProps) {
  const isMobile = useIsMobile();
  const {
    latitude,
    longitude,
    accuracy,
    nearestMile,
    nearestWaypoint,
    distanceFromTrail,
    error,
    loading,
    getCurrentPosition,
    isSupported,
  } = useGeolocation();

  const [isManualMode, setIsManualMode] = useState(false);
  const [manualMile, setManualMile] = useState<number | null>(null);
  const [manualInput, setManualInput] = useState('');

  // The effective mile (either from GPS or manual entry)
  const effectiveMile = manualMile ?? nearestMile;
  const effectiveWaypoint = manualMile !== null ? getNearestWaypoint(manualMile) : nearestWaypoint;

  const handleLocate = () => {
    getCurrentPosition();
  };

  // Update parent when GPS location is found
  useEffect(() => {
    if (nearestMile !== null && manualMile === null && onLocationFound) {
      onLocationFound(nearestMile);
    }
  }, [nearestMile, manualMile, onLocationFound]);

  const handleManualSubmit = () => {
    const mile = parseFloat(manualInput);
    if (!isNaN(mile) && mile >= 0 && mile <= TRAIL_LENGTH) {
      setManualMile(mile);
      setIsManualMode(false);
      if (onLocationFound) {
        onLocationFound(mile);
      }
    }
  };

  const handleClearManual = () => {
    setManualMile(null);
    setManualInput('');
    if (nearestMile !== null && onLocationFound) {
      onLocationFound(nearestMile);
    }
  };

  const progress = effectiveMile !== null ? (effectiveMile / TRAIL_LENGTH) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--background-secondary)] rounded-xl p-5 border border-[var(--border)]"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[var(--accent)] text-white">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">Your Location</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            {manualMile !== null ? 'Manually set position' : 'Find where you are on the trail'}
          </p>
        </div>
      </div>

      {/* Manual Entry Mode */}
      {isManualMode ? (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[var(--foreground-muted)]">
            Enter your mile marker (0 - {TRAIL_LENGTH})
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="e.g., 450.5"
              min={0}
              max={TRAIL_LENGTH}
              step={0.1}
              inputMode="decimal"
              autoComplete="off"
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              autoFocus={!isMobile}
            />
            <button
              onClick={handleManualSubmit}
              className="p-2 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-light)] transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsManualMode(false);
                setManualInput('');
              }}
              className="p-2 rounded-lg bg-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--border-light)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* GPS Button */}
          {isSupported && (
            <button
              onClick={handleLocate}
              disabled={loading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-medium transition-all',
                'flex items-center justify-center gap-2',
                loading
                  ? 'bg-[var(--border)] text-[var(--foreground-muted)] cursor-wait'
                  : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-light)]'
              )}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Compass className="w-5 h-5" />
                  </motion.div>
                  Locating...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Get My Position
                </>
              )}
            </button>
          )}

          {/* Manual Entry Button */}
          <button
            onClick={() => setIsManualMode(true)}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-medium transition-all mt-2',
              'flex items-center justify-center gap-2',
              'bg-[var(--background)] border border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]'
            )}
          >
            <Edit3 className="w-5 h-5" />
            Enter Mile Manually
          </button>

          {!isSupported && (
            <div className="text-center py-4 text-[var(--foreground-muted)]">
              Geolocation is not supported in this browser. Use manual entry above.
            </div>
          )}
        </>
      )}

      {error && !isManualMode && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-red-500 text-center"
        >
          {error}
        </motion.p>
      )}

      {/* Show position data when available */}
      {effectiveMile !== null && !loading && !isManualMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-4"
        >
          {/* Manual position indicator */}
          {manualMile !== null && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/30">
              <span className="text-sm text-[var(--accent)]">Manual position set</span>
              <button
                onClick={handleClearManual}
                className="text-xs px-2 py-1 rounded bg-[var(--accent)] text-white hover:bg-[var(--accent)]/80 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Trail Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[var(--foreground-muted)]">Trail Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary)]"
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--foreground-muted)] mt-1">
              <span>Springer</span>
              <span>Katahdin</span>
            </div>
          </div>

          {/* Mile Marker */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--background)] rounded-lg p-3 border border-[var(--border-light)]">
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                <Mountain className="w-4 h-4" />
                Mile Marker
              </div>
              <p className="text-xl font-semibold">{formatMile(effectiveMile)}</p>
            </div>

            <div className="bg-[var(--background)] rounded-lg p-3 border border-[var(--border-light)]">
              <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                <MapPin className="w-4 h-4" />
                Off Trail
              </div>
              <p className="text-xl font-semibold">
                {manualMile !== null ? '--' : (distanceFromTrail !== null ? formatDistance(distanceFromTrail) : '--')}
              </p>
            </div>
          </div>

          {/* Nearest Waypoint */}
          {effectiveWaypoint && (
            <div className="bg-[var(--background)] rounded-lg p-3 border border-[var(--border-light)]">
              <p className="text-sm text-[var(--foreground-muted)] mb-1">Nearest Waypoint</p>
              <p className="font-medium">{effectiveWaypoint.name}</p>
              <div className="flex items-center gap-2 mt-1 text-sm text-[var(--foreground-muted)]">
                <span className="capitalize">{effectiveWaypoint.type}</span>
                <span>·</span>
                <span>{effectiveWaypoint.state}</span>
              </div>
            </div>
          )}

          {/* GPS Coordinates (only when using GPS) */}
          {latitude && longitude && manualMile === null && (
            <div className="text-xs text-[var(--foreground-muted)] text-center">
              {latitude.toFixed(5)}, {longitude.toFixed(5)}
              {accuracy && ` (±${Math.round(accuracy)}m)`}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
