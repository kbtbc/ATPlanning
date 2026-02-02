import { Home, Package, Info, MapPin } from 'lucide-react';
import { cn, formatMile } from '../../lib/utils';
import type { Shelter, ResupplyPoint, Waypoint } from '../../types';

type ItineraryItemType =
  | { type: 'shelter'; data: Shelter }
  | { type: 'resupply'; data: ResupplyPoint }
  | { type: 'feature'; data: Waypoint };

interface ItineraryItemProps {
  item: ItineraryItemType;
  onSetStart: (mile: number) => void;
}

export function ItineraryItem({ item, onSetStart }: ItineraryItemProps) {
  if (item.type === 'shelter') {
    return <ShelterItem shelter={item.data} onSetStart={onSetStart} />;
  }

  if (item.type === 'resupply') {
    return <ResupplyItem resupply={item.data} onSetStart={onSetStart} />;
  }

  if (item.type === 'feature') {
    return <FeatureItem feature={item.data} onSetStart={onSetStart} />;
  }

  return null;
}

function ShelterItem({ shelter, onSetStart }: { shelter: Shelter; onSetStart: (mile: number) => void }) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-[var(--shelter-color)] flex items-center justify-center">
          <Home className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-sm">{shelter.name}</p>
          <p className="text-xs text-[var(--foreground-muted)]">
            Mile {formatMile(shelter.mile)} · {shelter.elevation.toLocaleString()} ft
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {shelter.hasWater && (
            <span className="badge bg-[var(--water-color)]/15 text-[var(--water-color)]">Water</span>
          )}
          {shelter.hasPrivy && (
            <span className="badge bg-[var(--stone-light)]/30 text-[var(--stone)]">Privy</span>
          )}
        </div>
        <SetStartButton onClick={() => onSetStart(shelter.mile)} />
      </div>
    </div>
  );
}

function ResupplyItem({ resupply, onSetStart }: { resupply: ResupplyPoint; onSetStart: (mile: number) => void }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
            resupply.resupplyQuality === 'full' && 'bg-green-500',
            resupply.resupplyQuality === 'limited' && 'bg-yellow-500',
            resupply.resupplyQuality === 'minimal' && 'bg-orange-500'
          )}>
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">{resupply.name}</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Mile {formatMile(resupply.mile)}
              {resupply.distanceFromTrail > 0 && ` · ${resupply.distanceFromTrail} mi off trail`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QualityBadge quality={resupply.resupplyQuality} />
          <SetStartButton onClick={() => onSetStart(resupply.mile)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2 ml-11">
        {resupply.hasGrocery && <ServiceBadge>Grocery</ServiceBadge>}
        {resupply.hasPostOffice && <ServiceBadge>Post Office</ServiceBadge>}
        {resupply.hasLodging && <ServiceBadge>Lodging</ServiceBadge>}
        {resupply.hasRestaurant && <ServiceBadge>Food</ServiceBadge>}
        {resupply.hasShower && <ServiceBadge>Shower</ServiceBadge>}
      </div>
      {resupply.notes && (
        <p className="text-xs text-[var(--foreground-muted)] mt-2 ml-11 italic">{resupply.notes}</p>
      )}
    </div>
  );
}

function FeatureItem({ feature, onSetStart }: { feature: Waypoint; onSetStart: (mile: number) => void }) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--feature-color)] flex items-center justify-center">
          <Info className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-sm">{feature.name}</p>
          <p className="text-xs text-[var(--foreground-muted)]">
            Mile {formatMile(feature.mile)} · {feature.elevation.toLocaleString()} ft
          </p>
        </div>
      </div>
      <SetStartButton onClick={() => onSetStart(feature.mile)} />
    </div>
  );
}

function SetStartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn-ghost p-1.5 rounded"
      title="Start from here"
    >
      <MapPin className="w-3.5 h-3.5" />
    </button>
  );
}

function QualityBadge({ quality }: { quality: 'full' | 'limited' | 'minimal' }) {
  return (
    <span className={cn(
      'badge font-medium',
      quality === 'full' && 'bg-green-100 text-green-700',
      quality === 'limited' && 'bg-yellow-100 text-yellow-700',
      quality === 'minimal' && 'bg-red-100 text-red-700'
    )}>
      {quality}
    </span>
  );
}

function ServiceBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="badge bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
      {children}
    </span>
  );
}

export type { ItineraryItemType };
