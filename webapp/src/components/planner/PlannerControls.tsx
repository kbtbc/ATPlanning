import { useState, useCallback } from 'react';
import { CalendarDays, MapPin, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TRAIL_LENGTH } from '../../data';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { Direction } from '../../types';

interface PlannerControlsProps {
  startMile: number;
  startDate: Date;
  direction: Direction;
  daysAhead: number;
  targetMilesPerDay: number;
  onStartMileChange: (mile: number) => void;
  onStartDateChange: (date: Date) => void;
  onDirectionChange: (direction: Direction) => void;
  onDaysAheadChange: (days: number) => void;
  onMilesPerDayChange: (miles: number) => void;
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function PlannerControls({
  startMile,
  startDate,
  direction,
  daysAhead,
  targetMilesPerDay,
  onStartMileChange,
  onStartDateChange,
  onDirectionChange,
  onDaysAheadChange,
  onMilesPerDayChange,
}: PlannerControlsProps) {
  const [showGpsError, setShowGpsError] = useState(false);

  // Use the onSuccess callback to directly update the mile when GPS succeeds
  const handleGpsSuccess = useCallback((nearestMile: number) => {
    onStartMileChange(nearestMile);
  }, [onStartMileChange]);

  const { getCurrentPosition, loading: gpsLoading, error: gpsError } = useGeolocation({
    onSuccess: handleGpsSuccess
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newDate.getTime())) {
      onStartDateChange(newDate);
    }
  };

  const handleUseLocation = () => {
    setShowGpsError(true);
    getCurrentPosition();
  };

  return (
    <div className="space-y-3">
      {/* Direction Toggle - Top Right */}
      <div className="flex justify-end">
        <div className="inline-flex items-center bg-[var(--background)] rounded-lg p-0.5 border border-[var(--border)]">
          <button
            onClick={() => onDirectionChange('NOBO')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              direction === 'NOBO'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            NOBO
          </button>
          <button
            onClick={() => onDirectionChange('SOBO')}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              direction === 'SOBO'
                ? 'bg-[var(--primary)] text-white'
                : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
            )}
          >
            SOBO
          </button>
        </div>
      </div>

      {/* Starting Mile and Start Date Row */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Starting Mile with GPS button */}
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
            Starting Mile
          </label>
          <div className="relative">
            <input
              type="number"
              value={startMile}
              onChange={(e) => onStartMileChange(Number(e.target.value))}
              min={-8.5}
              max={TRAIL_LENGTH}
              step={0.1}
              className="input py-1.5 text-sm pr-9"
            />
            <button
              onClick={handleUseLocation}
              disabled={gpsLoading}
              className={cn(
                'absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors',
                gpsLoading
                  ? 'text-[var(--foreground-muted)]'
                  : 'text-[var(--accent)] hover:bg-[var(--accent)]/10'
              )}
              title="Use my location"
            >
              {gpsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </button>
          </div>
          {gpsError && showGpsError && (
            <p className="text-[10px] text-[var(--warning)] mt-0.5">{gpsError}</p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Start Date
            </span>
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleDateChange}
            className="input py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Miles Per Day and Days to Plan on same row */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Miles Per Day */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-muted)] mb-0.5">
            Miles/Day: <span className="font-bold text-[var(--foreground)]">{targetMilesPerDay}</span>
          </label>
          <input
            type="range"
            value={targetMilesPerDay}
            onChange={(e) => onMilesPerDayChange(Number(e.target.value))}
            min={8}
            max={25}
            step={1}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--foreground-muted)] -mt-0.5">
            <span>8</span>
            <span>25</span>
          </div>
        </div>

        {/* Days Ahead */}
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
            Days to Plan: <span className="font-bold text-[var(--foreground)]">{daysAhead}</span>
          </label>
          <input
            type="range"
            value={daysAhead}
            onChange={(e) => onDaysAheadChange(Number(e.target.value))}
            min={1}
            max={14}
            step={1}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--foreground-muted)] -mt-0.5">
            <span>1</span>
            <span>14</span>
          </div>
        </div>
      </div>
    </div>
  );
}
