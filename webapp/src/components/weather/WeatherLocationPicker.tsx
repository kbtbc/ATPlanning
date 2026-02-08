import { useState, useMemo } from 'react';
import { MapPin, Navigation, Mountain, Search, Loader2 } from 'lucide-react';
import { allWaypoints, TRAIL_LENGTH } from '../../data';
import { formatMile } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { LocationMode } from '../../hooks/useWeather';
import type { Waypoint } from '../../types';

interface WeatherLocationPickerProps {
  currentMile: number;
  locationMode: LocationMode;
  onModeChange: (mode: LocationMode) => void;
  onFetchForMile: (mile: number) => void;
  onFetchForWaypoint: (waypoint: Waypoint) => void;
  onFetchForGps: () => void;
  loading: boolean;
}

export function WeatherLocationPicker({
  currentMile,
  locationMode,
  onModeChange,
  onFetchForMile,
  onFetchForWaypoint,
  onFetchForGps,
  loading,
}: WeatherLocationPickerProps) {
  const [mileInput, setMileInput] = useState(currentMile.toString());
  const [waypointSearch, setWaypointSearch] = useState('');

  const filteredWaypoints = useMemo(() => {
    const searchable = allWaypoints.filter(
      w => w.type === 'shelter' || w.type === 'resupply'
    );
    if (!waypointSearch.trim()) return searchable.slice(0, 20);
    const query = waypointSearch.toLowerCase();
    return searchable
      .filter(w =>
        w.name.toLowerCase().includes(query) ||
        w.state.toLowerCase().includes(query) ||
        w.mile.toString().includes(query)
      )
      .slice(0, 20);
  }, [waypointSearch]);

  const handleMileSubmit = () => {
    const mile = parseFloat(mileInput);
    if (!isNaN(mile) && mile >= -8.5 && mile <= TRAIL_LENGTH) {
      onFetchForMile(mile);
    }
  };

  const handleMileKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleMileSubmit();
  };

  return (
    <div className="space-y-2">
      {/* Compact inline selector: label + mode chips + inline input */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold shrink-0">
          Location
        </span>

        {/* Mode chips */}
        <div className="flex gap-0.5 bg-[var(--background)] rounded-md p-0.5 border border-[var(--border)]">
          <button
            onClick={() => onModeChange('mile')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all',
              locationMode === 'mile'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            <Mountain className="w-3 h-3" />
            Mile
          </button>
          <button
            onClick={() => onModeChange('waypoint')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all',
              locationMode === 'waypoint'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            <MapPin className="w-3 h-3" />
            Shelter
          </button>
          <button
            onClick={() => {
              onModeChange('gps');
              onFetchForGps();
            }}
            disabled={loading}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all',
              locationMode === 'gps'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            {loading && locationMode === 'gps' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            GPS
          </button>
        </div>

        {/* Inline mile input */}
        {locationMode === 'mile' && (
          <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
            <input
              type="number"
              value={mileInput}
              onChange={e => setMileInput(e.target.value)}
              onKeyDown={handleMileKeyDown}
              min={-8.5}
              max={TRAIL_LENGTH}
              step={0.1}
              placeholder="Mile #"
              className="w-20 bg-[var(--background)] border border-[var(--border)] rounded-md px-2 py-1 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            />
            <button
              onClick={handleMileSubmit}
              disabled={loading}
              className="btn btn-primary py-1 px-3 text-[11px]"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Go'}
            </button>
          </div>
        )}
      </div>

      {/* Shelter search (only shown when waypoint mode is active) */}
      {locationMode === 'waypoint' && (
        <div className="space-y-1.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={waypointSearch}
              onChange={e => setWaypointSearch(e.target.value)}
              placeholder="Search shelters, towns..."
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-md pl-7 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            />
          </div>
          <div className="max-h-40 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--background)] divide-y divide-[var(--border-light)]">
            {filteredWaypoints.map(wp => (
              <button
                key={wp.id}
                onClick={() => onFetchForWaypoint(wp)}
                disabled={loading}
                className="w-full text-left px-2.5 py-1.5 hover:bg-[var(--background-secondary)] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs text-[var(--foreground)] truncate">{wp.name}</span>
                  <span className="text-[9px] text-[var(--foreground-muted)] shrink-0">
                    mi {formatMile(wp.mile)} · {wp.elevation.toLocaleString()} ft
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
