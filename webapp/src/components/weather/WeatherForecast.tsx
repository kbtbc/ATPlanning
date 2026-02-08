import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mountain, ArrowUpDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import { WeatherLocationPicker } from './WeatherLocationPicker';
import { HourlyForecastCard, DailyForecastList } from './ForecastDisplay';
import { formatMile } from '../../lib/utils';

interface WeatherForecastProps {
  currentMile: number;
}

export function WeatherForecast({ currentMile }: WeatherForecastProps) {
  const {
    weather,
    loading,
    error,
    locationMode,
    fetchForMile,
    fetchForWaypoint,
    fetchForGps,
    setLocationMode,
    refresh,
  } = useWeather();

  // Auto-fetch on first load using planner's current mile
  useEffect(() => {
    if (!weather && !loading) {
      fetchForMile(currentMile);
    }
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {/* Location Picker */}
      <WeatherLocationPicker
        currentMile={currentMile}
        locationMode={locationMode}
        onModeChange={setLocationMode}
        onFetchForMile={fetchForMile}
        onFetchForWaypoint={fetchForWaypoint}
        onFetchForGps={fetchForGps}
        loading={loading}
      />

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-xl p-3 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--foreground)]">{error}</p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && !weather && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-5 h-5 text-[var(--foreground-muted)] animate-spin" />
        </div>
      )}

      {/* Weather Data */}
      {weather && (
        <>
          {/* Elevation Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {weather.location.name}
                </p>
                {weather.location.mile !== undefined && (
                  <p className="text-[10px] text-[var(--foreground-muted)]">
                    Mile {formatMile(weather.location.mile)}
                  </p>
                )}
              </div>
              <button
                onClick={refresh}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--foreground-muted)]"
                title="Pull updated data for this location — useful if weather is changing fast"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Elevation adjustment info */}
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-[var(--border-light)]">
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--foreground-muted)]">
                <Mountain className="w-3 h-3" />
                Trail: {weather.location.elevation.toLocaleString()} ft
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--foreground-muted)]">
                <ArrowUpDown className="w-3 h-3" />
                Station: {weather.stationElevation.toLocaleString()} ft
              </div>
              {weather.temperatureAdjustment !== 0 && (
                <span className="text-[10px] font-medium text-[var(--info)]">
                  {weather.temperatureAdjustment > 0 ? '+' : ''}{weather.temperatureAdjustment.toFixed(1)}°F adj
                </span>
              )}
            </div>
          </motion.div>

          {/* Hourly Forecast (today) */}
          <HourlyForecastCard hours={weather.hourly} temperatureAdjustment={weather.temperatureAdjustment} />

          {/* Daily Forecast (5-day) */}
          <DailyForecastList daily={weather.daily} temperatureAdjustment={weather.temperatureAdjustment} />

          {/* Methodology Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] text-[var(--foreground-muted)] text-center opacity-60 px-4"
          >
            Temps adjusted using {Math.abs(weather.elevationDifference).toLocaleString()} ft elevation difference
            at 3.5°F/1,000 ft lapse rate · Data from Open-Meteo
          </motion.div>
        </>
      )}
    </div>
  );
}
