import { getOpenWeatherJson, openWeatherUrl } from "@/lib/openweather";
import type { Location } from "@/lib/locations";

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  conditionId: number;
  icon: string;
  description: string;
}

export interface DailyForecast {
  date: string;
  high: number;
  low: number;
  conditionId: number;
  icon: string;
  description: string;
  precipChance: number;
}

export interface HourlyPoint {
  time: number;
  temp: number;
  precipChance: number;
  conditionId: number;
  icon: string;
  description: string;
}

export interface WeatherSnapshot {
  location: Location;
  current: CurrentWeather;
  daily: DailyForecast[];
  hourly: HourlyPoint[];
  forecastNote: string | null;
  timezoneOffset: number;
}

type WeatherCore = Omit<WeatherSnapshot, "hourly">;

interface Condition {
  id: number;
  description: string;
  icon: string;
}

interface OneCallResponse {
  timezone_offset: number;
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: Condition[];
  };
  daily: {
    dt: number;
    temp: { min: number; max: number };
    weather: Condition[];
    pop: number;
  }[];
}

interface CurrentResponse {
  timezone: number;
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number };
  weather: Condition[];
}

interface ForecastResponse {
  city: { timezone: number };
  list: {
    dt: number;
    main: { temp: number; temp_min: number; temp_max: number };
    weather: Condition[];
    pop: number;
  }[];
}

function coordinateParams(location: Location): Record<string, string> {
  return { lat: String(location.lat), lon: String(location.lon), units: "imperial" };
}

function localDateKey(unixSeconds: number, offsetSeconds: number): string {
  return new Date((unixSeconds + offsetSeconds) * 1000).toISOString().slice(0, 10);
}

function localHour(unixSeconds: number, offsetSeconds: number): number {
  return new Date((unixSeconds + offsetSeconds) * 1000).getUTCHours();
}

export function isPrecipitation(conditionId: number): boolean {
  return conditionId >= 200 && conditionId < 700;
}

export function formatDayLabel(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

export function formatFullDayLabel(dateKey: string): string {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function formatHourLabel(unixSeconds: number, offsetSeconds: number): string {
  const hour = localHour(unixSeconds, offsetSeconds);
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function hourOfDay(unixSeconds: number, offsetSeconds: number): number {
  return localHour(unixSeconds, offsetSeconds);
}

export function hourlyForDay(hourly: HourlyPoint[], dateKey: string, offsetSeconds: number): HourlyPoint[] {
  return hourly.filter((point) => localDateKey(point.time, offsetSeconds) === dateKey);
}

function fromOneCall(location: Location, data: OneCallResponse): WeatherCore {
  const offset = data.timezone_offset;
  const condition = data.current.weather[0];

  return {
    location,
    current: {
      temp: data.current.temp,
      feelsLike: data.current.feels_like,
      humidity: data.current.humidity,
      windSpeed: data.current.wind_speed,
      conditionId: condition.id,
      icon: condition.icon,
      description: condition.description,
    },
    daily: data.daily.slice(0, 7).map((day) => ({
      date: localDateKey(day.dt, offset),
      high: day.temp.max,
      low: day.temp.min,
      conditionId: day.weather[0].id,
      icon: day.weather[0].icon,
      description: day.weather[0].description,
      precipChance: Math.round(day.pop * 100),
    })),
    forecastNote: null,
    timezoneOffset: offset,
  };
}

function fromForecast(location: Location, current: CurrentResponse, forecast: ForecastResponse): WeatherCore {
  const offset = forecast.city.timezone;
  const condition = current.weather[0];

  const groups = new Map<string, ForecastResponse["list"]>();
  for (const item of forecast.list) {
    const key = localDateKey(item.dt, offset);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const daily: DailyForecast[] = [...groups.entries()].slice(0, 7).map(([date, items]) => {
    const midday = items.reduce((best, item) =>
      Math.abs(localHour(item.dt, offset) - 12) < Math.abs(localHour(best.dt, offset) - 12)
        ? item
        : best,
    );
    return {
      date,
      high: Math.max(...items.map((item) => item.main.temp_max)),
      low: Math.min(...items.map((item) => item.main.temp_min)),
      conditionId: midday.weather[0].id,
      icon: midday.weather[0].icon,
      description: midday.weather[0].description,
      precipChance: Math.round(Math.max(...items.map((item) => item.pop)) * 100),
    };
  });

  return {
    location,
    current: {
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      conditionId: condition.id,
      icon: condition.icon,
      description: condition.description,
    },
    daily,
    forecastNote:
      "Free forecast. Today and the last day only include the hours still forecast; a full seven-day outlook needs a One Call plan.",
    timezoneOffset: offset,
  };
}

function toHourly(forecast: ForecastResponse): HourlyPoint[] {
  return forecast.list.map((item) => ({
    time: item.dt,
    temp: item.main.temp,
    precipChance: Math.round(item.pop * 100),
    conditionId: item.weather[0].id,
    icon: item.weather[0].icon,
    description: item.weather[0].description,
  }));
}

export async function fetchWeather(location: Location): Promise<WeatherSnapshot> {
  const params = coordinateParams(location);
  const forecast = await getOpenWeatherJson<ForecastResponse>(openWeatherUrl("/data/2.5/forecast", params));
  const hourly = toHourly(forecast);

  try {
    const oneCall = await getOpenWeatherJson<OneCallResponse>(
      openWeatherUrl("/data/3.0/onecall", { ...params, exclude: "minutely,hourly,alerts" }),
    );
    return { ...fromOneCall(location, oneCall), hourly };
  } catch {
    const current = await getOpenWeatherJson<CurrentResponse>(openWeatherUrl("/data/2.5/weather", params));
    return { ...fromForecast(location, current, forecast), hourly };
  }
}

export function summarizeWeatherForChat(snapshot: WeatherSnapshot): string {
  const current = snapshot.current;
  const lines = [
    `Location: ${snapshot.location.label}`,
    `Now: ${Math.round(current.temp)}°F, feels like ${Math.round(current.feelsLike)}°F, ${current.description}, humidity ${current.humidity}%, wind ${Math.round(current.windSpeed)} mph`,
    "Forecast:",
    ...snapshot.daily.map(
      (day) =>
        `- ${day.date} (${formatDayLabel(day.date)}): high ${Math.round(day.high)}°F, low ${Math.round(day.low)}°F, ${day.description}, rain chance ${day.precipChance}%`,
    ),
  ];
  return lines.join("\n");
}
