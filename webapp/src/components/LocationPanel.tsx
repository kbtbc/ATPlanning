import { motion } from 'framer-motion';
import { MapPin, Mountain, Compass, Navigation } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { cn, formatMile, formatDistance } from '../lib/utils';
import { TRAIL_LENGTH } from '../data';

interface LocationPanelProps {
  onLocationFound?: (mile: number) => void;
}

export function LocationPanel({ onLocationFound }: LocationPanelProps) {
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

  const handleLocate = () => {
    getCurrentPosition();
    if (nearestMile !== null && onLocationFound) {
      onLocationFound(nearestMile);
    }
  };

  const progress = nearestMile !== null ? (nearestMile / TRAIL_LENGTH) * 100 : 0;

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
            Find where you are on the trail
          </p>
        </div>
      </div>

      {!isSupported ? (
        <div className="text-center py-4 text-[var(--foreground-muted)]">
          Geolocation is not supported in this browser.
        </div>
      ) : (
        <>
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

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-sm text-red-500 text-center"
            >
              {error}
            </motion.p>
          )}

          {nearestMile !== null && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-4"
            >
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
                  <p className="text-xl font-semibold">{formatMile(nearestMile)}</p>
                </div>

                <div className="bg-[var(--background)] rounded-lg p-3 border border-[var(--border-light)]">
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)] text-sm mb-1">
                    <MapPin className="w-4 h-4" />
                    Off Trail
                  </div>
                  <p className="text-xl font-semibold">
                    {distanceFromTrail !== null ? formatDistance(distanceFromTrail) : '--'}
                  </p>
                </div>
              </div>

              {/* Nearest Waypoint */}
              {nearestWaypoint && (
                <div className="bg-[var(--background)] rounded-lg p-3 border border-[var(--border-light)]">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">Nearest Waypoint</p>
                  <p className="font-medium">{nearestWaypoint.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[var(--foreground-muted)]">
                    <span className="capitalize">{nearestWaypoint.type}</span>
                    <span>·</span>
                    <span>{nearestWaypoint.state}</span>
                  </div>
                </div>
              )}

              {/* GPS Coordinates */}
              {latitude && longitude && (
                <div className="text-xs text-[var(--foreground-muted)] text-center">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                  {accuracy && ` (±${Math.round(accuracy)}m)`}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
