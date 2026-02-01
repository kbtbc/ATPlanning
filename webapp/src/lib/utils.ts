import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMile(mile: number): string {
  return mile.toFixed(1);
}

export function formatElevation(elevation: number): string {
  return elevation.toLocaleString() + ' ft';
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    return Math.round(miles * 5280) + ' ft';
  }
  return miles.toFixed(1) + ' mi';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getWaypointTypeColor(type: string): string {
  const colors: Record<string, string> = {
    shelter: 'bg-[var(--shelter-color)]',
    resupply: 'bg-[var(--resupply-color)]',
    town: 'bg-[var(--town-color)]',
    water: 'bg-[var(--water-color)]',
    campsite: 'bg-[var(--campsite-color)]',
    feature: 'bg-[var(--feature-color)]',
    hostel: 'bg-[var(--resupply-color)]',
    post_office: 'bg-[var(--town-color)]',
  };
  return colors[type] || 'bg-gray-500';
}

export function getWaypointTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    shelter: 'Shelter',
    resupply: 'Resupply',
    town: 'Town',
    water: 'Water',
    campsite: 'Campsite',
    feature: 'Feature',
    hostel: 'Hostel',
    post_office: 'Post Office',
  };
  return labels[type] || type;
}

export function getResupplyQualityLabel(quality: string): string {
  const labels: Record<string, string> = {
    full: 'Full Resupply',
    limited: 'Limited',
    minimal: 'Minimal',
  };
  return labels[quality] || quality;
}

export function getResupplyQualityColor(quality: string): string {
  const colors: Record<string, string> = {
    full: 'text-green-600',
    limited: 'text-yellow-600',
    minimal: 'text-red-600',
  };
  return colors[quality] || 'text-gray-600';
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
