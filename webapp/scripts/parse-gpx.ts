// Script to parse GPX file and generate elevation data
// Run with: bun run scripts/parse-gpx.ts

import { readFileSync, writeFileSync } from 'fs';

const gpxContent = readFileSync('./src/data/at-elevation.gpx', 'utf-8');

// Parse trackpoints
const trkptRegex = /<trkpt lat="([^"]+)" lon="([^"]+)"><ele>([^<]+)<\/ele><\/trkpt>/g;
const points: { lat: number; lon: number; ele: number }[] = [];

let match;
while ((match = trkptRegex.exec(gpxContent)) !== null) {
  points.push({
    lat: parseFloat(match[1]),
    lon: parseFloat(match[2]),
    ele: parseFloat(match[3]), // meters
  });
}

console.log(`Parsed ${points.length} points from GPX`);

// Calculate distance using Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate cumulative distance (mile marker) for each point
let cumulativeDistance = 0;
const rawElevationData: { mile: number; elevation: number; lat: number; lon: number }[] = [];

for (let i = 0; i < points.length; i++) {
  if (i > 0) {
    cumulativeDistance += haversineDistance(
      points[i - 1].lat, points[i - 1].lon,
      points[i].lat, points[i].lon
    );
  }

  // Convert elevation from meters to feet
  const elevationFeet = Math.round(points[i].ele * 3.28084);

  rawElevationData.push({
    mile: cumulativeDistance,
    elevation: elevationFeet,
    lat: points[i].lat,
    lon: points[i].lon,
  });
}

// Scale miles to match actual trail length (2197.4 miles)
const ACTUAL_TRAIL_LENGTH = 2197.4;
const scaleFactor = ACTUAL_TRAIL_LENGTH / cumulativeDistance;
console.log(`Scale factor: ${scaleFactor.toFixed(3)} (raw distance: ${cumulativeDistance.toFixed(1)} miles)`);

const elevationData = rawElevationData.map(p => ({
  ...p,
  mile: Math.round(p.mile * scaleFactor * 10) / 10,
}));

console.log(`Total trail length (scaled): ${elevationData[elevationData.length - 1].mile} miles`);
console.log(`First point: Mile ${elevationData[0].mile}, Elev ${elevationData[0].elevation} ft`);
console.log(`Last point: Mile ${elevationData[elevationData.length - 1].mile}, Elev ${elevationData[elevationData.length - 1].elevation} ft`);

// Sample down to ~2000 points for performance (every ~5th point)
const sampledData = elevationData.filter((_, i) => i % 5 === 0 || i === elevationData.length - 1);
console.log(`Sampled to ${sampledData.length} points`);

// Generate TypeScript file
const tsContent = `/**
 * High-resolution elevation profile for the Appalachian Trail
 * Auto-generated from GPX data with elevation from FKT
 * Source: https://fastestknowntime.com/route/appalachian-trail
 * ${sampledData.length} data points sampled from ${points.length} original points
 * Resolution: ~1 mile between points
 */

export interface ElevationPoint {
  mile: number;      // Distance from Springer Mountain (NOBO)
  elevation: number; // Elevation in feet
  lat: number;
  lng: number;
}

export const elevationProfile: ElevationPoint[] = [
${sampledData.map(p => `  { mile: ${p.mile}, elevation: ${p.elevation}, lat: ${Math.round(p.lat * 10000) / 10000}, lng: ${Math.round(p.lon * 10000) / 10000} }`).join(',\n')}
];

// Total trail length in miles
export const TRAIL_LENGTH = ${sampledData[sampledData.length - 1].mile};

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

writeFileSync('./src/data/elevation.ts', tsContent);
console.log('Generated src/data/elevation.ts');
