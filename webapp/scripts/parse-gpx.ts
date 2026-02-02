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

// Sample down to ~500 points for performance (every ~20th point)
const sampledData = elevationData.filter((_, i) => i % 20 === 0 || i === elevationData.length - 1);
console.log(`Sampled to ${sampledData.length} points`);

// Generate TypeScript file
const tsContent = `// Auto-generated elevation profile data from GPX
// Source: https://fastestknowntime.com/route/appalachian-trail
// ${sampledData.length} data points sampled from ${points.length} original points

export interface ElevationPoint {
  mile: number;      // Distance from Springer Mountain (NOBO)
  elevation: number; // Elevation in feet
  lat: number;
  lon: number;
}

export const elevationProfile: ElevationPoint[] = ${JSON.stringify(sampledData, null, 2)};

// Helper to get elevation at a specific mile
export function getElevationAtMile(mile: number): number {
  if (elevationProfile.length === 0) return 0;

  // Find the two closest points
  let closest = elevationProfile[0];
  let secondClosest = elevationProfile[1] || elevationProfile[0];

  for (const point of elevationProfile) {
    if (Math.abs(point.mile - mile) < Math.abs(closest.mile - mile)) {
      secondClosest = closest;
      closest = point;
    } else if (Math.abs(point.mile - mile) < Math.abs(secondClosest.mile - mile) && point !== closest) {
      secondClosest = point;
    }
  }

  // Linear interpolation
  if (closest.mile === secondClosest.mile) return closest.elevation;

  const ratio = (mile - closest.mile) / (secondClosest.mile - closest.mile);
  return Math.round(closest.elevation + ratio * (secondClosest.elevation - closest.elevation));
}

// Get elevation range for a mile range
export function getElevationRange(startMile: number, endMile: number): { min: number; max: number; points: ElevationPoint[] } {
  const points = elevationProfile.filter(p => p.mile >= startMile && p.mile <= endMile);
  if (points.length === 0) return { min: 0, max: 0, points: [] };

  const elevations = points.map(p => p.elevation);
  return {
    min: Math.min(...elevations),
    max: Math.max(...elevations),
    points,
  };
}

// Trail stats
export const ELEVATION_STATS = {
  minElevation: ${Math.min(...sampledData.map(p => p.elevation))},
  maxElevation: ${Math.max(...sampledData.map(p => p.elevation))},
  totalPoints: ${sampledData.length},
};
`;

writeFileSync('./src/data/elevation.ts', tsContent);
console.log('Generated src/data/elevation.ts');
