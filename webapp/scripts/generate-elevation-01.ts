/**
 * Generate high-resolution elevation profile at 0.1-mile intervals
 *
 * Steps:
 * 1. Parse all ~9,928 trackpoints from the FKT GPX file
 * 2. Calculate cumulative Haversine distances
 * 3. Scale to official 2026 trail length (2,197.9 miles)
 * 4. Add approach trail data (mile -8.5 to 0)
 * 5. Interpolate to exact 0.1-mile intervals
 * 6. Write elevation.ts with ~22,064 evenly-spaced points
 *
 * Run with: bun run scripts/generate-elevation-01.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const NEW_TRAIL_LENGTH = 2197.9;
const INTERVAL = 0.1; // miles between points

// --- Haversine ---
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// --- Parse GPX ---
const gpxPath = join(__dirname, '../src/data/at-elevation.gpx');
const gpxContent = readFileSync(gpxPath, 'utf-8');

const trkptRegex = /<trkpt lat="([^"]+)" lon="([^"]+)"><ele>([^<]+)<\/ele><\/trkpt>/g;
const rawPoints: { lat: number; lon: number; eleFeet: number }[] = [];
let m;
while ((m = trkptRegex.exec(gpxContent)) !== null) {
  rawPoints.push({
    lat: parseFloat(m[1]),
    lon: parseFloat(m[2]),
    eleFeet: Math.round(parseFloat(m[3]) * 3.28084), // meters → feet
  });
}
console.log(`Parsed ${rawPoints.length} trackpoints from GPX`);

// --- Cumulative distance ---
let cumDist = 0;
const rawWithMile = rawPoints.map((p, i) => {
  if (i > 0) {
    cumDist += haversineDistance(
      rawPoints[i - 1].lat, rawPoints[i - 1].lon,
      p.lat, p.lon
    );
  }
  return { ...p, rawMile: cumDist };
});

const rawTrailLength = cumDist;
const scaleFactor = NEW_TRAIL_LENGTH / rawTrailLength;
console.log(`Raw distance: ${rawTrailLength.toFixed(1)} mi, scale factor: ${scaleFactor.toFixed(4)}`);

// Scale all miles
const scaled = rawWithMile.map(p => ({
  mile: p.rawMile * scaleFactor,
  elevation: p.eleFeet,
  lat: p.lat,
  lon: p.lon,
}));

console.log(`Scaled range: ${scaled[0].mile.toFixed(1)} to ${scaled[scaled.length - 1].mile.toFixed(1)} mi`);

// --- Approach trail (manually defined, same as before) ---
const approachTrail = [
  { mile: -8.5, elevation: 1700, lat: 34.5611, lon: -84.2481 },
  { mile: -8.0, elevation: 1900, lat: 34.5650, lon: -84.2450 },
  { mile: -7.5, elevation: 2100, lat: 34.5680, lon: -84.2420 },
  { mile: -7.0, elevation: 2300, lat: 34.5720, lon: -84.2380 },
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

// Combine approach + main trail (all raw points, sorted by mile)
const allRaw = [...approachTrail, ...scaled].sort((a, b) => a.mile - b.mile);
console.log(`Total raw points (approach + main): ${allRaw.length}`);

// --- Interpolate to exact 0.1-mile intervals ---
interface ElevPoint { mile: number; elevation: number; lat: number; lng: number }

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const interpolated: ElevPoint[] = [];
let rawIdx = 0;

// Start at -8.5, end at 2197.9
const startMile = -8.5;
const endMile = NEW_TRAIL_LENGTH;
const totalSteps = Math.round((endMile - startMile) / INTERVAL);

for (let step = 0; step <= totalSteps; step++) {
  const targetMile = Math.round((startMile + step * INTERVAL) * 10) / 10;

  // Advance rawIdx so allRaw[rawIdx] <= targetMile < allRaw[rawIdx+1]
  while (rawIdx < allRaw.length - 2 && allRaw[rawIdx + 1].mile < targetMile) {
    rawIdx++;
  }

  const p1 = allRaw[rawIdx];
  const p2 = allRaw[Math.min(rawIdx + 1, allRaw.length - 1)];

  if (p1.mile === p2.mile) {
    // Exact point
    interpolated.push({
      mile: targetMile,
      elevation: p1.elevation,
      lat: Math.round(p1.lat * 10000) / 10000,
      lng: Math.round((p1.lon !== undefined ? p1.lon : 0) * 10000) / 10000,
    });
  } else {
    const t = (targetMile - p1.mile) / (p2.mile - p1.mile);
    const clampedT = Math.max(0, Math.min(1, t));
    interpolated.push({
      mile: targetMile,
      elevation: Math.round(lerp(p1.elevation, p2.elevation, clampedT)),
      lat: Math.round(lerp(p1.lat, p2.lat, clampedT) * 10000) / 10000,
      lng: Math.round(lerp(
        p1.lon !== undefined ? p1.lon : 0,
        p2.lon !== undefined ? p2.lon : 0,
        clampedT
      ) * 10000) / 10000,
    });
  }
}

console.log(`Interpolated to ${interpolated.length} points at ${INTERVAL}-mile intervals`);
console.log(`  First: mile ${interpolated[0].mile}, elev ${interpolated[0].elevation} ft`);
console.log(`  Last:  mile ${interpolated[interpolated.length - 1].mile}, elev ${interpolated[interpolated.length - 1].elevation} ft`);

// --- Generate TypeScript ---
const pointsStr = interpolated.map(p =>
  `  { mile: ${p.mile}, elevation: ${p.elevation}, lat: ${p.lat}, lng: ${p.lng} }`
).join(',\n');

const tsContent = `/**
 * High-resolution elevation profile for the Appalachian Trail
 * Auto-generated from GPX data with elevation from FKT
 * Source: https://fastestknowntime.com/route/appalachian-trail
 * ${interpolated.length} data points (includes approach trail from Amicalola Falls)
 * Resolution: 0.1 miles between points
 * Mile -8.5 = Amicalola Falls Visitor Center (approach trail start)
 * Mile 0 = Springer Mountain (official AT southern terminus)
 * Mile 2197.9 = Mt. Katahdin (northern terminus)
 * Official 2026 AT length: 2,197.9 miles (https://appalachiantrail.org/news-stories/2026-official-mileage/)
 */

export interface ElevationPoint {
  mile: number;      // Distance from Springer Mountain (negative = approach trail)
  elevation: number; // Elevation in feet
  lat: number;
  lng: number;
}

export const elevationProfile: ElevationPoint[] = [
${pointsStr}
];

// Trail boundaries
export const APPROACH_TRAIL_START = -8.5; // Amicalola Falls
export const TRAIL_START = 0; // Springer Mountain
export const TRAIL_END = ${NEW_TRAIL_LENGTH}; // Mt. Katahdin
export const TRAIL_LENGTH = ${NEW_TRAIL_LENGTH}; // Official 2026 AT length

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

const outPath = join(__dirname, '../src/data/elevation.ts');
writeFileSync(outPath, tsContent);
console.log(`\nWrote ${outPath}`);
console.log(`File size: ~${(tsContent.length / 1024).toFixed(0)} KB`);
