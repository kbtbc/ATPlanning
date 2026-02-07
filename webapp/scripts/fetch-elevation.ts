/**
 * Fetch elevation data for GPX track points using Open-Elevation API
 *
 * This script:
 * 1. Parses the detailed GPX file (192k+ points)
 * 2. Samples points at regular intervals to reduce API calls
 * 3. Fetches elevation data from Open-Elevation API
 * 4. Generates a new elevation.ts file with high-resolution data
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface TrackPoint {
  lat: number;
  lon: number;
  mile?: number;
  elevation?: number;
}

interface ElevationPoint {
  mile: number;
  elevation: number;
  lat: number;
  lng: number;
}

// Haversine formula for distance calculation
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

// Parse GPX file and extract track points
function parseGPX(gpxContent: string): TrackPoint[] {
  const points: TrackPoint[] = [];
  const trkptRegex = /<trkpt lat="([^"]+)" lon="([^"]+)"\/>/g;

  let match;
  while ((match = trkptRegex.exec(gpxContent)) !== null) {
    points.push({
      lat: parseFloat(match[1]),
      lon: parseFloat(match[2])
    });
  }

  return points;
}

// Calculate cumulative miles for each point
function calculateMiles(points: TrackPoint[]): TrackPoint[] {
  let cumulativeMile = 0;

  return points.map((point, i) => {
    if (i > 0) {
      const prev = points[i - 1];
      cumulativeMile += haversineDistance(prev.lat, prev.lon, point.lat, point.lon);
    }
    return { ...point, mile: cumulativeMile };
  });
}

// Sample points at regular mile intervals
function samplePoints(points: TrackPoint[], intervalMiles: number): TrackPoint[] {
  const sampled: TrackPoint[] = [];
  let nextMile = 0;

  for (const point of points) {
    if (point.mile !== undefined && point.mile >= nextMile) {
      sampled.push(point);
      nextMile += intervalMiles;
    }
  }

  return sampled;
}

// Fetch elevation data from Open-Elevation API
async function fetchElevations(points: TrackPoint[]): Promise<TrackPoint[]> {
  const BATCH_SIZE = 100; // API accepts up to ~100 points per request
  const results: TrackPoint[] = [];

  console.log(`Fetching elevation for ${points.length} points in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    const locations = batch.map(p => ({ latitude: p.lat, longitude: p.lon }));

    try {
      console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(points.length / BATCH_SIZE)}...`);

      const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locations })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json() as { results: Array<{ latitude: number; longitude: number; elevation: number }> };

      batch.forEach((point, idx) => {
        results.push({
          ...point,
          elevation: Math.round(data.results[idx].elevation * 3.28084) // Convert meters to feet
        });
      });

      // Rate limiting - be nice to the free API
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`Error fetching batch: ${error}`);
      // Add points without elevation on error
      batch.forEach(point => results.push(point));
    }
  }

  return results;
}

// Generate TypeScript file with elevation data
function generateTypeScript(points: ElevationPoint[]): string {
  // Format points as TypeScript object literals (no quoted keys)
  const pointsStr = points.map(p =>
    `  { mile: ${p.mile}, elevation: ${p.elevation}, lat: ${p.lat}, lng: ${p.lng} }`
  ).join(',\n');

  return `/**
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
export const TRAIL_LENGTH = ${points.length > 0 ? points[points.length - 1].mile.toFixed(1) : 2197.9};

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
}

async function main() {
  const ACTUAL_TRAIL_LENGTH = 2197.4; // Official AT length
  const SAMPLE_INTERVAL = 0.5; // Sample every 0.5 miles for high resolution

  console.log('Reading GPX file...');
  const gpxPath = join(__dirname, '../src/data/appalachian-trail.gpx');
  const gpxContent = readFileSync(gpxPath, 'utf-8');

  console.log('Parsing GPX...');
  const rawPoints = parseGPX(gpxContent);
  console.log(`  Found ${rawPoints.length} track points`);

  console.log('Calculating cumulative miles...');
  const pointsWithMiles = calculateMiles(rawPoints);
  const calculatedLength = pointsWithMiles[pointsWithMiles.length - 1].mile || 0;
  console.log(`  Calculated trail length: ${calculatedLength.toFixed(1)} miles`);

  // Apply scale factor to match official trail length
  const scaleFactor = ACTUAL_TRAIL_LENGTH / calculatedLength;
  console.log(`  Scale factor: ${scaleFactor.toFixed(4)}`);

  const scaledPoints = pointsWithMiles.map(p => ({
    ...p,
    mile: (p.mile || 0) * scaleFactor
  }));

  console.log('Sampling points...');
  const sampledPoints = samplePoints(scaledPoints, SAMPLE_INTERVAL);
  console.log(`  Sampled ${sampledPoints.length} points (every ${SAMPLE_INTERVAL} miles)`);

  console.log('Fetching elevation data from Open-Elevation API...');
  const pointsWithElevation = await fetchElevations(sampledPoints);

  // Filter out points without elevation
  const validPoints: ElevationPoint[] = pointsWithElevation
    .filter(p => p.elevation !== undefined && p.mile !== undefined)
    .map(p => ({
      mile: Math.round((p.mile || 0) * 10) / 10,
      elevation: p.elevation || 0,
      lat: Math.round(p.lat * 10000) / 10000,
      lng: Math.round(p.lon * 10000) / 10000
    }));

  console.log(`Generated ${validPoints.length} elevation points`);

  console.log('Writing elevation.ts...');
  const outputPath = join(__dirname, '../src/data/elevation.ts');
  const tsContent = generateTypeScript(validPoints);
  writeFileSync(outputPath, tsContent);

  console.log('Done!');
  console.log(`  Output: ${outputPath}`);
  console.log(`  Points: ${validPoints.length}`);
  console.log(`  Trail length: ${validPoints[validPoints.length - 1]?.mile || 0} miles`);
}

main().catch(console.error);
