import { cn } from '../../lib/utils';
import type { ResupplyPoint } from '../../types';

interface ResupplyTimelineProps {
  currentMile: number;
  resupplyPoints: ResupplyPoint[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}

export function ResupplyTimeline({
  currentMile,
  resupplyPoints,
  activeId,
  onSelect
}: ResupplyTimelineProps) {
  if (resupplyPoints.length === 0) return null;

  const maxMile = resupplyPoints[resupplyPoints.length - 1]?.mile || currentMile + 100;
  const range = maxMile - currentMile;

  const getQualityColor = (quality: ResupplyPoint['resupplyQuality']) => {
    switch (quality) {
      case 'full': return 'bg-emerald-500';
      case 'limited': return 'bg-amber-500';
      case 'minimal': return 'bg-rose-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative py-3">
      {/* Timeline track */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--border)]" />

      {/* Current position marker */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
        style={{ left: '0%' }}
      >
        <div className="w-3 h-3 rounded-full bg-[var(--primary)] ring-2 ring-[var(--primary)]/30" />
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-[var(--foreground-muted)] whitespace-nowrap">
          {currentMile.toFixed(0)}
        </span>
      </div>

      {/* Resupply point markers */}
      {resupplyPoints.slice(0, 6).map((point) => {
        const position = ((point.mile - currentMile) / range) * 100;
        const isActive = activeId === point.id;

        return (
          <button
            key={point.id}
            onClick={() => onSelect?.(point.id)}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
              isActive ? 'z-20 scale-125' : 'z-10 hover:scale-110'
            )}
            style={{ left: `${Math.min(position, 95)}%` }}
            title={`${point.name} - Mile ${point.mile.toFixed(1)}`}
          >
            <div className={cn(
              'w-2.5 h-2.5 rounded-full transition-all',
              getQualityColor(point.resupplyQuality),
              isActive && 'ring-2 ring-white/50'
            )} />
            {isActive && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-medium text-[var(--foreground)] whitespace-nowrap max-w-[60px] truncate">
                {point.name.split(',')[0]}
              </span>
            )}
          </button>
        );
      })}

      {/* Legend */}
      <div className="absolute -bottom-8 right-0 flex items-center gap-3 text-[9px] text-[var(--foreground-muted)]">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Full
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Limited
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Minimal
        </span>
      </div>
    </div>
  );
}
