import { motion } from 'framer-motion';
import { Droplets, Wind, Eye, Sun, Thermometer } from 'lucide-react';
import { getWeatherCondition, getWindDirection } from '../../lib/weather';
import type { HourlyForecast } from '../../lib/weather';

interface HourlyForecastCardProps {
  hours: HourlyForecast[];
}

function formatHour(date: Date): string {
  const h = date.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}${ampm}`;
}

function getTempColor(temp: number): string {
  if (temp <= 20) return 'text-blue-400';
  if (temp <= 32) return 'text-sky-400';
  if (temp <= 50) return 'text-[var(--info)]';
  if (temp <= 70) return 'text-[var(--accent)]';
  if (temp <= 85) return 'text-[var(--warning)]';
  return 'text-red-400';
}

function getUvLabel(uv: number): { label: string; color: string } {
  if (uv <= 2) return { label: 'Low', color: 'text-[var(--accent)]' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-[var(--secondary)]' };
  if (uv <= 7) return { label: 'High', color: 'text-[var(--warning)]' };
  if (uv <= 10) return { label: 'Very High', color: 'text-red-400' };
  return { label: 'Extreme', color: 'text-red-600' };
}

export function HourlyForecastCard({ hours }: HourlyForecastCardProps) {
  if (hours.length === 0) return null;

  // Show next 24 hours
  const next24 = hours.slice(0, 24);

  // Current conditions (first hour)
  const current = next24[0];
  const condition = getWeatherCondition(current.weatherCode);
  const uvInfo = getUvLabel(current.uvIndex);

  return (
    <div className="space-y-3">
      {/* Current Conditions Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-4"
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2">
          Right Now
        </p>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getTempColor(current.temperature)}`}>
                {current.temperature}°
              </span>
              <span className="text-sm text-[var(--foreground-muted)]">
                Feels {current.apparentTemperature}°
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] mt-1">
              <span className="text-lg mr-1">{condition.icon}</span>
              {condition.label}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
              <Wind className="w-3 h-3" />
              {current.windSpeed} mph {getWindDirection(current.windDirection)}
              {current.windGusts > current.windSpeed + 5 && (
                <span className="text-[var(--warning)]"> G{current.windGusts}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
              <Droplets className="w-3 h-3" />
              {current.humidity}% · {current.precipitationProbability}% rain
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)]">
              <Eye className="w-3 h-3" />
              {current.visibility} mi
            </div>
            <div className={`flex items-center gap-1 text-xs ${uvInfo.color}`}>
              <Sun className="w-3 h-3" />
              UV {current.uvIndex.toFixed(0)} ({uvInfo.label})
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hourly Scroll */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-3"
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2 px-1">
          Next 24 Hours
        </p>
        <div className="overflow-x-auto -mx-1">
          <div className="flex gap-0 min-w-max px-1">
            {next24.map((hour, i) => {
              const cond = getWeatherCondition(hour.weatherCode);
              return (
                <div
                  key={i}
                  className="flex flex-col items-center px-2.5 py-1.5 min-w-[52px]"
                >
                  <span className="text-[10px] text-[var(--foreground-muted)]">
                    {i === 0 ? 'Now' : formatHour(hour.time)}
                  </span>
                  <span className="text-sm my-0.5">{cond.icon}</span>
                  <span className={`text-xs font-semibold ${getTempColor(hour.temperature)}`}>
                    {hour.temperature}°
                  </span>
                  {hour.precipitationProbability > 0 && (
                    <span className="text-[9px] text-[var(--info)]">
                      {hour.precipitationProbability}%
                    </span>
                  )}
                  {hour.windGusts > 25 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Wind className="w-2 h-2 text-[var(--foreground-muted)]" />
                      <span className="text-[9px] text-[var(--foreground-muted)]">
                        {hour.windSpeed}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- Daily Forecast ---

interface DailyForecastListProps {
  daily: import('../../lib/weather').DailyForecast[];
}

function formatDay(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function DailyForecastList({ daily }: DailyForecastListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold px-4 pt-3 pb-1">
        5-Day Forecast
      </p>
      <div className="divide-y divide-[var(--border-light)]">
        {daily.map((day, i) => {
          const condition = getWeatherCondition(day.weatherCode);
          const uvInfo = getUvLabel(day.uvIndexMax);
          const isToday = i === 0;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                {/* Day + Icon */}
                <div className="w-20 shrink-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {isToday ? 'Today' : formatDay(day.date)}
                  </p>
                </div>

                {/* Weather icon */}
                <span className="text-lg w-8 text-center">{condition.icon}</span>

                {/* Precip probability */}
                <div className="w-10 text-center">
                  {day.precipitationProbability > 0 ? (
                    <span className="text-xs text-[var(--info)]">
                      {day.precipitationProbability}%
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--foreground-muted)]">—</span>
                  )}
                </div>

                {/* Temp bar visualization */}
                <div className="flex-1 flex items-center gap-2">
                  <span className={`text-xs font-medium w-8 text-right ${getTempColor(day.temperatureLow)}`}>
                    {day.temperatureLow}°
                  </span>
                  <div className="flex-1 h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--info)] via-[var(--accent)] to-[var(--warning)]"
                      style={{
                        marginLeft: `${Math.max(0, ((day.temperatureLow - 10) / 90) * 100)}%`,
                        width: `${Math.min(100, ((day.temperatureHigh - day.temperatureLow) / 90) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-8 ${getTempColor(day.temperatureHigh)}`}>
                    {day.temperatureHigh}°
                  </span>
                </div>
              </div>

              {/* Second row: wind, UV, sunrise/sunset */}
              <div className="flex items-center gap-3 mt-1 ml-20 pl-3">
                <span className="text-[10px] text-[var(--foreground-muted)] flex items-center gap-0.5">
                  <Wind className="w-2.5 h-2.5" />
                  {day.windSpeedMax} mph
                  {day.windGustsMax > day.windSpeedMax + 10 && (
                    <span className="text-[var(--warning)]"> G{day.windGustsMax}</span>
                  )}
                </span>
                <span className={`text-[10px] flex items-center gap-0.5 ${uvInfo.color}`}>
                  <Sun className="w-2.5 h-2.5" />
                  UV {day.uvIndexMax.toFixed(0)}
                </span>
                <span className="text-[10px] text-[var(--foreground-muted)] flex items-center gap-0.5">
                  <Thermometer className="w-2.5 h-2.5" />
                  Feels {day.apparentTempLow}°–{day.apparentTempHigh}°
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
