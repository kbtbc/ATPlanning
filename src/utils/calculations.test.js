import { describe, it, expect } from 'vitest'
import { calculateETA, calculateDistance, findNearestWaypoint } from './calculations'

describe('calculateETA', () => {
  it('should return start date if pace is 0', () => {
    const start = new Date('2023-01-01');
    const result = calculateETA(0, 10, 0, start);
    expect(result).toEqual(start);
  });

  it('should calculate correct date for 1 day travel', () => {
    const start = new Date('2023-01-01T00:00:00');
    // 15 miles at 15 mpd = 1 day
    const result = calculateETA(0, 15, 15, start);
    // Should be Jan 2
    const expected = new Date('2023-01-02T00:00:00');
    expect(result.getTime()).toBeCloseTo(expected.getTime(), -3); // Within a second (or close enough for float math)
  });

  it('should handle partial days', () => {
    const start = new Date('2023-01-01T00:00:00');
    // 7.5 miles at 15 mpd = 0.5 days
    const result = calculateETA(0, 7.5, 15, start);
    // Should be Jan 1 at 12:00
    const expected = new Date('2023-01-01T12:00:00');
    expect(result.getTime()).toBeCloseTo(expected.getTime(), -3);
  });
});

describe('calculateDistance (Haversine)', () => {
  it('should return 0 for same point', () => {
    const dist = calculateDistance(34.0, -84.0, 34.0, -84.0);
    expect(dist).toBe(0);
  });

  it('should calculate approximate distance between two points', () => {
    // New York to London approx distance, but let's do something smaller/verifiable.
    // 1 degree latitude is approx 111km (111,000 meters)
    const dist = calculateDistance(34.0, -84.0, 35.0, -84.0);
    expect(dist).toBeGreaterThan(110000);
    expect(dist).toBeLessThan(112000);
  });
});

describe('findNearestWaypoint', () => {
  const waypoints = [
    { name: 'A', lat: 34.0, lon: -84.0, mile: 0 },
    { name: 'B', lat: 35.0, lon: -84.0, mile: 100 },
  ];

  it('should find exact match', () => {
    const result = findNearestWaypoint(34.0, -84.0, waypoints);
    expect(result.name).toBe('A');
  });

  it('should find closer point', () => {
    // 34.1 is closer to 34.0 than 35.0
    const result = findNearestWaypoint(34.1, -84.0, waypoints);
    expect(result.name).toBe('A');

    // 34.9 is closer to 35.0
    const result2 = findNearestWaypoint(34.9, -84.0, waypoints);
    expect(result2.name).toBe('B');
  });
});
