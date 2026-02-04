import type { BusinessType } from '../../types';

// Category colors - muted, sophisticated palette
export const categoryColors: Record<string, { dot: string; badge: string; text: string }> = {
  lodging: { dot: 'bg-sky-500', badge: 'bg-sky-500/15', text: 'text-sky-400' },
  food: { dot: 'bg-amber-500', badge: 'bg-amber-500/15', text: 'text-amber-400' },
  shuttles: { dot: 'bg-emerald-500', badge: 'bg-emerald-500/15', text: 'text-emerald-400' },
  services: { dot: 'bg-violet-500', badge: 'bg-violet-500/15', text: 'text-violet-400' },
};

// Map business types to display categories
export const typeToCategory: Record<BusinessType, string> = {
  hostel: 'lodging',
  lodging: 'lodging',
  camping: 'lodging',
  campground: 'lodging',
  shelter: 'lodging',
  restaurant: 'food',
  grocery: 'food',
  general_store: 'food',
  shuttle: 'shuttles',
  post_office: 'services',
  outfitter: 'services',
  laundry: 'services',
  medical: 'services',
  pharmacy: 'services',
  veterinary: 'services',
  hospital: 'services',
  library: 'services',
  services: 'services',
  visitor_center: 'services',
  activity: 'services',
  museum: 'services',
  kennel: 'services',
  shipping: 'services',
};

export const categoryLabels: Record<string, string> = {
  lodging: 'LODGING',
  food: 'FOOD',
  shuttles: 'SHUTTLES',
  services: 'SERVICES',
};

export function getCategoryForType(type: BusinessType): string {
  return typeToCategory[type] || 'services';
}

export function getColorsForType(type: BusinessType) {
  const category = getCategoryForType(type);
  return categoryColors[category] || categoryColors.services;
}
