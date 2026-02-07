import { useState, useMemo } from 'react';
import { MapPin, Navigation, Mountain, Search } from 'lucide-react';
import { allWaypoints, TRAIL_LENGTH } from '../../data';
import { getElevationAtMile } from '../../data/elevation';
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

const modes: { id: LocationMode; label: string; icon: React.ReactNode }[] = [
  { id: 'mile', label: 'Mile', icon: <Mountain className="w-3.5 h-3.5" /> },
  { id: 'waypoint', label: 'Shelter', icon: <MapPin className="w-3.5 h-3.5" /> },
  { id: 'gps', label: 'GPS', icon: <Navigation className="w-3.5 h-3.5" /> },
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

  // Filter waypoints (shelters + resupply only) for the picker
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
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4">
      {/* Mode Toggle */}
      <div className="flex gap-1 bg-[var(--background)] rounded-lg p-0.5 mb-3">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all',
              locationMode === mode.id
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>

      {/* Mile Entry Mode */}
      {locationMode === 'mile' && (
        <div className="flex gap-2">
          <input
            type="number"
            value={mileInput}
            onChange={e => setMileInput(e.target.value)}
            onKeyDown={handleMileKeyDown}
            min={-8.5}
            max={TRAIL_LENGTH}
            step={0.1}
            placeholder="Enter mile marker..."
            className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
          />
          <button
            onClick={handleMileSubmit}
            disabled={loading}
            className="btn btn-primary py-2 px-4 text-sm"
          >
            {loading ? 'Loading...' : 'Get Weather'}
          </button>
        </div>
      )}

      {/* Waypoint Picker Mode */}
      {locationMode === 'waypoint' && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={waypointSearch}
              onChange={e => setWaypointSearch(e.target.value)}
              placeholder="Search shelters, towns..."
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-8 pr-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
            />
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] divide-y divide-[var(--border-light)]">
            {filteredWaypoints.map(wp => (
              <button
                key={wp.id}
                onClick={() => onFetchForWaypoint(wp)}
                disabled={loading}
                className="w-full text-left px-3 py-2 hover:bg-[var(--background-secondary)] transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-[var(--foreground)] truncate">{wp.name}</span>
                  <span className="text-[10px] text-[var(--foreground-muted)] shrink-0">
                    mi {formatMile(wp.mile)} · {wp.elevation.toLocaleString()} ft
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GPS Mode */}
      {locationMode === 'gps' && (
        <button
          onClick={onFetchForGps}
          disabled={loading}
          className="w-full btn btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          {loading ? 'Getting location...' : 'Use My GPS Location'}
        </button>
      )}

      {/* Current mile context */}
      {locationMode === 'mile' && (
        <p className="text-[10px] text-[var(--foreground-muted)] mt-2">
          Planner position: mile {formatMile(currentMile)} · Elevation: {getElevationAtMile(currentMile).toLocaleString()} ft
        </p>
      )}
    </div>
  );
}
