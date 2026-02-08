import { useState, useMemo } from 'react';
import { MapPin, Navigation, Mountain, Search, Loader2 } from 'lucide-react';
import { allWaypoints, TRAIL_LENGTH } from '../../data';
import { formatMile, cn } from '../../lib/utils';
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

const MODE_OPTIONS: { mode: LocationMode; label: string; icon: typeof Mountain }[] = [
  { mode: 'mile', label: 'Mile', icon: Mountain },
  { mode: 'waypoint', label: 'Shelter', icon: MapPin },
  { mode: 'gps', label: 'GPS', icon: Navigation },
];

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

  const handleModeClick = (mode: LocationMode) => {
    onModeChange(mode);
    if (mode === 'gps') {
      onFetchForGps();
    }
  };

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-5 py-4">
      {/* Instruction bar */}
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-3 text-center">
        Set your location by Trail Mile, Shelter, or GPS
      </p>

      {/* Mode chips - centered */}
      <div className="flex justify-center">
        <div className="inline-flex gap-1 bg-[var(--background)] rounded-lg p-1 border border-[var(--border)]">
          {MODE_OPTIONS.map(({ mode, label, icon: Icon }) => {
            const isActive = locationMode === mode;
            const isGpsLoading = loading && mode === 'gps' && locationMode === 'gps';

            return (
              <button
                key={mode}
                onClick={() => handleModeClick(mode)}
                disabled={isGpsLoading}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all',
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]'
                )}
              >
                {isGpsLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mile input */}
      {locationMode === 'mile' && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <input
            type="number"
            value={mileInput}
            onChange={e => setMileInput(e.target.value)}
            onKeyDown={handleMileKeyDown}
            min={-8.5}
            max={TRAIL_LENGTH}
            step={0.1}
            placeholder="Mile #"
            className="w-24 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-center text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          <button
            onClick={handleMileSubmit}
            disabled={loading}
            className={cn(
              'px-4 py-1.5 rounded-lg text-xs font-medium transition-all',
              'bg-[var(--primary)] text-white hover:opacity-90',
              'disabled:opacity-50'
            )}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Go'}
          </button>
        </div>
      )}

      {/* Shelter search */}
      {locationMode === 'waypoint' && (
        <div className="mt-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={waypointSearch}
              onChange={e => setWaypointSearch(e.target.value)}
              placeholder="Search shelters, towns..."
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] divide-y divide-[var(--border-light)]">
            {filteredWaypoints.map(wp => (
              <button
                key={wp.id}
                onClick={() => onFetchForWaypoint(wp)}
                disabled={loading}
                className="w-full text-left px-3 py-2 hover:bg-[var(--background-secondary)] transition-colors flex items-center justify-between gap-2"
              >
                <span className="text-xs text-[var(--foreground)] truncate">{wp.name}</span>
                <span className="text-[10px] text-[var(--foreground-muted)] shrink-0 tabular-nums">
                  mi {formatMile(wp.mile)} · {wp.elevation.toLocaleString()} ft
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
