import { addDays, startOfDay } from 'date-fns';

export function calculateETA(currentMile, targetMile, pace, startDate) {
  if (pace <= 0) return startDate;

  const distance = Math.max(0, targetMile - currentMile);
  const days = distance / pace;

  // Assuming startDate is a Date object
  // adding fractional days adds hours/minutes, but usually hikers think in days.
  // We can round to nearest day or just add the time.
  // For planning, showing the "Day # of hike" and the calendar date is useful.
  // Let's just add the float days to the date for now.

  // date-fns addDays takes an integer, so we might need to add milliseconds manually
  // or use a different logic if we want "End of Day X".
  // Let's keep it simple: add 24 hours * days.

  const resultDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  return resultDate;
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180; // φ, λ in radians
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const d = R * c; // in metres
  return d;
}

export function findNearestWaypoint(lat, lon, waypoints) {
  let nearest = null;
  let minDistance = Infinity;

  waypoints.forEach(wp => {
    const dist = calculateDistance(lat, lon, wp.lat, wp.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = wp;
    }
  });

  return nearest;
}
