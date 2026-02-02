import { motion } from 'framer-motion';
import { trailStats, STATE_BOUNDARIES } from '../data';

export function TrailProgress() {
  const stateData = Object.entries(STATE_BOUNDARIES).map(([abbr, data]) => ({
    abbr,
    name: data.name,
    start: data.start,
    end: data.end,
    length: data.end - data.start,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--background-secondary)] rounded-xl p-5 border border-[var(--border)]"
    >
      <h3 className="text-lg font-semibold mb-4">Trail Overview</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 rounded-lg bg-[var(--background)]">
          <p className="text-2xl font-bold text-[var(--primary)]">{trailStats.totalLength.toLocaleString()}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Total Miles</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[var(--background)]">
          <p className="text-2xl font-bold text-[var(--shelter-color)]">{trailStats.shelterCount}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Shelters</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[var(--background)]">
          <p className="text-2xl font-bold text-[var(--resupply-color)]">{trailStats.resupplyCount}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Resupply Points</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[var(--background)]">
          <p className="text-2xl font-bold">{trailStats.stateCount}</p>
          <p className="text-xs text-[var(--foreground-muted)]">States</p>
        </div>
      </div>

      {/* State Breakdown */}
      <div>
        <h4 className="text-sm font-medium text-[var(--foreground-muted)] mb-3">Miles by State</h4>
        <div className="space-y-2">
          {stateData.map((state, index) => (
            <motion.div
              key={state.abbr}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center gap-3"
            >
              <span className="w-8 text-xs font-medium text-[var(--foreground-muted)]">{state.abbr}</span>
              <div className="flex-1 h-6 bg-[var(--background)] rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.length / trailStats.totalLength) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.03 }}
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                  {state.length.toFixed(0)} mi
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trail Direction Info */}
      <div className="mt-6 pt-4 border-t border-[var(--border)] grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="font-semibold text-[var(--primary)]">NOBO</p>
          <p className="text-xs text-[var(--foreground-muted)]">Northbound</p>
          <p className="text-xs text-[var(--foreground-muted)]">Georgia → Maine</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--accent)]">SOBO</p>
          <p className="text-xs text-[var(--foreground-muted)]">Southbound</p>
          <p className="text-xs text-[var(--foreground-muted)]">Maine → Georgia</p>
        </div>
      </div>
    </motion.div>
  );
}
