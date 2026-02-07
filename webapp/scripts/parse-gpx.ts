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

// Scale miles to match actual trail length (2197.9 miles - official 2026 AT length)
const ACTUAL_TRAIL_LENGTH = 2197.9;
const scaleFactor = ACTUAL_TRAIL_LENGTH / cumulativeDistance;
console.log(`Scale factor: ${scaleFactor.toFixed(3)} (raw distance: ${cumulativeDistance.toFixed(1)} miles)`);

const elevationData = rawElevationData.map(p => ({
  ...p,
  mile: Math.round(p.mile * scaleFactor * 10) / 10,
}));

console.log(`Total trail length (scaled): ${elevationData[elevationData.length - 1].mile} miles`);
console.log(`First point: Mile ${elevationData[0].mile}, Elev ${elevationData[0].elevation} ft`);
console.log(`Last point: Mile ${elevationData[elevationData.length - 1].mile}, Elev ${elevationData[elevationData.length - 1].elevation} ft`);

// Sample every 2nd point for ~0.5 mile resolution
const sampledData = elevationData.filter((_, i) => i % 2 === 0 || i === elevationData.length - 1);
console.log(`Sampled to ${sampledData.length} points`);

// Add Amicalola Falls approach trail data (8.5 miles before Springer)
// Elevation data approximated from trail guides
const approachTrail: { mile: number; elevation: number; lat: number; lon: number }[] = [
  { mile: -8.5, elevation: 1700, lat: 34.5611, lon: -84.2481 }, // Amicalola Falls Visitor Center
  { mile: -8.0, elevation: 1900, lat: 34.5650, lon: -84.2450 },
  { mile: -7.5, elevation: 2100, lat: 34.5680, lon: -84.2420 },
  { mile: -7.0, elevation: 2300, lat: 34.5720, lon: -84.2380 }, // Top of falls
  { mile: -6.5, elevation: 2450, lat: 34.5760, lon: -84.2340 },
  { mile: -6.0, elevation: 2600, lat: 34.5800, lon: -84.2300 },
  { mile: -5.5, elevation: 2750, lat: 34.5840, lon: -84.2260 },
  { mile: -5.0, elevation: 2900, lat: 34.5880, lon: -84.2220 },
  { mile: -4.5, elevation: 3050, lat: 34.5920, lon: -84.2180 },
  { mile: -4.0, elevation: 3150, lat: 34.5960, lon: -84.2140 },
  { mile: -3.5, elevation: 3250, lat: 34.6000, lon: -84.2100 },
  { mile: -3.0, elevation: 3350, lat: 34.6040, lon: -84.2060 },
  { mile: -2.5, elevation: 3450, lat: 34.6080, lon: -84.2020 },
  { mile: -2.0, elevation: 3520, lat: 34.6120, lon: -84.1980 },
  { mile: -1.5, elevation: 3580, lat: 34.6160, lon: -84.1960 },
  { mile: -1.0, elevation: 3650, lat: 34.6200, lon: -84.1950 },
  { mile: -0.5, elevation: 3700, lat: 34.6240, lon: -84.1945 },
];

// Combine approach trail with main trail
const fullData = [...approachTrail, ...sampledData];
console.log(`Total with approach trail: ${fullData.length} points`);

// Generate TypeScript file
const tsContent = `/**
 * High-resolution elevation profile for the Appalachian Trail
 * Auto-generated from GPX data with elevation from FKT
 * Source: https://fastestknowntime.com/route/appalachian-trail
 * ${fullData.length} data points (includes approach trail from Amicalola Falls)
 * Resolution: ~0.5 miles between points
 * Mile -8.5 = Amicalola Falls Visitor Center (approach trail start)
 * Mile 0 = Springer Mountain (official AT southern terminus)
 * Mile 2197.9 = Mt. Katahdin (northern terminus)
 */

export interface ElevationPoint {
  mile: number;      // Distance from Springer Mountain (negative = approach trail)
  elevation: number; // Elevation in feet
  lat: number;
  lng: number;
}

export const elevationProfile: ElevationPoint[] = [
${fullData.map(p => `  { mile: ${p.mile}, elevation: ${p.elevation}, lat: ${Math.round(p.lat * 10000) / 10000}, lng: ${Math.round(p.lon * 10000) / 10000} }`).join(',\n')}
];

// Trail boundaries
export const APPROACH_TRAIL_START = -8.5; // Amicalola Falls
export const TRAIL_START = 0; // Springer Mountain
export const TRAIL_END = ${sampledData[sampledData.length - 1].mile}; // Mt. Katahdin
export const TRAIL_LENGTH = ${sampledData[sampledData.length - 1].mile}; // Official AT length

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
