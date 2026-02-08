import { useState, useMemo, useCallback } from 'react';
import { Navigation, Search, MapPin, Loader2 } from 'lucide-react';
import { allWaypoints, TRAIL_LENGTH } from '../../data';
import { formatMile } from '../../lib/utils';
import type { Waypoint } from '../../types';

interface WeatherLocationPickerProps {
  currentMile: number;
  onFetchForMile: (mile: number) => void;
  onFetchForWaypoint: (waypoint: Waypoint) => void;
  onFetchForGps: () => void;
  loading: boolean;
}

export function WeatherLocationPicker({
  onFetchForMile,
  onFetchForWaypoint,
  onFetchForGps,
  loading,
}: WeatherLocationPickerProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const trimmed = query.trim();
  const isNumeric = /^-?\d+(\.\d+)?$/.test(trimmed);
  const showResults = focused && trimmed.length > 0;

  // Filter waypoints for shelter/town search
  const filteredWaypoints = useMemo(() => {
    if (isNumeric || !trimmed) return [];
    const q = trimmed.toLowerCase();
    return allWaypoints
      .filter(
        w =>
          (w.type === 'shelter' || w.type === 'resupply') &&
          (w.name.toLowerCase().includes(q) ||
            w.state.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [trimmed, isNumeric]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && isNumeric) {
        const mile = parseFloat(trimmed);
        if (!isNaN(mile) && mile >= -8.5 && mile <= TRAIL_LENGTH) {
          onFetchForMile(mile);
          setQuery('');
        }
      }
    },
    [isNumeric, trimmed, onFetchForMile]
  );

  const handleWaypointClick = useCallback(
    (wp: Waypoint) => {
      onFetchForWaypoint(wp);
      setQuery('');
      setFocused(false);
    },
    [onFetchForWaypoint]
  );

  const handleGpsClick = useCallback(() => {
    onFetchForGps();
    setQuery('');
    setFocused(false);
  }, [onFetchForGps]);

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-5 py-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-3 text-center">
        Set your location by Trail Mile or Shelter Name, or use GPS
      </p>

      <div className="flex justify-center px-4">
        <div className="flex items-center gap-2 w-full max-w-md">
          {/* Unified search input */}
          <div className="flex items-center gap-2.5 flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 focus-within:border-[var(--primary)] transition-colors">
            {loading ? (
              <Loader2 className="w-4 h-4 text-[var(--foreground-muted)] shrink-0 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-[var(--foreground-muted)] shrink-0" />
            )}
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              placeholder="Mile number or shelter name..."
              className="flex-1 min-w-0 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none"
            />
          </div>

          {/* GPS button */}
          <button
            onClick={handleGpsClick}
            disabled={loading}
            style={{ paddingLeft: '24px', paddingRight: '24px' }}
            className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-colors shrink-0 whitespace-nowrap disabled:opacity-50"
          >
            <Navigation className="w-4 h-4 shrink-0" />
            GPS
          </button>
        </div>
      </div>

      {/* Results / hints */}
      {showResults && (
        <div className="flex justify-center px-4 mt-1.5">
          <div className="w-full max-w-md">
            {isNumeric ? (
              <p className="text-[10px] text-[var(--foreground-muted)] text-center py-0.5">
                Press Enter for Mile {trimmed} forecast
              </p>
            ) : filteredWaypoints.length > 0 ? (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden shadow-sm max-h-48 overflow-y-auto">
                {filteredWaypoints.map(wp => (
                  <button
                    key={wp.id}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => handleWaypointClick(wp)}
                    disabled={loading}
                    className="w-full text-left px-3.5 py-2 hover:bg-[var(--background-secondary)] transition-colors flex items-center gap-3 border-t border-[var(--border-light)] first:border-0"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                    <span className="text-xs font-medium text-[var(--foreground)] flex-1 min-w-0 truncate">
                      {wp.name}
                    </span>
                    <span className="text-[10px] text-[var(--foreground-muted)] tabular-nums shrink-0">
                      mi {formatMile(wp.mile)} · {wp.elevation.toLocaleString()} ft
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-[var(--foreground-muted)] text-center py-0.5">
                No shelters or towns found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
