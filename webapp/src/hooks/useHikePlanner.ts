import { useState, useCallback, useMemo } from 'react';
import { generateHikePlan, TRAIL_LENGTH } from '../data';
import type { Direction } from '../types';

interface HikePlannerState {
  startMile: number;
  targetMilesPerDay: number;
  daysAhead: number;
  direction: Direction;
  startDate: Date;
}

export function useHikePlanner(initialState?: Partial<HikePlannerState>) {
  const [state, setState] = useState<HikePlannerState>({
    startMile: 0,
    targetMilesPerDay: 15,
    daysAhead: 7,
    direction: 'NOBO',
    startDate: new Date(),
    ...initialState,
  });

  const plan = useMemo(() => {
    return generateHikePlan(
      state.startMile,
      state.targetMilesPerDay,
      state.daysAhead,
      state.direction
    );
  }, [state.startMile, state.targetMilesPerDay, state.daysAhead, state.direction]);

  const setStartMile = useCallback((mile: number) => {
    setState(prev => ({
      ...prev,
      startMile: Math.max(-8.5, Math.min(TRAIL_LENGTH, mile)),
    }));
  }, []);

  const setTargetMiles = useCallback((miles: number) => {
    setState(prev => ({
      ...prev,
      targetMilesPerDay: Math.max(1, Math.min(30, miles)),
    }));
  }, []);

  const setDaysAhead = useCallback((days: number) => {
    setState(prev => ({
      ...prev,
      daysAhead: Math.max(1, Math.min(30, days)),
    }));
  }, []);

  const setDirection = useCallback((direction: Direction) => {
    setState(prev => ({ ...prev, direction }));
  }, []);

  const setStartDate = useCallback((date: Date) => {
    setState(prev => ({ ...prev, startDate: date }));
  }, []);

  const totalMiles = useMemo(() => {
    if (plan.length === 0) return 0;
    const first = plan[0];
    const last = plan[plan.length - 1];
    return Math.abs(last.endMile - first.startMile);
  }, [plan]);

  const endMile = useMemo(() => {
    if (plan.length === 0) return state.startMile;
    return plan[plan.length - 1].endMile;
  }, [plan, state.startMile]);

  const resupplyCount = useMemo(() => {
    return plan.reduce((count, day) => count + day.resupply.length, 0);
  }, [plan]);

  const shelterCount = useMemo(() => {
    return plan.reduce((count, day) => count + day.shelters.length, 0);
  }, [plan]);

  return {
    ...state,
    plan,
    setStartMile,
    setTargetMiles,
    setDaysAhead,
    setDirection,
    setStartDate,
    totalMiles,
    endMile,
    resupplyCount,
    shelterCount,
  };
}
