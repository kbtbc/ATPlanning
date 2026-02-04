import { Home, Package, Info, MapPin, ChevronRight } from 'lucide-react';
import { cn, formatMile } from '../../lib/utils';
import type { Shelter, ResupplyPoint, Waypoint } from '../../types';

type ItineraryItemType =
  | { type: 'shelter'; data: Shelter }
  | { type: 'resupply'; data: ResupplyPoint }
  | { type: 'feature'; data: Waypoint };

interface ItineraryItemProps {
  item: ItineraryItemType;
  onSetStart: (mile: number) => void;
  onResupplyClick?: (resupply: ResupplyPoint) => void;
}

export function ItineraryItem({ item, onSetStart, onResupplyClick }: ItineraryItemProps) {
  if (item.type === 'shelter') {
    return <ShelterItem shelter={item.data} onSetStart={onSetStart} />;
  }

  if (item.type === 'resupply') {
    return <ResupplyItem resupply={item.data} onSetStart={onSetStart} onResupplyClick={onResupplyClick} />;
  }

  if (item.type === 'feature') {
    return <FeatureItem feature={item.data} onSetStart={onSetStart} />;
  }

  return null;
}

function ShelterItem({ shelter, onSetStart }: { shelter: Shelter; onSetStart: (mile: number) => void }) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[var(--shelter-color)] flex items-center justify-center">
          <Home className="w-3 h-3 text-white" />
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

interface ResupplyItemProps {
  resupply: ResupplyPoint;
  onSetStart: (mile: number) => void;
  onResupplyClick?: (resupply: ResupplyPoint) => void;
}

function ResupplyItem({ resupply, onSetStart, onResupplyClick }: ResupplyItemProps) {
  const isClickable = !!onResupplyClick;

  const handleClick = () => {
    if (onResupplyClick) {
      onResupplyClick(resupply);
    }
  };

  return (
    <div
      className={cn(
        "card",
        isClickable && "cursor-pointer hover:bg-[var(--background)] transition-colors"
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
            resupply.resupplyQuality === 'major_town' && 'bg-green-500',
            resupply.resupplyQuality === 'trail_town' && 'bg-blue-500',
            resupply.resupplyQuality === 'on_trail' && 'bg-purple-500',
            resupply.resupplyQuality === 'limited' && 'bg-yellow-500'
          )}>
            <Package className="w-3 h-3 text-white" />
          </div>
          <div>
            <p className="font-medium text-sm">{resupply.name}</p>
            <p className="text-xs text-[var(--foreground-muted)]">
              Mile {formatMile(resupply.mile)}
              {resupply.distanceFromTrail > 0 && ` · ${resupply.distanceFromTrail} mi ${resupply.directionFromTrail || ''}`.trim()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QualityBadge quality={resupply.resupplyQuality} />
          {isClickable ? (
            <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
          ) : (
            <SetStartButton onClick={(e) => { e.stopPropagation(); onSetStart(resupply.mile); }} />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-1.5 ml-8">
        {resupply.hasGrocery && <ServiceBadge>Grocery</ServiceBadge>}
        {resupply.hasPostOffice && <ServiceBadge>Post Office</ServiceBadge>}
        {resupply.hasLodging && <ServiceBadge>Lodging</ServiceBadge>}
        {resupply.hasRestaurant && <ServiceBadge>Food</ServiceBadge>}
        {resupply.hasShower && <ServiceBadge>Shower</ServiceBadge>}
      </div>
      {resupply.notes && (
        <p className="text-xs text-[var(--foreground-muted)] mt-1.5 ml-8 italic">{resupply.notes}</p>
      )}
    </div>
  );
}

function FeatureItem({ feature, onSetStart }: { feature: Waypoint; onSetStart: (mile: number) => void }) {
  return (
    <div className="card flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[var(--feature-color)] flex items-center justify-center">
          <Info className="w-3 h-3 text-white" />
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

function SetStartButton({ onClick }: { onClick: (e: React.MouseEvent) => void }) {
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

function QualityBadge({ quality }: { quality: 'major_town' | 'trail_town' | 'on_trail' | 'limited' }) {
  const labels = {
    major_town: 'Major Town',
    trail_town: 'Trail Town',
    on_trail: 'On Trail',
    limited: 'Limited',
  };
  return (
    <span className={cn(
      'badge font-medium',
      quality === 'major_town' && 'bg-green-100 text-green-700',
      quality === 'trail_town' && 'bg-blue-100 text-blue-700',
      quality === 'on_trail' && 'bg-purple-100 text-purple-700',
      quality === 'limited' && 'bg-yellow-100 text-yellow-700'
    )}>
      {labels[quality]}
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
