import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('skeleton', className)} />
  );
}

// Preset skeleton layouts for common patterns

export function DayCardSkeleton() {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-7 h-7 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
    </div>
  );
}

export function WaypointCardSkeleton() {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function ResupplyCardSkeleton() {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Skeleton className="h-5 w-14 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg p-3">
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  );
}

export function MiniMapSkeleton() {
  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4 h-48">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="relative h-24">
        <Skeleton className="absolute inset-0 rounded-lg opacity-50" />
      </div>
      <div className="flex justify-between mt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}
