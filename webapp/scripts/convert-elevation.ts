/**
 * Convert existing elevation JSON to cleaner TypeScript format
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read current elevation data (extract just the array part)
const filePath = join(__dirname, '../src/data/elevation.ts');
const content = readFileSync(filePath, 'utf-8');

// Extract the array from the file
const arrayMatch = content.match(/export const elevationProfile: ElevationPoint\[\] = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
  console.error('Could not find elevationProfile array');
  process.exit(1);
}

// Parse the array (it's valid JSON)
const points = JSON.parse(arrayMatch[1]);
console.log(`Found ${points.length} points`);

// Format points as TypeScript object literals (no quoted keys)
const pointsStr = points.map((p: { mile: number; elevation: number; lat: number; lng: number }) =>
  `  { mile: ${p.mile}, elevation: ${p.elevation}, lat: ${p.lat}, lng: ${p.lng} }`
).join(',\n');

const lastPoint = points[points.length - 1];

const output = `/**
 * High-resolution elevation profile for the Appalachian Trail
 * Auto-generated from GPX data with elevation from Open-Elevation API
 * Total points: ${points.length}
 * Resolution: ~0.5 miles between points
 */

export interface ElevationPoint {
  mile: number;
  elevation: number;
  lat: number;
  lng: number;
}

export const elevationProfile: ElevationPoint[] = [
${pointsStr}
];

// Total trail length in miles
export const TRAIL_LENGTH = ${lastPoint.mile};

/**
 * Get elevation at a specific mile marker using linear interpolation
 */
export function getElevationAtMile(mile: number): number {
  if (elevationProfile.length === 0) return 3000;

  // Handle edge cases
  if (mile <= elevationProfile[0].mile) return elevationProfile[0].elevation;
  if (mile >= elevationProfile[elevationProfile.length - 1].mile) {
    return elevationProfile[elevationProfile.length - 1].elevation;
  }

  // Binary search for the closest points
  let low = 0;
  let high = elevationProfile.length - 1;

  while (low < high - 1) {
    const mid = Math.floor((low + high) / 2);
    if (elevationProfile[mid].mile <= mile) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Linear interpolation between the two closest points
  const p1 = elevationProfile[low];
  const p2 = elevationProfile[high];
  const ratio = (mile - p1.mile) / (p2.mile - p1.mile);

  return Math.round(p1.elevation + ratio * (p2.elevation - p1.elevation));
}

/**
 * Get elevation data for a range of miles
 */
export function getElevationRange(startMile: number, endMile: number): {
  min: number;
  max: number;
  points: ElevationPoint[];
} {
  const points = elevationProfile.filter(p => p.mile >= startMile && p.mile <= endMile);

  if (points.length === 0) {
    return { min: 1000, max: 6000, points: [] };
  }

  const elevations = points.map(p => p.elevation);
  return {
    min: Math.min(...elevations),
    max: Math.max(...elevations),
    points
  };
}
`;

writeFileSync(filePath, output);
console.log('Converted elevation.ts to cleaner TypeScript format');
console.log(`Trail length: ${lastPoint.mile} miles`);
