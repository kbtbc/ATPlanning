import { useState, useCallback, useMemo } from 'react';
import type { FilterOptions, WaypointType } from '../types';
import { allWaypoints, TRAIL_LENGTH, AT_STATES } from '../data';

const defaultFilters: FilterOptions = {
  types: [],
  states: [],
  minMile: 0,
  maxMile: TRAIL_LENGTH,
  searchQuery: '',
};

export function useWaypointFilters(initialFilters?: Partial<FilterOptions>) {
  const [filters, setFilters] = useState<FilterOptions>({
    ...defaultFilters,
    ...initialFilters,
  });

  const filteredWaypoints = useMemo(() => {
    return allWaypoints.filter(waypoint => {
      // Filter by type
      if (filters.types.length > 0 && !filters.types.includes(waypoint.type)) {
        return false;
      }

      // Filter by state
      if (filters.states.length > 0 && !filters.states.includes(waypoint.state)) {
        return false;
      }

      // Filter by mile range
      if (waypoint.mile < filters.minMile || waypoint.mile > filters.maxMile) {
        return false;
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const nameMatch = waypoint.name.toLowerCase().includes(query);
        const stateMatch = waypoint.state.toLowerCase().includes(query);
        const notesMatch = waypoint.notes?.toLowerCase().includes(query) || false;
        if (!nameMatch && !stateMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const toggleType = useCallback((type: WaypointType) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  const toggleState = useCallback((state: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states.includes(state)
        ? prev.states.filter(s => s !== state)
        : [...prev.states, state],
    }));
  }, []);

  const setMileRange = useCallback((min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      minMile: Math.max(0, min),
      maxMile: Math.min(TRAIL_LENGTH, max),
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  return {
    filters,
    filteredWaypoints,
    updateFilters,
    resetFilters,
    toggleType,
    toggleState,
    setMileRange,
    setSearchQuery,
    availableStates: AT_STATES,
    totalCount: allWaypoints.length,
    filteredCount: filteredWaypoints.length,
  };
}
