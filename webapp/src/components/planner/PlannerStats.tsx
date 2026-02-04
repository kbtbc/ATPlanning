import { formatMile } from '../../lib/utils';

interface PlannerStatsProps {
  totalMiles: number;
  shelterCount: number;
  resupplyCount: number;
  endMile: number;
}

export function PlannerStats({ totalMiles, shelterCount, resupplyCount, endMile }: PlannerStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-[var(--border)]">
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--primary)]">{totalMiles.toFixed(1)}</p>
        <p className="text-[10px] text-[var(--foreground-muted)]">Total Miles</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--accent)]">{shelterCount}</p>
        <p className="text-[10px] text-[var(--foreground-muted)]">Shelters</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-[var(--secondary)]">{resupplyCount}</p>
        <p className="text-[10px] text-[var(--foreground-muted)]">Resupply</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold">{formatMile(endMile)}</p>
        <p className="text-[10px] text-[var(--foreground-muted)]">End Mile</p>
      </div>
    </div>
  );
}
