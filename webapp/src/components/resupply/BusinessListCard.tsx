import { Phone, MapPin, Globe, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCategoryForType, getColorsForType, categoryLabels } from './businessCategories';
import type { Business } from '../../types';

interface BusinessListCardProps {
  business: Business;
  distanceInfo?: string; // e.g., "0.2 mi E"
  onViewDetails?: () => void;
}

function buildSummaryLine(business: Business, distanceInfo?: string): string {
  const parts: string[] = [];

  // Distance info first
  if (distanceInfo) {
    parts.push(distanceInfo);
  }

  // Hours
  if (business.hours) {
    parts.push(business.hours);
  }

  // Pricing
  if (business.pricing) {
    parts.push(business.pricing);
  }

  // Key services or notes (abbreviated)
  if (business.services?.includes('shuttle')) {
    parts.push('Shuttle available');
  }

  // If no specific info, use a truncated note
  if (parts.length <= 1 && business.notes) {
    const shortNote = business.notes.split('.')[0];
    if (shortNote.length < 40) {
      parts.push(shortNote);
    }
  }

  return parts.join(' · ');
}

export function BusinessListCard({ business, distanceInfo, onViewDetails }: BusinessListCardProps) {
  const colors = getColorsForType(business.type);
  const category = getCategoryForType(business.type);
  const categoryLabel = categoryLabels[category] || 'SERVICES';
  const summaryLine = buildSummaryLine(business, distanceInfo);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.phone) {
      window.open(`tel:${business.phone.replace(/\D/g, '')}`);
    }
  };

  const handleMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.googleMapsUrl) {
      window.open(business.googleMapsUrl, '_blank');
    } else if (business.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(business.address)}`, '_blank');
    }
  };

  const handleWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  return (
    <div
      onClick={onViewDetails}
      className={cn(
        'group relative bg-[var(--background-secondary)] rounded-lg border border-[var(--border)] overflow-hidden transition-all duration-200',
        onViewDetails && 'cursor-pointer hover:border-[var(--primary)]/40 hover:bg-[var(--background)]'
      )}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Color dot indicator */}
        <div className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and category badge */}
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="font-medium text-sm text-[var(--foreground)] truncate">
              {business.name}
            </h4>
            <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider shrink-0', colors.badge, colors.text)}>
              {categoryLabel}
            </span>
          </div>

          {/* Summary line */}
          {summaryLine && (
            <p className="text-xs text-[var(--foreground-muted)] truncate">
              {summaryLine}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {business.phone && (
            <button
              onClick={handleCall}
              className="p-2 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--primary)] transition-colors"
              aria-label={`Call ${business.name}`}
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          {(business.googleMapsUrl || business.address) && (
            <button
              onClick={handleMap}
              className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--accent)] transition-colors"
              aria-label={`Open ${business.name} in Maps`}
            >
              <MapPin className="w-4 h-4" />
            </button>
          )}
          {business.website && (
            <button
              onClick={handleWebsite}
              className="p-2 rounded-lg hover:bg-[var(--foreground)]/10 text-[var(--foreground-muted)] transition-colors"
              aria-label={`Visit ${business.name} website`}
            >
              <Globe className="w-4 h-4" />
            </button>
          )}
          {onViewDetails && (
            <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}

