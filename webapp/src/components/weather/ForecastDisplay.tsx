import { motion } from 'framer-motion';
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain,
  CloudRainWind, CloudSnow, Snowflake, CloudHail, CloudLightning,
  CircleHelp, Droplets, Wind, Eye, Thermometer,
} from 'lucide-react';
import { getWeatherCondition, getWindDirection } from '../../lib/weather';
import type { WeatherIconKey } from '../../lib/weather';
import type { HourlyForecast, DailyForecast } from '../../lib/weather';

// --- Lucide icon renderer for weather codes ---

const WEATHER_ICONS: Record<WeatherIconKey, React.ComponentType<{ className?: string }>> = {
  'sun': Sun,
  'cloud-sun': CloudSun,
  'cloud': Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  'cloud-rain-wind': CloudRainWind,
  'cloud-snow': CloudSnow,
  'snowflake': Snowflake,
  'cloud-hail': CloudHail,
  'cloud-lightning': CloudLightning,
  'unknown': CircleHelp,
};

function WeatherIcon({ iconKey, className }: { iconKey: WeatherIconKey; className?: string }) {
  const Icon = WEATHER_ICONS[iconKey] || CircleHelp;
  return <Icon className={className} />;
}

// All weather icons use warm golden color
const WEATHER_ICON_COLOR = 'text-[var(--color-sunrise)]';

// --- Helpers ---

