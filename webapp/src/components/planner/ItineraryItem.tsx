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
        <div className="w-6 h-6 flex items-center justify-center">
          <Home className="w-5 h-5 text-[var(--shelter-color)]" />
        </div>
        <div>
          <p className="font-medium text-sm">{shelter.name}</p>
          <p className="text-xs text-[var(--foreground-muted)]">
            Mile {formatMile(shelter.mile)} · {shelter.elevation.toLocaleString()} ft
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-wrap gap-1">
          {shelter.hasWater && (
            <span className="badge bg-[var(--water-color)]/15 text-[var(--water-color)]">Water</span>
          )}
          {shelter.hasPrivy && (
            <span className="badge bg-[var(--stone-light)]/30 text-[var(--stone)]">Privy</span>
          )}
          {shelter.isTenting && (
            <span className="badge bg-[var(--stone-light)]/30 text-[var(--stone)]">Tent</span>
          )}
          {shelter.isHammockFriendly && (
            <span className="badge bg-[var(--stone-light)]/30 text-[var(--stone)]">Hammock</span>
          )}
          {shelter.hasBearProtection && (
            <span className="badge bg-[var(--stone-light)]/30 text-[var(--stone)]">Bear</span>
          )}
          {shelter.hasShowers && (
            <span className="badge bg-[var(--water-color)]/15 text-[var(--water-color)]">Shower</span>
          )}
          {shelter.hasWarning && (
            <span className="badge bg-red-500/15 text-red-500">Warning</span>
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
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            <Package className={cn(
              'w-5 h-5',
              resupply.resupplyQuality === 'major_town' && 'text-[var(--category-major-town)]',
              resupply.resupplyQuality === 'trail_town' && 'text-[var(--category-trail-town)]',
              resupply.resupplyQuality === 'on_trail' && 'text-[var(--category-on-trail)]',
              resupply.resupplyQuality === 'limited' && 'text-[var(--category-limited)]'
            )} />
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
        <div className="w-6 h-6 flex items-center justify-center">
          <Info className="w-5 h-5 text-[var(--category-limited)]" />
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
  const styles = {
    major_town: 'bg-[var(--category-major-town-bg)] text-[var(--category-major-town)]',
    trail_town: 'bg-[var(--category-trail-town-bg)] text-[var(--category-trail-town)]',
    on_trail: 'bg-[var(--category-on-trail-bg)] text-[var(--category-on-trail)]',
    limited: 'bg-[var(--category-limited-bg)] text-[var(--category-limited)]',
  };
  return (
    <span className={cn('badge font-medium', styles[quality])}>
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
