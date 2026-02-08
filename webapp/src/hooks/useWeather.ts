import { useState, useCallback } from 'react';
import { fetchWeather } from '../lib/weather';
import { getElevationAtMile, elevationProfile } from '../data/elevation';
import { allWaypoints, TRAIL_LENGTH } from '../data';
import type { WeatherData, WeatherLocation } from '../lib/weather';
import type { Waypoint } from '../types';

export type LocationMode = 'gps' | 'waypoint' | 'mile';

interface UseWeatherState {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  location: WeatherLocation | null;
  locationMode: LocationMode;
}

export function useWeather() {
  const [state, setState] = useState<UseWeatherState>({
    weather: null,
    loading: false,
    error: null,
    location: null,
    locationMode: 'mile',
  });

  const fetchForLocation = useCallback(async (location: WeatherLocation) => {
    setState(prev => ({ ...prev, loading: true, error: null, location }));
    try {
      const weather = await fetchWeather(location);
      setState(prev => ({ ...prev, weather, loading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch weather';
      setState(prev => ({ ...prev, error: message, loading: false }));
    }
  }, []);

  const fetchForMile = useCallback((mile: number) => {
    const clampedMile = Math.max(-8.5, Math.min(TRAIL_LENGTH, mile));
    const elevation = getElevationAtMile(clampedMile);

    // Find nearest waypoint for name context
    const nearest = allWaypoints.reduce<Waypoint | null>((best, wp) => {
      if (!best) return wp;
      return Math.abs(wp.mile - clampedMile) < Math.abs(best.mile - clampedMile) ? wp : best;
    }, null);

    // Get lat/lng from elevation profile (interpolated)
    let lat = 34.6267; // default to Springer
    let lng = -84.1938;

    // Binary search for closest elevation point
    let low = 0;
    let high = elevationProfile.length - 1;
    while (low < high - 1) {
      const mid = Math.floor((low + high) / 2);
      if (elevationProfile[mid].mile <= clampedMile) low = mid;
      else high = mid;
    }
    // Interpolate lat/lng
    const p1 = elevationProfile[low];
    const p2 = elevationProfile[high];
    if (p1 && p2 && p2.mile !== p1.mile) {
      const ratio = (clampedMile - p1.mile) / (p2.mile - p1.mile);
      lat = p1.lat + ratio * (p2.lat - p1.lat);
      lng = p1.lng + ratio * (p2.lng - p1.lng);
    } else if (p1) {
      lat = p1.lat;
      lng = p1.lng;
    }

    const name = nearest && Math.abs(nearest.mile - clampedMile) < 2
      ? `Mile ${clampedMile.toFixed(1)} (near ${nearest.name})`
      : `Mile ${clampedMile.toFixed(1)}`;

    return fetchForLocation({
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      elevation,
      name,
      mile: clampedMile,
    });
  }, [fetchForLocation]);

  const fetchForWaypoint = useCallback((waypoint: Waypoint) => {
    return fetchForLocation({
      lat: waypoint.lat,
      lng: waypoint.lng,
      elevation: waypoint.elevation,
      name: waypoint.name,
      mile: waypoint.mile,
    });
  }, [fetchForLocation]);

  const fetchForGps = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, locationMode: 'gps' }));

    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'GPS not supported on this device', loading: false }));
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      // Find nearest trail mile from GPS coordinates
      const nearest = allWaypoints.reduce<Waypoint | null>((best, wp) => {
        if (!best) return wp;
        const bestDist = Math.hypot(best.lat - latitude, best.lng - longitude);
        const wpDist = Math.hypot(wp.lat - latitude, wp.lng - longitude);
        return wpDist < bestDist ? wp : best;
      }, null);

      const mile = nearest?.mile ?? 0;
      const elevation = getElevationAtMile(mile);

      await fetchForLocation({
        lat: Math.round(latitude * 10000) / 10000,
        lng: Math.round(longitude * 10000) / 10000,
        elevation,
        name: nearest ? `Near ${nearest.name}` : `GPS Location`,
        mile,
      });
    } catch (err) {
      let message = 'Unable to get GPS location';
      if (err instanceof GeolocationPositionError) {
        if (err.code === 1) message = 'Location permission denied';
        else if (err.code === 2) message = 'Location unavailable';
        else if (err.code === 3) message = 'Location request timed out';
      }
      setState(prev => ({ ...prev, error: message, loading: false }));
    }
  }, [fetchForLocation]);

  const setLocationMode = useCallback((mode: LocationMode) => {
    setState(prev => ({ ...prev, locationMode: mode }));
  }, []);

  /** Re-fetch weather for the current location (preserves original coordinates) */
  const refresh = useCallback(() => {
    if (state.location) {
      return fetchForLocation(state.location);
    }
  }, [state.location, fetchForLocation]);

  return {
    ...state,
    fetchForMile,
    fetchForWaypoint,
    fetchForGps,
    setLocationMode,
    refresh,
  };
}
