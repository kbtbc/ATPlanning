import { CalendarDays } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TRAIL_LENGTH } from '../../data';
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
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newDate.getTime())) {
      onStartDateChange(newDate);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Starting Mile */}
      <div>
        <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">
          Starting Mile <span className="opacity-70">(-8.5 = Amicalola)</span>
        </label>
        <input
          type="number"
          value={startMile}
          onChange={(e) => onStartMileChange(Number(e.target.value))}
          min={-8.5}
          max={TRAIL_LENGTH}
          step={0.1}
          className="input py-1.5 text-sm"
        />
      </div>

      {/* Start Date */}
      <div>
        <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">
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

      {/* Direction */}
      <div>
        <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">
          Direction
        </label>
        <div className="flex gap-1.5">
          <button
            onClick={() => onDirectionChange('NOBO')}
            className={cn(
              'btn flex-1 py-1.5 text-sm',
              direction === 'NOBO'
                ? 'btn-primary'
                : 'btn-secondary'
            )}
          >
            NOBO
          </button>
          <button
            onClick={() => onDirectionChange('SOBO')}
            className={cn(
              'btn flex-1 py-1.5 text-sm',
              direction === 'SOBO'
                ? 'btn-primary'
                : 'btn-secondary'
            )}
          >
            SOBO
          </button>
        </div>
      </div>

      {/* Days Ahead */}
      <div>
        <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">
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
        <div className="flex justify-between text-[10px] text-[var(--foreground-muted)]">
          <span>1 day</span>
          <span>14 days</span>
        </div>
      </div>

      {/* Miles Per Day */}
      <div className="md:col-span-2">
        <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1">
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
        <div className="flex justify-between text-[10px] text-[var(--foreground-muted)]">
          <span>8 mi</span>
          <span>25 mi</span>
        </div>
      </div>
    </div>
  );
}
