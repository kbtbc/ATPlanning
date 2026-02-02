import type { Waypoint, Shelter, ResupplyPoint } from '../types';
import { shelters, SHELTER_COUNT, TRAIL_LENGTH, AT_STATES, STATE_BOUNDARIES } from './shelters';
import { resupplyPoints, RESUPPLY_COUNT } from './resupply';
import { features, FEATURE_COUNT } from './features';

// Combine all waypoints
export const allWaypoints: Waypoint[] = [
  ...shelters,
  ...resupplyPoints,
  ...features,
].sort((a, b) => a.mile - b.mile);

// Export individual datasets
export { shelters, resupplyPoints, features };
export { SHELTER_COUNT, RESUPPLY_COUNT, FEATURE_COUNT, TRAIL_LENGTH, AT_STATES, STATE_BOUNDARIES };

// Helper functions
export function getWaypointsByState(state: string): Waypoint[] {
  return allWaypoints.filter(w => w.state === state);
}

export function getWaypointsByType(type: Waypoint['type']): Waypoint[] {
  return allWaypoints.filter(w => w.type === type);
}

export function getWaypointsInRange(startMile: number, endMile: number): Waypoint[] {
  return allWaypoints.filter(w => w.mile >= startMile && w.mile <= endMile);
}

export function getSheltersInRange(startMile: number, endMile: number): Shelter[] {
  return shelters.filter(s => s.mile >= startMile && s.mile <= endMile);
}

export function getResupplyInRange(startMile: number, endMile: number): ResupplyPoint[] {
  return resupplyPoints.filter(r => r.mile >= startMile && r.mile <= endMile);
}

export function getFeaturesInRange(startMile: number, endMile: number): Waypoint[] {
  return features.filter(f => f.mile >= startMile && f.mile <= endMile);
}

export function getNearestWaypoint(mile: number): Waypoint | null {
  if (allWaypoints.length === 0) return null;

  return allWaypoints.reduce((nearest, waypoint) => {
    const currentDiff = Math.abs(waypoint.mile - mile);
    const nearestDiff = Math.abs(nearest.mile - mile);
    return currentDiff < nearestDiff ? waypoint : nearest;
  });
}

export function getNearestShelter(mile: number, direction: 'ahead' | 'behind' | 'nearest' = 'nearest'): Shelter | null {
  if (shelters.length === 0) return null;

  if (direction === 'ahead') {
    const ahead = shelters.filter(s => s.mile > mile);
    return ahead.length > 0 ? ahead[0] : null;
  }

  if (direction === 'behind') {
    const behind = shelters.filter(s => s.mile < mile);
    return behind.length > 0 ? behind[behind.length - 1] : null;
  }

  return shelters.reduce((nearest, shelter) => {
    const currentDiff = Math.abs(shelter.mile - mile);
    const nearestDiff = Math.abs(nearest.mile - mile);
    return currentDiff < nearestDiff ? shelter : nearest;
  });
}

export function getNearestResupply(mile: number, direction: 'ahead' | 'behind' | 'nearest' = 'nearest'): ResupplyPoint | null {
  if (resupplyPoints.length === 0) return null;

  if (direction === 'ahead') {
    const ahead = resupplyPoints.filter(r => r.mile > mile);
    return ahead.length > 0 ? ahead[0] : null;
  }

  if (direction === 'behind') {
    const behind = resupplyPoints.filter(r => r.mile < mile);
    return behind.length > 0 ? behind[behind.length - 1] : null;
  }

  return resupplyPoints.reduce((nearest, resupply) => {
    const currentDiff = Math.abs(resupply.mile - mile);
    const nearestDiff = Math.abs(nearest.mile - mile);
    return currentDiff < nearestDiff ? resupply : nearest;
  });
}

export function getStateAtMile(mile: number): string {
  for (const [state, bounds] of Object.entries(STATE_BOUNDARIES)) {
    if (mile >= bounds.start && mile <= bounds.end) {
      return state;
    }
  }
  return 'Unknown';
}

export function getMileToKatahdin(mile: number): number {
  return TRAIL_LENGTH - mile;
}

export function getMileFromSpringer(mile: number): number {
  return mile;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the nearest trail mile given GPS coordinates
export function findNearestMileFromCoordinates(lat: number, lng: number): { mile: number; waypoint: Waypoint; distance: number } | null {
  if (allWaypoints.length === 0) return null;

  let nearest = allWaypoints[0];
  let minDistance = calculateDistance(lat, lng, nearest.lat, nearest.lng);

  for (const waypoint of allWaypoints) {
    const distance = calculateDistance(lat, lng, waypoint.lat, waypoint.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = waypoint;
    }
  }

  return {
    mile: nearest.mile,
    waypoint: nearest,
    distance: minDistance
  };
}

// Generate hiking plan based on daily mileage
export function generateHikePlan(
  startMile: number,
  targetMilesPerDay: number,
  daysAhead: number,
  direction: 'NOBO' | 'SOBO' = 'NOBO'
): Array<{
  day: number;
  startMile: number;
  endMile: number;
  shelters: Shelter[];
  resupply: ResupplyPoint[];
  features: Waypoint[];
}> {
  const plan = [];
  let currentMile = startMile;

  for (let day = 1; day <= daysAhead; day++) {
    const dayEndMile = direction === 'NOBO'
      ? Math.min(currentMile + targetMilesPerDay, TRAIL_LENGTH)
      : Math.max(currentMile - targetMilesPerDay, 0);

    const [rangeStart, rangeEnd] = direction === 'NOBO'
      ? [currentMile, dayEndMile]
      : [dayEndMile, currentMile];

    plan.push({
      day,
      startMile: currentMile,
      endMile: dayEndMile,
      shelters: getSheltersInRange(rangeStart, rangeEnd),
      resupply: getResupplyInRange(rangeStart, rangeEnd),
      features: features.filter(f => f.mile >= rangeStart && f.mile <= rangeEnd),
    });

    currentMile = dayEndMile;

    // Stop if we've reached the end
    if ((direction === 'NOBO' && currentMile >= TRAIL_LENGTH) ||
        (direction === 'SOBO' && currentMile <= 0)) {
      break;
    }
  }

  return plan;
}

// Trail stats
export const trailStats = {
  totalLength: TRAIL_LENGTH,
  shelterCount: SHELTER_COUNT,
  resupplyCount: RESUPPLY_COUNT,
  featureCount: FEATURE_COUNT,
  stateCount: AT_STATES.length,
  states: AT_STATES,
};
