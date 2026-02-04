import { cn } from '../../lib/utils';
import { getColorsForType, getLabelForType } from './businessCategories';
import type { Business } from '../../types';

interface BusinessListCardProps {
  business: Business;
  distanceInfo?: string; // e.g., "0.2 mi E"
  onViewDetails?: () => void;
}

// Build a robust summary line from business data
function buildSummaryLine(business: Business, distanceInfo?: string): string {
  const parts: string[] = [];

  // Distance info first (if provided)
  if (distanceInfo) {
    parts.push(distanceInfo);
  }

  // Pricing is always useful
  if (business.pricing) {
    parts.push(business.pricing);
  }

  // For shuttles, restaurants, stores - notes are the most important
  // Pull key info from notes first
  if (business.notes) {
    // Clean up notes - remove location info that's redundant with distanceInfo
    let cleanNotes = business.notes
      .replace(/Located\s+\d+\.?\d*\s*[EW]\s*(from trail)?\.?\s*/gi, '')
      .replace(/In town\.?\s*/gi, '')
      .replace(/On trail\.?\s*/gi, '')
      .trim();

    // For shuttles, show the full notes (owner info, availability, etc.)
    if (business.type === 'shuttle') {
      if (cleanNotes) {
        parts.push(cleanNotes);
      }
    } else {
      // For other types, extract key highlights
      const highlights: string[] = [];

      // Pet friendly
      if (/pet\s*friendly/i.test(cleanNotes)) {
        highlights.push('Pet friendly');
        cleanNotes = cleanNotes.replace(/pet\s*friendly[,.]?\s*/gi, '');
      }

      // Breakfast included
      if (/breakfast/i.test(cleanNotes) && !/no breakfast/i.test(cleanNotes)) {
        highlights.push('Breakfast');
      }

      // Restaurant on-site
      if (/restaurant\s*(on[- ]?site)?/i.test(cleanNotes)) {
        highlights.push('Restaurant');
      }

      // WiFi
      if (/wifi|wi-fi/i.test(cleanNotes)) {
        highlights.push('WiFi');
      }

      // Laundry
      if (/laundry/i.test(cleanNotes)) {
        highlights.push('Laundry');
      }

      // Shuttle available (we're already in the non-shuttle branch)
      if (/shuttle/i.test(cleanNotes)) {
        highlights.push('Shuttle');
      }

      // Resupply
      if (/resupply/i.test(cleanNotes)) {
        highlights.push('Resupply');
      }

      // Slackpacking
      if (/slackpack/i.test(cleanNotes)) {
        highlights.push('Slackpacking');
      }

      // AT Passport
      if (/AT Passport/i.test(cleanNotes)) {
        highlights.push('AT Passport');
      }

      // Coleman fuel
      if (/coleman\s*fuel/i.test(cleanNotes)) {
        highlights.push('Coleman fuel');
      }

      // Full menu / food
      if (/full menu/i.test(cleanNotes)) {
        highlights.push('Full menu');
      }

      // General Delivery / holds packages
      if (/general\s*delivery/i.test(cleanNotes) || /holds\s*packages/i.test(cleanNotes)) {
        highlights.push('Holds packages');
      }

      // Year round
      if (/year\s*round|open\s*year/i.test(cleanNotes)) {
        highlights.push('Open year round');
      }

      // Thru-hiker owned
      if (/thru[- ]?hiker\s*owned/i.test(cleanNotes)) {
        highlights.push('Thru-hiker owned');
      }

      // Add highlights
      parts.push(...highlights.slice(0, 4)); // Limit to 4 highlights
    }
  }

  // Hours - but shortened
  if (business.hours && parts.length < 3) {
    const hours = business.hours
      .replace('Check-in:', 'CI:')
      .replace('Check-out:', 'CO:')
      .trim();
    // Only add if not too long
    if (hours.length < 30) {
      parts.push(hours);
    }
  }

  // If we still don't have much, pull from services
  if (parts.length < 2 && business.services && business.services.length > 0) {
    const usefulServices = business.services.filter(s =>
      !['hostel', 'lodging', 'shuttle', 'services', 'post_office', 'general_store', 'restaurant', 'grocery'].includes(s.toLowerCase())
    );
    if (usefulServices.length > 0) {
      parts.push(...usefulServices.slice(0, 2).map(s =>
        s.charAt(0).toUpperCase() + s.slice(1)
      ));
    }
  }

  return parts.join(' · ');
}

export function BusinessListCard({ business, distanceInfo, onViewDetails }: BusinessListCardProps) {
  const colors = getColorsForType(business.type);
  const typeLabel = getLabelForType(business.type);
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
              {typeLabel}
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
