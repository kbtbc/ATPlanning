import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useHikePlanner } from '../hooks/useHikePlanner';
import { getContactsByResupplyId } from '../data/contacts';
import { MiniMap } from './MiniMap';
import { PlannerControls, PlannerStats, DayCard } from './planner';
import { ResupplyExpandedCard } from './resupply';
import type { ResupplyPoint, Business } from '../types';

interface HikePlannerProps {
  initialMile?: number;
}

export function HikePlanner({ initialMile = 0 }: HikePlannerProps) {
  const {
    startMile,
    targetMilesPerDay,
    daysAhead,
    direction,
    startDate,
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
  } = useHikePlanner({ startMile: initialMile });

  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [selectedResupply, setSelectedResupply] = useState<ResupplyPoint | null>(null);

  // Generate day markers for the map
  const dayMarkers = useMemo(() => {
    return plan.map(day => ({
      mile: day.endMile,
      day: day.day,
    }));
  }, [plan]);

  const handleSetStart = (mile: number, date: Date) => {
    setStartMile(mile);
    setStartDate(date);
  };

  const handleResupplyClick = (resupply: ResupplyPoint) => {
    setSelectedResupply(resupply);
  };

  const handleBackFromResupply = () => {
    setSelectedResupply(null);
  };

  // Get businesses for a resupply point
  const getBusinesses = (resupply: ResupplyPoint): Business[] => {
    if (resupply.businesses && resupply.businesses.length > 0) {
      return resupply.businesses;
    }
    const contacts = getContactsByResupplyId(resupply.id);
    return contacts?.businesses || [];
  };

  // Show resupply detail view
  if (selectedResupply) {
    const businesses = getBusinesses(selectedResupply);
    return (
      <AnimatePresence mode="wait">
        <ResupplyExpandedCard
          key={selectedResupply.id}
          resupply={selectedResupply}
          businesses={businesses}
          currentMile={startMile}
          onBack={handleBackFromResupply}
        />
      </AnimatePresence>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mini Map with day markers */}
      <MiniMap
        currentMile={startMile}
        rangeAhead={totalMiles}
        direction={direction}
        dayMarkers={dayMarkers}
      />

      {/* Controls Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel"
      >
        <h3 className="text-base font-semibold flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          Plan Your Hike
        </h3>

        <PlannerControls
          startMile={startMile}
          startDate={startDate}
          direction={direction}
          daysAhead={daysAhead}
          targetMilesPerDay={targetMilesPerDay}
          onStartMileChange={setStartMile}
          onStartDateChange={setStartDate}
          onDirectionChange={setDirection}
          onDaysAheadChange={setDaysAhead}
          onMilesPerDayChange={setTargetMiles}
        />

        <PlannerStats
          totalMiles={totalMiles}
          shelterCount={shelterCount}
          resupplyCount={resupplyCount}
          endMile={endMile}
        />
      </motion.div>

      {/* Daily Plan */}
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold flex items-center gap-2 pl-1">
          <Calendar className="w-4 h-4 text-[var(--accent)]" />
          Daily Itinerary
        </h3>

        <div className="space-y-0.5">
          {plan.map((day, index) => (
            <DayCard
              key={day.day}
              day={day}
              startDate={startDate}
              direction={direction}
              isExpanded={expandedDay === day.day}
              index={index}
              onToggle={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              onSetStart={handleSetStart}
              onResupplyClick={handleResupplyClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
