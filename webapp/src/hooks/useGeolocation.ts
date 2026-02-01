import { useState, useEffect, useCallback } from 'react';
import { findNearestMileFromCoordinates } from '../data';
import { Waypoint } from '../types';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  nearestMile: number | null;
  nearestWaypoint: Waypoint | null;
  distanceFromTrail: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    nearestMile: null,
    nearestWaypoint: null,
    distanceFromTrail: null,
    error: null,
    loading: false,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
  } = options;

  const updatePosition = useCallback((position: GeolocationPosition) => {
    const { latitude, longitude, accuracy } = position.coords;

    // Find nearest point on trail
    const nearest = findNearestMileFromCoordinates(latitude, longitude);

    setState({
      latitude,
      longitude,
      accuracy,
      nearestMile: nearest?.mile ?? null,
      nearestWaypoint: nearest?.waypoint ?? null,
      distanceFromTrail: nearest?.distance ?? null,
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out.';
        break;
      default:
        errorMessage = 'An unknown error occurred.';
    }

    setState(prev => ({
      ...prev,
      error: errorMessage,
      loading: false,
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      updatePosition,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );
  }, [enableHighAccuracy, timeout, maximumAge, updatePosition, handleError]);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser.',
        loading: false,
      }));
      return () => {};
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      handleError,
      { enableHighAccuracy, timeout, maximumAge }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [enableHighAccuracy, timeout, maximumAge, updatePosition, handleError]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    isSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
  };
}
