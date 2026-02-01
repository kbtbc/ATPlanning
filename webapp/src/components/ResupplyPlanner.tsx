import { motion } from 'framer-motion';
import { Package, Store, Mail, Bed, Utensils, ShowerHead, Shirt, ArrowRight } from 'lucide-react';
import { resupplyPoints, getNearestResupply } from '../data';
import { cn, formatMile, formatDistance } from '../lib/utils';
import type { ResupplyPoint } from '../types';

interface ResupplyPlannerProps {
  currentMile?: number;
  direction?: 'NOBO' | 'SOBO';
}

export function ResupplyPlanner({ currentMile = 0, direction = 'NOBO' }: ResupplyPlannerProps) {
  // Get next several resupply points from current position
  const upcomingResupply = resupplyPoints
    .filter(r => direction === 'NOBO' ? r.mile > currentMile : r.mile < currentMile)
    .sort((a, b) => direction === 'NOBO' ? a.mile - b.mile : b.mile - a.mile)
    .slice(0, 10);

  const nearestResupply = getNearestResupply(currentMile, 'ahead');

  const getQualityBadge = (quality: ResupplyPoint['resupplyQuality']) => {
    const styles = {
      full: 'bg-green-500 text-white',
      limited: 'bg-yellow-500 text-white',
      minimal: 'bg-red-500 text-white',
    };
    return styles[quality] || 'bg-gray-500 text-white';
  };

  const ServiceIcon = ({ has, icon: Icon, label }: { has: boolean; icon: typeof Store; label: string }) => (
    <div className={cn(
      'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
      has ? 'bg-[var(--accent)] bg-opacity-15 text-[var(--primary)]' : 'bg-[var(--border-light)] text-[var(--foreground-muted)]'
    )}>
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Current Position Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-xl p-5 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Current Position</p>
            <p className="text-3xl font-bold">Mile {formatMile(currentMile)}</p>
          </div>
          {nearestResupply && (
            <div className="text-right">
              <p className="text-sm opacity-80">Next Resupply</p>
              <p className="text-lg font-semibold">{nearestResupply.name}</p>
              <p className="text-sm opacity-80">
                {formatDistance(Math.abs(nearestResupply.mile - currentMile))} ahead
              </p>
            </div>
          )}
        </div>

        {/* Progress to next resupply */}
        {nearestResupply && (
          <div className="mt-4">
            <div className="flex justify-between text-sm opacity-80 mb-1">
              <span>Current</span>
              <span>{nearestResupply.name}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '0%' }}
                className="h-full bg-white/80"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Resupply Strategy Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--background-secondary)] rounded-xl p-5 border border-[var(--border)]"
      >
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-[var(--accent)]" />
          Resupply Strategy
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-lg bg-[var(--background)]">
            <p className="text-2xl font-bold text-green-600">{resupplyPoints.filter(r => r.resupplyQuality === 'full').length}</p>
            <p className="text-xs text-[var(--foreground-muted)]">Full Resupply</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--background)]">
            <p className="text-2xl font-bold text-yellow-600">{resupplyPoints.filter(r => r.resupplyQuality === 'limited').length}</p>
            <p className="text-xs text-[var(--foreground-muted)]">Limited</p>
          </div>
          <div className="p-3 rounded-lg bg-[var(--background)]">
            <p className="text-2xl font-bold text-red-600">{resupplyPoints.filter(r => r.resupplyQuality === 'minimal').length}</p>
            <p className="text-xs text-[var(--foreground-muted)]">Minimal</p>
          </div>
        </div>
        <p className="text-sm text-[var(--foreground-muted)] mt-3">
          Typical resupply interval: 3-5 days. Stock up at "Full Resupply" towns before sections with only "Limited" or "Minimal" options.
        </p>
      </motion.div>

      {/* Upcoming Resupply Points */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-[var(--accent)]" />
          Upcoming Resupply Points
        </h3>

        <div className="space-y-3">
          {upcomingResupply.map((resupply, index) => (
            <motion.div
              key={resupply.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[var(--background-secondary)] rounded-xl p-4 border border-[var(--border)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getQualityBadge(resupply.resupplyQuality))}>
                      {resupply.resupplyQuality}
                    </span>
                    {resupply.distanceFromTrail === 0 && (
                      <span className="px-2 py-0.5 rounded text-xs bg-[var(--accent)] text-white">
                        On Trail
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold">{resupply.name}</h4>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Mile {formatMile(resupply.mile)} · {formatDistance(Math.abs(resupply.mile - currentMile))} from current position
                    {resupply.distanceFromTrail > 0 && ` · ${resupply.distanceFromTrail} mi off trail`}
                  </p>
                </div>
              </div>

              {/* Services Grid */}
              <div className="flex flex-wrap gap-2 mb-3">
                <ServiceIcon has={resupply.hasGrocery} icon={Store} label="Grocery" />
                <ServiceIcon has={resupply.hasPostOffice} icon={Mail} label="Post Office" />
                <ServiceIcon has={resupply.hasLodging} icon={Bed} label="Lodging" />
                <ServiceIcon has={resupply.hasRestaurant} icon={Utensils} label="Restaurant" />
                <ServiceIcon has={resupply.hasShower} icon={ShowerHead} label="Shower" />
                <ServiceIcon has={resupply.hasLaundry} icon={Shirt} label="Laundry" />
              </div>

              {resupply.notes && (
                <p className="text-sm text-[var(--foreground-muted)] border-t border-[var(--border)] pt-3">
                  {resupply.notes}
                </p>
              )}

              {resupply.shuttleAvailable && (
                <p className="text-xs text-[var(--accent)] mt-2">
                  Shuttle service available
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {upcomingResupply.length === 0 && (
          <div className="text-center py-8 text-[var(--foreground-muted)]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No more resupply points ahead</p>
            <p className="text-sm">You're near the end of the trail!</p>
          </div>
        )}
      </div>

      {/* Mail Drop Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--info)] bg-opacity-10 rounded-xl p-4 border border-[var(--info)] border-opacity-30"
      >
        <h4 className="font-medium text-[var(--info)] mb-2 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Mail Drop Tips
        </h4>
        <ul className="text-sm text-[var(--foreground-muted)] space-y-1 list-disc list-inside">
          <li>Send mail drops to towns with "Minimal" resupply options</li>
          <li>Use General Delivery at post offices (hold for 30 days)</li>
          <li>Hostels often accept packages for a small fee</li>
          <li>Consider a "bounce box" for items you don't need every day</li>
        </ul>
      </motion.div>
    </div>
  );
}