interface HourlyForecastCardProps {
  hours: HourlyForecast[];
  temperatureAdjustment: number;
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

// --- Current + Hourly ---

export function HourlyForecastCard({ hours, temperatureAdjustment }: HourlyForecastCardProps) {
  if (hours.length === 0) return null;

  const next24 = hours.slice(0, 24);
  const current = next24[0];
  const condition = getWeatherCondition(current.weatherCode);
  const uvInfo = getUvLabel(current.uvIndex);

  return (
    <div className="space-y-3">
      {/* Current Conditions Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-5 py-4"
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-3">
          Right Now
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getTempColor(current.temperature)}`}>
                {current.temperature}°
              </span>
              <span className="text-sm text-[var(--foreground-muted)]">
                Feels {current.apparentTemperature}°
              </span>
            </div>
            {/* Show station temp if adjustment is significant */}
            {Math.abs(temperatureAdjustment) >= 1 && (
              <p className="text-[10px] text-[var(--foreground-muted)] mt-0.5 opacity-70">
                Station: {current.stationTemperature}° ({temperatureAdjustment > 0 ? '+' : ''}{temperatureAdjustment.toFixed(1)}° elev adj)
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              <WeatherIcon iconKey={condition.icon} className={`w-5 h-5 ${WEATHER_ICON_COLOR}`} />
              <span className="text-sm text-[var(--foreground)]">{condition.label}</span>
            </div>
          </div>
          <div className="text-right space-y-1.5 shrink-0">
            {current.windGusts > current.windSpeed + 5 ? (
              <div className="flex items-center justify-end text-xs">
                <Wind className="w-3 h-3 text-[#c4916a] mr-1" />
                <span className="text-[#c4916a]">{current.windSpeed}/{current.windGusts} mph/</span>
                <span className="text-[var(--warning)] font-semibold">gusts</span>
                <span className="text-[#c4916a]">&nbsp;{getWindDirection(current.windDirection)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-1 text-xs text-[var(--foreground-muted)]">
                <Wind className="w-3 h-3" />
                <span>{current.windSpeed} mph {getWindDirection(current.windDirection)}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-1 text-xs text-[var(--foreground-muted)]">
              <Droplets className="w-3 h-3" />
              <span>{current.humidity}% · {current.precipitationProbability}% rain</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-xs text-[var(--foreground-muted)]">
              <Eye className="w-3 h-3" />
              <span>{current.visibility} mi vis</span>
            </div>
            <div className={`flex items-center justify-end gap-1 text-xs ${uvInfo.color}`}>
              <Sun className="w-3 h-3" />
              <span>UV {current.uvIndex.toFixed(0)} ({uvInfo.label})</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hourly Scroll */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-3"
      >
        <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2">
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
                  <WeatherIcon
                    iconKey={cond.icon}
                    className={`w-4 h-4 my-1 ${WEATHER_ICON_COLOR}`}
                  />
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
  daily: DailyForecast[];
  temperatureAdjustment: number;
}

function formatDay(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

export function DailyForecastList({ daily, temperatureAdjustment }: DailyForecastListProps) {
  const hasAdjustment = Math.abs(temperatureAdjustment) >= 1;

  // Find global min/max across all days for consistent positioning
  const allLows = daily.map(d => d.temperatureLow);
  const allHighs = daily.map(d => d.temperatureHigh);
  const globalMin = Math.min(...allLows);
  const globalMax = Math.max(...allHighs);
  const globalRange = globalMax - globalMin || 1; // avoid div by zero

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl overflow-hidden"
    >
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold px-5 pt-3 pb-1">
        7-Day Forecast
      </p>
      <div className="divide-y divide-[var(--border-light)]">
        {daily.map((day, i) => {
          const condition = getWeatherCondition(day.weatherCode);
          const uvInfo = getUvLabel(day.uvIndexMax);
          const isToday = i === 0;

          // Position this day's bar relative to the global range
          const barLeft = ((day.temperatureLow - globalMin) / globalRange) * 100;
          const barWidth = ((day.temperatureHigh - day.temperatureLow) / globalRange) * 100;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="px-5 py-3"
            >
              <div className="flex items-center gap-3">
                {/* Day */}
                <div className="w-20 shrink-0">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {isToday ? 'Today' : formatDay(day.date)}
                  </p>
                </div>

                {/* Weather icon */}
                <WeatherIcon
                  iconKey={condition.icon}
                  className={`w-5 h-5 shrink-0 ${WEATHER_ICON_COLOR}`}
                />

                {/* Precip probability */}
                <div className="w-10 text-center shrink-0">
                  {day.precipitationProbability > 0 ? (
                    <span className="text-xs text-[var(--info)]">
                      {day.precipitationProbability}%
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--foreground-muted)]">—</span>
                  )}
                </div>

                {/* Temp range: low — bar — high */}
                <div className="flex-1 flex items-center gap-2">
                  <span className={`text-xs font-medium w-8 text-right ${getTempColor(day.temperatureLow)}`}>
                    {day.temperatureLow}°
                  </span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden relative" style={{ backgroundColor: 'var(--background)' }}>
                    <div
                      className="absolute top-0 h-full rounded-full"
                      style={{
                        left: `${barLeft}%`,
                        width: `${Math.max(barWidth, 4)}%`,
                        background: `linear-gradient(to right, ${getTempBarColor(day.temperatureLow)}, ${getTempBarColor(day.temperatureHigh)})`,
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium w-8 ${getTempColor(day.temperatureHigh)}`}>
                    {day.temperatureHigh}°
                  </span>
                </div>
              </div>

              {/* Second row: wind, UV, feels-like, station temps */}
              <div className="flex items-center gap-3 mt-1.5 ml-20 pl-3 flex-wrap">
                {day.windGustsMax > day.windSpeedMax + 10 ? (
                  <span className="text-[10px] flex items-center">
                    <Wind className="w-2.5 h-2.5 text-[#c4916a] mr-0.5" />
                    <span className="text-[#c4916a]">{day.windSpeedMax}/{day.windGustsMax} mph/</span>
                    <span className="text-[var(--warning)] font-semibold">gusts</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--foreground-muted)] flex items-center gap-0.5">
                    <Wind className="w-2.5 h-2.5" />
                    {day.windSpeedMax} mph
                  </span>
                )}
                <span className={`text-[10px] flex items-center gap-0.5 ${uvInfo.color}`}>
                  <Sun className="w-2.5 h-2.5" />
                  UV {day.uvIndexMax.toFixed(0)}
                </span>
                <span className="text-[10px] text-[var(--foreground-muted)] flex items-center gap-0.5">
                  <Thermometer className="w-2.5 h-2.5" />
                  Feels {day.apparentTempLow}°–{day.apparentTempHigh}°
                </span>
                {hasAdjustment && (
                  <span className="text-[10px] text-[var(--foreground-muted)] opacity-60">
                    Stn: {day.temperatureLow - Math.round(temperatureAdjustment)}°–{day.temperatureHigh - Math.round(temperatureAdjustment)}°
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Returns a hex color for the temp bar gradient based on temperature */
function getTempBarColor(temp: number): string {
  if (temp <= 10) return '#60a5fa';   // blue-400
  if (temp <= 25) return '#38bdf8';   // sky-400
  if (temp <= 40) return '#67c7c3';   // teal-ish
  if (temp <= 55) return '#7a9e7e';   // meadow (accent)
  if (temp <= 70) return '#c4a77d';   // trail-light (warm)
  if (temp <= 85) return '#d4846a';   // sunset (warning)
  return '#f87171';                    // red-400
}
