import { useState, useCallback } from 'react';
import { CalendarDays, MapPin, Loader2, CheckCircle } from 'lucide-react';
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
  const [showSoboMessage, setShowSoboMessage] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState<{ mile: number; waypointName?: string } | null>(null);

  // Use the onSuccess callback to directly update the mile when GPS succeeds
  const handleGpsSuccess = useCallback((nearestMile: number) => {
    onStartMileChange(nearestMile);
    setGpsSuccess({ mile: nearestMile });
    setTimeout(() => setGpsSuccess(null), 4000);
  }, [onStartMileChange]);

  const { getCurrentPosition, loading: gpsLoading, error: gpsError, nearestWaypoint } = useGeolocation({
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

  const handleDirectionToggle = (newDirection: Direction) => {
    if (newDirection === 'SOBO') {
      setShowSoboMessage(true);
      setTimeout(() => setShowSoboMessage(false), 3000);
    } else {
      onDirectionChange(newDirection);
      setShowSoboMessage(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Direction Toggle - Top Right */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[var(--foreground-muted)]">
            <span className={direction === 'NOBO' ? 'font-bold text-[var(--foreground)]' : ''}>NOBO</span>
            /
            <span className={direction === 'SOBO' ? 'font-bold text-[var(--foreground)]' : ''}>SOBO</span>
          </span>
          <div className="inline-flex items-center bg-[var(--background)] rounded-full p-[2px] border border-[var(--border)]">
            <button
              onClick={() => handleDirectionToggle('NOBO')}
              className={cn(
                'w-4 h-4 rounded-full transition-all',
                direction === 'NOBO'
                  ? 'bg-[var(--primary)]'
                  : 'hover:bg-[var(--foreground)]/10'
              )}
              aria-label="NOBO"
            />
            <button
              onClick={() => handleDirectionToggle('SOBO')}
              className={cn(
                'w-4 h-4 rounded-full transition-all',
                direction === 'SOBO'
                  ? 'bg-[var(--primary)]'
                  : 'hover:bg-[var(--foreground)]/10 opacity-60'
              )}
              aria-label="SOBO"
            />
          </div>
        </div>
        {showSoboMessage && (
          <p className="text-[10px] text-[var(--warning)] animate-pulse">
            NOBO support only for now, SOBO coming soon
          </p>
        )}
      </div>

      {/* Start Date and Starting Mile Row */}
      <div className="grid grid-cols-2 gap-2.5">
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

        {/* Starting Mile with GPS button outside */}
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
            Starting Mile
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={startMile}
              onChange={(e) => onStartMileChange(Number(e.target.value))}
              min={-8.5}
              max={TRAIL_LENGTH}
              step={0.1}
              className="input py-1.5 text-sm flex-1"
            />
            <button
              onClick={handleUseLocation}
              disabled={gpsLoading}
              className={cn(
                'p-2 rounded-lg border border-[var(--border)] transition-colors shrink-0',
                gpsLoading
                  ? 'text-[var(--foreground-muted)] bg-[var(--background)]'
                  : 'text-[var(--accent)] hover:bg-[var(--accent)]/10 bg-[var(--background-secondary)]'
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
          {gpsSuccess && (
            <p className="text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Located near mile {gpsSuccess.mile.toFixed(1)}{nearestWaypoint ? ` (${nearestWaypoint.name})` : ''}
            </p>
          )}
        </div>
      </div>

      {/* Days to Plan and Miles Per Day on same row */}
      <div className="grid grid-cols-2 gap-2.5">
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
          <div className="flex justify-between text-xs text-[var(--foreground-muted)] -mt-0.5">
            <span>1</span>
            <span>14</span>
          </div>
        </div>

        {/* Miles Per Day */}
        <div>
          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
            Miles Per Day: <span className="font-bold text-[var(--foreground)]">{targetMilesPerDay}</span>
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
          <div className="flex justify-between text-xs text-[var(--foreground-muted)] -mt-0.5">
            <span>8</span>
            <span>25</span>
          </div>
        </div>
      </div>
    </div>
  );
}
