import { fetchJSON } from "../lib/http";
import { _raw, CurrentWeatherSchema, type CurrentWeather, DailyForecastSchema, type DailyForecast } from "../lib/schemas";

const OWM_BASE = "https://api.openweathermap.org/data/2.5";
const API_KEY = import.meta.env.VITE_OWM_API_KEY as string;

function q(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) usp.set(k, String(v));
  return usp.toString();
}

function requireKey() {
  if (!API_KEY) throw new Error("Missing VITE_OWM_API_KEY. Set it in .env.local");
}

export async function fetchCurrentWeather(city: string): Promise<CurrentWeather> {
  requireKey();
  const url = `${OWM_BASE}/weather?${q({ q: city, appid: API_KEY, units: "metric" })}`;
  const data = await fetchJSON<unknown>(url);
  const parsed = _raw.OwmWeatherSchema.parse(data);

  return CurrentWeatherSchema.parse({
    city: parsed.name,
    lat: parsed.coord.lat,
    lon: parsed.coord.lon,
    tempC: parsed.main.temp,
    feelsLikeC: parsed.main.feels_like,
    humidity: parsed.main.humidity,
    windSpeedMs: parsed.wind?.speed ?? null,
    description: parsed.weather[0].description,
    icon: parsed.weather[0].icon,
  });
}

export async function fetchForecast(city: string): Promise<DailyForecast[]> {
  requireKey();
  const url = `${OWM_BASE}/forecast?${q({ q: city, appid: API_KEY, units: "metric" })}`;
  const data = await fetchJSON<unknown>(url);
  const parsed = _raw.OwmForecastSchema.parse(data);

  const byDate = new Map<string, { min: number; max: number; icon: string; desc: string }>();
  for (const item of parsed.list) {
    const date = new Date(item.dt * 1000).toISOString().slice(0, 10);
    const e = byDate.get(date);
    const tmin = item.main.temp_min, tmax = item.main.temp_max;
    const icon = item.weather[0].icon, desc = item.weather[0].description;
    if (!e) byDate.set(date, { min: tmin, max: tmax, icon, desc });
    else { e.min = Math.min(e.min, tmin); e.max = Math.max(e.max, tmax); }
  }

  return Array.from(byDate.entries())
    .slice(0, 5)
    .map(([date, v]) => DailyForecastSchema.parse({ date, minC: v.min, maxC: v.max, icon: v.icon, description: v.desc }));
}

export async function fetchCoordsForCity(city: string): Promise<{ lat: number; lon: number; city: string }> {
  const cw = await fetchCurrentWeather(city);
  return { lat: cw.lat, lon: cw.lon, city: cw.city };
}
