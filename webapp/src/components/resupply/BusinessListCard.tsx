import { cn } from '../../lib/utils';
import { getCategoryForType, getColorsForType, categoryLabels } from './businessCategories';
import type { Business } from '../../types';

interface BusinessListCardProps {
  business: Business;
  distanceInfo?: string; // e.g., "0.2 mi E"
  onViewDetails?: () => void;
}

// Build a robust summary line from business data
function buildSummaryLine(business: Business, distanceInfo?: string): string {
  const parts: string[] = [];

  // Distance info first
  if (distanceInfo) {
    parts.push(distanceInfo);
  }

  // Hours - extract key info
  if (business.hours) {
    // Shorten common patterns
    const hours = business.hours
      .replace('Check-in:', '')
      .replace('Check-out:', 'CO:')
      .trim();
    parts.push(hours);
  }

  // Pricing
  if (business.pricing) {
    parts.push(business.pricing);
  }

  // Key features from services
  if (business.services && business.services.length > 0) {
    const keyServices = business.services.filter(s =>
      ['shuttle', 'pet friendly', 'breakfast', 'laundry', 'parking'].some(k =>
        s.toLowerCase().includes(k)
      )
    );
    if (keyServices.length > 0) {
      // Capitalize first letter of each
      parts.push(...keyServices.slice(0, 2).map(s =>
        s.charAt(0).toUpperCase() + s.slice(1)
      ));
    }
  }

  // Extract key info from notes if we don't have much yet
  if (parts.length <= 2 && business.notes) {
    // Look for specific patterns
    const petMatch = business.notes.match(/pet\s*friendly/i);
    const shuttleMatch = business.notes.match(/shuttle/i);
    const breakfastMatch = business.notes.match(/breakfast/i);
    const openMatch = business.notes.match(/open\s+(\d+\s*(am|pm)?\s*[-–]\s*\d+\s*(am|pm)?)/i);

    if (petMatch && !parts.some(p => p.toLowerCase().includes('pet'))) {
      parts.push('Pet friendly');
    }
    if (shuttleMatch && !parts.some(p => p.toLowerCase().includes('shuttle'))) {
      parts.push('Shuttle available');
    }
    if (breakfastMatch && !parts.some(p => p.toLowerCase().includes('breakfast'))) {
      parts.push('Breakfast');
    }
    if (openMatch) {
      parts.push(`Open ${openMatch[1]}`);
    }

    // Special notes about packages/mail
    if (business.notes.toLowerCase().includes('holds packages') ||
        business.notes.toLowerCase().includes('general delivery')) {
      parts.push('Holds packages');
    }
  }

  return parts.join(' · ');
}

export function BusinessListCard({ business, distanceInfo, onViewDetails }: BusinessListCardProps) {
  const colors = getColorsForType(business.type);
  const category = getCategoryForType(business.type);
  const categoryLabel = categoryLabels[category] || 'SERVICES';
  const summaryLine = buildSummaryLine(business, distanceInfo);

  return (
    <button
      onClick={onViewDetails}
      className={cn(
        'w-full text-left group relative transition-all duration-200',
        onViewDetails && 'cursor-pointer hover:bg-[var(--background)]'
      )}
    >
      <div className="flex items-center gap-4 py-2.5">
        {/* Color dot indicator */}
        <div className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name and category badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--foreground)]">
              {business.name}
            </span>
            <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider shrink-0', colors.badge, colors.text)}>
              {categoryLabel}
            </span>
          </div>

          {/* Summary line - indented to align with name */}
          {summaryLine && (
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
              {summaryLine}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
