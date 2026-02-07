/**
 * Open-Meteo Weather API service with elevation-adjusted temperatures
 *
 * Uses the environmental lapse rate (3.5°F per 1,000 ft) to adjust
 * weather station temps to actual trail elevation.
 *
 * API: https://open-meteo.com/ (free, no key required)
 */

// --- Types ---

export interface WeatherLocation {
  lat: number;
  lng: number;
  elevation: number; // trail elevation in feet
  name: string;
  mile?: number;
}

export interface HourlyForecast {
  time: Date;
  temperature: number;       // °F, elevation-adjusted
  apparentTemperature: number; // °F, elevation-adjusted (feels like)
  stationTemperature: number;  // °F, raw from API
  precipitationProbability: number; // %
  precipitation: number;     // inches
  weatherCode: number;       // WMO code
  windSpeed: number;         // mph
  windGusts: number;         // mph
  windDirection: number;     // degrees
  humidity: number;          // %
  uvIndex: number;
  cloudCover: number;        // %
  visibility: number;        // miles
}

export interface DailyForecast {
  date: Date;
  temperatureHigh: number;   // °F, elevation-adjusted
  temperatureLow: number;    // °F, elevation-adjusted
  apparentTempHigh: number;  // °F, elevation-adjusted
  apparentTempLow: number;   // °F, elevation-adjusted
  precipitationProbability: number;
  precipitationSum: number;  // inches
  weatherCode: number;
  windSpeedMax: number;      // mph
  windGustsMax: number;      // mph
  windDirection: number;     // dominant direction in degrees
  uvIndexMax: number;
  sunrise: Date;
  sunset: Date;
}

export interface WeatherData {
  location: WeatherLocation;
  stationElevation: number;  // feet - API grid point elevation
  elevationDifference: number; // feet - trail minus station
  temperatureAdjustment: number; // °F - lapse rate correction
  hourly: HourlyForecast[];  // next ~48 hours
  daily: DailyForecast[];    // 5 days
  fetchedAt: Date;
}

// --- Constants ---

/** Standard environmental lapse rate: 3.5°F per 1,000 feet */
const LAPSE_RATE_F_PER_1000FT = 3.5;

/** Meters to feet conversion */
const METERS_TO_FEET = 3.28084;

/** km to miles */
const KM_TO_MILES = 0.621371;

// --- WMO Weather Codes ---
// https://open-meteo.com/en/docs#weathervariables

interface WeatherCondition {
  label: string;
  icon: string; // emoji for simple display
  severity: 'clear' | 'mild' | 'moderate' | 'severe';
}

const WMO_CODES: Record<number, WeatherCondition> = {
  0: { label: 'Clear sky', icon: '☀️', severity: 'clear' },
  1: { label: 'Mostly clear', icon: '🌤️', severity: 'clear' },
  2: { label: 'Partly cloudy', icon: '⛅', severity: 'clear' },
  3: { label: 'Overcast', icon: '☁️', severity: 'mild' },
  45: { label: 'Fog', icon: '🌫️', severity: 'mild' },
  48: { label: 'Rime fog', icon: '🌫️', severity: 'mild' },
  51: { label: 'Light drizzle', icon: '🌦️', severity: 'mild' },
  53: { label: 'Drizzle', icon: '🌦️', severity: 'mild' },
  55: { label: 'Heavy drizzle', icon: '🌧️', severity: 'moderate' },
  56: { label: 'Freezing drizzle', icon: '🌧️', severity: 'moderate' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧️', severity: 'severe' },
  61: { label: 'Light rain', icon: '🌦️', severity: 'mild' },
  63: { label: 'Rain', icon: '🌧️', severity: 'moderate' },
  65: { label: 'Heavy rain', icon: '🌧️', severity: 'severe' },
  66: { label: 'Freezing rain', icon: '🌧️', severity: 'severe' },
  67: { label: 'Heavy freezing rain', icon: '🌧️', severity: 'severe' },
  71: { label: 'Light snow', icon: '🌨️', severity: 'moderate' },
  73: { label: 'Snow', icon: '❄️', severity: 'moderate' },
  75: { label: 'Heavy snow', icon: '❄️', severity: 'severe' },
  77: { label: 'Snow grains', icon: '❄️', severity: 'moderate' },
  80: { label: 'Light showers', icon: '🌦️', severity: 'mild' },
  81: { label: 'Showers', icon: '🌧️', severity: 'moderate' },
  82: { label: 'Heavy showers', icon: '🌧️', severity: 'severe' },
  85: { label: 'Light snow showers', icon: '🌨️', severity: 'moderate' },
  86: { label: 'Heavy snow showers', icon: '❄️', severity: 'severe' },
  95: { label: 'Thunderstorm', icon: '⛈️', severity: 'severe' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️', severity: 'severe' },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️', severity: 'severe' },
};

export function getWeatherCondition(code: number): WeatherCondition {
  return WMO_CODES[code] || { label: 'Unknown', icon: '❓', severity: 'mild' };
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}

// --- Elevation Adjustment ---

/**
 * Calculate temperature adjustment using the standard environmental lapse rate.
 *
 * When the trail is HIGHER than the weather station, it will be COLDER on trail.
 * Adjustment is negative (subtracts from station temp).
 *
 * When the trail is LOWER than the station, it will be WARMER on trail.
 * Adjustment is positive (adds to station temp).
 */
export function calculateElevationAdjustment(
  trailElevationFt: number,
  stationElevationFt: number
): number {
  const elevationDifference = trailElevationFt - stationElevationFt;
  return -(LAPSE_RATE_F_PER_1000FT * elevationDifference / 1000);
}

// --- API Fetch ---

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  elevation: number; // meters
  timezone: string;
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    relative_humidity_2m: number[];
    uv_index: number[];
    cloud_cover: number[];
    visibility: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    precipitation_probability_max: number[];
    precipitation_sum: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export async function fetchWeather(location: WeatherLocation): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: location.lat.toFixed(4),
    longitude: location.lng.toFixed(4),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
      'wind_direction_10m',
      'relative_humidity_2m',
      'uv_index',
      'cloud_cover',
      'visibility',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'weather_code',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
      'uv_index_max',
      'sunrise',
      'sunset',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    forecast_days: '5',
    timezone: 'America/New_York',
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const data: OpenMeteoResponse = await response.json();

  // Station elevation in feet
  const stationElevationFt = Math.round(data.elevation * METERS_TO_FEET);
  const adjustment = calculateElevationAdjustment(location.elevation, stationElevationFt);

  // Parse hourly data (next 48 hours)
  const now = new Date();
  const hourly: HourlyForecast[] = data.hourly.time
    .map((time, i) => ({
      time: new Date(time),
      stationTemperature: data.hourly.temperature_2m[i],
      temperature: Math.round(data.hourly.temperature_2m[i] + adjustment),
      apparentTemperature: Math.round(data.hourly.apparent_temperature[i] + adjustment),
      precipitationProbability: data.hourly.precipitation_probability[i],
      precipitation: data.hourly.precipitation[i],
      weatherCode: data.hourly.weather_code[i],
      windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
      windGusts: Math.round(data.hourly.wind_gusts_10m[i]),
      windDirection: data.hourly.wind_direction_10m[i],
      humidity: data.hourly.relative_humidity_2m[i],
      uvIndex: data.hourly.uv_index[i],
      cloudCover: data.hourly.cloud_cover[i],
      visibility: Math.round(data.hourly.visibility[i] * KM_TO_MILES * 10) / 10,
    }))
    .filter(h => h.time >= now)
    .slice(0, 48);

  // Parse daily data
  const daily: DailyForecast[] = data.daily.time.map((time, i) => ({
    date: new Date(time),
    temperatureHigh: Math.round(data.daily.temperature_2m_max[i] + adjustment),
    temperatureLow: Math.round(data.daily.temperature_2m_min[i] + adjustment),
    apparentTempHigh: Math.round(data.daily.apparent_temperature_max[i] + adjustment),
    apparentTempLow: Math.round(data.daily.apparent_temperature_min[i] + adjustment),
    precipitationProbability: data.daily.precipitation_probability_max[i],
    precipitationSum: data.daily.precipitation_sum[i],
    weatherCode: data.daily.weather_code[i],
    windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i]),
    windGustsMax: Math.round(data.daily.wind_gusts_10m_max[i]),
    windDirection: data.daily.wind_direction_10m_dominant[i],
    uvIndexMax: data.daily.uv_index_max[i],
    sunrise: new Date(data.daily.sunrise[i]),
    sunset: new Date(data.daily.sunset[i]),
  }));

  return {
    location,
    stationElevation: stationElevationFt,
    elevationDifference: location.elevation - stationElevationFt,
    temperatureAdjustment: Math.round(adjustment * 10) / 10,
    hourly,
    daily,
    fetchedAt: new Date(),
  };
}
